import * as React from "react";
import { AppPopupFormValues, AppPopupMessage } from "../../models/AppPopupMessage";
import { AlarmPanelGroup } from "../../models/AlarmPanelItem";

const maintenancePhone = "333-444-5555";

interface AlarmOption {
  source: string;
  group: AlarmPanelGroup;
}

interface AlarmGroupDefinition {
  group: AlarmPanelGroup;
  label: string;
  options: AlarmOption[];
}

const alarmGroups: AlarmGroupDefinition[] = [
  {
    group: "Remote Alarm Panel",
    label: "Remote Alarm Panel (Boiler/Env)",
    options: [
      { source: "Boiler Alarm", group: "Remote Alarm Panel" },
      { source: "AHU-1 Low Temp Alarm", group: "Remote Alarm Panel" },
      { source: "AHU-2 Low Temp Alarm", group: "Remote Alarm Panel" },
      { source: "AHU-3 Low Temp Alarm", group: "Remote Alarm Panel" },
      { source: "AHU-4 Low Temp Alarm", group: "Remote Alarm Panel" },
      { source: "AHU-5 Low Temp Alarm", group: "Remote Alarm Panel" },
      { source: "AHU-6 Low Temp Alarm", group: "Remote Alarm Panel" },
      { source: "AHU-7 Low Temp Alarm", group: "Remote Alarm Panel" },
      { source: "AHU-8 Low Temp Alarm", group: "Remote Alarm Panel" },
      { source: "Chiller CH-1 High Temp Alarm", group: "Remote Alarm Panel" },
      { source: "Chiller CH-2 High Temp Alarm", group: "Remote Alarm Panel" }
    ]
  },
  {
    group: "Fire Alarm Code Red",
    label: "Fire Alarm (Code Red) Panel",
    options: [
      { source: "Fire Alarm", group: "Fire Alarm Code Red" },
      { source: "Priority 2 Alarm", group: "Fire Alarm Code Red" },
      { source: "System Supervisory", group: "Fire Alarm Code Red" },
      { source: "System Trouble", group: "Fire Alarm Code Red" }
    ]
  },
  {
    group: "Generator Alarm",
    label: "Generator Alarm",
    options: [
      { source: "Generator 1", group: "Generator Alarm" },
      { source: "Generator 2", group: "Generator Alarm" }
    ]
  },
  {
    group: "Condition A",
    label: "Condition A Phone",
    options: [{ source: "Condition A Phone", group: "Condition A" }]
  },
  {
    group: "Medical Gas Master Alarm Panel",
    label: "Medical Gas Master Alarm Panel",
    options: [{ source: "Medical Gas Master Alarm Panel", group: "Medical Gas Master Alarm Panel" }]
  }
];

export interface AlarmPanelWorkflowProps {
  message: AppPopupMessage;
  onAction: (actionId: string, formValues?: AppPopupFormValues) => void;
  onDraftChange?: (formValues: AppPopupFormValues) => void;
}

export function AlarmPanelWorkflow(props: AlarmPanelWorkflowProps): JSX.Element {
  const [formValues, setFormValues] = React.useState<AppPopupFormValues>(props.message.formValues ?? {});
  const source = String(formValues.AlAlarmSource ?? "");
  const panelGroup = String(formValues.AlPanelGroup ?? "") as AlarmPanelGroup | "";
  const maintenanceContacted = formValues.AlMaintenanceContacted === true;
  const requiresMaintenance = source.length > 0 && panelGroup !== "Fire Alarm Code Red" && panelGroup !== "Condition A";
  const isCodeAlertRelevant = panelGroup === "Fire Alarm Code Red" || panelGroup === "Condition A";
  const detailsRequired = panelGroup === "Medical Gas Master Alarm Panel" || panelGroup === "Condition A";
  const detailsMissing = detailsRequired && String(formValues.AlAlarmDetails ?? "").trim().length === 0;
  const canSubmit = source.length > 0 && (!requiresMaintenance || maintenanceContacted) && !detailsMissing && !Boolean(props.message.terminalState);
  const script = requiresMaintenance ? buildMaintenanceScript(formValues) : "";

  React.useEffect(() => {
    setFormValues((current) => ({
      ...props.message.formValues,
      ...current,
      AlMaintenanceContacted: props.message.formValues?.AlMaintenanceContacted ?? current.AlMaintenanceContacted,
      AlMaintenanceContactedAt: props.message.formValues?.AlMaintenanceContactedAt ?? current.AlMaintenanceContactedAt
    }));
  }, [props.message.actions, props.message.formValues, props.message.id, props.message.terminalState]);

  const updateFormValues = (nextValues: AppPopupFormValues): void => {
    setFormValues(nextValues);
    props.onDraftChange?.(nextValues);
  };

  const chooseOption = (option: AlarmOption): void => {
    updateFormValues({
      ...formValues,
      AlAlarmSource: option.source,
      AlPanelGroup: option.group,
      AlMaintenanceContacted: false,
      AlMaintenanceContactedAt: "",
      AlMaintenanceScript: "",
      AlCodeAlertCalled: false
    });
  };

  const updateField = (fieldName: string, value: string | boolean): void => {
    updateFormValues({
      ...formValues,
      [fieldName]: value
    });
  };

  const stampMaintenanceContact = (): void => {
    const nowIso = new Date().toISOString();
    updateFormValues({
      ...formValues,
      AlMaintenanceContacted: true,
      AlMaintenanceContactedAt: nowIso,
      AlMaintenanceScript: script
    });
  };

  const submit = (): void => {
    if (!canSubmit) {
      return;
    }

    props.onAction("AlSubmit", {
      ...formValues,
      AlMaintenanceContacted: requiresMaintenance ? formValues.AlMaintenanceContacted : false,
      AlMaintenanceContactedAt: requiresMaintenance ? formValues.AlMaintenanceContactedAt : "",
      AlMaintenanceScript: script
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (event.ctrlKey && event.key === "Enter" && canSubmit) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <div className="swDuiWorkflow swAlarmPanelWorkflow" onKeyDown={handleKeyDown}>
      <div className="swDuiPaperForm">
        <div className="swPopupSectionLabel">Alarm Panel / Phone</div>
        <div className="swDuiHint">Select the alarm or phone source, complete the matching details, then submit the one-shot log.</div>
        <div className="swAlarmPanelGroupGrid">
          {alarmGroups.map((group) => (
            <fieldset key={group.group} className={`swAlarmPanelGroup ${getGroupClassName(group.group)}`}>
              <legend>{group.label}</legend>
              <div className="swAlarmPanelOptions">
                {group.options.map((option) => (
                  <button
                    key={option.source}
                    className={`swAlarmPanelChoice${source === option.source ? " isSelected" : ""}`}
                    type="button"
                    onClick={() => chooseOption(option)}
                  >
                    {option.source}
                  </button>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
      </div>

      {source ? (
        <div className="swDuiPaperForm">
          <div className="swPopupSectionLabel">Alarm Details</div>
          <div className="swAlarmPanelSelected">Selected: {source}</div>
          <label className="swDuiFieldRow swDuiFieldRowWide">
            <span>{getDetailsLabel(panelGroup)}</span>
            <textarea rows={4} value={String(formValues.AlAlarmDetails ?? "")} onChange={(event) => updateField("AlAlarmDetails", event.currentTarget.value)} />
          </label>
          {isCodeAlertRelevant ? (
            <label className="swDialogCheckboxField swAlarmPanelCheckbox">
              <input type="checkbox" checked={formValues.AlCodeAlertCalled === true} onChange={(event) => updateField("AlCodeAlertCalled", event.currentTarget.checked)} />
              <span>Was Code Alert called?</span>
            </label>
          ) : null}
        </div>
      ) : null}

      {requiresMaintenance ? (
        <div className="swDuiChecklistPanel">
          <div className="swPopupSectionLabel">Maintenance Contact</div>
          <div className="swAlarmPanelScriptBox">{script}</div>
          <div className="swDuiChecklistRow">
            <div>
              <strong>Maintenance contacted</strong>
              <div>{maintenanceContacted ? `Completed ${formatLocalTimestamp(String(formValues.AlMaintenanceContactedAt ?? ""))}` : "Pending"}</div>
            </div>
            <button className={`swDuiActionButton swAlarmPanelMaintenanceButton${maintenanceContacted ? " isStamped" : ""}`} type="button" disabled={!source || Boolean(props.message.terminalState)} onClick={stampMaintenanceContact}>
              Maintenance Contacted
            </button>
          </div>
          {!source ? <div className="swPopupValidation">Select an alarm source before calling Maintenance.</div> : null}
          {detailsMissing ? <div className="swPopupValidation">Complete the required details for this alarm source.</div> : null}
        </div>
      ) : detailsMissing ? (
        <div className="swDuiChecklistPanel">
          <div className="swPopupValidation">Complete the required details for this alarm source.</div>
        </div>
      ) : null}

      <div className="swDuiSubmitPanel">
        {props.message.terminalState ? <div className="swPopupCompletion">{props.message.terminalState}</div> : <span />}
        <button className="swDuiActionButton swDuiActionButton-submit" type="button" disabled={!canSubmit} onClick={submit}>
          Submit Alarm Log
        </button>
      </div>
    </div>
  );
}

function getGroupClassName(group: AlarmPanelGroup): string {
  switch (group) {
    case "Remote Alarm Panel":
      return "swAlarmPanelGroupRemote";
    case "Fire Alarm Code Red":
      return "swAlarmPanelGroupFire";
    case "Generator Alarm":
      return "swAlarmPanelGroupGenerator";
    case "Condition A":
      return "swAlarmPanelGroupCondition";
    default:
      return "swAlarmPanelGroupMedicalGas";
  }
}

function getDetailsLabel(panelGroup: AlarmPanelGroup | ""): string {
  if (panelGroup === "Medical Gas Master Alarm Panel") {
    return "Record the Medical Gas Alarm Type *";
  }

  if (panelGroup === "Condition A") {
    return "Condition A Comments *";
  }

  return "Additional Notes";
}

function buildMaintenanceScript(formValues: AppPopupFormValues): string {
  const source = String(formValues.AlAlarmSource ?? "the switchboard alarm panel").trim() || "the switchboard alarm panel";
  const panelGroup = getMaintenancePanelLabel(String(formValues.AlPanelGroup ?? ""));
  const details = String(formValues.AlAlarmDetails ?? "").trim();
  const specificAlarm = formValues.AlPanelGroup === "Medical Gas Master Alarm Panel" && details ? details : source;

  return `Call Maintenance at: ${maintenancePhone}\nThis is WKRC switchboard, the ${panelGroup} is sounding on the ${specificAlarm}.`;
}

function getMaintenancePanelLabel(panelGroup: string): string {
  switch (panelGroup) {
    case "Remote Alarm Panel":
      return "Remote Alarm Panel (Boiler/Env)";
    case "Generator Alarm":
      return "Generator Alarm";
    case "Medical Gas Master Alarm Panel":
      return "Medical Gas Master Alarm Panel";
    default:
      return "switchboard alarm panel";
  }
}

function formatLocalTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value || "Completed";
  }

  return date.toLocaleString(undefined, {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

