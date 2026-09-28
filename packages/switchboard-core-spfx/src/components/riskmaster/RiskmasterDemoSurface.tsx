import * as React from "react";
import { RmDemoEntryItem } from "../../models/RmDemoEntryItem";
import { IRmDemoEntriesService } from "../../services/contracts/IRmDemoEntriesService";

export interface RiskmasterDemoSurfaceProps {
  service: IRmDemoEntriesService;
  currentUserName: string;
}

interface RiskmasterDemoFormState {
  condition: string;
  alertType: string;
  location: string;
  facility: string;
  department: string;
  room: string;
  eventDescription: string;
  sourcePopupId: string;
  sourceAlertId: string;
}

export function RiskmasterDemoSurface(props: RiskmasterDemoSurfaceProps): JSX.Element {
  const [formState, setFormState] = React.useState<RiskmasterDemoFormState>(() => readInitialState());
  const [receiptCode, setReceiptCode] = React.useState<string | undefined>(undefined);
  const [errorMessage, setErrorMessage] = React.useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  const updateValue = React.useCallback((fieldName: keyof RiskmasterDemoFormState, value: string): void => {
    setFormState((current) => ({
      ...current,
      [fieldName]: value
    }));
  }, []);

  const handleSubmit = React.useCallback(async (): Promise<void> => {
    setIsSubmitting(true);
    setErrorMessage(undefined);

    const now = new Date();
    const listDateTime = now.toISOString();
    const fakeReceiptCode = createFakeRiskmasterCode(now);
    const item: RmDemoEntryItem = {
      id: fakeReceiptCode,
      title: `${formState.condition} - ${formState.location} - ${fakeReceiptCode}`,
      submittedAt: listDateTime,
      operator: props.currentUserName,
      alertType: formState.alertType,
      condition: formState.condition,
      location: formState.location,
      facility: formState.facility,
      department: formState.department,
      room: formState.room,
      dateOfCall: listDateTime,
      alerted911: formState.condition === "Fire Alarm",
      cancelled911: false,
      eventDescription: formState.eventDescription,
      receiptCode: fakeReceiptCode,
      status: "CodeReturned",
      sourcePopupId: formState.sourcePopupId,
      sourceAlertId: formState.sourceAlertId,
      payloadJson: JSON.stringify({
        demoOnly: true,
        containsRealPatientData: false,
        source: "RiskmasterDemoSurface"
      }),
      notes: "Internal demo Riskmaster simulation. No production Riskmaster write occurred."
    };

    try {
      await props.service.createEntry(item);
      setReceiptCode(fakeReceiptCode);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Riskmaster demo submit failed.");
    } finally {
      setIsSubmitting(false);
    }
  }, [formState, props.currentUserName, props.service]);

  const handleSubmitClick = React.useCallback((): void => {
    handleSubmit().catch((error: unknown) => {
      setErrorMessage(error instanceof Error ? error.message : "Riskmaster demo submit failed.");
      setIsSubmitting(false);
    });
  }, [handleSubmit]);

  return (
    <div className="swRiskmasterDemoSurface">
      <header className="swRiskmasterDemoHeader">
        <span>RISKMASTER</span>
        <h1>Operator - Condition Data Entry</h1>
        <p>Internal demo only. No production Riskmaster write occurs.</p>
      </header>
      <section className="swRiskmasterDemoForm" aria-label="Riskmaster demo form">
        <RiskmasterTextField label="Operator" value={props.currentUserName} readOnly />
        <RiskmasterTextField label="Facility" value={formState.facility} onChange={(value) => updateValue("facility", value)} />
        <RiskmasterTextField label="Department" value={formState.department} onChange={(value) => updateValue("department", value)} />
        <RiskmasterTextField label="Room" value={formState.room} onChange={(value) => updateValue("room", value)} />
        <RiskmasterTextField label="Location" value={formState.location} onChange={(value) => updateValue("location", value)} />
        <RiskmasterTextField label="Condition" value={formState.condition} onChange={(value) => updateValue("condition", value)} />
        <RiskmasterTextField label="Stat Page Type" value={formState.alertType} onChange={(value) => updateValue("alertType", value)} />
        <label className="swRiskmasterDemoField">
          <span>Event Description</span>
          <textarea
            value={formState.eventDescription}
            onChange={(event) => updateValue("eventDescription", event.currentTarget.value)}
            rows={5}
          />
        </label>
        <button className="swPopupAction swPopupAction-primary" disabled={isSubmitting || Boolean(receiptCode)} type="button" onClick={handleSubmitClick}>
          {isSubmitting ? "Submitting Demo Entry" : "Submit Demo Riskmaster Entry"}
        </button>
        {errorMessage ? <div className="swRiskmasterDemoError">{errorMessage}</div> : null}
        {receiptCode ? (
          <div className="swRiskmasterDemoReceipt">
            <h2>Demo Riskmaster Response</h2>
            <p>Copy this code back into the Code Alert popup:</p>
            <div className="swRiskmasterDemoCode">{receiptCode}</div>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function RiskmasterTextField(props: {
  label: string;
  value: string;
  readOnly?: boolean;
  onChange?: (value: string) => void;
}): JSX.Element {
  return (
    <label className="swRiskmasterDemoField">
      <span>{props.label}</span>
      <input
        readOnly={props.readOnly}
        value={props.value}
        onChange={(event) => props.onChange?.(event.currentTarget.value)}
      />
    </label>
  );
}

function readInitialState(): RiskmasterDemoFormState {
  const params = new URLSearchParams(window.location.search);
  const location = params.get("RmLocation") ?? "ED Room 12";

  return {
    condition: params.get("RmCondition") ?? "Code Blue Adult",
    alertType: params.get("RmAlertType") ?? "Medical",
    location,
    facility: params.get("RmFacility") ?? "Demo Hospital",
    department: params.get("RmDepartment") ?? inferDepartment(location),
    room: params.get("RmRoom") ?? location,
    eventDescription: params.get("RmEventDescription") ?? `Demo alert at ${location}.`,
    sourcePopupId: params.get("RmSourcePopupId") ?? "",
    sourceAlertId: params.get("RmSourceAlertId") ?? ""
  };
}

function inferDepartment(location: string): string {
  if (location.toLowerCase().startsWith("ed")) {
    return "Emergency Department";
  }

  const firstToken = location.trim().split(/\s+/)[0];
  return firstToken || "Demo Department";
}

function createFakeRiskmasterCode(date: Date): string {
  const datePart = date.toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `RM-DEMO-${datePart}-${randomPart}`;
}
