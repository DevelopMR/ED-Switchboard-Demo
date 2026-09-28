import * as React from "react";
import { getFirstHourResponsePdfDataUrl } from "../../assets/firstHourResponsePdfData";
import { getAlertColorClass } from "../../constants/CodeAlertLaunchOptions";
import { AppPopupFormValues, AppPopupMessage } from "../../models/AppPopupMessage";

export interface CodeAlertWorkflowShellProps {
  message: AppPopupMessage;
  announcementText: string;
  onAction: (actionId: string, formValues?: AppPopupFormValues) => void;
}

export function CodeAlertWorkflowShell(props: CodeAlertWorkflowShellProps): JSX.Element {
  const [copiedActionId, setCopiedActionId] = React.useState<string | undefined>(undefined);
  const copyResetTimeoutRef = React.useRef<number | undefined>(undefined);
  const alertColorClass = getAlertColorClass(props.message);
  const isBombThreat = props.message.workflowKind === "BombThreat";
  const isBombEvidenceClosed = props.message.formValues?.CaBombEvidenceClosed === true;
  const bombEvidenceNotes = String(props.message.formValues?.CaBombThreatEvidenceNotes ?? "");
  const stepDefinitions = props.message.actions
    .filter((action) => action.id !== "DailyNoteLogged")
    .filter((action) => shouldIncludeStep(action.id, props.message))
    .map((action) => ({
      actionId: action.id,
      title: getStepTitle(action.id, props.message),
      body: getStepBody(action.id, props.message, props.announcementText, getEpicChatText(props.message)),
      buttonLabel: getButtonLabel(action.id, action.label),
      referenceUrl: getStepReferenceUrl(action.id, props.message)
    }));
  const firstIncompleteIndex = stepDefinitions.findIndex((step) => !isActionComplete(props.message, step.actionId));
  const activeIndex = firstIncompleteIndex === -1 ? stepDefinitions.length : firstIncompleteIndex;
  const compactCompletedCount = getCompactCompletedCount(props.message, stepDefinitions.map((step) => step.actionId));

  React.useEffect(() => {
    return () => {
      if (copyResetTimeoutRef.current !== undefined) {
        window.clearTimeout(copyResetTimeoutRef.current);
      }
    };
  }, []);

  const handleCopy = React.useCallback((actionId: string, text: string): void => {
    if (!navigator.clipboard) {
      return;
    }

    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopiedActionId(actionId);

        if (copyResetTimeoutRef.current !== undefined) {
          window.clearTimeout(copyResetTimeoutRef.current);
        }

        copyResetTimeoutRef.current = window.setTimeout(() => {
          setCopiedActionId(undefined);
        }, 1500);
      })
      .catch(() => undefined);
  }, []);

  return (
    <div className={`swAlertWorkflow swCodeAlertWorkflow ${alertColorClass}`}>
      {isBombThreat && !isBombEvidenceClosed ? (
        <BombThreatEvidencePanel
          notes={bombEvidenceNotes}
          onNotesChange={(notes) =>
            props.onAction("BombThreatEvidenceSaved", {
              ...props.message.formValues,
              CaBombThreatEvidenceNotes: notes,
              CaBombEvidenceClosed: false
            })
          }
          onSaveClose={(notes) =>
            props.onAction("BombThreatEvidenceClosed", {
              ...props.message.formValues,
              CaBombThreatEvidenceNotes: notes,
              CaBombEvidenceClosed: true
            })
          }
        />
      ) : null}
      {renderWorkflowSteps(stepDefinitions, compactCompletedCount, (step, index) => {
        const isComplete = isActionComplete(props.message, step.actionId);
        const isActive = index === activeIndex && !props.message.terminalState;
        const bodyText = step.body;

        return (
          <section className={`swAlertTask swWorkflowStep ${alertColorClass}${isActive ? " isActive" : ""}${isComplete ? " isComplete" : ""}`} key={step.actionId}>
            <div className="swWorkflowStepHeader">
              <span className="swWorkflowStepHeading">
                <span
                  className={"swWorkflowStepMarker" + (isComplete ? " isComplete" : "")}
                  aria-label={isComplete ? "Complete" : "Step " + (index + 1)}
                >
                  {isComplete ? "✓" : index + 1}
                </span>
                <span className="swWorkflowStepTitle">{step.title}</span>
              </span>
              {isActive ? <span className="swWorkflowStepDisclosure" aria-hidden="true">⌃</span> : null}
            </div>
            {isActive ? (
              <div className={`swAlertTaskBody swWorkflowStepBody ${alertColorClass}`}>
                <WorkflowStepContent
                  actionId={step.actionId}
                  message={props.message}
                  workflowKind={props.message.workflowKind}
                  text={bodyText}
                  isCopied={copiedActionId === step.actionId}
                  referenceUrl={step.referenceUrl}
                  isBombEvidenceAvailable={isBombThreat && isBombEvidenceClosed}
                  onCopy={() => handleCopy(step.actionId, bodyText)}
                  onOpenBombEvidence={() =>
                    props.onAction("BombThreatEvidenceReopened", {
                      ...props.message.formValues,
                      CaBombEvidenceClosed: false
                    })
                  }
                  onContactNurse={(concern) =>
                    props.onAction("ContactNurseConcernLogged", {
                      ...props.message.formValues,
                      CaDecisionPath: "ContactNurse",
                      CaConcernNotes: concern
                    })
                  }
                  onFireAlarmDecision={(decision) =>
                    props.onAction("FireAlarmConfirmationLogged", {
                      ...props.message.formValues,
                      CaFireDecision: decision
                    })
                  }
                  onRiskmasterReceiptCode={(receiptCode) =>
                    props.onAction("RiskmasterDemoCompleted", {
                      ...props.message.formValues,
                      RmReceiptCode: receiptCode
                    })
                  }
                  onStandardAction={() => props.onAction(step.actionId, props.message.formValues)}
                  onMissingPatientDecision={(decision) =>
                    props.onAction("MissingPatientDecisionLogged", {
                      ...props.message.formValues,
                      CaMissingDecision: decision
                    })
                  }
                  onMissingPatientPageAttempt={(attemptCount) =>
                    props.onAction("MissingPatientPageAttemptLogged", {
                      ...props.message.formValues,
                      CaMissingPatientPageCount: String(attemptCount + 1),
                      CaMissingPatientPageLog: appendAuditLine(
                        props.message.formValues?.CaMissingPatientPageLog,
                        `Alerted patient ${attemptCount} time(s) at ${getShortTime()}.`
                      )
                    })
                  }
                  onMissingSecurityContacted={(foundLocation) =>
                    props.onAction("MissingSecurityContacted", {
                      ...props.message.formValues,
                      CaFoundLocation: foundLocation
                    })
                  }
                  onDeconManagersComplete={(managerLog) =>
                    props.onAction("DeconDepartmentManagersNotified", {
                      ...props.message.formValues,
                      CaDepartmentManagerLog: managerLog
                    })
                  }
                  onDeconCommandCenterContacted={(values) =>
                    props.onAction("DeconCommandCenterContacted", {
                      ...props.message.formValues,
                      ...values
                    })
                  }
                />
                {isCustomStepAction(step.actionId) ? null : (
                  <button
                    className={`swPopupAction swPopupAction-${index === 0 ? "primary" : "secondary"}${step.actionId === "Acknowledge" ? " swAcknowledgeAction" : ""}`}
                    disabled={isComplete}
                    type="button"
                    onClick={() => props.onAction(step.actionId, props.message.formValues)}
                  >
                    {step.buttonLabel}
                  </button>
                )}
              </div>
            ) : null}
          </section>
        );
      })}
      {props.message.terminalState ? <div className="swPopupCompletion">{props.message.terminalState}</div> : null}
    </div>
  );
}

interface WorkflowStepDefinition {
  actionId: string;
  title: string;
  body: string;
  buttonLabel: string;
  referenceUrl?: string;
}

function renderWorkflowSteps(
  steps: WorkflowStepDefinition[],
  compactCompletedCount: number,
  renderStep: (step: WorkflowStepDefinition, index: number) => JSX.Element
): JSX.Element[] {
  const renderedSteps: JSX.Element[] = [];
  let index = 0;

  while (index < steps.length) {
    if (index < compactCompletedCount) {
      const firstStep = renderStep(steps[index], index);
      const secondStep = index + 1 < compactCompletedCount ? renderStep(steps[index + 1], index + 1) : undefined;
      const thirdStep = index + 2 < compactCompletedCount ? renderStep(steps[index + 2], index + 2) : undefined;
      const fourthStep = index + 3 < compactCompletedCount ? renderStep(steps[index + 3], index + 3) : undefined;
      renderedSteps.push(
        <div className="swWorkflowCompactRow" key={`compact-${steps[index].actionId}`}>
          {firstStep}
          {secondStep}
          {thirdStep}
          {fourthStep}
        </div>
      );
      index += 4;
    } else {
      renderedSteps.push(renderStep(steps[index], index));
      index += 1;
    }
  }

  return renderedSteps;
}

function getCompactCompletedCount(message: AppPopupMessage, actionIds: string[]): number {
  const completedCount = actionIds.filter((actionId) => isActionComplete(message, actionId)).length;

  if (completedCount < 4) {
    return 0;
  }

  let completedPrefixCount = 0;
  for (const actionId of actionIds) {
    if (!isActionComplete(message, actionId)) {
      break;
    }

    completedPrefixCount += 1;
  }

  const requestedCompactCount = Math.floor(completedCount / 4) * 4;
  return Math.min(requestedCompactCount, completedPrefixCount - (completedPrefixCount % 4));
}

function isActionComplete(message: AppPopupMessage, actionId: string): boolean {
  return message.actions.some((action) => action.id === actionId && action.disabled === true);
}

function appendAuditLine(existing: unknown, line: string): string {
  const current = String(existing ?? "").trim();
  return current.length > 0 ? `${current}\n${line}` : line;
}

function getShortTime(): string {
  return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function shouldIncludeStep(actionId: string, message: AppPopupMessage): boolean {
  const values = message.formValues ?? {};

  if (message.workflowKind === "FireAlarm") {
    const decision = values.CaFireDecision;

    if (actionId === "FireAdministratorNotified" || actionId === "FirePresidentNotified") {
      return decision === "Confirmed";
    }

    if (actionId === "FireCancel911Confirmed") {
      return decision === "Cleared";
    }
  }

  if (message.workflowKind === "MissingPersonMissingChild") {
    if (actionId === "MissingSecurityContacted") {
      return values.CaMissingDecision === "PatientResponds";
    }

    if (actionId === "AllClearAnnounced") {
      return values.CaMissingDecision === "AllClear";
    }
  }

  if (message.workflowKind === "Decontamination" || message.workflowKind === "HazardousMaterialsSpillRelease") {
    if (actionId === "DeconMediaRelationsNotified") {
      return values.CaCallMediaRelations === true;
    }

    if (actionId === "DeconRenoNotified") {
      return values.CaCallReno === true;
    }
  }

  return true;
}

function isCustomStepAction(actionId: string): boolean {
  return (
    actionId === "FireAlarmConfirmationLogged" ||
    actionId === "RiskmasterDemoCompleted" ||
    actionId === "MissingPatientDecisionLogged" ||
    actionId === "MissingSecurityContacted" ||
    actionId === "DeconDepartmentManagersNotified" ||
    actionId === "DeconCommandCenterContacted" ||
    actionId === "BombThreatIntakeAnnouncementCompleted"
  );
}

function getStepTitle(actionId: string, message: AppPopupMessage): string {
  if (message.workflowKind === "BombThreat") {
    if (actionId === "SecurityConfirmedNotified") {
      return "NOTIFY SECURITY";
    }

    if (actionId === "MaintenanceConfirmedNotified") {
      return "NOTIFY MAINTENANCE";
    }
  }

  const titles: Record<string, string> = {
    Acknowledge: "ACKNOWLEDGE",
    AnnouncementCompleted: "READ ANNOUNCEMENT 3 TIMES",
    EpicBedPlanningConfirmedSent: "SEND TEXT WITH EPIC CHAT TO: HOS BED PLANNING (AOD)",
    EpicRespiratoryConfirmedSent: "SEND TEXT WITH EPIC CHAT TO: HOS RESPIRATORY",
    Call911Confirmed: "CALL 911",
    SecurityConfirmedNotified: "CONFIRM SECURITY NOTIFICATION",
    MaintenanceConfirmedNotified: "CONFIRM MAINTENANCE NOTIFICATION",
    FireAlarmConfirmationLogged: "WAIT FOR FIRE ALARM CONFIRMATION",
    FireAdministratorNotified: "NOTIFY ADMINISTRATOR ON CALL",
    FirePresidentNotified: "NOTIFY PRESIDENT",
    FireCancel911Confirmed: "CALL 911 TO CANCEL FIRE ALARM",
    AllClearAnnounced: "ANNOUNCE ALL CLEAR WHEN INSTRUCTED",
    DecisionPathLogged: "DOCUMENT DECISION PATH",
    ContactChecklistLogged: "COMPLETE CONTACT CHECKLIST",
    DemoCopyCaveatAcknowledged: "*DEMO COPY*",
    BombThreatIntakeAnnouncementCompleted: "ASK QUESTIONS, RECORD EXACT WORDS, THEN ANNOUNCE",
    BombPresidentDesigneeNotified: "NOTIFY PRESIDENT OR DESIGNEE",
    BombAdministratorNotified: "NOTIFY ADMINISTRATOR ON CALL",
    BombAodNotified: "NOTIFY AOD",
    BombPatientAccessManagerNotified: "NOTIFY PATIENT REGISTRATION MANAGER/SUPERVISOR",
    BombMaterialsManagerNotified: "NOTIFY MATERIALS MANAGEMENT",
    BombMarketingNotified: "NOTIFY MARKETING",
    ManagerSupervisorConfirmedNotified: "CONFIRM MANAGER / SUPERVISOR NOTIFICATION",
    WatchExitsConfirmed: "WATCH EXITS",
    MissingPatientPageCompleted: "PAGE THE PATIENT BY NAME",
    MissingPatientDecisionLogged: "CONTINUE PAGE AND SELECT OUTCOME",
    MissingSecurityContacted: "GET LOCATION AND CONTACT SECURITY",
    DeconHazardGuidanceAcknowledged: "DIRECT PEOPLE AWAY FROM THE HAZARD",
    DeconErPhysicianNotified: "NOTIFY ER PHYSICIAN ON DUTY",
    DeconAodNotified: "NOTIFY AOD",
    DeconAdministratorNotified: "NOTIFY ADMINISTRATOR ON CALL",
    DeconMedicalStaffLeadershipNotified: "NOTIFY PRESIDENT OR VP OF MEDICAL STAFF",
    DeconDepartmentManagersNotified: "NOTIFY DEPARTMENT MANAGERS",
    DeconCommandCenterContacted: "VERIFY COMMAND CENTER INSTRUCTIONS",
    DeconMediaRelationsNotified: "NOTIFY MEDIA RELATIONS",
    DeconRenoNotified: "NOTIFY RENO",
    MassCasualtyCommandCenterBriefingConfirmed: "CONFIRM COMMAND CENTER BRIEFING",
    MassCasualtyCareAreasReviewed: "REVIEW DISASTER CARE AREAS",
    FirstHourResponseReviewed: "SEE FIRST HOUR RESPONSE",
    RiskmasterDemoCompleted: "CONFIRM RISKMASTER DEMO ENTRY"
  };

  return titles[actionId] ?? actionId;
}

function getButtonLabel(actionId: string, fallback: string): string {
  const labels: Record<string, string> = {
    Acknowledge: "Acknowledge",
    AnnouncementCompleted: "Announcement Complete",
    EpicBedPlanningConfirmedSent: "Sent to HOS Bed Planning (AOD)",
    EpicRespiratoryConfirmedSent: "Sent to HOS Respiratory",
    Call911Confirmed: "911 Contacted",
    SecurityConfirmedNotified: "Security Notified",
    MaintenanceConfirmedNotified: "Maintenance Notified",
    FireAlarmConfirmationLogged: "Confirmation Received",
    FireAdministratorNotified: "Administrator Notified",
    FirePresidentNotified: "President Notified",
    FireCancel911Confirmed: "911 Cancellation Confirmed",
    AllClearAnnounced: "All Clear Announced",
    DecisionPathLogged: "Activate Welfare Check",
    ContactChecklistLogged: "Contact Checklist Complete",
    DemoCopyCaveatAcknowledged: "Demo Copy Acknowledged",
    BombThreatIntakeAnnouncementCompleted: "Announcement Complete",
    BombPresidentDesigneeNotified: "President / Designee Notified",
    BombAdministratorNotified: "Administrator Notified",
    BombAodNotified: "AOD Notified",
    BombPatientAccessManagerNotified: "Patient Registration Manager Notified",
    BombMaterialsManagerNotified: "Materials Manager Notified",
    BombMarketingNotified: "Marketing Notified",
    ManagerSupervisorConfirmedNotified: "Manager / Supervisor Notified",
    WatchExitsConfirmed: "Watching Exits",
    MissingPatientPageCompleted: "Patient Page Complete",
    MissingPatientDecisionLogged: "Outcome Selected",
    MissingSecurityContacted: "Security Contacted",
    DeconHazardGuidanceAcknowledged: "Acknowledge",
    DeconErPhysicianNotified: "ER Physician on Duty Notified",
    DeconAodNotified: "AOD Notified",
    DeconAdministratorNotified: "Administrator on Call Notified",
    DeconMedicalStaffLeadershipNotified: "Leadership Notified",
    DeconDepartmentManagersNotified: "Department Managers Contacted",
    DeconCommandCenterContacted: "Command Center Contacted",
    DeconMediaRelationsNotified: "Media Relations Contacted",
    DeconRenoNotified: "Reno Contacted",
    MassCasualtyCommandCenterBriefingConfirmed: "Command Center Briefing Confirmed",
    MassCasualtyCareAreasReviewed: "Care Areas Reviewed",
    FirstHourResponseReviewed: "First Hour Response Opened",
    RiskmasterDemoCompleted: "Riskmaster Code Copied Back"
  };

  return labels[actionId] ?? fallback;
}

function getStepBody(actionId: string, message: AppPopupMessage, announcementText: string, epicChatText: string): string {
  if (actionId === "AnnouncementCompleted") {
    if (message.workflowKind === "MissingPersonMissingChild") {
      return [
        announcementText,
        `Announce this description if provided: ${String(message.formValues?.CaPatientDescription ?? "Demo patient description not provided.")}`
      ].join("\n");
    }

    return announcementText;
  }

  if (actionId === "AllClearAnnounced") {
    if (message.workflowKind === "MissingPersonMissingChild") {
      return `Security Alert + ${getLocationText(message)} + All Clear`;
    }

    const allClearText = renderTemplate(message.allClearTemplate, message.formValues ?? {});

    if (message.workflowKind === "ArmedSubjectActiveShooter") {
      return [
        "Safety guidance for operator awareness:",
        "Seek protection by getting into an area where you can lock/secure the door.",
        "Stay out of corridors until an all-clear is called.",
        "If near a waiting area or lobby, get visitors to a safe area.",
        "",
        "When instructed, announce:",
        allClearText
      ].join("\n");
    }

    return allClearText;
  }

  if (actionId === "EpicBedPlanningConfirmedSent" || actionId === "EpicRespiratoryConfirmedSent") {
    return epicChatText;
  }

  if (actionId === "Acknowledge") {
    return "ED Switchboard has received your Alert. (Respond IMMEDIATELY!)";
  }

  if (actionId === "DemoCopyCaveatAcknowledged") {
    if (message.workflowKind === "MassCasualtyIncident") {
      return "*DEMO COPY* Mass Casualty Incident language is a proof-of-concept rewrite. Replace with approved facility text before any production consideration.";
    }

    return "*DEMO COPY* Approved Trauma Alert verbiage is pending. Use this placeholder workflow only for proof-of-concept testing.";
  }

  if (actionId === "BombThreatIntakeAnnouncementCompleted") {
    return [
      "Ask the caller for specific information and try to record EXACT words of caller.",
      "",
      "Announcement script:",
      `Security Alert + Bomb Threat + ${getLocationText(message)}`
    ].join("\n");
  }

  if (actionId === "Call911Confirmed") {
    if (message.workflowKind === "MassCasualtyIncident") {
      return [
        "Call 911",
        `"Mass Casualty Incident reported at ${getLocationText(message)}. Facility Alert is active. Please respond."`
      ].join("\n");
    }

    if (message.workflowKind === "EmergencyOperationsPlan") {
      return "Call 911 using the demo emergency operations activation path.";
    }

    if (message.workflowKind === "BombThreat") {
      return [
        "Call 911.",
        `"Bomb Threat reported at ${getLocationText(message)}. Security Alert has been announced. (We are currently on the phone with the caller)"`
      ].join("\n");
    }

    if (message.workflowKind === "ChildAbduction" || message.workflowKind === "InfantAbduction") {
      return `Call 911. Script: ${message.title} reported at ${getLocationText(message)}. Security Alert has been announced. Please respond.`;
    }

    return [
      "Demo 911 call script:",
      `Fire Alarm reported at ${getLocationText(message)}. Facility Alert has been announced.`,
      "Please respond per emergency procedure."
    ].join("\n");
  }

  if (actionId === "SecurityConfirmedNotified") {
    const securityNumber = message.workflowKind === "OutsideMedicalEmergency" ? "123-456-FAKE" : "333-444-NOPE";

    if (message.workflowKind === "BombThreat") {
      return [
        `Notify Security at ${securityNumber}.`,
        "\"We have received a Bomb Threat. (We are currently on the phone with the caller) Security Alert has been announced. Here are relevant details.\""
      ].join("\n");
    }

    if (message.workflowKind === "FireAlarm") {
      return [
        `Contact Security at ${securityNumber}.`,
        `Script: Fire Alarm reported at ${getLocationText(message)}. Facility Alert has been announced. Please respond.`
      ].join("\n");
    }

    if (message.workflowKind === "OutsideMedicalEmergency") {
      return `Contact Security at ${securityNumber} for ${message.title} at ${getLocationText(message)}.`;
    }

    return `Notify Security at ${securityNumber} for ${message.title} using the approved placeholder contact path.`;
  }

  if (actionId === "ManagerSupervisorConfirmedNotified") {
    return `Notify manager / supervisor at 333-121-FAKE for ${message.title} at ${getLocationText(message)}.`;
  }

  if (actionId === "WatchExitsConfirmed") {
    const subject = message.workflowKind === "InfantAbduction" ? "infant" : "child";
    return `Keep a close eye out for a possible ${subject} abduction. Security will be nearby.`;
  }

  if (actionId === "BombPresidentDesigneeNotified") {
    return [
      "Notify President or designee at 333-404-NOPE. After Hours call list.",
      `"We have received a Bomb Threat at ${getLocationText(message)}. Security Alert has been announced. Please review the after-hours response path. Here are relevant details."`
    ].join("\n");
  }

  if (actionId === "BombAdministratorNotified") {
    return [
      "Notify Administrator on Call at 333-505-FAKE.",
      `"We have received a Bomb Threat at ${getLocationText(message)}. Security Alert has been announced. Please review the administrator response path. Here are relevant details."`
    ].join("\n");
  }

  if (actionId === "BombAodNotified") {
    return [
      "Notify AOD at 333-606-NOPE.",
      `"We have received a Bomb Threat at ${getLocationText(message)}. Security Alert has been announced. Please advise if additional actions are needed. Here are relevant details."`
    ].join("\n");
  }

  if (actionId === "BombPatientAccessManagerNotified") {
    return [
      "Notify Patient Registration Manager/Supervisor at 333-707-FAKE.",
      `"We have received a Bomb Threat at ${getLocationText(message)}. Security Alert has been announced. Please prepare Patient Registration support as directed. Here are relevant details."`
    ].join("\n");
  }

  if (actionId === "BombMaterialsManagerNotified") {
    return [
      "Notify Manager, Materials Management: Avery Ledger at 333-808-NOPE.",
      `"We have received a Bomb Threat at ${getLocationText(message)}. Security Alert has been announced. Please review Materials Management response needs. Here are relevant details."`
    ].join("\n");
  }

  if (actionId === "BombMarketingNotified") {
    return [
      "Notify Marketing at 333-909-FAKE.",
      `"We have received a Bomb Threat at ${getLocationText(message)}. Security Alert has been announced. Please prepare communications support if requested. Here are relevant details."`
    ].join("\n");
  }

  if (actionId === "MissingPatientPageCompleted" || actionId === "MissingPatientDecisionLogged") {
    return `Attention ${getPatientName(message)}, the hospital needs to speak with you. Please ask for help from a hospital employee or go to the nearest phone and dial '0'.`;
  }

  if (actionId === "MissingSecurityContacted") {
    return "Get location from patient, contact Security at 333-444-NOPE. Stay on the phone with the patient, if possible.";
  }

  if (actionId === "MaintenanceConfirmedNotified" && message.workflowKind === "BombThreat") {
    return [
      "Contact Maintenance at ABC-DEF-FROG.",
      `"Bomb Threat reported at ${getLocationText(message)}. Security Alert has been announced."`
    ].join("\n");
  }

  if (actionId === "DeconHazardGuidanceAcknowledged") {
    return [
      `A serious environmental hazard has been identified. Direct patients and visitors away from ${getLocationText(message)}.`,
      "Please stay on duty if your area is secure and help register patients.",
      "All Hazards Manual"
    ].join("\n");
  }

  if (actionId === "DeconErPhysicianNotified") {
    return "Notify ER physician on duty: Dr. Velvet Clipboard, 333-111-NOPE.";
  }

  if (actionId === "DeconAodNotified") {
    return "Notify AOD at 333-222-FAKE.";
  }

  if (actionId === "DeconAdministratorNotified") {
    return "Notify Administrator on Call: Harper Demo, 333-333-NOPE.";
  }

  if (actionId === "DeconMedicalStaffLeadershipNotified") {
    return [
      "Notify President or Vice President of Medical Staff:",
      "Dr. Atlas Paperclip, President, 333-444-FAKE",
      "Dr. Juniper Ledger, VP Medical Staff, 333-555-NOPE",
      "Dr. Basil Folder, VP Medical Staff, 333-666-FAKE",
      "Dr. Mina Binder, VP Medical Staff, 333-777-NOPE"
    ].join("\n");
  }

  if (actionId === "DeconDepartmentManagersNotified") {
    return "Contact each demo department manager. Buttons may be selected in any order.";
  }

  if (actionId === "DeconCommandCenterContacted") {
    return "Verify family-direction instructions, whether to activate Emergency Operations Plan, and whether Media Relations or Reno should be called. Command Center: 333-000-FAKE.";
  }

  if (actionId === "DeconMediaRelationsNotified") {
    return "Notify Media Relations: Marigold Presskit, 333-135-FAKE.";
  }

  if (actionId === "DeconRenoNotified") {
    return "Notify Reno: Quill Dispatch, 333-246-NOPE.";
  }

  if (actionId === "FirstHourResponseReviewed") {
    if (message.workflowKind === "MassCasualtyIncident") {
      return "Open First Hour Response. Confirm staff call-in and Command Center support instructions before continuing.";
    }

    return "Open First Hour Response in a new browser window.";
  }

  if (actionId === "MassCasualtyCommandCenterBriefingConfirmed") {
    return [
      "Patient Registration Manager/Supervisor reports to the Command Center for briefing.",
      "Command Center: ED Conference Room. Demo phone: 333-515-FAKE.",
      `Report event type, location (${getLocationText(message)}), and time. Confirm whether staff call-in procedures are active.`
    ].join("\n");
  }

  if (actionId === "MassCasualtyCareAreasReviewed") {
    return [
      "Review disaster care areas with Command Center direction:",
      "Command Center: ED Conference Room.",
      "Triage: ED.",
      "Urgent Care: Extended Recovery Center.",
      "Non-Urgent: Outpatient Surgery Center.",
      "Family support, media, and discharge areas: use Command Center direction."
    ].join("\n");
  }

  if (actionId === "MaintenanceConfirmedNotified") {
    return [
      "Contact Maintenance at ABC-DEF-FROG.",
      `Script: Fire Alarm reported at ${getLocationText(message)}. Facility Alert has been announced. Please respond.`
    ].join("\n");
  }

  if (actionId === "FireAlarmConfirmationLogged") {
    return [
      "Wait for confirmation from Security or Maintenance.",
      "Choose the confirmed path only when instructed by Security or Maintenance."
    ].join("\n");
  }

  if (actionId === "FireAdministratorNotified") {
    return [
      "Contact Administrator on Call at 333-555-NOPE.",
      `Script: Fire has been confirmed at ${getLocationText(message)}. Facility Alert is active. Please respond per emergency procedure.`
    ].join("\n");
  }

  if (actionId === "FirePresidentNotified") {
    return [
      "Contact President at ABC-999-FAKE.",
      `Script: Fire has been confirmed at ${getLocationText(message)}. Facility Alert is active. Please respond per emergency procedure.`
    ].join("\n");
  }

  if (actionId === "FireCancel911Confirmed") {
    return [
      "Call 911 to cancel the Fire Alarm.",
      `Script: Fire Alarm at ${getLocationText(message)} has been cleared / confirmed false. Please cancel the Fire Alarm response.`
    ].join("\n");
  }

  if (actionId === "DecisionPathLogged") {
    return "Is the patient in immediate medical need, or do they have just basic concerns?";
  }

  if (actionId === "ContactChecklistLogged") {
    return "Complete the approved placeholder contact checklist and record who was contacted.";
  }

  if (actionId === "RiskmasterDemoCompleted") {
    return "Open the simulated Riskmaster form, submit the demo entry, then copy the returned fake Riskmaster code back here.";
  }

  return `${message.title} task ready. Confirm when complete.`;
}

function getLocationText(message: AppPopupMessage): string {
  return String(message.formValues?.CaLocation ?? message.subtitle ?? "Location not specified").trim();
}

function getPatientName(message: AppPopupMessage): string {
  return String(message.formValues?.CaPatientName ?? "Demo Patient").trim();
}

function getEpicChatText(message: AppPopupMessage): string {
  return `${message.title} - ${getLocationText(message)}. Please respond.`;
}

function getStepReferenceUrl(actionId: string, message: AppPopupMessage): string | undefined {
  if (actionId !== "DecisionPathLogged") {
    return undefined;
  }

  const examplesUrl = message.formValues?.CaExamplesUrl ?? message.formValues?.CaDecisionTreeUrl;
  return typeof examplesUrl === "string" && examplesUrl.trim().length > 0 ? examplesUrl.trim() : undefined;
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

function WorkflowStepContent(props: {
  actionId: string;
  message: AppPopupMessage;
  workflowKind?: string;
  text: string;
  isCopied: boolean;
  referenceUrl?: string;
  isBombEvidenceAvailable?: boolean;
  onCopy: () => void;
  onOpenBombEvidence?: () => void;
  onStandardAction?: () => void;
  onContactNurse?: (concern: string) => void;
  onFireAlarmDecision?: (decision: "Confirmed" | "Cleared") => void;
  onRiskmasterReceiptCode?: (receiptCode: string) => void;
  onMissingPatientDecision?: (decision: "PatientResponds" | "AllClear") => void;
  onMissingPatientPageAttempt?: (attemptCount: number) => void;
  onMissingSecurityContacted?: (foundLocation: string) => void;
  onDeconManagersComplete?: (managerLog: string) => void;
  onDeconCommandCenterContacted?: (values: AppPopupFormValues) => void;
}): JSX.Element {
  const [isExamplesOpen, setIsExamplesOpen] = React.useState<boolean>(false);
  const evidenceButton = props.isBombEvidenceAvailable ? (
    <button className="swEvidenceReopenButton" type="button" onClick={props.onOpenBombEvidence}>
      Evidence
    </button>
  ) : null;
  const withEvidenceButton = (content: JSX.Element): JSX.Element => (
    <React.Fragment>
      {evidenceButton}
      {content}
    </React.Fragment>
  );

  if (props.actionId === "AnnouncementCompleted") {
    return withEvidenceButton(<div className="swGeneratedTextBox">{props.text}</div>);
  }

  if (props.actionId === "AllClearAnnounced" && props.workflowKind === "ArmedSubjectActiveShooter") {
    const lines = props.text.split("\n");
    const guidance = lines.slice(1, 4);
    const announcement = lines[6] ?? "";

    return withEvidenceButton(
      <div className="swAllClearGuidance">
        <p>
          <strong>Safety guidance for operator awareness:</strong>
        </p>
        <ul>
          {guidance.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <p>When instructed, announce:</p>
        <div className="swGeneratedTextBox">{announcement}</div>
      </div>
    );
  }

  if (props.actionId === "EpicBedPlanningConfirmedSent" || props.actionId === "EpicRespiratoryConfirmedSent") {
    return withEvidenceButton(
      <div className="swCopyTextRow">
        <div className="swCopyTextBox" aria-label="Generated Epic chat text">
          {props.text}
        </div>
        <button className="swCopyButton" type="button" onClick={props.onCopy}>
          {props.isCopied ? "Copied" : "Copy"}
        </button>
      </div>
    );
  }

  if (props.actionId === "DecisionPathLogged") {
    return withEvidenceButton(
      <div className={`swWorkflowDecisionHelp${isExamplesOpen ? " isExamplesOpen" : ""}`}>
        <div className="swWorkflowStepText">
          {props.text}{" "}
          <span className="swExamplesAnchor">
            <button className="swInlineReferenceButton" type="button" onClick={() => setIsExamplesOpen((current) => !current)}>
              see Examples
            </button>
            {isExamplesOpen ? (
              <AnchoredReferencePopover ariaLabel="Welfare Check examples">
                <WelfareCheckExamples referenceUrl={props.referenceUrl} onContactNurse={(concern) => props.onContactNurse?.(concern)} />
              </AnchoredReferencePopover>
            ) : null}
          </span>
        </div>
      </div>
    );
  }

  if (props.actionId === "FireAlarmConfirmationLogged") {
    return withEvidenceButton(
      <React.Fragment>
        <div className="swWorkflowStepText">{props.text}</div>
        <div className="swDecisionActionRow">
          <button className="swPopupAction swPopupAction-danger" type="button" onClick={() => props.onFireAlarmDecision?.("Confirmed")}>
            FIRE IS CONFIRMED
          </button>
          <button className="swPopupAction swPopupAction-secondary" type="button" onClick={() => props.onFireAlarmDecision?.("Cleared")}>
            Alarm Cleared / Confirmed False
          </button>
        </div>
      </React.Fragment>
    );
  }

  if (props.actionId === "BombThreatIntakeAnnouncementCompleted") {
    return withEvidenceButton(
      <React.Fragment>
        <div className="swWorkflowStepText">{props.text}</div>
        <button className="swPopupAction swPopupAction-secondary" type="button" onClick={props.onStandardAction}>
          Announcement Complete
        </button>
      </React.Fragment>
    );
  }

  if (props.actionId === "BombPresidentDesigneeNotified") {
    const lines = props.text.split("\n");
    const scriptText = lines.slice(1).join("\n");

    return withEvidenceButton(
      <div className="swWorkflowStepText">
        Notify President or designee at 333-404-NOPE.{" "}
        <button
          className="swInlineReferenceButton"
          type="button"
          onClick={() =>
            openReferenceWindow(
              "After Hours Call List Placeholder",
              [
                "Demo after-hours executive call list.",
                "",
                "Avery Slate, President, 333-404-NOPE",
                "Morgan Ledger, Executive Designee, 333-405-FAKE",
                "Jordan Binder, Operations Executive, 333-406-NOPE",
                "Riley Folder, Administrative Lead, 333-407-FAKE",
                "Casey Roster, Backup Executive, 333-408-NOPE"
              ].join("\n")
            )
          }
        >
          After Hours call list.
        </button>
        {scriptText ? (
          <React.Fragment>
            <br />
            <span>{scriptText}</span>
          </React.Fragment>
        ) : null}
      </div>
    );
  }

  if (props.actionId === "MissingPatientDecisionLogged") {
    const rawPageAttemptCount = Number(props.message.formValues?.CaMissingPatientPageCount ?? "2");
    const pageAttemptCount = Number.isFinite(rawPageAttemptCount) ? rawPageAttemptCount : 2;

    return withEvidenceButton(
      <React.Fragment>
        <div className="swGeneratedTextActionRow">
          <div className="swGeneratedTextBox">{props.text}</div>
          <button className="swPopupAction swPopupAction-secondary swPageAttemptButton" type="button" onClick={() => props.onMissingPatientPageAttempt?.(pageAttemptCount)}>
            {`Alerted Patient ${pageAttemptCount} times`}
          </button>
        </div>
        <p className="swWorkflowStepText">Continue to page Missing Person at the direction of the AOD every 5 minutes.</p>
        <div className="swDecisionActionRow">
          <button className="swPopupAction swPopupAction-secondary" type="button" onClick={() => props.onMissingPatientDecision?.("PatientResponds")}>
            Patient Responds
          </button>
          <button className="swPopupAction swPopupAction-secondary" type="button" onClick={() => props.onMissingPatientDecision?.("AllClear")}>
            All Clear
          </button>
        </div>
      </React.Fragment>
    );
  }

  if (props.actionId === "MissingSecurityContacted") {
    return withEvidenceButton(<MissingSecurityContactStep text={props.text} onSubmit={(location) => props.onMissingSecurityContacted?.(location)} />);
  }

  if (props.actionId === "DeconHazardGuidanceAcknowledged") {
    return withEvidenceButton(
      <React.Fragment>
        <div className="swWorkflowStepText">
          {props.text.replace("\nAll Hazards Manual", "")}{" "}
          <button className="swInlineReferenceButton" type="button" onClick={() => openReferenceWindow("All Hazards Manual Placeholder", "Generic demo placeholder for the All Hazards Manual. Replace with the approved document link when available.")}>
            All Hazards Manual
          </button>
        </div>
      </React.Fragment>
    );
  }

  if (props.actionId === "DeconMedicalStaffLeadershipNotified") {
    return withEvidenceButton(<ContactListTable text={props.text} />);
  }

  if (props.actionId === "DeconDepartmentManagersNotified") {
    return withEvidenceButton(
      <DeconDepartmentManagersStep
        onSubmit={(managerLog) => props.onDeconManagersComplete?.(managerLog)}
      />
    );
  }

  if (props.actionId === "DeconCommandCenterContacted") {
    return withEvidenceButton(
      <DeconCommandCenterStep
        text={props.text}
        onSubmit={(values) => props.onDeconCommandCenterContacted?.(values)}
      />
    );
  }

  if (isDeconStandardCommunicationAction(props.actionId)) {
    return withEvidenceButton(
      <React.Fragment>
        <div className="swWorkflowStepText">{props.text}</div>
        <CommunicationScriptQuote script={getDeconGeneratedScript(props.actionId, props.message)} />
      </React.Fragment>
    );
  }

  if (props.actionId === "FirstHourResponseReviewed") {
    return withEvidenceButton(
      <React.Fragment>
        <div className="swWorkflowStepText">{props.text}</div>
        <button className="swReferenceActionButton" type="button" onClick={openFirstHourResponseReference}>
          Open First Hour Response
        </button>
      </React.Fragment>
    );
  }

  if (props.actionId === "RiskmasterDemoCompleted") {
    return withEvidenceButton(<RiskmasterDemoStep message={props.message} text={props.text} onSubmit={(receiptCode) => props.onRiskmasterReceiptCode?.(receiptCode)} />);
  }

  return withEvidenceButton(<div className="swWorkflowStepText">{props.text}</div>);
}

function BombThreatEvidencePanel(props: {
  notes: string;
  onNotesChange: (notes: string) => void;
  onSaveClose: (notes: string) => void;
}): JSX.Element {
  const [notes, setNotes] = React.useState<string>(props.notes);

  React.useEffect(() => {
    setNotes(props.notes);
  }, [props.notes]);

  const handleNotesChange = (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
    const nextNotes = event.currentTarget.value;
    setNotes(nextNotes);
    props.onNotesChange(nextNotes);
  };

  return (
    <aside className="swBombThreatEvidencePanel" aria-label="Bomb threat evidence notes">
      <div className="swBombThreatEvidenceHeader">Bomb Threat Evidence Notes</div>
      <div className="swBombThreatQuestionGrid">
        <div>
          <strong>Ask the caller</strong>
          <ul>
            <li>Where is the bomb?</li>
            <li>What time will it explode?</li>
            <li>What kind of bomb is it?</li>
            <li>What does the device look like?</li>
            <li>Where are you calling from?</li>
          </ul>
        </div>
        <div>
          <strong>Be alert to</strong>
          <ul>
            <li>Background noises</li>
            <li>Speech characteristics</li>
            <li>Young or old?</li>
            <li>Male or female?</li>
            <li>Accent?</li>
          </ul>
        </div>
      </div>
      <label className="swBombThreatNotes">
        <span>Record exact words and observations</span>
        <textarea value={notes} onChange={handleNotesChange} rows={5} />
      </label>
      <div className="swBombThreatEvidenceActions">
        <button className="swPopupAction swPopupAction-secondary" type="button" onClick={() => props.onSaveClose(notes)}>
          Save / Close Evidence
        </button>
      </div>
    </aside>
  );
}

function MissingSecurityContactStep(props: {
  text: string;
  onSubmit: (foundLocation: string) => void;
}): JSX.Element {
  const [foundLocation, setFoundLocation] = React.useState<string>("");

  return (
    <div className="swMiniForm">
      <div className="swWorkflowStepText">{props.text}</div>
      <label className="swMiniFormField">
        <span>Patient location</span>
        <input value={foundLocation} onChange={(event) => setFoundLocation(event.currentTarget.value)} placeholder="Demo patient location" />
      </label>
      <button className="swPopupAction swPopupAction-secondary" disabled={foundLocation.trim().length === 0} type="button" onClick={() => props.onSubmit(foundLocation.trim())}>
        Security Contacted
      </button>
    </div>
  );
}

function ContactListTable(props: { text: string }): JSX.Element {
  const rows = props.text
    .split("\n")
    .slice(1)
    .map((line) => line.split(",").map((part) => part.trim()))
    .filter((parts) => parts.length >= 3);

  return (
    <table className="swContactTable">
      <thead>
        <tr>
          <th>Name</th>
          <th>Role</th>
          <th>Number</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((parts) => (
          <tr key={parts.join("|")}>
            <td>{parts[0]}</td>
            <td>{parts[1]}</td>
            <td>{parts.slice(2).join(", ")}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function DeconDepartmentManagersStep(props: {
  onSubmit: (managerLog: string) => void;
}): JSX.Element {
  const managers = React.useMemo(
    () => [
      { name: "Nora Clipboard", department: "Emergency Department", number: "333-210-FAKE" },
      { name: "Miles Badge", department: "Radiology", number: "333-211-NOPE" },
      { name: "Penny Binder", department: "Registration", number: "333-212-FAKE" },
      { name: "Otis Ledger", department: "Facilities", number: "333-213-NOPE" },
      { name: "June Roster", department: "Housekeeping", number: "333-214-FAKE" }
    ],
    []
  );
  const [contacted, setContacted] = React.useState<Record<string, boolean>>({});
  const allContacted = managers.every((manager) => contacted[manager.name]);

  return (
    <div>
      <table className="swContactTable">
        <thead>
          <tr>
            <th>Manager</th>
            <th>Department</th>
            <th>Contact</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {managers.map((manager) => (
            <tr key={manager.name}>
              <td>{manager.name}</td>
              <td>{manager.department}</td>
              <td>{manager.number}</td>
              <td>
                <button
                  className="swPopupAction swPopupAction-secondary"
                  disabled={Boolean(contacted[manager.name])}
                  type="button"
                  onClick={() => setContacted((current) => ({ ...current, [manager.name]: true }))}
                >
                  {contacted[manager.name] ? "Contacted" : "Contacted"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        className="swPopupAction swPopupAction-secondary"
        disabled={!allContacted}
        type="button"
        onClick={() => props.onSubmit(managers.map((manager) => `${manager.name} (${manager.department}) contacted`).join("; "))}
      >
        Department Managers Complete
      </button>
    </div>
  );
}

function DeconCommandCenterStep(props: {
  text: string;
  onSubmit: (values: AppPopupFormValues) => void;
}): JSX.Element {
  const [familyDirections, setFamilyDirections] = React.useState<string>("");
  const [activateEop, setActivateEop] = React.useState<boolean | undefined>(undefined);
  const [callMedia, setCallMedia] = React.useState<boolean>(false);
  const [callReno, setCallReno] = React.useState<boolean>(false);
  const canSubmit = activateEop !== undefined;

  return (
    <div className="swMiniForm">
      <div className="swWorkflowStepText">{props.text}</div>
      <div className="swDeconCommandGrid">
        <div className="swDeconCommandCell">
          <label className="swMiniFormField">
            <span>How should family members of contaminated patients be directed?</span>
            <textarea value={familyDirections} onChange={(event) => setFamilyDirections(event.currentTarget.value)} rows={3} />
          </label>
        </div>
        <div className="swDeconCommandCell">
          <fieldset className="swChoiceRow">
            <legend>Activate Emergency Operations Plan?</legend>
            <label>
              <input checked={activateEop === true} name="deconEop" type="radio" onChange={() => setActivateEop(true)} /> Yes
            </label>
            <label>
              <input checked={activateEop === false} name="deconEop" type="radio" onChange={() => setActivateEop(false)} /> No
            </label>
          </fieldset>
          <div className="swDeconOptionalCalls" aria-label="Optional Command Center call instructions">
            <span>Optional follow-up calls</span>
            <label className="swPopupCheckboxField">
              <input checked={callMedia} type="checkbox" onChange={(event) => setCallMedia(event.currentTarget.checked)} />
              Call Media Relations
            </label>
            <label className="swPopupCheckboxField">
              <input checked={callReno} type="checkbox" onChange={(event) => setCallReno(event.currentTarget.checked)} />
              Call Reno
            </label>
          </div>
        </div>
      </div>
      <button
        className="swPopupAction swPopupAction-secondary"
        disabled={!canSubmit}
        type="button"
        onClick={() =>
          props.onSubmit({
            CaFamilyDirections: familyDirections.trim(),
            CaActivateEop: activateEop === true,
            CaCallMediaRelations: callMedia,
            CaCallReno: callReno
          })
        }
      >
        Command Center Contacted
      </button>
    </div>
  );
}

function CommunicationScriptQuote(props: { script: string }): JSX.Element {
  return <div className="swCommunicationScriptQuote">&ldquo;{props.script}&rdquo;</div>;
}

function isDeconStandardCommunicationAction(actionId: string): boolean {
  return (
    actionId === "DeconErPhysicianNotified" ||
    actionId === "DeconAodNotified" ||
    actionId === "DeconAdministratorNotified" ||
    actionId === "DeconMediaRelationsNotified" ||
    actionId === "DeconRenoNotified"
  );
}

function getDeconGeneratedScript(actionId: string, message: AppPopupMessage): string {
  const alertName = message.title;
  const location = getLocationText(message);
  const base = `${alertName} reported at ${location}. Facility Alert has been announced.`;

  const scripts: Record<string, string> = {
    DeconErPhysicianNotified: `${base} Please respond and follow Command Center direction.`,
    DeconAodNotified: `${base} Please contact the switchboard for current information and follow Command Center direction.`,
    DeconAdministratorNotified: `${base} Please contact the switchboard and advise on administrative response needs.`,
    DeconMediaRelationsNotified: `${base} Please prepare communications support if requested. Command Center: 333-000-FAKE.`,
    DeconRenoNotified: `${base} Please coordinate the requested demo response with the Command Center at 333-000-FAKE.`
  };

  return scripts[actionId] ?? base;
}

export function RiskmasterDemoStep(props: {
  message: AppPopupMessage;
  text: string;
  onSubmit: (receiptCode: string) => void;
}): JSX.Element {
  const [receiptCode, setReceiptCode] = React.useState<string>("");
  const canSubmit = /^RM-DEMO-\d{8}-\d{4}$/.test(receiptCode.trim());

  return (
    <div className="swRiskmasterWorkflowStep">
      <div className="swWorkflowStepText">{props.text}</div>
      <button className="swPopupAction swPopupAction-secondary" type="button" onClick={() => openRiskmasterDemoWindow(props.message)}>
        Open Simulated Riskmaster Form
      </button>
      <label className="swRiskmasterCodeField">
        <span>Paste returned fake Riskmaster code</span>
        <input
          value={receiptCode}
          placeholder="RM-DEMO-YYYYMMDD-0000"
          onChange={(event) => setReceiptCode(event.currentTarget.value.toUpperCase())}
        />
      </label>
      <button
        className="swPopupAction swPopupAction-primary"
        disabled={!canSubmit}
        type="button"
        onClick={() => props.onSubmit(receiptCode.trim())}
      >
        Confirm Riskmaster Code
      </button>
    </div>
  );
}

function openRiskmasterDemoWindow(message: AppPopupMessage): void {
  const params = new URLSearchParams(window.location.search);
  const location = getLocationText(message);
  const evidenceNotes = String(message.formValues?.CaBombThreatEvidenceNotes ?? "").trim();
  const eventDescription = evidenceNotes
    ? `${message.title} demo alert at ${location}.\n\nBomb threat evidence notes:\n${evidenceNotes}`
    : `${message.title} demo alert at ${location}.`;
  params.set("SwSetup", "RiskmasterDemo");
  params.set("RmCondition", message.title);
  params.set("RmAlertType", getRiskmasterAlertType(message));
  params.set("RmLocation", location);
  params.set("RmFacility", "Demo Hospital");
  params.set("RmDepartment", inferDepartment(location));
  params.set("RmRoom", location);
  params.set("RmEventDescription", eventDescription);
  params.set("RmSourcePopupId", message.id);
  params.set("RmSourceAlertId", message.id);
  const targetUrl = `${window.location.pathname}?${params.toString()}`;
  window.open(targetUrl, "RiskmasterDemo", "width=860,height=900,resizable=yes,scrollbars=yes");
}

function getRiskmasterAlertType(message: AppPopupMessage): string {
  const workflowKind = message.workflowKind ?? "";

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

function openReferenceWindow(title: string, body: string): void {
  const referenceWindow = window.open("", title.replace(/\s+/g, ""), "width=780,height=760,resizable=yes,scrollbars=yes");

  if (!referenceWindow) {
    return;
  }

  referenceWindow.document.write(`<!doctype html>
<html>
<head>
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: "Segoe UI", Arial, sans-serif; margin: 32px; color: #111; }
    h1 { font-size: 1.4rem; margin: 0 0 16px; }
    .placeholder { border: 1px solid #999; padding: 16px; background: #f7f7f7; white-space: pre-line; }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <div class="placeholder">${escapeHtml(body)}</div>
</body>
</html>`);
  referenceWindow.document.close();
}

function openFirstHourResponseReference(): void {
  const referenceWindow = window.open("", "FirstHourResponse", "width=780,height=820,resizable=yes,scrollbars=yes");

  if (!referenceWindow) {
    return;
  }

  referenceWindow.document.title = "First Hour Response";
  referenceWindow.document.body.style.margin = "0";
  referenceWindow.document.body.style.backgroundColor = "#f5f5f5";
  referenceWindow.document.body.textContent = "";

  const frame = referenceWindow.document.createElement("iframe");
  frame.title = "First Hour Response";
    frame.src = getFirstHourResponsePdfDataUrl();
  frame.style.width = "100vw";
  frame.style.height = "100vh";
  frame.style.border = "0";
  referenceWindow.document.body.appendChild(frame);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function AnchoredReferencePopover(props: {
  ariaLabel: string;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <div className="swDecisionPopover" role="dialog" aria-label={props.ariaLabel}>
      {props.children}
    </div>
  );
}

function InlineDocumentationCell(props: {
  title: string;
  body: string;
  documentLabel: string;
  submitLabel: string;
  textLabel: string;
  onSubmit: (value: string) => void;
}): JSX.Element {
  const [isDocumenting, setIsDocumenting] = React.useState<boolean>(false);
  const [value, setValue] = React.useState<string>("");
  const canSubmit = value.trim().length > 0;

  if (isDocumenting) {
    return (
      <div className="swInlineDocumentCell">
        <button className="swInlineDocumentClose" type="button" aria-label={`Close ${props.title} documentation`} onClick={() => setIsDocumenting(false)}>
          X
        </button>
        <label htmlFor="swInlineDocumentText">{props.textLabel}</label>
        <textarea
          id="swInlineDocumentText"
          value={value}
          onChange={(event) => setValue(event.currentTarget.value)}
          rows={3}
        />
        <button className="swPopupAction swPopupAction-secondary" disabled={!canSubmit} type="button" onClick={() => props.onSubmit(value)}>
          {props.submitLabel}
        </button>
      </div>
    );
  }

  return (
    <React.Fragment>
      <strong>{props.title}</strong>
      <span>{props.body}</span>
      <button className="swInlineDocumentButton" type="button" onClick={() => setIsDocumenting(true)}>
        {props.documentLabel}
      </button>
    </React.Fragment>
  );
}

function WelfareCheckExamples(props: {
  referenceUrl?: string;
  onContactNurse: (concern: string) => void;
}): JSX.Element {
  return (
    <React.Fragment>
      <div className="swDecisionIntro">Calls on line 44444</div>
      <div className="swDecisionColumns">
        <div>
          <h4>Immediate Medical Need</h4>
          <ul>
            <li>Bleeding</li>
            <li>Difficulty breathing or not breathing</li>
            <li>Something is wrong; patient is not acting like themself</li>
            <li>No one is listening to me</li>
            <li>Immediate concern and no one from the care team is answering</li>
          </ul>
        </div>
        <div>
          <h4>Basic Concerns</h4>
          <ul>
            <li>Diet, TV, phone, or room temperature</li>
            <li>Directions</li>
            <li>Water pitcher refill</li>
            <li>Basic environmental or housekeeping concerns</li>
            <li>Bathing or shower issue</li>
          </ul>
        </div>
      </div>
      <div className="swDecisionResults">
        <div>
          <strong>Activate Welfare Check</strong>
          <span>When in doubt, activate Welfare Check.</span>
        </div>
        <div>
          <InlineDocumentationCell
            title="Contact Nurse"
            body="For basic concerns, use the demo nurse-station lookup path and document the concern."
            documentLabel="Document"
            submitLabel="Submit"
            textLabel="Concern documented for nurse contact"
            onSubmit={props.onContactNurse}
          />
        </div>
      </div>
      {props.referenceUrl ? (
        <a className="swDecisionPdfLink" href={props.referenceUrl} target="_blank" rel="noreferrer">
          Open PDF reference
        </a>
      ) : null}
    </React.Fragment>
  );
}
