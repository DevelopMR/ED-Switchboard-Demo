import * as React from "react";
import { DailyNotesPanel } from "../dailyNotes/DailyNotesPanel";
import { LeftNavMenu } from "../moduleColumn/LeftNavMenu";
import { ModuleColumn } from "../moduleColumn/ModuleColumn";
import { ModuleLaunchDialog } from "../moduleColumn/ModuleLaunchDialog";
import { SwitchboardCodeAlertOriginatorDialog } from "../moduleColumn/SwitchboardCodeAlertOriginatorDialog";
import { PopupHost } from "../popupHost/PopupHost";
import { ShellHeader } from "./ShellHeader";
import { useShellClock } from "../../hooks/useShellClock";
import { formatClockTime } from "../../utils/dateFormatting";
import { useDailyNotesState } from "../../hooks/useDailyNotesState";
import { useLeaveWarning } from "../../hooks/useLeaveWarning";
import { usePopupHostState } from "../../hooks/usePopupHostState";
import { AlarmPanelItem } from "../../models/AlarmPanelItem";
import { DuiIntakeItem } from "../../models/DuiIntakeItem";
import { OrCallInContactItem } from "../../models/OrCallInContactItem";
import { OrCallInItem } from "../../models/OrCallInItem";
import { PagingLogItem } from "../../models/PagingLogItem";
import { SwDailyNoteCategory } from "../../models/SwDailyNoteCategory";
import { AppPopupFormValues, AppPopupLaunchKind } from "../../models/AppPopupMessage";
import { SwMenuRole } from "../../models/SwMenuRole";
import { ShellServiceBundle } from "../../services/ShellServiceBundle";
import { createMockShellServices } from "../../services/createMockShellServices";

export interface SwitchboardShellProps {
  services?: ShellServiceBundle;
  showLauncherMenu?: boolean;
  menuRoleOverride?: SwMenuRole;
  defaultCodeAlertFacility?: string;
}

const defaultServices = createMockShellServices();

export function SwitchboardShell(props: SwitchboardShellProps): JSX.Element {
  const services = React.useMemo(() => props.services ?? defaultServices, [props.services]);
  const now = useShellClock();
  const [activeLaunchKind, setActiveLaunchKind] = React.useState<AppPopupLaunchKind | undefined>(undefined);
  const [isCodeAlertOriginatorOpen, setIsCodeAlertOriginatorOpen] = React.useState<boolean>(false);
  const inFlightPopupActionsRef = React.useRef<Set<string>>(new Set());
  const popupHostState = usePopupHostState(services.popupHostService);
  useLeaveWarning(popupHostState.messages.length > 0);
  const dailyNotesState = useDailyNotesState({
    notesService: services.notesService,
    drawerCountService: services.drawerCountService,
    currentUserName: services.currentUserName
  });

  const handlePopupAction = async (messageId: string, actionId: string, formValues?: AppPopupFormValues): Promise<void> => {
    const actionKey = `${messageId}:${actionId}`;
    if (inFlightPopupActionsRef.current.has(actionKey)) {
      return;
    }

    inFlightPopupActionsRef.current.add(actionKey);
    const message = popupHostState.messages.find((candidate) => candidate.id === messageId);
    const actionTime = new Date();
    const listActionTimeIso = actionTime.toISOString();
    const actionTimeLabel = formatClockTime(actionTime.toISOString());
    const isCodeAlertCompletion = message?.messageType === "CodeAlert" && willCompleteCodeAlert(message, actionId);

    try {
      if (message?.messageType === "OrCallIn" && actionId === "OrSubmit") {
        const mergedValues = {
          ...message.formValues,
          ...formValues
        };
        const callIn = await services.orCallInService.createCallIn(buildOrCallInItem(mergedValues, listActionTimeIso));

        await dailyNotesState.createModuleNote({
          entryType: SwDailyNoteCategory.OrCallIn,
          title: callIn.title,
          summary: `${callIn.procedure} OR call-in completed at ${actionTimeLabel}.`,
          details: formatOrCallInDetails(callIn),
          sourceModule: "OrCallIn",
          sourceItemId: callIn.id,
          locationText: callIn.surgeon
        });
      }

      if (message?.messageType === "DuiIntake" && actionId === "DuiSubmit") {
        const mergedValues = {
          ...message.formValues,
          ...formValues
        };
        const intake = await services.duiIntakeService.createIntake(buildDuiIntakeItem(mergedValues, listActionTimeIso));

        await dailyNotesState.createModuleNote({
          entryType: SwDailyNoteCategory.Dui,
          title: intake.title,
          summary: `${intake.policeDepartment} intake completed at ${actionTimeLabel}.`,
          details: formatDuiIntakeDetails(intake),
          sourceModule: "Dui",
          sourceItemId: intake.id,
          locationText: intake.policeDepartment
        });
      }

      if (message?.messageType === "PagingLog" && actionId === "PgSubmit") {
        const mergedValues = {
          ...message.formValues,
          ...formValues
        };
        const pagingLog = await services.pagingLogService.createLog(buildPagingLogItem(mergedValues, listActionTimeIso));

        await dailyNotesState.createModuleNote({
          entryType: SwDailyNoteCategory.Paging,
          title: pagingLog.title,
          summary: `${pagingLog.whoNeededPaged} page completed at ${actionTimeLabel}.`,
          details: formatPagingLogDetails(pagingLog),
          sourceModule: "Paging",
          sourceItemId: pagingLog.id,
          locationText: pagingLog.department
        });
      }

      if (message?.messageType === "AlarmPanel" && actionId === "AlSubmit") {
        const mergedValues = {
          ...message.formValues,
          ...formValues
        };
        const alarmPanelLog = await services.alarmPanelService.createLog(buildAlarmPanelItem(mergedValues, listActionTimeIso, services.currentUserName));

        await dailyNotesState.createModuleNote({
          entryType: SwDailyNoteCategory.AlarmPanel,
          title: alarmPanelLog.title,
          summary: `${alarmPanelLog.alarmSource} logged at ${actionTimeLabel}. Maintenance contacted at ${formatClockTime(alarmPanelLog.maintenanceContactedAt ?? listActionTimeIso)}.`,
          details: formatAlarmPanelDetails(alarmPanelLog),
          sourceModule: "AlarmPanel",
          sourceItemId: alarmPanelLog.id,
          locationText: alarmPanelLog.panelGroup
        });
      }

      if (message?.messageType === "CodeAlert" && actionId === "RiskmasterDemoCompleted") {
        const receiptCode = String(formValues?.RmReceiptCode ?? message.formValues?.RmReceiptCode ?? "").trim();
        await services.riskmasterService.markCopiedBack(receiptCode);
      }

      if (message?.messageType === "CodeAlert" && isCodeAlertCompletion) {
        const location = String(formValues?.CaLocation ?? message.subtitle ?? "Location not specified");
        const mergedValues = {
          ...message.formValues,
          ...formValues
        };
        const announcementText = renderTemplate(message.announcementTemplate, mergedValues);
        await dailyNotesState.createModuleNote({
          entryType: SwDailyNoteCategory.CodeAlert,
          title: message.title,
          summary: `${location} workflow completed at ${actionTimeLabel}.`,
          details: formatPopupDetails(message.title, listActionTimeIso, getCodeAlertLogValues(message, actionId, mergedValues)),
          sourceModule: "CodeAlert",
          sourceItemId: message.id,
          locationText: location
        });

        if (actionId !== "ContactNurseConcernLogged" && mergedValues.RmReceiptCode) {
          await services.pageLogService.createPageLog({
            id: `PGL-${actionTime.getTime()}`,
            title: `${message.title} - ${location}`,
            pageDateTime: listActionTimeIso,
            pageType: "CodeAlert",
            messageText: announcementText,
            location,
            alertCategory: getAlertCategory(message.workflowKind),
            descriptionOfAlert: `${message.title} workflow completed for ${location}.`,
            callerName: String(mergedValues.CaCallerName ?? "Demo Caller"),
            unitDepartment: inferDepartment(location),
            patientName: String(mergedValues.PgPatientName ?? "Jane Demo"),
            patientMrn: String(mergedValues.PgPatientMrn ?? "MRN-FAKE-0001"),
            patientDob: String(mergedValues.PgPatientDob ?? "1990-01-01"),
            patientSsn: String(mergedValues.PgPatientSsn ?? "000-00-0001"),
            allClearDateTime: actionId === "AllClearAnnounced" ? listActionTimeIso : undefined,
            additionalInfo: formatPageLogAdditionalInfo(message, actionId, mergedValues),
            switchboard: services.currentUserName,
            riskmasterCode: String(mergedValues.RmReceiptCode),
            sourceModule: "CodeAlert",
            sourceItemId: message.id,
            operatorName: services.currentUserName,
            status: actionId === "AllClearAnnounced" ? "AllClear" : "Logged",
            notes: getDemoPageLogNotes(mergedValues)
          });
        }
      }

      if (message && actionId === "noted") {
        const location = String(formValues?.CaLocation ?? message.subtitle ?? "Location not specified");
        await dailyNotesState.createModuleNote({
          entryType: SwDailyNoteCategory.AlarmPanel,
          title: message.title,
          summary: `${location} workflow logged at ${actionTimeLabel}.`,
          details: formatPopupDetails(message.title, listActionTimeIso, formValues),
          sourceModule: "AlarmPanel",
          sourceItemId: message.id,
          locationText: location
        });
      }

      await popupHostState.executeAction(messageId, actionId, formValues);
    } finally {
      inFlightPopupActionsRef.current.delete(actionKey);
    }
  };

  const handleLaunchSubmit = async (kind: AppPopupLaunchKind, formValues: AppPopupFormValues): Promise<void> => {
    await popupHostState.launchPopup({
      kind,
      formValues
    });
    setActiveLaunchKind(undefined);
  };

  const handleStartOrCallIn = (): void => {
    popupHostState.launchPopup({
      kind: "OrCallIn"
    }).catch(() => undefined);
  };

  const handleStartDuiIntake = (): void => {
    popupHostState.launchPopup({
      kind: "DuiIntake"
    }).catch(() => undefined);
  };

  const handleStartPagingLog = (): void => {
    popupHostState.launchPopup({
      kind: "PagingLog"
    }).catch(() => undefined);
  };

  const handleStartAlarmPanel = (): void => {
    popupHostState.launchPopup({
      kind: "FireAlarmPanel"
    }).catch(() => undefined);
  };

  return (
    <div className="swShell">
      {props.showLauncherMenu !== false ? (
        <LeftNavMenu referenceLinksService={services.referenceLinksService} menuRoleOverride={props.menuRoleOverride} />
      ) : null}
      <ShellHeader selectedDate={dailyNotesState.selectedDate} currentTimeLabel={formatClockTime(now.toISOString())} />
      <div className="swShellBody">
        <DailyNotesPanel
          selectedDate={dailyNotesState.selectedDate}
          notes={dailyNotesState.visibleNotes}
          drawerCountState={dailyNotesState.drawerState}
          searchText={dailyNotesState.searchText}
          onSearchChange={dailyNotesState.setSearchText}
          onPreviousDay={dailyNotesState.goToPreviousDay}
          onNextDay={dailyNotesState.goToNextDay}
          onToday={dailyNotesState.goToToday}
          onPrint={() => window.print()}
          onOpenEntryDialog={dailyNotesState.openEntryDialog}
          onCloseEntryDialog={dailyNotesState.closeEntryDialog}
          onCreateManualNote={dailyNotesState.createManualNote}
          onToggleDrawerSlot={(slot) => dailyNotesState.toggleDrawerSlot(slot, services.currentUserName).catch(() => undefined)}
          isEntryDialogOpen={dailyNotesState.isEntryDialogOpen}
        />
        {props.showLauncherMenu !== false ? (
          <ModuleColumn
            onStartCodeAlert={() => setIsCodeAlertOriginatorOpen(true)}
            onStartOrCallIn={handleStartOrCallIn}
            onStartDuiIntake={handleStartDuiIntake}
            onStartPagingLog={handleStartPagingLog}
            onStartFireAlarmPanel={handleStartAlarmPanel}
          />
        ) : null}
      </div>
      <PopupHost messages={popupHostState.messages} onAction={handlePopupAction} onResolveOrRoster={services.orCallInService.getRosterEntries.bind(services.orCallInService)} />
      <SwitchboardCodeAlertOriginatorDialog
        isOpen={isCodeAlertOriginatorOpen}
        defaultFacility={props.defaultCodeAlertFacility ?? "HOS"}
        onCancel={() => setIsCodeAlertOriginatorOpen(false)}
        onSubmit={async (kind, values) => {
          await handleLaunchSubmit(kind, values);
          setIsCodeAlertOriginatorOpen(false);
        }}
      />
      <ModuleLaunchDialog
        launchKind={activeLaunchKind}
        onCancel={() => setActiveLaunchKind(undefined)}
        onSubmit={handleLaunchSubmit}
      />
    </div>
  );
}

function willCompleteCodeAlert(message: { actions: Array<{ id: string; label: string; disabled?: boolean }> }, actionId: string): boolean {
  if (actionId === "ContactNurseConcernLogged") {
    return true;
  }

  const requiredActions = message.actions.filter((action) => action.id !== "DailyNoteLogged");

  return requiredActions.length > 0 && requiredActions.every((requiredAction) => {
    if (requiredAction.id === actionId) {
      return true;
    }

    return message.actions.some((action) => action.id === requiredAction.id && action.disabled === true);
  });
}

function formatCompletedActions(message: { actions: Array<{ id: string; label: string; disabled?: boolean }> }, actionId: string): string {
  if (actionId === "ContactNurseConcernLogged") {
    return "Contact Nurse concern documented";
  }

  return message.actions
    .filter((action) => action.id !== "DailyNoteLogged" && (action.disabled || action.id === actionId))
    .map((action) => action.label)
    .join(", ");
}

function formatPageLogAdditionalInfo(
  message: { actions: Array<{ id: string; label: string; disabled?: boolean }> },
  actionId: string,
  formValues: AppPopupFormValues
): string {
  const parts = [formatCompletedActions(message, actionId)];
  const bombThreatEvidenceNotes = String(formValues.CaBombThreatEvidenceNotes ?? "").trim();
  const missingPatientPageLog = String(formValues.CaMissingPatientPageLog ?? "").trim();

  if (bombThreatEvidenceNotes) {
    parts.push(`Bomb threat evidence notes:\n${bombThreatEvidenceNotes}`);
  }

  if (missingPatientPageLog) {
    parts.push(`Missing patient page attempts:\n${missingPatientPageLog}`);
  }

  return parts.filter((part) => part.trim().length > 0).join("\n\n");
}

function getDemoPageLogNotes(formValues: AppPopupFormValues): string {
  if (String(formValues.CaBombThreatEvidenceNotes ?? "").trim().length > 0) {
    return "Synthetic demo page-log row. Bomb threat evidence notes copied into Additional Info. Spreadsheet append is deferred.";
  }

  return "Synthetic demo page-log row. Spreadsheet append is deferred.";
}

function getCodeAlertLogValues(
  message: { formValues?: AppPopupFormValues; actions: Array<{ id: string; label: string; disabled?: boolean }> },
  actionId: string,
  formValues?: AppPopupFormValues
): AppPopupFormValues {
  const values: AppPopupFormValues = {
    ...message.formValues,
    ...formValues,
    CompletedActions: formatCompletedActions(message, actionId)
  };

  if (actionId !== "ContactNurseConcernLogged") {
    values.PgOverheadPageLog = "Final page log row written";
  }

  return values;
}

function getAlertCategory(workflowKind?: string): string {
  if (
    workflowKind === "FireAlarm" ||
    workflowKind === "SevereWeatherEventActivation" ||
    workflowKind === "Decontamination" ||
    workflowKind === "HazardousMaterialsSpillRelease" ||
    workflowKind === "MassCasualtyIncident" ||
    workflowKind === "EmergencyOperationsPlan"
  ) {
    return "Facility";
  }

  if (
    workflowKind === "ArmedSubjectActiveShooter" ||
    workflowKind === "EnhancedSecurityMeasures" ||
    workflowKind === "ConditionSupport" ||
    workflowKind === "BombThreat" ||
    workflowKind === "ChildAbduction" ||
    workflowKind === "InfantAbduction" ||
    workflowKind === "MissingPersonMissingChild"
  ) {
    return "Security";
  }

  return "Medical";
}

function inferDepartment(location: string): string {
  if (location.toLowerCase().startsWith("ed")) {
    return "Emergency Department";
  }

  const firstToken = location.trim().split(/\s+/)[0];
  return firstToken || "Demo Department";
}

function formatPopupDetails(title: string, actionTimeIso: string, formValues?: AppPopupFormValues): string {
  const entries = Object.entries(formValues ?? {})
    .filter(([, value]) => value !== undefined && String(value).trim().length > 0)
    .map(([key, value]) => `${key}: ${String(value)}`);

  return [`${title} operator workflow logged at ${actionTimeIso}.`, ...entries].join("\n");
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

function buildOrCallInItem(formValues: AppPopupFormValues, actionTimeIso: string): OrCallInItem {
  const procedure = getTrimmedValue(formValues, "OrProcedure");
  const contacts = parseOrCallInContacts(formValues)
    .filter((contact) => shouldPersistOrContact(contact, formValues.OrCArmRequired === true))
    .map((contact, index) => ({
      ...contact,
      callInId: `ORCALL-${new Date(actionTimeIso).getTime()}`,
      sortOrder: index + 1,
      required: contact.role === "Radiology" ? formValues.OrCArmRequired === true : contact.role === "SurgicalTechFirstAssist" ? false : contact.required,
      completed: isOrContactComplete(contact),
      timeContacted: normalizeLocalDateTimeToIso(contact.timeContacted),
      aodCalledAnesthAt: normalizeLocalDateTimeToIso(contact.aodCalledAnesthAt)
    }));

  const radiologyContact = contacts.find((contact) => contact.role === "Radiology");
  const teamCallInNotes = buildOrTeamCallInNotes(contacts);

  return {
    id: "",
    title: procedure ? `OR Call In - ${procedure}` : "OR Call In",
    callInId: `ORCALL-${new Date(actionTimeIso).getTime()}`,
    date: getTrimmedValue(formValues, "OrDate") || actionTimeIso,
    timeContacted: combineLocalDateAndTime(getTrimmedValue(formValues, "OrDate"), getTrimmedValue(formValues, "OrTimeContacted"), actionTimeIso),
    aodName: getTrimmedValue(formValues, "OrAodName"),
    procedure,
    surgeon: getTrimmedValue(formValues, "OrSurgeon"),
    surgeryDateTime: combineLocalDateAndTime(getTrimmedValue(formValues, "OrSurgeryDate"), getTrimmedValue(formValues, "OrSurgeryTime"), actionTimeIso),
    surgeryStatus: getTrimmedValue(formValues, "OrSurgeryStatus"),
    covidStatus: getTrimmedValue(formValues, "OrCovidStatus"),
    cArmRequired: formValues.OrCArmRequired === true,
    radiologyContactedTime: radiologyContact?.timeContacted ? combineLocalDateAndTime(getTrimmedValue(formValues, "OrDate"), radiologyContact.timeContacted, actionTimeIso) : undefined,
    aodCallbackTime: getOptionalTrimmedValue(formValues, "OrAodCallbackTime"),
    operatorInitials: getOptionalTrimmedValue(formValues, "OrOperatorInitials"),
    callInScript: getOptionalTrimmedValue(formValues, "OrCallInScript"),
    status: "Complete",
    notes: getOptionalTrimmedValue(formValues, "OrNotes"),
    teamCallInNotes,
    contacts
  };
}

function formatOrCallInDetails(item: OrCallInItem): string {
  const lines = [
    `${item.title} completed.`,
    `AOD: ${item.aodName}`,
    `Procedure: ${item.procedure}`,
    `Surgeon: ${item.surgeon}`,
    `Surgery Date/Time: ${item.surgeryDateTime}`,
    `Status: ${item.surgeryStatus}`,
    `COVID Status: ${item.covidStatus}`,
    `C-Arm Required: ${item.cArmRequired ? "Yes" : "No"}`,
    `Time Contacted: ${item.timeContacted}`
  ];

  if (item.callInScript) {
    lines.push(`Call Script: ${item.callInScript}`);
  }

  item.contacts.forEach((contact) => {
    lines.push(
      `${contact.role}: ${contact.staffName || "Unassigned"} | Time Contacted: ${contact.timeContacted ?? "Pending"} | AOD Contacted: ${contact.aodCalledAnesth ? "Yes" : "No"}`
    );
    if (contact.contactNotes) {
      lines.push(`  Notes: ${contact.contactNotes}`);
    }
  });

  if (item.notes) {
    lines.push(`Notes: ${item.notes}`);
  }

  if (item.teamCallInNotes) {
    lines.push(`Team Call-In Notes:\n${item.teamCallInNotes}`);
  }

  return lines.join("\n");
}

function buildDuiIntakeItem(formValues: AppPopupFormValues, intakeDateIso: string): DuiIntakeItem {
  const intakeDate = getTrimmedValue(formValues, "DuDate") || intakeDateIso;
  const nameLastFirst = getTrimmedValue(formValues, "DuNameLastFirst");

  return {
    id: "",
    title: nameLastFirst ? `DUI Intake - ${nameLastFirst}` : "DUI Intake",
    intakeId: `DUI-${new Date(intakeDateIso).getTime()}`,
    intakeDate,
    dob: getTrimmedValue(formValues, "DuDob"),
    ssn: getTrimmedValue(formValues, "DuSsn"),
    nameLastFirst,
    policeDepartment: getTrimmedValue(formValues, "DuPoliceDepartment"),
    policeOfficer: getTrimmedValue(formValues, "DuPoliceOfficer"),
    policeIncidentNumber: getTrimmedValue(formValues, "DuPoliceIncidentNumber"),
    registrationNumber: getTrimmedValue(formValues, "DuRegistrationNumber"),
    securityNotified: formValues.DuSecurityNotified === true,
    securityNotifiedAt: getOptionalTrimmedValue(formValues, "DuSecurityNotifiedAt"),
    labNotified: formValues.DuLabNotified === true,
    labNotifiedAt: getOptionalTrimmedValue(formValues, "DuLabNotifiedAt"),
    registered: formValues.DuRegistered === true,
    registeredAt: getOptionalTrimmedValue(formValues, "DuRegisteredAt"),
    notes: getOptionalTrimmedValue(formValues, "DuNotes")
  };
}

function formatDuiIntakeDetails(item: DuiIntakeItem): string {
  const lines = [
    `${item.title} completed.`,
    `Date: ${item.intakeDate}`,
    `Name: ${item.nameLastFirst}`,
    `Police Department: ${item.policeDepartment}`,
    `Police Officer: ${item.policeOfficer}`,
    `Police Incident Number: ${item.policeIncidentNumber}`,
    `Registration Number: ${item.registrationNumber}`,
    `Security Notified At: ${item.securityNotifiedAt ?? "Pending"}`,
    `Lab Notified At: ${item.labNotifiedAt ?? "Pending"}`,
    `Registration Confirmed At: ${item.registeredAt ?? "Pending"}`
  ];

  if (item.notes) {
    lines.push(`Notes: ${item.notes}`);
  }

  return lines.join("\n");
}

function buildAlarmPanelItem(formValues: AppPopupFormValues, actionTimeIso: string, operatorName: string): AlarmPanelItem {
  const alarmSource = getTrimmedValue(formValues, "AlAlarmSource") || "Alarm Panel";
  const panelGroup = getTrimmedValue(formValues, "AlPanelGroup") as AlarmPanelItem["panelGroup"];

  const maintenanceContacted = formValues.AlMaintenanceContacted === true;
  const maintenanceContactedAt = maintenanceContacted ? getOptionalTrimmedValue(formValues, "AlMaintenanceContactedAt") ?? actionTimeIso : undefined;

  return {
    id: "",
    title: alarmSource ? `Alarm Panel - ${alarmSource}` : "Alarm Panel Log",
    alarmSource,
    panelGroup: panelGroup || "Remote Alarm Panel",
    alarmDetails: getOptionalTrimmedValue(formValues, "AlAlarmDetails"),
    maintenanceContacted,
    maintenanceContactedAt,
    maintenanceScript: getOptionalTrimmedValue(formValues, "AlMaintenanceScript"),
    codeAlertCalled: formValues.AlCodeAlertCalled === true,
    loggedAt: actionTimeIso,
    operatorName
  };
}

function formatAlarmPanelDetails(item: AlarmPanelItem): string {
  const lines = [
    `${item.title} completed.`,
    `Panel Group: ${item.panelGroup}`,
    `Alarm Source: ${item.alarmSource}`,
    `Maintenance Contacted: ${item.maintenanceContacted ? "Yes" : "No"}`,
    `Maintenance Contacted At: ${item.maintenanceContactedAt ?? "Not required"}`,
    `Code Alert Called: ${item.codeAlertCalled ? "Yes" : "No"}`,
    `Logged At: ${item.loggedAt}`
  ];

  if (item.alarmDetails) {
    lines.push(`Details: ${item.alarmDetails}`);
  }

  if (item.maintenanceScript) {
    lines.push(`Maintenance Script: ${item.maintenanceScript}`);
  }

  return lines.join("\n");
}

function buildPagingLogItem(formValues: AppPopupFormValues, actionTimeIso: string): PagingLogItem {
  const whoNeededPaged = getTrimmedValue(formValues, "PgWhoNeededPaged");
  const combinedDateTime = combinePagingDateAndTime(getTrimmedValue(formValues, "PgDate"), getTrimmedValue(formValues, "PgTime"), actionTimeIso);

  return {
    id: "",
    title: whoNeededPaged ? `Paging Log - ${whoNeededPaged}` : "Paging Log",
    logId: `PAGING-${new Date(actionTimeIso).getTime()}`,
    dateTime: combinedDateTime,
    whoCalled: getTrimmedValue(formValues, "PgWhoCalled"),
    fromWhere: getTrimmedValue(formValues, "PgFromWhere"),
    callbackNumber: getTrimmedValue(formValues, "PgCallbackNumber"),
    whoNeededPaged,
    department: getTrimmedValue(formValues, "PgDepartment"),
    personOnCallPhoneNumber: getTrimmedValue(formValues, "PgPersonOnCallPhoneNumber"),
    success: true,
    successAt: getOptionalTrimmedValue(formValues, "PgSuccessAt") ?? actionTimeIso,
    notes: getOptionalTrimmedValue(formValues, "PgNotes")
  };
}

function formatPagingLogDetails(item: PagingLogItem): string {
  const lines = [
    `${item.title} completed.`,
    `Date/Time: ${item.dateTime}`,
    `Who Called: ${item.whoCalled}`,
    `From Where: ${item.fromWhere}`,
    `Call Back Number: ${item.callbackNumber}`,
    `Who Needed Paged: ${item.whoNeededPaged}`,
    `Department: ${item.department}`,
    `Person On Call Phone Number: ${item.personOnCallPhoneNumber}`,
    `Successful Page: ${item.success ? "Yes" : "No"}`,
    `Successful Page At: ${item.successAt ?? "Pending"}`
  ];

  if (item.notes) {
    lines.push(`Notes: ${item.notes}`);
  }

  return lines.join("\n");
}

function parseOrCallInContacts(formValues: AppPopupFormValues): OrCallInContactItem[] {
  try {
    const parsed = JSON.parse(String(formValues.OrContactsJson ?? "[]")) as OrCallInContactItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function buildOrTeamCallInNotes(contacts: OrCallInContactItem[]): string | undefined {
  const sections = contacts
    .map((contact) => {
      const note = String(contact.contactNotes ?? "");
      const trimmedNote = note.trim();
      if (!trimmedNote || isDefaultOrContactNote(contact.role, trimmedNote)) {
        return undefined;
      }

      return `${getOrContactTitle(contact.role)}:\n${trimmedNote}`;
    })
    .filter((value): value is string => Boolean(value));

  return sections.length > 0 ? sections.join("\n\n") : undefined;
}

function getOrContactTitle(role: OrCallInContactItem["role"]): string {
  switch (role) {
    case "AnesthesiaNurse":
      return "Anesthesia Nurse";
    case "OrNurse":
      return "OR Nurse";
    case "ScrubOrTech":
      return "Scrub/OR Tech";
    case "SurgicalTechFirstAssist":
      return "Surgical Tech 1st Asst";
    case "RecoveryNurse":
      return "Recovery Nurse";
    default:
      return role;
  }
}

function isDefaultOrContactNote(role: OrCallInContactItem["role"], note: string): boolean {
  if (role === "Anesthesiologist" && note === "AOD usually contacts this role before switchboard starts the call-in.") {
    return true;
  }

  if (role === "SurgicalTechFirstAssist" && note === "Optional call-in role.") {
    return true;
  }

  return false;
}

function shouldPersistOrContact(contact: OrCallInContactItem, cArmRequired: boolean): boolean {
  if (contact.role === "Radiology" && !cArmRequired) {
    return false;
  }

  return (
    String(contact.staffName ?? "").trim().length > 0 ||
    String(contact.phoneOne ?? "").trim().length > 0 ||
    String(contact.phoneTwo ?? "").trim().length > 0 ||
    String(contact.timeContacted ?? "").trim().length > 0 ||
    String(contact.contactNotes ?? "").trim().length > 0 ||
    contact.aodCalledAnesth === true ||
    contact.required
  );
}

function isOrContactComplete(contact: OrCallInContactItem): boolean {
  if (contact.role === "Anesthesiologist") {
    return contact.aodCalledAnesth === true || String(contact.timeContacted ?? "").trim().length > 0;
  }

  return String(contact.timeContacted ?? "").trim().length > 0;
}

function combineLocalDateAndTime(dateValue: string, timeValue: string, fallbackIso: string): string {
  const normalizedDate = dateValue.trim();
  const normalizedTime = timeValue.trim();
  const parsed = new Date(`${normalizedDate} ${normalizedTime}`);

  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString();
  }

  const fallbackParsed = new Date(timeValue);
  if (!Number.isNaN(fallbackParsed.getTime())) {
    return fallbackParsed.toISOString();
  }

  return fallbackIso;
}

function combinePagingDateAndTime(dateValue: string, timeValue: string, fallbackIso: string): string {
  const normalizedDate = dateValue.trim();
  const normalizedTime = timeValue.trim();
  const parsed = new Date(`${normalizedDate} ${normalizedTime}`);

  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString();
  }

  return fallbackIso;
}

function normalizeLocalDateTimeToIso(value: string | undefined): string | undefined {
  const normalized = String(value ?? "").trim();
  if (!normalized) {
    return undefined;
  }

  const parsed = new Date(normalized);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString();
  }

  return value;
}

function getTrimmedValue(formValues: AppPopupFormValues, fieldName: string): string {
  return String(formValues[fieldName] ?? "").trim();
}

function getOptionalTrimmedValue(formValues: AppPopupFormValues, fieldName: string): string | undefined {
  const value = getTrimmedValue(formValues, fieldName);
  return value.length > 0 ? value : undefined;
}




