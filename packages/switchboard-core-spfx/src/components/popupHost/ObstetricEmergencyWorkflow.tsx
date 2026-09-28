import * as React from "react";
import { getAlertColorClass } from "../../constants/CodeAlertLaunchOptions";
import { AppPopupFormValues, AppPopupMessage } from "../../models/AppPopupMessage";
import { OrCallInRole } from "../../models/OrCallInContactItem";
import { OrMedTrakRosterItem } from "../../models/OrMedTrakRosterItem";
import { RiskmasterDemoStep } from "./CodeAlertWorkflowShell";

interface ObstetricContactDefinition {
  actionId: string;
  role?: OrCallInRole;
  label: string;
  phoneOne?: string;
  phoneTwo?: string;
  defaultNotes?: string;
  required: boolean;
}

interface ObstetricContactRow extends ObstetricContactDefinition {
  staffName: string;
  timeContacted?: string;
  notes?: string;
}

const contactDefinitions: ObstetricContactDefinition[] = [
  {
    actionId: "ContactObstetrician",
    role: "Obstetrician",
    label: "Obstetrician on call",
    defaultNotes: "Women's Health Specialty / OBGYN",
    required: true
  },
  {
    actionId: "ContactPediatricHospitalist",
    role: "PediatricHospitalist",
    label: "Pediatric Hospitalist on call",
    defaultNotes: "Do not call if birthing center says no Peds.",
    required: true
  },
  {
    actionId: "ContactAnesthesiologist",
    role: "Anesthesiologist",
    label: "Anesthesiologist on call",
    required: true
  },
  {
    actionId: "ContactAnesthesiaNurse",
    role: "AnesthesiaNurse",
    label: "Anesthesia Nurse on call",
    required: true
  },
  {
    actionId: "ContactAod",
    label: "AOD",
    phoneOne: "841-555-0166",
    required: true
  },
  {
    actionId: "ContactLaboratory",
    label: "Laboratory",
    phoneOne: "842-555-0106",
    required: true
  }
];

export interface ObstetricEmergencyWorkflowProps {
  message: AppPopupMessage;
  announcementText: string;
  onAction: (actionId: string, formValues?: AppPopupFormValues) => void;
  onDraftChange?: (formValues: AppPopupFormValues) => void;
  onResolveRoster?: (surgeryDateTimeIso: string) => Promise<OrMedTrakRosterItem[]>;
}

export function ObstetricEmergencyWorkflow(props: ObstetricEmergencyWorkflowProps): JSX.Element {
  const [formValues, setFormValues] = React.useState<AppPopupFormValues>(normalizeValues(props.message.formValues ?? {}));
  const [isRosterLoading, setIsRosterLoading] = React.useState<boolean>(false);
  const [rosterStatus, setRosterStatus] = React.useState<string>("");
  const formValuesRef = React.useRef<AppPopupFormValues>(formValues);
  const actionSyncKey = React.useMemo(() => props.message.actions.map((action) => `${action.id}:${action.disabled === true ? "1" : "0"}`).join("|"), [props.message.actions]);
  const alertColorClass = getAlertColorClass(props.message);

  React.useEffect(() => {
    formValuesRef.current = formValues;
  }, [formValues]);

  React.useEffect(() => {
    const nextValues = normalizeValues(props.message.formValues ?? {});
    setFormValues((current) => (areFormValuesEqual(current, nextValues) ? current : nextValues));
  }, [props.message.formValues, props.message.id, actionSyncKey, props.message.terminalState]);

  const noPedsRequested = formValues.CaNoPediatricsRequested === true;
  const contacts = React.useMemo(() => getContactsFromValues(formValues), [formValues]);
  const requiredContactActions = contactDefinitions.filter((definition) => !(noPedsRequested && definition.actionId === "ContactPediatricHospitalist")).map((definition) => definition.actionId);
  const contactsComplete = requiredContactActions.every((actionId) => isActionComplete(props.message, actionId));
  const checklistComplete = isActionComplete(props.message, "ContactChecklistLogged");
  const riskmasterComplete = isActionComplete(props.message, "RiskmasterDemoCompleted");

  const updateFormValues = React.useCallback(
    (updater: (current: AppPopupFormValues) => AppPopupFormValues): void => {
      const nextValues = normalizeValues(updater(formValuesRef.current));
      formValuesRef.current = nextValues;
      setFormValues(nextValues);
      props.onDraftChange?.(nextValues);
    },
    [props.onDraftChange]
  );

  const updateContact = (actionId: string, updater: (current: ObstetricContactRow) => ObstetricContactRow): void => {
    updateFormValues((current) => {
      const nextContacts = getContactsFromValues(current).map((contact) => (contact.actionId === actionId ? updater(contact) : contact));
      return {
        ...current,
        CaObContactsJson: JSON.stringify(nextContacts)
      };
    });
  };

  const loadRoster = React.useCallback(async (): Promise<void> => {
    if (!props.onResolveRoster) {
      setRosterStatus("Mock MedTrak lookup is not available in this mode.");
      return;
    }

    setIsRosterLoading(true);
    setRosterStatus("Loading mock MedTrak contacts...");

    try {
      const rosterEntries = await props.onResolveRoster(new Date().toISOString());
      updateFormValues((current) => {
        const nextContacts = applyRosterEntries(getContactsFromValues(current), rosterEntries);
        return {
          ...current,
          CaObRosterLoadedAt: new Date().toISOString(),
          CaObContactsJson: JSON.stringify(nextContacts)
        };
      });
      setRosterStatus(
        rosterEntries.length > 0
          ? `Loaded ${rosterEntries.length} mock MedTrak roster entr${rosterEntries.length === 1 ? "y" : "ies"}.`
          : "No mock MedTrak entries matched the current time. Manual entry is still available."
      );
    } finally {
      setIsRosterLoading(false);
    }
  }, [props.onResolveRoster, updateFormValues]);

  const handleFieldChange = (fieldName: string, value: string | boolean): void => {
    updateFormValues((current) => ({
      ...current,
      [fieldName]: value
    }));
  };

  const stampContact = (contact: ObstetricContactRow): void => {
    const timestamp = new Date().toISOString();
    const nextContacts = contacts.map((item) =>
      item.actionId === contact.actionId
        ? {
            ...item,
            timeContacted: timestamp
          }
        : item
    );
    const nextValues = {
      ...formValues,
      CaObContactsJson: JSON.stringify(nextContacts),
      [`${contact.actionId}At`]: timestamp,
      [`${contact.actionId}Name`]: contact.staffName,
      [`${contact.actionId}Notes`]: contact.notes
    };
    setFormValues(normalizeValues(nextValues));
    props.onDraftChange?.(nextValues);
    props.onAction(contact.actionId, nextValues);
  };

  const handleChecklistComplete = (): void => {
    const nextValues = {
      ...formValues,
      CaObContactSummary: buildContactSummary(contacts, noPedsRequested)
    };
    props.onAction("ContactChecklistLogged", nextValues);
  };

  return (
    <div className={`swAlertWorkflow swCodeAlertWorkflow swObWorkflow ${alertColorClass}`}>
      <section className={`swAlertTask swWorkflowStep ${alertColorClass}${isActionComplete(props.message, "Acknowledge") ? " isComplete" : " isActive"}`}>
        <div className="swWorkflowStepHeader">
          <span>ACKNOWLEDGE</span>
          {isActionComplete(props.message, "Acknowledge") ? <span className="swWorkflowStepStatus">✓</span> : null}
        </div>
        {!isActionComplete(props.message, "Acknowledge") ? (
          <div className={`swAlertTaskBody swWorkflowStepBody ${alertColorClass}`}>
            <div>ED Switchboard has received your Obstetrics Emergency alert. Respond immediately.</div>
            <button className="swPopupAction swPopupAction-primary swAcknowledgeAction" type="button" onClick={() => props.onAction("Acknowledge", formValues)}>
              Acknowledge
            </button>
          </div>
        ) : null}
      </section>

      <section className={`swAlertTask swWorkflowStep ${alertColorClass}${isActionComplete(props.message, "AnnouncementCompleted") ? " isComplete" : " isActive"}`}>
        <div className="swWorkflowStepHeader">
          <span>READ OVERHEAD PAGE 3 TIMES</span>
          {isActionComplete(props.message, "AnnouncementCompleted") ? <span className="swWorkflowStepStatus">✓</span> : null}
        </div>
        {!isActionComplete(props.message, "AnnouncementCompleted") ? (
          <div className={`swAlertTaskBody swWorkflowStepBody ${alertColorClass}`}>
            <div className="swGeneratedTextBox swObAnnouncementBox">{props.announcementText}</div>
            <div className="swDuiHint">Approved format: Medical Alert + Obstetric Emergency + Department and Room Number.</div>
            <button className="swPopupAction swPopupAction-secondary" type="button" onClick={() => props.onAction("AnnouncementCompleted", formValues)}>
              Announcement Complete
            </button>
          </div>
        ) : null}
      </section>

      <section className={`swAlertTask swWorkflowStep ${alertColorClass}${contactsComplete ? " isComplete" : " isActive"}`}>
        <div className="swWorkflowStepHeader">
          <span>CONTACT OBSTETRICS TEAM</span>
          {contactsComplete ? <span className="swWorkflowStepStatus">✓</span> : null}
        </div>
        <div className={`swAlertTaskBody swWorkflowStepBody ${alertColorClass}`}>
          <div className="swObRosterToolbar">
            <button className="swDuiActionButton" type="button" disabled={isRosterLoading} onClick={() => loadRoster().catch(() => undefined)}>
              {isRosterLoading ? "Loading Contacts..." : "Load Obstetrics Contacts"}
            </button>
            <span className="swOrStatusNote">(mock MedTrak)</span>
            {rosterStatus ? <span className="swOrStatusNote">{rosterStatus}</span> : null}
          </div>
          <label className="swPopupCheckboxField swObNoPedsToggle">
            <input type="checkbox" checked={noPedsRequested} onChange={(event) => handleFieldChange("CaNoPediatricsRequested", event.currentTarget.checked)} />
            <span>Birthing center says no Peds: do not include Pediatric Hospitalist.</span>
          </label>
          <table className="swContactTable swOrContactTable swObContactTable">
            <thead>
              <tr>
                <th>Order</th>
                <th>Contact</th>
                <th>Staff On Call</th>
                <th>Contact Numbers</th>
                <th>Time Contacted</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact, index) => {
                const isPedsSkipped = noPedsRequested && contact.actionId === "ContactPediatricHospitalist";
                const complete = isPedsSkipped || isActionComplete(props.message, contact.actionId);
                return (
                  <tr className={isPedsSkipped ? "swObSkippedRow" : ""} key={contact.actionId}>
                    <td>#{index + 1}</td>
                    <td>
                      <strong>{contact.label}</strong>
                      <div>{isPedsSkipped ? "Skipped" : contact.required ? "Required" : "Optional"}</div>
                    </td>
                    <td>
                      <input
                        className="swOrContactInput swOrContactInput-borderless swOrStaffNameInput"
                        type="text"
                        disabled={isPedsSkipped}
                        value={contact.staffName}
                        onChange={(event) => updateContact(contact.actionId, (current) => ({ ...current, staffName: event.currentTarget.value }))}
                      />
                    </td>
                    <td>
                      <div className="swObPhoneLine">
                        {[contact.phoneOne, contact.phoneTwo].filter((phone) => String(phone ?? "").trim().length > 0).map((phone) => (
                          <span className="swObPhoneNumber" key={String(phone)}>
                            {String(phone)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <input
                        className="swOrContactInput swOrContactInput-borderless"
                        type="datetime-local"
                        step={60}
                        disabled={isPedsSkipped}
                        value={formatDateTimeLocalValue(contact.timeContacted)}
                        onChange={(event) => updateContact(contact.actionId, (current) => ({ ...current, timeContacted: event.currentTarget.value }))}
                      />
                      {complete ? <div className="swOrContactState swOrContactState-complete">Complete</div> : <div className="swOrContactState swOrContactState-pending">Pending</div>}
                    </td>
                    <td>
                      <textarea
                        className="swOrContactNotesInput"
                        rows={3}
                        disabled={isPedsSkipped}
                        value={String(contact.notes ?? "")}
                        onChange={(event) => updateContact(contact.actionId, (current) => ({ ...current, notes: event.currentTarget.value }))}
                      />
                    </td>
                    <td>
                      <button className="swDuiActionButton" type="button" disabled={complete} onClick={() => stampContact(contact)}>
                        {isPedsSkipped ? "Skipped" : "Stamp Contact Time"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!contactsComplete ? <div className="swPopupValidation">Complete each required contact, or mark no Peds if instructed.</div> : null}
          <button className="swPopupAction swPopupAction-secondary" type="button" disabled={!contactsComplete || checklistComplete} onClick={handleChecklistComplete}>
            Contact Checklist Complete
          </button>
        </div>
      </section>

      <section className={`swAlertTask swWorkflowStep ${alertColorClass}${riskmasterComplete ? " isComplete" : checklistComplete ? " isActive" : ""}`}>
        <div className="swWorkflowStepHeader">
          <span>CONFIRM RISKMASTER DEMO ENTRY</span>
          {riskmasterComplete ? <span className="swWorkflowStepStatus">✓</span> : null}
        </div>
        {checklistComplete && !riskmasterComplete ? (
          <div className={`swAlertTaskBody swWorkflowStepBody ${alertColorClass}`}>
            <RiskmasterDemoStep
              message={{ ...props.message, formValues }}
              text="Open the simulated Riskmaster form, submit the demo entry, then copy the returned fake Riskmaster code back here."
              onSubmit={(receiptCode) =>
                props.onAction("RiskmasterDemoCompleted", {
                  ...formValues,
                  RmReceiptCode: receiptCode
                })
              }
            />
          </div>
        ) : null}
      </section>
      {props.message.terminalState ? <div className="swPopupCompletion">{props.message.terminalState}</div> : null}
    </div>
  );
}

function normalizeValues(values: AppPopupFormValues): AppPopupFormValues {
  return {
    ...values,
    CaObContactsJson: JSON.stringify(getContactsFromValues(values))
  };
}

function getContactsFromValues(values: AppPopupFormValues): ObstetricContactRow[] {
  const baseContacts = createDefaultContacts();
  const serialized = values.CaObContactsJson;

  if (typeof serialized !== "string" || serialized.trim().length === 0) {
    return baseContacts;
  }

  try {
    const parsed = JSON.parse(serialized) as Array<Partial<ObstetricContactRow>>;
    const byActionId = new Map(parsed.filter((item): item is Partial<ObstetricContactRow> & { actionId: string } => typeof item?.actionId === "string").map((item) => [item.actionId, item]));
    return baseContacts.map((contact) => {
      const saved = byActionId.get(contact.actionId);
      return {
        ...contact,
        staffName: String(saved?.staffName ?? contact.staffName),
        phoneOne: String(saved?.phoneOne ?? contact.phoneOne ?? ""),
        phoneTwo: String(saved?.phoneTwo ?? contact.phoneTwo ?? ""),
        timeContacted: String(saved?.timeContacted ?? ""),
        notes: String(saved?.notes ?? contact.notes ?? contact.defaultNotes ?? "")
      };
    });
  } catch {
    return baseContacts;
  }
}

function createDefaultContacts(): ObstetricContactRow[] {
  return contactDefinitions.map((definition) => ({
    ...definition,
    staffName: definition.role ? "" : definition.label,
    phoneOne: definition.phoneOne ?? "",
    phoneTwo: definition.phoneTwo ?? "",
    timeContacted: "",
    notes: definition.defaultNotes ?? ""
  }));
}

function applyRosterEntries(currentContacts: ObstetricContactRow[], rosterEntries: OrMedTrakRosterItem[]): ObstetricContactRow[] {
  const rosterByRole = new Map(rosterEntries.map((entry) => [entry.role, entry]));
  return currentContacts.map((contact) => {
    const rosterEntry = contact.role ? rosterByRole.get(contact.role) : undefined;
    if (!rosterEntry) {
      return contact;
    }

    return {
      ...contact,
      staffName: rosterEntry.staffName || contact.staffName,
      phoneOne: rosterEntry.phoneOne || contact.phoneOne,
      phoneTwo: rosterEntry.phoneTwo || contact.phoneTwo,
      notes: contact.notes || rosterEntry.defaultNotes || ""
    };
  });
}

function isActionComplete(message: AppPopupMessage, actionId: string): boolean {
  return message.actions.some((action) => action.id === actionId && action.disabled === true);
}

function buildContactSummary(contacts: ObstetricContactRow[], noPedsRequested: boolean): string {
  return contacts
    .map((contact) => {
      if (noPedsRequested && contact.actionId === "ContactPediatricHospitalist") {
        return `${contact.label}: skipped - birthing center said no Peds.`;
      }

      const contactedAt = contact.timeContacted ? formatDisplayTimestamp(contact.timeContacted) : "not recorded";
      const name = contact.staffName || "not recorded";
      const numbers = [contact.phoneOne, contact.phoneTwo].filter((item) => String(item ?? "").trim().length > 0).join(" / ");
      const notes = String(contact.notes ?? "").trim();
      return `${contact.label}: ${name}${numbers ? ` (${numbers})` : ""}, contacted ${contactedAt}.${notes ? ` Notes: ${notes}` : ""}`;
    })
    .join("\n");
}

function formatDateTimeLocalValue(value: string | undefined): string {
  if (!value) {
    return "";
  }

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)) {
    return value.slice(0, 16);
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  const year = parsed.getFullYear();
  const month = `${parsed.getMonth() + 1}`.padStart(2, "0");
  const day = `${parsed.getDate()}`.padStart(2, "0");
  const hours = `${parsed.getHours()}`.padStart(2, "0");
  const minutes = `${parsed.getMinutes()}`.padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function formatDisplayTimestamp(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString([], {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function areFormValuesEqual(left: AppPopupFormValues, right: AppPopupFormValues): boolean {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);

  if (leftKeys.length !== rightKeys.length) {
    return false;
  }

  return leftKeys.every((key) => left[key] === right[key]);
}