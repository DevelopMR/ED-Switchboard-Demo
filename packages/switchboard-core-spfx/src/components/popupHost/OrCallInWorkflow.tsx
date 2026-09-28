import * as React from "react";
import { AppPopupFormValues, AppPopupMessage } from "../../models/AppPopupMessage";
import { OrCallInContactItem, OrCallInRole } from "../../models/OrCallInContactItem";
import { OrMedTrakRosterItem } from "../../models/OrMedTrakRosterItem";

const roleDefinitions: Array<{ role: OrCallInRole; label: string; required: boolean; allowAodButton?: boolean }> = [
  { role: "Anesthesiologist", label: "Anesthesiologist", required: true, allowAodButton: true },
  { role: "AnesthesiaNurse", label: "Anesthesia Nurse", required: true },
  { role: "OrNurse", label: "OR Nurse", required: true },
  { role: "ScrubOrTech", label: "Scrub/OR Tech", required: true },
  { role: "SurgicalTechFirstAssist", label: "Surgical Tech 1st Asst", required: false },
  { role: "RecoveryNurse", label: "Recovery Nurse", required: true },
  { role: "Radiology", label: "Radiology", required: true }
];

const requiredFieldNames = [
  "OrDate",
  "OrTimeContacted",
  "OrAodName",
  "OrProcedure",
  "OrSurgeon",
  "OrSurgeryDate",
  "OrSurgeryTime",
  "OrSurgeryStatus",
  "OrCovidStatus"
] as const;

export interface OrCallInWorkflowProps {
  message: AppPopupMessage;
  onAction: (actionId: string, formValues?: AppPopupFormValues) => void;
  onDraftChange?: (formValues: AppPopupFormValues) => void;
  onResolveRoster?: (surgeryDateTimeIso: string) => Promise<OrMedTrakRosterItem[]>;
}

export function OrCallInWorkflow(props: OrCallInWorkflowProps): JSX.Element {
  const [formValues, setFormValues] = React.useState<AppPopupFormValues>(normalizeOrFormValues(props.message.formValues ?? {}));
  const [isRosterLoading, setIsRosterLoading] = React.useState<boolean>(false);
  const [rosterStatus, setRosterStatus] = React.useState<string>("");
  const formValuesRef = React.useRef<AppPopupFormValues>(formValues);
  const actionSyncKey = React.useMemo(() => props.message.actions.map((action) => `${action.id}:${action.disabled === true ? "1" : "0"}`).join("|"), [props.message.actions]);

  React.useEffect(() => {
    formValuesRef.current = formValues;
  }, [formValues]);

  React.useEffect(() => {
    const nextValues = normalizeOrFormValues(props.message.formValues ?? {});
    setFormValues((current) => (areFormValuesEqual(current, nextValues) ? current : nextValues));
  }, [props.message.formValues, props.message.id, actionSyncKey, props.message.terminalState]);

  const cArmRequired = formValues.OrCArmRequired === true;
  const contacts = React.useMemo(() => getContactsFromFormValues(formValues), [formValues]);
  const visibleContacts = React.useMemo(() => contacts.filter((contact) => isVisibleContact(contact.role, cArmRequired)), [contacts, cArmRequired]);
  const headerFieldsMissing = requiredFieldNames.filter((fieldName) => String(formValues[fieldName] ?? "").trim().length === 0);
  const missingContactRows = visibleContacts.filter((contact) => contact.required && !isContactComplete(contact));
  const operatorInitials = String(formValues.OrOperatorInitials ?? "").trim();
  const canSubmit = headerFieldsMissing.length === 0 && missingContactRows.length === 0 && operatorInitials.length > 0 && !Boolean(props.message.terminalState);
  const surgeryDateTimeIso = React.useMemo(
    () => combineDateAndTime(String(formValues.OrSurgeryDate ?? ""), String(formValues.OrSurgeryTime ?? "")),
    [formValues.OrSurgeryDate, formValues.OrSurgeryTime]
  );

  const updateFormValues = React.useCallback(
    (updater: (current: AppPopupFormValues) => AppPopupFormValues): void => {
      const nextValues = normalizeOrFormValues(updater(formValuesRef.current));
      formValuesRef.current = nextValues;
      setFormValues(nextValues);
      props.onDraftChange?.(nextValues);
    },
    [props.onDraftChange]
  );

  const updateContact = (role: OrCallInRole, updater: (current: OrCallInContactItem) => OrCallInContactItem): void => {
    updateFormValues((current) => {
      const nextContacts = getContactsFromFormValues(current).map((contact) => (contact.role === role ? updater(contact) : contact));
      return {
        ...current,
        OrContactsJson: serializeContacts(nextContacts.map((contact) => withComputedFlags(contact, current.OrCArmRequired === true)))
      };
    });
  };

  const handleFieldChange = (fieldName: string, value: string | boolean): void => {
    updateFormValues((current) => ({
      ...current,
      [fieldName]: value
    }));
  };

  const loadRoster = React.useCallback(async (): Promise<void> => {
    if (!props.onResolveRoster) {
      setRosterStatus("Mock MedTrak lookup is not available in this mode.");
      return;
    }

    if (!surgeryDateTimeIso) {
      setRosterStatus("Enter surgery date and time before loading the mock MedTrak team.");
      return;
    }

    setIsRosterLoading(true);
    setRosterStatus("Loading mock MedTrak roster...");

    try {
      const rosterEntries = await props.onResolveRoster(surgeryDateTimeIso);
      updateFormValues((current) => {
        const currentContacts = getContactsFromFormValues(current);
        const nextContacts = applyRosterEntries(currentContacts, rosterEntries).map((contact) => withComputedFlags(contact, current.OrCArmRequired === true));
        return {
          ...current,
          OrContactsJson: serializeContacts(nextContacts),
          OrRosterLoadedFor: getRosterLoadKey(current)
        };
      });

      setRosterStatus(
        rosterEntries.length > 0
          ? `Loaded ${rosterEntries.length} mock MedTrak roster entr${rosterEntries.length === 1 ? "y" : "ies"}.`
          : "No mock MedTrak entries matched that surgery date/time. Manual entry is still available."
      );
    } finally {
      setIsRosterLoading(false);
    }
  }, [props.onResolveRoster, surgeryDateTimeIso, updateFormValues]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (event.ctrlKey && event.key === "Enter" && canSubmit) {
      event.preventDefault();
      props.onAction("OrSubmit", buildEffectiveFormValues(formValues));
    }
  };

  return (
    <div className="swOrWorkflow" onKeyDown={handleKeyDown}>
      <div className="swDuiPaperForm">
        <div className="swPopupSectionLabel">OR Call-In Intake</div>
        <div className="swDuiHint">Synthetic demo only. Team lookup loads from the SharePoint mock MedTrak roster list.</div>
        <div className="swDuiFieldGrid">
          <label className="swDuiFieldRow">
            <span>Date *</span>
            <input type="date" value={String(formValues.OrDate ?? "")} onChange={(event) => handleFieldChange("OrDate", event.currentTarget.value)} />
          </label>
          <label className="swDuiFieldRow">
            <span>Time Contacted *</span>
            <input type="time" step={60} value={String(formValues.OrTimeContacted ?? "")} onChange={(event) => handleFieldChange("OrTimeContacted", event.currentTarget.value)} />
          </label>
          <label className="swDuiFieldRow swDuiFieldRowWide">
            <span>AOD *</span>
            <input type="text" value={String(formValues.OrAodName ?? "")} onChange={(event) => handleFieldChange("OrAodName", event.currentTarget.value)} />
          </label>
          <label className="swDuiFieldRow swDuiFieldRowWide">
            <span>Procedure *</span>
            <input type="text" value={String(formValues.OrProcedure ?? "")} onChange={(event) => handleFieldChange("OrProcedure", event.currentTarget.value)} />
          </label>
          <label className="swDuiFieldRow">
            <span>Surgeon *</span>
            <input type="text" value={String(formValues.OrSurgeon ?? "")} onChange={(event) => handleFieldChange("OrSurgeon", event.currentTarget.value)} />
          </label>
          <label className="swDuiFieldRow">
            <span>Surgery Status *</span>
            <select value={String(formValues.OrSurgeryStatus ?? "")} onChange={(event) => handleFieldChange("OrSurgeryStatus", event.currentTarget.value)}>
              <option value="">Select status</option>
              <option value="Stat">Stat</option>
              <option value="UrgentEmergent">Urgent/Emergent</option>
              <option value="Routine">Routine</option>
            </select>
          </label>
          <label className="swDuiFieldRow">
            <span>Surgery Date *</span>
            <input type="date" value={String(formValues.OrSurgeryDate ?? "")} onChange={(event) => handleFieldChange("OrSurgeryDate", event.currentTarget.value)} />
          </label>
          <label className="swDuiFieldRow">
            <span>Surgery Time *</span>
            <input type="time" step={60} value={String(formValues.OrSurgeryTime ?? "")} onChange={(event) => handleFieldChange("OrSurgeryTime", event.currentTarget.value)} />
          </label>
          <label className="swDuiFieldRow">
            <span>COVID Status *</span>
            <select value={String(formValues.OrCovidStatus ?? "Unknown")} onChange={(event) => handleFieldChange("OrCovidStatus", event.currentTarget.value)}>
              <option value="Unknown">Unknown</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </label>
          <label className="swDuiFieldRow">
            <span>C-Arm Required</span>
            <select value={cArmRequired ? "Yes" : "No"} onChange={(event) => handleFieldChange("OrCArmRequired", event.currentTarget.value === "Yes")}>
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </label>
          <label className="swDuiFieldRow swDuiFieldRowWide">
            <span>Notes</span>
            <textarea rows={3} value={String(formValues.OrNotes ?? "")} onChange={(event) => handleFieldChange("OrNotes", event.currentTarget.value)} />
          </label>
        </div>
      </div>

      <div className="swDuiPaperForm">
        <div className="swPopupSectionLabel">Call Script</div>
        <div className="swGeneratedTextBox swOrScriptBox">{buildCallScript(formValues)}</div>
      </div>

      <div className="swDuiChecklistPanel">
        <div className="swOrRosterPanel">
          <div className="swOrToolbar">
            <button className="swDuiActionButton" type="button" disabled={isRosterLoading} onClick={() => loadRoster().catch(() => undefined)}>
              {isRosterLoading ? "Loading Team..." : "Load OR Team"}
            </button>
            <div className="swOrStatusNote">(mock MedTrak)</div>
            {rosterStatus ? <div className="swOrStatusNote">{rosterStatus}</div> : null}
          </div>
        </div>
        <div className="swPopupSectionLabel">OR Team Call-In Log</div>
        <table className="swContactTable swOrContactTable">
          <thead>
            <tr>
              <th>Department</th>
              <th>Staff On Call</th>
              <th>Contact Numbers</th>
              <th>Time Contacted</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleContacts.map((contact) => {
              const definition = roleDefinitions.find((item) => item.role === contact.role);
              const rowComplete = isContactComplete(contact);

              return (
                <tr key={contact.role}>
                  <td>
                    <strong>{definition?.label ?? contact.role}</strong>
                    {contact.required ? <div>Required</div> : <div>Optional</div>}
                    {contact.role === "OrNurse" ? <div className="swOrDepartmentHint">Ask if C-Arm needed</div> : null}
                  </td>
                  <td>
                    <input
                      className="swOrContactInput swOrContactInput-borderless swOrStaffNameInput"
                      type="text"
                      value={contact.staffName}
                      onChange={(event) => updateContact(contact.role, (current) => ({ ...current, staffName: event.currentTarget.value }))}
                    />
                  </td>
                  <td>
                    <div className="swOrPhoneStack">
                      <input
                        className="swOrContactInput swOrContactInput-borderless swOrPhoneNumberInput"
                        type="text"
                        value={String(contact.phoneOne ?? "")}
                        onChange={(event) => updateContact(contact.role, (current) => ({ ...current, phoneOne: event.currentTarget.value }))}
                      />
                      <input
                        className="swOrContactInput swOrContactInput-borderless swOrPhoneNumberInput"
                        type="text"
                        value={String(contact.phoneTwo ?? "")}
                        onChange={(event) => updateContact(contact.role, (current) => ({ ...current, phoneTwo: event.currentTarget.value }))}
                      />
                    </div>
                  </td>
                  <td>
                    <input
                      className="swOrContactInput swOrContactInput-borderless"
                      type="datetime-local"
                      step={60}
                      value={String(contact.timeContacted ?? "")}
                      onChange={(event) => updateContact(contact.role, (current) => ({ ...current, timeContacted: event.currentTarget.value }))}
                    />
                    {contact.role === "Anesthesiologist" && contact.aodCalledAnesth ? <div>Contacted by AOD {formatLocalTimestamp(contact.aodCalledAnesthAt)}</div> : null}
                    {rowComplete ? <div className="swOrContactState swOrContactState-complete">Complete</div> : <div className="swOrContactState swOrContactState-pending">Pending</div>}
                  </td>
                  <td>
                    <textarea
                      className="swOrContactNotesInput"
                      rows={3}
                      value={String(contact.contactNotes ?? "")}
                      onChange={(event) => updateContact(contact.role, (current) => ({ ...current, contactNotes: event.currentTarget.value }))}
                    />
                  </td>
                  <td>
                    <div className="swOrActionStack">
                      <button
                        className="swDuiActionButton"
                        type="button"
                        onClick={() => updateContact(contact.role, (current) => ({ ...current, timeContacted: formatNowDateTimeLocalInput() }))}
                      >
                        Stamp Contact Time
                      </button>
                      {definition?.allowAodButton ? (
                        <button
                          className="swDuiActionButton"
                          type="button"
                          onClick={() =>
                            updateContact(contact.role, (current) => ({
                              ...current,
                              aodCalledAnesth: true,
                              aodCalledAnesthAt: formatNowDateTimeLocalInput()
                            }))
                          }
                        >
                          Contacted by AOD
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {headerFieldsMissing.length > 0 ? <div className="swPopupValidation">Complete the header fields before finalizing the OR call-in.</div> : null}
        {missingContactRows.length > 0 ? <div className="swPopupValidation">Still pending: {missingContactRows.map((contact) => getRoleLabel(contact.role)).join(", ")}.</div> : null}
        {operatorInitials.length === 0 ? <div className="swPopupValidation">Enter switchboard operator initials before finalizing the OR call-in.</div> : null}
      </div>

      <div className="swDuiPaperForm swOrReportPanel">
        <div className="swPopupSectionLabel">Report to AOD</div>
        <div className="swDuiFieldGrid">
          <label className="swDuiFieldRow">
            <span>Call Back Time To AOD</span>
            <input
              type="datetime-local"
              step={60}
              value={String(formValues.OrAodCallbackTime ?? "")}
              onChange={(event) => handleFieldChange("OrAodCallbackTime", event.currentTarget.value)}
            />
          </label>
          <label className="swDuiFieldRow">
            <span>Switchboard Operator Initials *</span>
            <input className="swOrInitialsInput" type="text" value={String(formValues.OrOperatorInitials ?? "")} onChange={(event) => handleFieldChange("OrOperatorInitials", event.currentTarget.value)} />
          </label>
        </div>
      </div>

      <div className="swDuiSubmitPanel">
        {props.message.terminalState ? <div className="swPopupCompletion">{props.message.terminalState}</div> : null}
        <button className="swDuiActionButton swDuiActionButton-submit" type="button" disabled={!canSubmit} onClick={() => props.onAction("OrSubmit", buildEffectiveFormValues(formValues))}>
          Final Submit
        </button>
      </div>
    </div>
  );
}

function normalizeOrFormValues(values: AppPopupFormValues): AppPopupFormValues {
  const cArmRequired = values.OrCArmRequired === true;
  const contacts = getContactsFromSerializedValue(values.OrContactsJson, cArmRequired);

  return {
    ...values,
    OrDate: normalizeDateInputValue(values.OrDate),
    OrTimeContacted: normalizeTimeInputValue(values.OrTimeContacted),
    OrSurgeryDate: normalizeDateInputValue(values.OrSurgeryDate),
    OrSurgeryTime: normalizeTimeInputValue(values.OrSurgeryTime),
    OrAodCallbackTime: normalizeDateTimeLocalInputValue(values.OrAodCallbackTime),
    OrCovidStatus: String(values.OrCovidStatus ?? "Unknown"),
    OrContactsJson: serializeContacts(contacts)
  };
}

function buildEffectiveFormValues(values: AppPopupFormValues): AppPopupFormValues {
  const normalizedValues = normalizeOrFormValues(values);
  return {
    ...normalizedValues,
    OrCallInScript: buildCallScript(normalizedValues)
  };
}

function getContactsFromFormValues(values: AppPopupFormValues): OrCallInContactItem[] {
  return getContactsFromSerializedValue(values.OrContactsJson, values.OrCArmRequired === true);
}

function getContactsFromSerializedValue(value: string | boolean | undefined, cArmRequired: boolean): OrCallInContactItem[] {
  const baseContacts = createDefaultContacts();
  if (typeof value !== "string" || value.trim().length === 0) {
    return baseContacts.map((contact) => withComputedFlags(contact, cArmRequired));
  }

  try {
    const parsed = JSON.parse(value) as Array<Partial<OrCallInContactItem>>;
    const byRole = new Map(parsed.filter((item): item is Partial<OrCallInContactItem> & { role: OrCallInRole } => Boolean(item?.role)).map((item) => [item.role, item]));
    return baseContacts.map((contact) =>
      withComputedFlags(
        {
          ...contact,
          ...byRole.get(contact.role),
          role: contact.role,
          callInId: String(byRole.get(contact.role)?.callInId ?? contact.callInId),
          staffName: String(byRole.get(contact.role)?.staffName ?? contact.staffName),
          phoneOne: getOptionalString(byRole.get(contact.role)?.phoneOne),
          phoneTwo: getOptionalString(byRole.get(contact.role)?.phoneTwo),
          timeContacted: normalizeDateTimeLocalInputValue(byRole.get(contact.role)?.timeContacted),
          contactNotes: getOptionalTextValue(byRole.get(contact.role)?.contactNotes),
          aodCalledAnesth: byRole.get(contact.role)?.aodCalledAnesth === true,
          aodCalledAnesthAt: normalizeDateTimeLocalInputValue(byRole.get(contact.role)?.aodCalledAnesthAt)
        },
        cArmRequired
      )
    );
  } catch {
    return baseContacts.map((contact) => withComputedFlags(contact, cArmRequired));
  }
}

function createDefaultContacts(): OrCallInContactItem[] {
  return roleDefinitions.map((definition, index) => ({
    id: "",
    callInId: "",
    role: definition.role,
    staffName: "",
    phoneOne: "",
    phoneTwo: "",
    timeContacted: "",
    contactNotes: definition.role === "Anesthesiologist" ? "AOD usually contacts this role before switchboard starts the call-in." : "",
    sortOrder: index + 1,
    required: definition.required,
    completed: false,
    aodCalledAnesth: false,
    aodCalledAnesthAt: ""
  }));
}

function withComputedFlags(contact: OrCallInContactItem, cArmRequired: boolean): OrCallInContactItem {
  const required = contact.role === "Radiology" ? cArmRequired : contact.role === "SurgicalTechFirstAssist" ? false : contact.required;
  return {
    ...contact,
    required,
    completed: isContactComplete({ ...contact, required })
  };
}

function serializeContacts(contacts: OrCallInContactItem[]): string {
  return JSON.stringify(contacts);
}

function areFormValuesEqual(left: AppPopupFormValues, right: AppPopupFormValues): boolean {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);

  if (leftKeys.length !== rightKeys.length) {
    return false;
  }

  return leftKeys.every((key) => left[key] === right[key]);
}

function isVisibleContact(role: OrCallInRole, cArmRequired: boolean): boolean {
  return role !== "Radiology" || cArmRequired;
}

function isContactComplete(contact: OrCallInContactItem): boolean {
  if (!contact.required) {
    return String(contact.timeContacted ?? "").trim().length > 0 || contact.aodCalledAnesth === true || String(contact.contactNotes ?? "").trim().length > 0;
  }

  if (contact.role === "Anesthesiologist") {
    return contact.aodCalledAnesth === true || String(contact.timeContacted ?? "").trim().length > 0;
  }

  return String(contact.timeContacted ?? "").trim().length > 0;
}

function applyRosterEntries(currentContacts: OrCallInContactItem[], rosterEntries: OrMedTrakRosterItem[]): OrCallInContactItem[] {
  const rosterByRole = new Map(rosterEntries.map((entry) => [entry.role, entry]));

  return currentContacts.map((contact) => {
    const rosterEntry = rosterByRole.get(contact.role);
    if (!rosterEntry) {
      return contact;
    }

    return {
      ...contact,
      staffName: rosterEntry.staffName || contact.staffName,
      phoneOne: rosterEntry.phoneOne || contact.phoneOne,
      phoneTwo: rosterEntry.phoneTwo || contact.phoneTwo,
      contactNotes: contact.contactNotes || rosterEntry.defaultNotes || ""
    };
  });
}

function buildCallScript(values: AppPopupFormValues): string {
  const surgeonValue = String(values.OrSurgeon ?? "").trim();
  const surgeon = surgeonValue || "(surgeon)";
  const surgeonLabel = /^dr\.?\s/i.test(surgeon) ? surgeon : `Dr. ${surgeon}`;
  const procedure = String(values.OrProcedure ?? "").trim() || "(procedure)";
  const status = mapStatusLabel(String(values.OrSurgeryStatus ?? "").trim() || "(status)");
  const urgencyText = getUrgencyText(String(values.OrSurgeryStatus ?? "").trim(), String(values.OrSurgeryTime ?? "").trim());
  const surgeryDateTimeLabel = formatSurgeryDateTimeLabel(String(values.OrSurgeryDate ?? ""), String(values.OrSurgeryTime ?? ""));

  return `Hello, this is the hospital switchboard calling for {team member}, ${surgeonLabel} is asking the OR Team to come in ${urgencyText} for a ${procedure}.
Surgery date and time: ${surgeryDateTimeLabel}. The status is ${status}.`;
}

function getUrgencyText(status: string, timeValue: string): string {
  if (status === "Stat") {
    return "ASAP";
  }

  if (status === "UrgentEmergent") {
    return "as soon as possible";
  }

  if (timeValue) {
    const parsed = parseTimeValue(timeValue);
    if (parsed) {
      return `at ${formatTimeLabel(parsed.hours, parsed.minutes)}`;
    }
  }

  return "for the scheduled surgery time";
}

function mapStatusLabel(value: string): string {
  return value === "UrgentEmergent" ? "Urgent/Emergent" : value;
}

function combineDateAndTime(dateValue: string, timeValue: string): string | undefined {
  return parseFlexibleDateTime(dateValue.trim(), timeValue.trim())?.toISOString();
}

function getRosterLoadKey(values: AppPopupFormValues): string {
  const surgeryDate = String(values.OrSurgeryDate ?? "").trim();
  const surgeryTime = String(values.OrSurgeryTime ?? "").trim();
  return surgeryDate && surgeryTime ? `${surgeryDate}|${surgeryTime}` : "";
}

function getOptionalString(value: unknown): string | undefined {
  const normalized = String(value ?? "").trim();
  return normalized.length > 0 ? normalized : undefined;
}

function getOptionalTextValue(value: unknown): string | undefined {
  const raw = String(value ?? "");
  return raw.trim().length > 0 ? raw : undefined;
}

function getRoleLabel(role: OrCallInRole): string {
  return roleDefinitions.find((definition) => definition.role === role)?.label ?? role;
}

function formatLocalTimestamp(value: string | undefined): string {
  if (!value) {
    return "";
  }

  const parsed = parseDateTimeLocalValue(value) ?? parseGeneralDateValue(value);
  if (!parsed) {
    return value;
  }

  return parsed.toLocaleString(undefined, {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function normalizeDateInputValue(value: string | boolean | undefined): string {
  const parsed = parseDateValue(String(value ?? "").trim());
  return parsed ? formatDateInputValue(parsed) : "";
}

function normalizeTimeInputValue(value: string | boolean | undefined): string {
  const parsed = parseTimeValue(String(value ?? "").trim());
  return parsed ? `${parsed.hours.toString().padStart(2, "0")}:${parsed.minutes.toString().padStart(2, "0")}` : "";
}

function normalizeDateTimeLocalInputValue(value: unknown): string | undefined {
  const normalized = String(value ?? "").trim();
  if (!normalized) {
    return undefined;
  }

  const parsed = parseDateTimeLocalValue(normalized) ?? parseGeneralDateValue(normalized);
  return parsed ? formatDateTimeLocalInputValue(parsed) : undefined;
}

function parseFlexibleDateTime(dateValue: string, timeValue: string): Date | undefined {
  const parsedDate = parseDateValue(dateValue);
  const parsedTime = parseTimeValue(timeValue);

  if (parsedDate && parsedTime) {
    return new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate(), parsedTime.hours, parsedTime.minutes, 0, 0);
  }

  return parseGeneralDateValue(`${dateValue} ${timeValue}`.trim());
}

function parseDateValue(value: string): Date | undefined {
  if (!value) {
    return undefined;
  }

  const htmlMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (htmlMatch) {
    return new Date(Number(htmlMatch[1]), Number(htmlMatch[2]) - 1, Number(htmlMatch[3]), 0, 0, 0, 0);
  }

  const general = parseGeneralDateValue(value);
  return general ? new Date(general.getFullYear(), general.getMonth(), general.getDate(), 0, 0, 0, 0) : undefined;
}

function parseTimeValue(value: string): { hours: number; minutes: number } | undefined {
  if (!value) {
    return undefined;
  }

  const htmlMatch = /^(\d{1,2}):(\d{2})$/.exec(value);
  if (htmlMatch) {
    return {
      hours: Number(htmlMatch[1]),
      minutes: Number(htmlMatch[2])
    };
  }

  const compactMatch = /^(\d{2})(\d{2})$/.exec(value);
  if (compactMatch) {
    return {
      hours: Number(compactMatch[1]),
      minutes: Number(compactMatch[2])
    };
  }

  const general = parseGeneralDateValue(`2000-01-01 ${value}`);
  return general
    ? {
        hours: general.getHours(),
        minutes: general.getMinutes()
      }
    : undefined;
}

function parseDateTimeLocalValue(value: string): Date | undefined {
  const htmlMatch = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!htmlMatch) {
    return undefined;
  }

  return new Date(Number(htmlMatch[1]), Number(htmlMatch[2]) - 1, Number(htmlMatch[3]), Number(htmlMatch[4]), Number(htmlMatch[5]), 0, 0);
}

function parseGeneralDateValue(value: string): Date | undefined {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function formatDateInputValue(value: Date): string {
  return `${value.getFullYear()}-${`${value.getMonth() + 1}`.padStart(2, "0")}-${`${value.getDate()}`.padStart(2, "0")}`;
}

function formatDateTimeLocalInputValue(value: Date): string {
  return `${formatDateInputValue(value)}T${`${value.getHours()}`.padStart(2, "0")}:${`${value.getMinutes()}`.padStart(2, "0")}`;
}

function formatNowDateTimeLocalInput(): string {
  return formatDateTimeLocalInputValue(new Date());
}

function formatSurgeryDateTimeLabel(dateValue: string, timeValue: string): string {
  const parsed = parseFlexibleDateTime(dateValue.trim(), timeValue.trim());
  if (!parsed) {
    return "(surgery date/time pending)";
  }

  return parsed.toLocaleString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function formatTimeLabel(hours: number, minutes: number): string {
  return new Date(2000, 0, 1, hours, minutes, 0, 0).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit"
  });
}
