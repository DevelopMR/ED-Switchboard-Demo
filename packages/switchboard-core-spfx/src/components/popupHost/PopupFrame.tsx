import * as React from "react";
import { AppPopupFormValues, AppPopupMessage } from "../../models/AppPopupMessage";
import { AlarmPanelWorkflow } from "./AlarmPanelWorkflow";
import { CodeAlertWorkflowRouter } from "./CodeAlertWorkflowRouter";
import { DuiIntakeWorkflow } from "./DuiIntakeWorkflow";
import { OrCallInWorkflow } from "./OrCallInWorkflow";
import { PagingLogWorkflow } from "./PagingLogWorkflow";
import { PopupActionBar } from "./PopupActionBar";
import { getAlertColorClass } from "../../constants/CodeAlertLaunchOptions";

export interface PopupFrameProps {
  message: AppPopupMessage;
  elapsedLabel: string;
  onAction: (actionId: string, formValues?: AppPopupFormValues) => void;
  onDraftChange?: (messageId: string, formValues: AppPopupFormValues) => void;
  onResolveOrRoster?: (surgeryDateTimeIso: string) => Promise<import("../../models/OrMedTrakRosterItem").OrMedTrakRosterItem[]>;
}

export function PopupFrame(props: PopupFrameProps): JSX.Element {
  const [formValues, setFormValues] = React.useState<AppPopupFormValues>(props.message.formValues ?? {});

  React.useEffect(() => {
    setFormValues(props.message.formValues ?? {});
  }, [props.message.id, props.message.formValues]);

  const announcementText = renderTemplate(props.message.announcementTemplate, formValues);
  const isCodeAlertWorkflow = props.message.messageType === "CodeAlert";
  const isOrCallInWorkflow = props.message.messageType === "OrCallIn";
  const isDuiWorkflow = props.message.messageType === "DuiIntake";
  const isPagingWorkflow = props.message.messageType === "PagingLog";
  const isAlarmPanelWorkflow = props.message.messageType === "AlarmPanel";
  const alertColorClass = getAlertColorClass(props.message);
  const requiredFieldsMissing = (props.message.formFields ?? []).some((field) => {
    if (!field.required) {
      return false;
    }

    const value = formValues[field.name];
    return typeof value === "boolean" ? false : String(value ?? "").trim().length === 0;
  });

  return (
    <div className={`swPopupFrame ${alertColorClass}`}>
      {isCodeAlertWorkflow ? (
        <CodeAlertWorkflowRouter
          message={props.message}
          announcementText={announcementText}
          onAction={props.onAction}
          onDraftChange={(nextValues) => props.onDraftChange?.(props.message.id, nextValues)}
          onResolveRoster={props.onResolveOrRoster}
        />
      ) : isOrCallInWorkflow ? (
        <OrCallInWorkflow
          message={props.message}
          onAction={props.onAction}
          onDraftChange={(nextValues) => props.onDraftChange?.(props.message.id, nextValues)}
          onResolveRoster={props.onResolveOrRoster}
        />
      ) : isDuiWorkflow ? (
        <DuiIntakeWorkflow
          message={props.message}
          onAction={props.onAction}
          onDraftChange={(nextValues) => props.onDraftChange?.(props.message.id, nextValues)}
        />
      ) : isPagingWorkflow ? (
        <PagingLogWorkflow
          message={props.message}
          onAction={props.onAction}
          onDraftChange={(nextValues) => props.onDraftChange?.(props.message.id, nextValues)}
        />
      ) : isAlarmPanelWorkflow ? (
        <AlarmPanelWorkflow
          message={props.message}
          onAction={props.onAction}
          onDraftChange={(nextValues) => props.onDraftChange?.(props.message.id, nextValues)}
        />
      ) : (
        <React.Fragment>
          {props.message.bodyText ? <div className="swPopupBody">{props.message.bodyText}</div> : null}
          {announcementText ? (
            <div className="swPopupAnnouncement">
              <div className="swPopupSectionLabel">Announcement</div>
              <div>{announcementText}</div>
              <div className="swPopupReadNote">Read three times.</div>
            </div>
          ) : null}
          <PopupFormFields
            fields={props.message.formFields ?? []}
            values={formValues}
            onChange={(fieldName, value) => {
              const nextValues = {
                ...formValues,
                [fieldName]: value
              };
              setFormValues(nextValues);
              props.onDraftChange?.(props.message.id, nextValues);
            }}
          />
          {props.message.procedureHtml ? (
            <div className="swPopupProcedure" dangerouslySetInnerHTML={{ __html: sanitizeProcedureHtml(props.message.procedureHtml) }} />
          ) : null}
          {requiredFieldsMissing ? <div className="swPopupValidation">Complete required fields before confirming actions.</div> : null}
          <PopupActionBar
            actions={props.message.actions}
            isBlocked={requiredFieldsMissing}
            onAction={(actionId) => props.onAction(actionId, formValues)}
          />
        </React.Fragment>
      )}
    </div>
  );
}

interface PopupFormFieldsProps {
  fields: NonNullable<AppPopupMessage["formFields"]>;
  values: AppPopupFormValues;
  onChange: (fieldName: string, value: string | boolean) => void;
}

function PopupFormFields(props: PopupFormFieldsProps): JSX.Element {
  if (props.fields.length === 0) {
    return <React.Fragment />;
  }

  return (
    <div className="swPopupForm">
      <div className="swPopupSectionLabel">Operator Form</div>
      {props.fields.map((field) => {
        const value = props.values[field.name];

        if (field.type === "Boolean") {
          return (
            <label className="swPopupCheckboxField" key={field.name}>
              <input
                type="checkbox"
                checked={Boolean(value)}
                onChange={(event) => props.onChange(field.name, event.currentTarget.checked)}
              />
              <span>{field.label}</span>
            </label>
          );
        }

        if (field.type === "MultilineText") {
          return (
            <label className="swPopupFormField" key={field.name}>
              <span>
                {field.label}
                {field.required ? " *" : ""}
              </span>
              <textarea
                value={String(value ?? "")}
                onChange={(event) => props.onChange(field.name, event.currentTarget.value)}
              />
            </label>
          );
        }

        return (
          <label className="swPopupFormField" key={field.name}>
            <span>
              {field.label}
              {field.required ? " *" : ""}
            </span>
            <input type="text" value={String(value ?? "")} onChange={(event) => props.onChange(field.name, event.currentTarget.value)} />
          </label>
        );
      })}
    </div>
  );
}

function renderTemplate(template: string | undefined, values: AppPopupFormValues): string {
  if (!template) {
    return "";
  }

  return template
    .replace("{Location}", String(values.CaLocation ?? "").trim())
    .replace("{Instructions}", String(values.CaInstructions ?? "").trim())
    .replace(/\s+\+\s*$/g, "")
    .replace(/\+\s+\+/g, "+")
    .trim();
}

function sanitizeProcedureHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "");
}

