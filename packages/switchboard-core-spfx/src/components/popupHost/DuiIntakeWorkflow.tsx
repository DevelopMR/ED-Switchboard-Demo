import * as React from "react";
import { AppPopupFormValues, AppPopupMessage } from "../../models/AppPopupMessage";

const policeDepartmentOptions = [
  "State Police",
  "Riverbend Police Department",
  "Riverbend County Sheriff",
  "Cedar Township Police",
  "Harbor Falls Police"
] as const;

const otherPoliceDepartmentValue = "__other__";
const defaultPoliceDepartment = policeDepartmentOptions[0];
const actionManagedFieldNames = [
  "DuSecurityNotified",
  "DuSecurityNotifiedAt",
  "DuLabNotified",
  "DuLabNotifiedAt",
  "DuRegistered",
  "DuRegisteredAt"
] as const;

export interface DuiIntakeWorkflowProps {
  message: AppPopupMessage;
  onAction: (actionId: string, formValues?: AppPopupFormValues) => void;
  onDraftChange?: (formValues: AppPopupFormValues) => void;
}

export function DuiIntakeWorkflow(props: DuiIntakeWorkflowProps): JSX.Element {
  const [formValues, setFormValues] = React.useState<AppPopupFormValues>(normalizeDuiFormValues(props.message.formValues ?? {}));
  const actionSyncKey = React.useMemo(() => {
    return props.message.actions.map((action) => `${action.id}:${action.disabled === true ? "1" : "0"}`).join("|");
  }, [props.message.actions]);

  React.useEffect(() => {
    setFormValues((current) => mergeDuiFormValues(current, normalizeDuiFormValues(props.message.formValues ?? {})));
  }, [props.message.id, actionSyncKey, props.message.terminalState]);

  const actionsById = React.useMemo(() => {
    return new Map(props.message.actions.map((action) => [action.id, action]));
  }, [props.message.actions]);

  const policeDepartmentChoice = String(formValues.DuPoliceDepartmentChoice ?? defaultPoliceDepartment);
  const policeDepartmentOther = String(formValues.DuPoliceDepartmentOther ?? "");
  const effectiveFormValues = buildEffectiveFormValues(formValues);
  const effectivePoliceDepartment = String(effectiveFormValues.DuPoliceDepartment ?? "").trim();

  const requiredFieldsMissing = [
    "DuDate",
    "DuDob",
    "DuSsn",
    "DuNameLastFirst",
    "DuPoliceOfficer",
    "DuPoliceIncidentNumber"
  ].some((fieldName) => String(effectiveFormValues[fieldName] ?? "").trim().length === 0) || effectivePoliceDepartment.length === 0;

  const securityComplete = actionsById.get("DuiSecurityNotified")?.disabled === true;
  const labComplete = actionsById.get("DuiLabNotified")?.disabled === true;
  const registrationComplete = actionsById.get("DuiRegistrationRecorded")?.disabled === true;
  const registrationNumber = String(formValues.DuRegistrationNumber ?? "").trim();
  const canSubmit = !requiredFieldsMissing && securityComplete && labComplete && registrationComplete && registrationNumber.length > 0;

  const updateFormValues = (updater: (current: AppPopupFormValues) => AppPopupFormValues): void => {
    setFormValues((current) => {
      const nextValues = normalizeDuiFormValues(updater(current));
      props.onDraftChange?.(nextValues);
      return nextValues;
    });
  };

  const handleChange = (fieldName: string, value: string): void => {
    updateFormValues((current) => ({
      ...current,
      [fieldName]: value
    }));
  };

  const handlePoliceDepartmentChoiceChange = (value: string): void => {
    updateFormValues((current) => ({
      ...current,
      DuPoliceDepartmentChoice: value,
      DuPoliceDepartmentOther: value === otherPoliceDepartmentValue ? String(current.DuPoliceDepartmentOther ?? "") : ""
    }));
  };

  const handlePoliceDepartmentOtherChange = (value: string): void => {
    updateFormValues((current) => ({
      ...current,
      DuPoliceDepartmentOther: value
    }));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (event.ctrlKey && event.key === "Enter" && canSubmit) {
      event.preventDefault();
      props.onAction("DuiSubmit", effectiveFormValues);
    }
  };

  return (
    <div className="swDuiWorkflow" onKeyDown={handleKeyDown}>
      <div className="swDuiPaperForm">
        <div className="swPopupSectionLabel">Synthetic Demo Intake Form</div>
        <div className="swDuiHint">Use fake names, fake dates of birth, and fake SSNs only. This proof of concept must not store real patient or legal identifiers.</div>
        <div className="swDuiFieldGrid">
          <label className="swDuiFieldRow">
            <span>Date *</span>
            <input type="text" value={String(formValues.DuDate ?? "")} onChange={(event) => handleChange("DuDate", event.currentTarget.value)} />
          </label>
          <label className="swDuiFieldRow">
            <span>DOB *</span>
            <input type="text" value={String(formValues.DuDob ?? "")} onChange={(event) => handleChange("DuDob", event.currentTarget.value)} />
          </label>
          <label className="swDuiFieldRow">
            <span>SSN *</span>
            <input type="text" value={String(formValues.DuSsn ?? "")} onChange={(event) => handleChange("DuSsn", event.currentTarget.value)} />
            <small>Demo only. Use a fake SSN.</small>
          </label>
          <label className="swDuiFieldRow">
            <span>Name (Last, First) *</span>
            <input type="text" value={String(formValues.DuNameLastFirst ?? "")} onChange={(event) => handleChange("DuNameLastFirst", event.currentTarget.value)} />
          </label>
          <label className="swDuiFieldRow">
            <span>Police Department *</span>
            <select value={policeDepartmentChoice} onChange={(event) => handlePoliceDepartmentChoiceChange(event.currentTarget.value)}>
              {policeDepartmentOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
              <option value={otherPoliceDepartmentValue}>Other Department</option>
            </select>
          </label>
          <label className="swDuiFieldRow">
            <span>Police Officer *</span>
            <input type="text" value={String(formValues.DuPoliceOfficer ?? "")} onChange={(event) => handleChange("DuPoliceOfficer", event.currentTarget.value)} />
          </label>
          <label className="swDuiFieldRow">
            <span>Police Incident Number *</span>
            <input
              type="text"
              value={String(formValues.DuPoliceIncidentNumber ?? "")}
              onChange={(event) => handleChange("DuPoliceIncidentNumber", event.currentTarget.value)}
            />
          </label>
          <label className="swDuiFieldRow">
            <span>Registration Number</span>
            <input
              type="text"
              value={registrationNumber}
              onChange={(event) => handleChange("DuRegistrationNumber", event.currentTarget.value)}
            />
            <small>After the subject is registered in the legacy workflow, paste the synthetic MRN or incident identifier here.</small>
          </label>
          {policeDepartmentChoice === otherPoliceDepartmentValue ? (
            <label className="swDuiFieldRow swDuiFieldRowWide">
              <span>Other Police Department *</span>
              <input type="text" value={policeDepartmentOther} onChange={(event) => handlePoliceDepartmentOtherChange(event.currentTarget.value)} />
            </label>
          ) : null}
          <label className="swDuiFieldRow swDuiFieldRowWide">
            <span>Notes</span>
            <textarea rows={4} value={String(formValues.DuNotes ?? "")} onChange={(event) => handleChange("DuNotes", event.currentTarget.value)} />
          </label>
        </div>
      </div>

      <div className="swDuiChecklistPanel">
        <div className="swPopupSectionLabel">Required Checklist</div>
        <div className="swDuiChecklistRow">
          <div>
            <strong>Security notified</strong>
            <div>{formatTaskState(formValues.DuSecurityNotifiedAt, securityComplete)}</div>
          </div>
          <button
            className="swDuiActionButton"
            type="button"
            disabled={securityComplete || requiredFieldsMissing}
            onClick={() => props.onAction("DuiSecurityNotified", effectiveFormValues)}
          >
            Mark Security Notified
          </button>
        </div>
        <div className="swDuiChecklistRow">
          <div>
            <strong>Lab notified</strong>
            <div>{formatTaskState(formValues.DuLabNotifiedAt, labComplete)}</div>
          </div>
          <button
            className="swDuiActionButton"
            type="button"
            disabled={labComplete || requiredFieldsMissing}
            onClick={() => props.onAction("DuiLabNotified", effectiveFormValues)}
          >
            Mark Lab Notified
          </button>
        </div>
        <div className="swDuiChecklistRow">
          <div>
            <strong>Registration number recorded</strong>
            <div>{formatTaskState(formValues.DuRegisteredAt, registrationComplete)}</div>
          </div>
          <button
            className="swDuiActionButton"
            type="button"
            disabled={registrationComplete || requiredFieldsMissing || registrationNumber.length === 0}
            onClick={() => props.onAction("DuiRegistrationRecorded", effectiveFormValues)}
          >
            Confirm Registration Number
          </button>
        </div>
        {requiredFieldsMissing ? <div className="swPopupValidation">Complete the paper-form fields before stamping the checklist.</div> : null}
        {!requiredFieldsMissing && registrationNumber.length === 0 ? (
          <div className="swPopupValidation">Enter the registration number before confirming the final registration task.</div>
        ) : null}
      </div>

      <div className="swDuiSubmitPanel">
        {props.message.terminalState ? <div className="swPopupCompletion">{props.message.terminalState}</div> : null}
        <button
          className="swDuiActionButton swDuiActionButton-submit"
          type="button"
          disabled={!canSubmit || Boolean(props.message.terminalState)}
          onClick={() => props.onAction("DuiSubmit", effectiveFormValues)}
        >
          Final Submit
        </button>
      </div>
    </div>
  );
}

function normalizeDuiFormValues(values: AppPopupFormValues): AppPopupFormValues {
  const explicitChoice = String(values.DuPoliceDepartmentChoice ?? "").trim();
  const explicitOther = String(values.DuPoliceDepartmentOther ?? "").trim();
  const storedDepartment = String(values.DuPoliceDepartment ?? "").trim();
  const policeDepartmentChoice = explicitChoice || getPoliceDepartmentChoice(storedDepartment || defaultPoliceDepartment);
  const policeDepartmentOther =
    policeDepartmentChoice === otherPoliceDepartmentValue
      ? explicitOther || storedDepartment
      : "";
  const effectiveDepartment =
    policeDepartmentChoice === otherPoliceDepartmentValue
      ? policeDepartmentOther
      : policeDepartmentChoice;

  return {
    ...values,
    DuPoliceDepartmentChoice: policeDepartmentChoice,
    DuPoliceDepartmentOther: policeDepartmentOther,
    DuPoliceDepartment: effectiveDepartment
  };
}

function buildEffectiveFormValues(values: AppPopupFormValues): AppPopupFormValues {
  const policeDepartmentChoice = String(values.DuPoliceDepartmentChoice ?? defaultPoliceDepartment);
  const policeDepartment =
    policeDepartmentChoice === otherPoliceDepartmentValue
      ? String(values.DuPoliceDepartmentOther ?? "").trim()
      : policeDepartmentChoice;

  return {
    ...values,
    DuPoliceDepartment: policeDepartment
  };
}

function mergeDuiFormValues(current: AppPopupFormValues, incoming: AppPopupFormValues): AppPopupFormValues {
  const merged: AppPopupFormValues = {
    ...incoming,
    ...current
  };

  for (const fieldName of actionManagedFieldNames) {
    if (typeof incoming[fieldName] !== "undefined") {
      merged[fieldName] = incoming[fieldName];
    }
  }

  return normalizeDuiFormValues(merged);
}

function getPoliceDepartmentChoice(value: string): string {
  const trimmedValue = value.trim();
  return policeDepartmentOptions.includes(trimmedValue as typeof policeDepartmentOptions[number]) ? trimmedValue : otherPoliceDepartmentValue;
}

function formatTaskState(timestamp: string | boolean | undefined, isComplete: boolean): string {
  if (!isComplete) {
    return "Pending";
  }

  const value = typeof timestamp === "string" ? timestamp : "";
  if (!value) {
    return "Completed";
  }

  return `Completed ${formatLocalTimestamp(value)}`;
}

function formatLocalTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(undefined, {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

