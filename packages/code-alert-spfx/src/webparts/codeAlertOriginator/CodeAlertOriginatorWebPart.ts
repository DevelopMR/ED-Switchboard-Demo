import * as React from "react";
import * as ReactDom from "react-dom";
import { Version } from "@microsoft/sp-core-library";
import {
  IPropertyPaneConfiguration,
  PropertyPaneCheckbox,
  PropertyPaneTextField
} from "@microsoft/sp-property-pane";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";

import { CodeAlertOriginator, ICodeAlertOriginatorProps } from "../../components/CodeAlertOriginator";
import { MockOriginatorRequestService } from "../../services/MockOriginatorRequestService";
import { SharePointOriginatorRequestService } from "../../services/SharePointOriginatorRequestService";

export interface ICodeAlertOriginatorWebPartProps {
  IntakeSiteUrl: string;
  IntakeListTitle: string;
  OriginatorId: string;
  SwitchboardId: string;
  FunctionSignalEndpointUrl: string;
  FunctionSignalKey: string;
  DefaultFacility: string;
  DefaultTeam: string;
  DefaultDepartment: string;
  DefaultFloor: string;
  DefaultDirection: string;
  UseMockData: boolean;
}

export default class CodeAlertOriginatorWebPart extends BaseClientSideWebPart<ICodeAlertOriginatorWebPartProps> {
  public render(): void {
    const service = this.properties.UseMockData
      ? new MockOriginatorRequestService(this.context.pageContext.user.displayName)
      : new SharePointOriginatorRequestService({
          spHttpClient: this.context.spHttpClient,
          intakeSiteUrl: this.properties.IntakeSiteUrl,
          listTitle: this.properties.IntakeListTitle,
          originatorId: this.properties.OriginatorId,
          switchboardId: this.properties.SwitchboardId,
          functionSignalEndpointUrl: this.properties.FunctionSignalEndpointUrl,
          functionSignalKey: this.properties.FunctionSignalKey,
          currentUserName: this.context.pageContext.user.displayName,
          currentUserEmail: this.context.pageContext.user.email
        });

    const displayTeam = this.properties.DefaultTeam || this.properties.DefaultDepartment || "";
    const displayFacility = this.properties.DefaultFacility || "";
    const element: React.ReactElement<ICodeAlertOriginatorProps> = React.createElement(CodeAlertOriginator, {
      currentUserName: this.context.pageContext.user.displayName,
      service,
      displayFacility,
      displayTeam,
      presets: {
        facility: displayFacility,
        department: displayTeam,
        floor: this.properties.DefaultFloor || "",
        direction: this.properties.DefaultDirection || "",
        room: "",
        additional: ""
      }
    });

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse("1.0");
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: { description: "Configure the central intake list, routing IDs, and location presets." },
          groups: [
            {
              groupName: "Intake connection",
              groupFields: [
                PropertyPaneTextField("IntakeSiteUrl", { label: "Intake site URL" }),
                PropertyPaneTextField("IntakeListTitle", { label: "Intake list title" }),
                PropertyPaneTextField("OriginatorId", { label: "Originator ID" }),
                PropertyPaneTextField("SwitchboardId", { label: "Switchboard ID" }),
                PropertyPaneCheckbox("UseMockData", { text: "Use mock data" })
              ]
            },
            {
              groupName: "Azure Function signal",
              groupFields: [
                PropertyPaneTextField("FunctionSignalEndpointUrl", {
                  label: "Function signal endpoint URL",
                  description: "Pointer-only Code Alert signal endpoint. Do not include descriptive alert data in this channel."
                }),
                PropertyPaneTextField("FunctionSignalKey", {
                  label: "Function signal key",
                  description: "Function key for the demo signal endpoint. Treat as configuration secret."
                })
              ]
            },
            {
              groupName: "Location presets",
              groupFields: [
                PropertyPaneTextField("DefaultFacility", { label: "Facility preset", description: "Shown in the popup as read-only for offsite users." }),
                PropertyPaneTextField("DefaultTeam", { label: "Team / department preset", description: "Preloads the Department or area field. Users may edit it in the popup." }),
                PropertyPaneTextField("DefaultFloor", { label: "Default floor" }),
                PropertyPaneTextField("DefaultDirection", { label: "Default direction" })
              ]
            }
          ]
        }
      ]
    };
  }
}