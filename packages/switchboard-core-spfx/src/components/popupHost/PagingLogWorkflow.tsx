import * as React from "react";
import { AppPopupFormValues, AppPopupMessage } from "../../models/AppPopupMessage";

const requiredFieldNames = [
  "PgDate",
  "PgTime",
  "PgWhoCalled",
  "PgFromWhere",
  "PgCallbackNumber",
  "PgWhoNeededPaged",
  "PgDepartment",
  "PgPersonOnCallPhoneNumber"
] as const;

export interface PagingLogWorkflowProps {
  message: AppPopupMessage;
  onAction: (actionId: string, formValues?: AppPopupFormValues) => void;
  onDraftChange?: (formValues: AppPopupFormValues) => void;
}

export function PagingLogWorkflow(props: PagingLogWorkflowProps): JSX.Element {
  const [formValues, setFormValues] = React.useState<AppPopupFormValues>(props.message.formValues ?? {});
  const actionSyncKey = React.useMemo(() => {
    return props.message.actions.map((action) => `${action.id}:${action.disabled === true ? "1" : "0"}`).join("|");
  }, [props.message.actions]);

  React.useEffect(() => {
    setFormValues((current) => ({
      ...props.message.formValues,
      ...current,
      PgSuccess: props.message.formValues?.PgSuccess,
      PgSuccessAt: props.message.formValues?.PgSuccessAt
    }));
  }, [actionSyncKey, props.message.formValues, props.message.id, props.message.terminalState]);

  const successComplete = formValues.PgSuccess === true || Boolean(props.message.terminalState);
  const requiredFieldsMissing = requiredFieldNames.some((fieldName) => String(formValues[fieldName] ?? "").trim().length === 0);
  const canComplete = !requiredFieldsMissing && !Boolean(props.message.terminalState);

  const updateFormValues = (fieldName: string, value: string): void => {
    setFormValues((current) => {
      const nextValues = {
        ...current,
        [fieldName]: value
      };
      props.onDraftChange?.(nextValues);
      return nextValues;
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (event.ctrlKey && event.key === "Enter" && canComplete) {
      event.preventDefault();
      props.onAction("PgSubmit", formValues);
    }
  };

  return (
    <div className="swDuiWorkflow" onKeyDown={handleKeyDown}>
      <div className="swDuiPaperForm">
        <div className="swPopupSectionLabel">Paging Request Form</div>
        <div className="swDuiHint">Synthetic internal demo only. Directory lookup remains a future read-only stub.</div>
        <div className="swDuiFieldGrid">
          <label className="swDuiFieldRow">
            <span>Date *</span>
            <input type="text" value={String(formValues.PgDate ?? "")} onChange={(event) => updateFormValues("PgDate", event.currentTarget.value)} />
          </label>
          <label className="swDuiFieldRow">
            <span>Time *</span>
            <input type="text" value={String(formValues.PgTime ?? "")} onChange={(event) => updateFormValues("PgTime", event.currentTarget.value)} />
          </label>
          <label className="swDuiFieldRow swDuiFieldRowWide">
            <span>Who Called *</span>
            <input type="text" value={String(formValues.PgWhoCalled ?? "")} onChange={(event) => updateFormValues("PgWhoCalled", event.currentTarget.value)} />
          </label>
          <label className="swDuiFieldRow swDuiFieldRowWide">
            <span>From Where *</span>
            <input type="text" value={String(formValues.PgFromWhere ?? "")} onChange={(event) => updateFormValues("PgFromWhere", event.currentTarget.value)} />
          </label>
          <label className="swDuiFieldRow swDuiFieldRowWide">
            <span>Call Back Number *</span>
            <input type="text" value={String(formValues.PgCallbackNumber ?? "")} onChange={(event) => updateFormValues("PgCallbackNumber", event.currentTarget.value)} />
          </label>
          <label className="swDuiFieldRow">
            <span>Who Needed Paged *</span>
            <input type="text" value={String(formValues.PgWhoNeededPaged ?? "")} onChange={(event) => updateFormValues("PgWhoNeededPaged", event.currentTarget.value)} />
          </label>
          <label className="swDuiFieldRow">
            <span>Department *</span>
            <input type="text" value={String(formValues.PgDepartment ?? "")} onChange={(event) => updateFormValues("PgDepartment", event.currentTarget.value)} />
          </label>
          <label className="swDuiFieldRow swDuiFieldRowWide">
            <span>Person On Call Phone Number *</span>
            <input
              type="text"
              value={String(formValues.PgPersonOnCallPhoneNumber ?? "")}
              onChange={(event) => updateFormValues("PgPersonOnCallPhoneNumber", event.currentTarget.value)}
            />
          </label>
          <div className="swDuiFieldRow swDuiFieldRowWide">
            <span>Phone Directory</span>
            <button className="swDuiActionButton" type="button" disabled>
              Directory Lookup Stub
            </button>
          </div>
          <label className="swDuiFieldRow swDuiFieldRowWide">
            <span>Notes</span>
            <textarea rows={4} value={String(formValues.PgNotes ?? "")} onChange={(event) => updateFormValues("PgNotes", event.currentTarget.value)} />
          </label>
        </div>
      </div>

      <div className="swDuiChecklistPanel">
        <div className="swPopupSectionLabel">Required Checklist</div>
        <div className="swDuiChecklistRow">
          <div>
            <strong>Successful page</strong>
            <div>{formatTaskState(formValues.PgSuccessAt, successComplete)}</div>
          </div>
          <div className="swPagingCompletionRow">
            {props.message.terminalState ? <div className="swPopupCompletion">{props.message.terminalState}</div> : null}
            <button
              className="swDuiActionButton"
              type="button"
              disabled={!canComplete}
              onClick={() => props.onAction("PgSubmit", formValues)}
            >
              Page Complete
            </button>
          </div>
        </div>
        {requiredFieldsMissing ? <div className="swPopupValidation">Complete the paper-form fields before closing the page request.</div> : null}
      </div>
    </div>
  );
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
