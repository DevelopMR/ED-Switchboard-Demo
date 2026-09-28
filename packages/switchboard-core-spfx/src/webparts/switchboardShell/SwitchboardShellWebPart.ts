import * as React from "react";
import * as ReactDom from "react-dom";
import { Version } from "@microsoft/sp-core-library";
import {
  IPropertyPaneConfiguration,
  PropertyPaneDropdown,
  PropertyPaneTextField,
  PropertyPaneToggle
} from "@microsoft/sp-property-pane";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";

import { RiskmasterDemoSurface } from "../../components/riskmaster/RiskmasterDemoSurface";
import { SwitchboardShell } from "../../components/shell/SwitchboardShell";
import { SwMenuRole, SwMenuRoles } from "../../models/SwMenuRole";
import { SwitchboardSetupSurface } from "../../models/SwitchboardSetupSurface";
import { SwitchboardShellMode } from "../../models/SwitchboardShellMode";
import { ShellServiceBundle } from "../../services/ShellServiceBundle";
import { createMockShellServices } from "../../services/createMockShellServices";
import { createSharePointShellServices } from "../../services/createSharePointShellServices";
import { ensureShellStyles } from "../../styles/shellStyles";

const defaultSwitchboardId = "SWITCHBOARDDEMO000000000";
const defaultCodeAlertsListTitle = "CodeAlerts";
const defaultIntakeListTitle = "CaOriginatorRequests";
const defaultPopupPollingIntervalSeconds = "1";
const defaultCodeAlertFacility = "HOS";
const operatorPageClassName = "swOperatorConsolePage";

export interface ISwitchboardShellWebPartProps {
  Mode?: SwitchboardShellMode;
  SetupSurface?: SwitchboardSetupSurface;
  TargetSiteUrl?: string;
  UsePrintView?: boolean;
  ShowLauncherMenu?: boolean;
  SwitchboardId?: string;
  CodeAlertsListTitle?: string;
  IntakeListTitle?: string;
  PopupPollingIntervalSeconds?: string;
  DefaultCodeAlertFacility?: string;
}

export default class SwitchboardShellWebPart extends BaseClientSideWebPart<ISwitchboardShellWebPartProps> {
  private serviceBundle?: ShellServiceBundle;

  public render(): void {
    ensureShellStyles();
    const services = this.getServiceBundle();

    const surface = this.getSetupSurface();
    this.syncOperatorPageClass(surface);
    const element: React.ReactElement =
      surface === "RiskmasterDemo"
          ? React.createElement(RiskmasterDemoSurface, {
              service: services.riskmasterService,
              currentUserName: services.currentUserName
            })
          : React.createElement(SwitchboardShell, {
              services,
              showLauncherMenu: this.properties.ShowLauncherMenu !== false,
              menuRoleOverride: this.getMenuRoleOverride(),
              defaultCodeAlertFacility: this.getDefaultCodeAlertFacility()
            });

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    this.syncOperatorPageClass("RiskmasterDemo");
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected onPropertyPaneFieldChanged(propertyPath: string, oldValue: unknown, newValue: unknown): void {
    this.serviceBundle = undefined;
    super.onPropertyPaneFieldChanged(propertyPath, oldValue, newValue);
  }

  protected get dataVersion(): Version {
    return Version.parse("1.0");
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: "ED Switchboard shell settings"
          },
          groups: [
            {
              groupName: "Runtime",
              groupFields: [
                PropertyPaneDropdown("Mode", {
                  label: "Mode",
                  options: [
                    { key: "Mock", text: "Mock" },
                    { key: "SharePoint", text: "SharePoint" }
                  ]
                }),
                PropertyPaneDropdown("SetupSurface", {
                  label: "Surface",
                  options: [
                    { key: "Operator", text: "Operator console" },
                    { key: "RiskmasterDemo", text: "Riskmaster demo" }
                  ]
                }),
                PropertyPaneTextField("TargetSiteUrl", {
                  label: "Target SharePoint site URL"
                }),
                PropertyPaneTextField("SwitchboardId", {
                  label: "Switchboard ID"
                }),
                PropertyPaneTextField("CodeAlertsListTitle", {
                  label: "CodeAlerts list title"
                }),
                PropertyPaneTextField("IntakeListTitle", {
                  label: "Originator intake list title"
                }),
                PropertyPaneTextField("PopupPollingIntervalSeconds", {
                  label: "Popup polling interval (seconds)",
                  description: "Use 1 second for the staffed Switchboard console. Polls never overlap."
                }),
                PropertyPaneTextField("DefaultCodeAlertFacility", {
                  label: "Default Code Alert facility"
                }),
                PropertyPaneToggle("UsePrintView", {
                  label: "Enable print-focused layout",
                  checked: this.properties.UsePrintView !== false
                }),
                PropertyPaneToggle("ShowLauncherMenu", {
                  label: "Show launcher menu",
                  checked: this.properties.ShowLauncherMenu !== false
                })
              ]
            }
          ]
        }
      ]
    };
  }

  private createServiceBundle(): ShellServiceBundle {
    const currentUserName = this.context.pageContext.user.displayName || "Current User";
    const mode = this.getMode();

    if (mode === "SharePoint") {
      return createSharePointShellServices({
        siteUrl: this.getTargetSiteUrl(),
        currentUserName,
        fetchImpl: window.fetch.bind(window) as typeof fetch,
        requestDigest: this.getRequestDigest(),
        preloadDemoAlerts: this.shouldPreloadAlerts(),
        switchboardId: this.getSwitchboardId(),
        codeAlertsListTitle: this.getCodeAlertsListTitle(),
        intakeListTitle: this.getIntakeListTitle(),
        popupPollingIntervalMs: this.getPopupPollingIntervalMs(),
        popupDebugLogging: this.getPopupDebugLogging()
      });
    }

    return createMockShellServices(currentUserName);
  }

  private getServiceBundle(): ShellServiceBundle {
    if (!this.serviceBundle) {
      this.serviceBundle = this.createServiceBundle();
    }

    return this.serviceBundle;
  }

  private getMode(): SwitchboardShellMode {
    const urlMode = new URLSearchParams(window.location.search).get("SwMode");

    if (urlMode === "Mock" || urlMode === "SharePoint") {
      return urlMode;
    }

    return this.properties.Mode ?? "SharePoint";
  }

  private getSetupSurface(): SwitchboardSetupSurface {
    const urlSetup = new URLSearchParams(window.location.search).get("SwSetup");

    if (urlSetup === "RiskmasterDemo") {
      return urlSetup;
    }

    return this.properties.SetupSurface ?? "Operator";
  }

  private shouldPreloadAlerts(): boolean {
    const value = new URLSearchParams(window.location.search).get("SwPreloadAlerts");
    return value === "true" || value === "1" || value === "yes";
  }

  private getTargetSiteUrl(): string {
    return this.properties.TargetSiteUrl || this.context.pageContext.web.absoluteUrl;
  }

  private getSwitchboardId(): string {
    return this.getQueryStringValue("SwSwitchboardId") || this.properties.SwitchboardId || defaultSwitchboardId;
  }

  private getCodeAlertsListTitle(): string {
    return this.getQueryStringValue("SwCodeAlertsList") || this.properties.CodeAlertsListTitle || defaultCodeAlertsListTitle;
  }

  private getIntakeListTitle(): string {
    return this.getQueryStringValue("SwIntakeList") || this.properties.IntakeListTitle || defaultIntakeListTitle;
  }

  private getPopupPollingIntervalMs(): number {
    const rawValue = this.getQueryStringValue("SwPopupPollingSeconds") || this.properties.PopupPollingIntervalSeconds || defaultPopupPollingIntervalSeconds;
    const parsedSeconds = Number.parseInt(rawValue, 10);
    const pollingSeconds = Number.isFinite(parsedSeconds) && parsedSeconds > 0 ? parsedSeconds : 1;
    return pollingSeconds * 1000;
  }

  private getDefaultCodeAlertFacility(): string {
    return this.getQueryStringValue("SwFacility") || this.properties.DefaultCodeAlertFacility || defaultCodeAlertFacility;
  }

  private getPopupDebugLogging(): boolean {
    const value = this.getQueryStringValue("SwPopupDebug");
    return value === "true" || value === "1" || value === "yes";
  }

  private getMenuRoleOverride(): SwMenuRole | undefined {
    const value = this.getQueryStringValue("SwMenuRole");

    if (!value) {
      return undefined;
    }

    return SwMenuRoles.find((role) => role.toLowerCase() === value.toLowerCase());
  }

  private getQueryStringValue(key: string): string | undefined {
    const value = new URLSearchParams(window.location.search).get(key);
    return value && value.trim().length > 0 ? value.trim() : undefined;
  }

  private syncOperatorPageClass(surface: SwitchboardSetupSurface): void {
    if (typeof document === "undefined") {
      return;
    }

    if (surface === "Operator") {
      document.body.classList.add(operatorPageClassName);
      return;
    }

    document.body.classList.remove(operatorPageClassName);
  }

  private getRequestDigest(): string | undefined {
    const legacyContext = this.context.pageContext.legacyPageContext as { formDigestValue?: string } | undefined;
    return legacyContext?.formDigestValue;
  }
}
