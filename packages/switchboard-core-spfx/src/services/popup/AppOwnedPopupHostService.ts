import {
  AppPopupAction,
  AppPopupFormField,
  AppPopupFormValues,
  AppPopupLaunchKind,
  AppPopupLaunchRequest,
  AppPopupMessage
} from "../../models/AppPopupMessage";
import { CodeAlertWorkflowDefinition } from "../../models/CodeAlertWorkflowDefinition";
import { getCodeAlertLaunchOption, getCodeAlertLaunchOptionByRuleId } from "../../constants/CodeAlertLaunchOptions";
import { codeAlertWorkflowDefinitionSources } from "./codeAlertWorkflowDefinitionSources";
import { IPopupHostService } from "../contracts/IPopupHostService";

const demoRuleIds = ["CaMedicalCodeBlueAdult", "CaFacilityFireAlarm"];

const actionLabels: Record<string, string> = {
  Acknowledge: "Acknowledge",
  AnnouncementCompleted: "Announcement Complete",
  EpicBedPlanningConfirmedSent: "Epic Bed Planning Confirmed",
  EpicRespiratoryConfirmedSent: "Epic Respiratory Confirmed",
  Call911Confirmed: "911 Contacted",
  SecurityConfirmedNotified: "Security Contacted",
  MaintenanceConfirmedNotified: "Maintenance Contacted",
  FireAlarmConfirmationLogged: "Fire Alarm Confirmation Received",
  FireAdministratorNotified: "Administrator on Call Notified",
  FirePresidentNotified: "President Notified",
  FireCancel911Confirmed: "911 Cancellation Confirmed",
  AllClearAnnounced: "All Clear Announced",
  DecisionPathLogged: "Decision Path Logged",
  DemoCopyCaveatAcknowledged: "Demo Copy Caveat Acknowledged",
  BombThreatIntakeAnnouncementCompleted: "Bomb Threat Intake and Announcement Complete",
  BombPresidentDesigneeNotified: "President or Designee Notified",
  BombAdministratorNotified: "Administrator on Call Notified",
  BombAodNotified: "AOD Notified",
  BombPatientAccessManagerNotified: "Patient Registration Manager Notified",
  BombMaterialsManagerNotified: "Materials Manager Notified",
  BombMarketingNotified: "Marketing Notified",
  ManagerSupervisorConfirmedNotified: "Manager or Supervisor Notified",
  WatchExitsConfirmed: "Watching Exits",
  BombThreatEvidenceSaved: "Bomb Threat Evidence Saved",
  BombThreatEvidenceClosed: "Bomb Threat Evidence Closed",
  BombThreatEvidenceReopened: "Bomb Threat Evidence Reopened",
  MissingPatientPageCompleted: "Patient Page Complete",
  MissingPatientDecisionLogged: "Missing Person Decision Logged",
  MissingPatientPageAttemptLogged: "Missing Patient Page Attempt Logged",
  MissingSecurityContacted: "Security Contacted",
  DeconHazardGuidanceAcknowledged: "Hazard Guidance Acknowledged",
  DeconErPhysicianNotified: "ER Physician Notified",
  DeconAodNotified: "AOD Notified",
  DeconAdministratorNotified: "Administrator on Call Notified",
  DeconMedicalStaffLeadershipNotified: "Medical Staff Leadership Notified",
  DeconDepartmentManagersNotified: "Department Managers Notified",
  DeconCommandCenterContacted: "Command Center Contacted",
  DeconMediaRelationsNotified: "Media Relations Notified",
  DeconRenoNotified: "Reno Notified",
  MassCasualtyCommandCenterBriefingConfirmed: "Command Center Briefing Confirmed",
  MassCasualtyCareAreasReviewed: "Disaster Care Areas Reviewed",
  FirstHourResponseReviewed: "First Hour Response Reviewed",
  RiskmasterDemoCompleted: "Riskmaster Demo Completed",
  ContactObstetrician: "Obstetrician Contacted",
  ContactPediatricHospitalist: "Pediatric Hospitalist Contacted",
  ContactAnesthesiologist: "Anesthesiologist Contacted",
  ContactAnesthesiaNurse: "Anesthesia Nurse Contacted",
  ContactAod: "AOD Contacted",
  ContactLaboratory: "Laboratory Contacted",
  ContactChecklistLogged: "Contact Checklist Logged",
  DailyNoteLogged: "Log Note Added",
  OrSubmit: "Finalize OR Call-In",
  DuiSecurityNotified: "Security Notified",
  DuiLabNotified: "Lab Notified",
  DuiRegistrationRecorded: "Registration Number Recorded",
  DuiSubmit: "Final Submit",
  PgSubmit: "Page Complete",
  AlSubmit: "Submit Alarm Log"
};

const terminalActions = new Set(["DailyNoteLogged"]);

export interface AppOwnedPopupHostServiceOptions {
  preloadDemoAlerts?: boolean;
}

export class AppOwnedPopupHostService implements IPopupHostService {
  private messages?: AppPopupMessage[];

  public constructor(private readonly options: AppOwnedPopupHostServiceOptions = {}) {}

  public async getActiveMessages(): Promise<AppPopupMessage[]> {
    if (!this.messages && this.options.preloadDemoAlerts) {
      const definitions = demoRuleIds
        .map(getAppOwnedDefinition)
        .filter((definition): definition is CodeAlertWorkflowDefinition => definition !== undefined);
      this.messages = this.createMessages(definitions);
    }

    return this.copyMessages();
  }

  public async launchPopup(request: AppPopupLaunchRequest): Promise<AppPopupMessage[]> {
    if (request.kind === "OrCallIn") {
      const message = this.createOrCallInMessage(this.messages?.length ?? 0, request.formValues);
      this.messages = [...(this.messages ?? []), message];
      return this.copyMessages();
    }

    if (request.kind === "DuiIntake") {
      const message = this.createDuiMessage(this.messages?.length ?? 0, request.formValues);
      this.messages = [...(this.messages ?? []), message];
      return this.copyMessages();
    }

    if (request.kind === "PagingLog") {
      const message = this.createPagingMessage(this.messages?.length ?? 0, request.formValues);
      this.messages = [...(this.messages ?? []), message];
      return this.copyMessages();
    }

    if (request.kind === "FireAlarmPanel") {
      const message = this.createAlarmPanelMessage(this.messages?.length ?? 0, request.formValues);
      this.messages = [...(this.messages ?? []), message];
      return this.copyMessages();
    }

    const ruleId = getRuleIdForLaunchKind(request.kind);
    const rule = getAppOwnedDefinition(ruleId);

    if (!rule) {
      return this.copyMessages();
    }

    const message = this.createMessage(rule, this.messages?.length ?? 0, request.kind, request.formValues);
    this.messages = [...(this.messages ?? []), message];

    return this.copyMessages();
  }

  public async executeAction(
    messageId: string,
    actionId: string,
    formValues?: AppPopupFormValues
  ): Promise<AppPopupMessage[]> {
    const message = this.messages?.find((candidate) => candidate.id === messageId);

    if (!message) {
      return this.copyMessages();
    }

    if (terminalActions.has(actionId) || actionId === "__autoClose") {
      this.messages = this.messages?.filter((candidate) => candidate.id !== messageId) ?? [];
      return this.copyMessages();
    }

    if (message.messageType === "OrCallIn") {
      this.messages = this.messages?.map((candidate) => {
        if (candidate.id !== messageId) {
          return candidate;
        }

        return updateOrCallInActionState(candidate, actionId, formValues);
      }) ?? [];

      return this.copyMessages();
    }

    if (message.messageType === "DuiIntake") {
      this.messages = this.messages?.map((candidate) => {
        if (candidate.id !== messageId) {
          return candidate;
        }

        return updateDuiActionState(candidate, actionId, formValues);
      }) ?? [];

      return this.copyMessages();
    }

    if (message.messageType === "PagingLog") {
      this.messages = this.messages?.map((candidate) => {
        if (candidate.id !== messageId) {
          return candidate;
        }

        return updatePagingActionState(candidate, actionId, formValues);
      }) ?? [];

      return this.copyMessages();
    }

    if (message.messageType === "AlarmPanel") {
      this.messages = this.messages?.map((candidate) => {
        if (candidate.id !== messageId) {
          return candidate;
        }

        return updateAlarmPanelActionState(candidate, actionId, formValues);
      }) ?? [];

      return this.copyMessages();
    }
    if (isUpdateOnlyPopupAction(actionId)) {
      this.messages =
        this.messages?.map((candidate) => {
          if (candidate.id !== messageId) {
            return candidate;
          }

          return {
            ...candidate,
            bodyText: this.getUpdatedBodyText(candidate, actionId),
            formValues: {
              ...candidate.formValues,
              ...formValues
            }
          };
        }) ?? [];

      return this.copyMessages();
    }

    if (actionId === "ContactNurseConcernLogged") {
      this.messages =
        this.messages?.map((candidate) => {
          if (candidate.id !== messageId) {
            return candidate;
          }

          return {
            ...candidate,
            bodyText: "Nurse contact concern documented.",
            formValues: {
              ...candidate.formValues,
              ...formValues
            },
            terminalState: `${candidate.title} nurse-contact path complete. Returning to the switchboard log.`,
            actions: candidate.actions.map((action) => ({
              ...action,
              disabled: true
            }))
          };
        }) ?? [];

      return this.copyMessages();
    }

    let shouldLaunchEmergencyOperationsPlan = false;

    this.messages =
      this.messages?.map((candidate) => {
        if (candidate.id !== messageId) {
          return candidate;
        }

        const actions = candidate.actions.map((action) => {
          if (action.id === actionId) {
            return {
              ...action,
              disabled: true
            };
          }
          if (actionId === "ContactChecklistLogged" && candidate.workflowKind === "ObstetricEmergency" && formValues?.CaNoPediatricsRequested === true && action.id === "ContactPediatricHospitalist") {
            return {
              ...action,
              disabled: true
            };
          }

          if (actionId === "FireAlarmConfirmationLogged" && formValues?.CaFireDecision === "Confirmed" && action.id === "FireCancel911Confirmed") {
            return {
              ...action,
              disabled: true
            };
          }

          if (
            actionId === "FireAlarmConfirmationLogged" &&
            formValues?.CaFireDecision === "Cleared" &&
            (action.id === "FireAdministratorNotified" || action.id === "FirePresidentNotified")
          ) {
            return {
              ...action,
              disabled: true
            };
          }

          if (actionId === "MissingPatientDecisionLogged" && formValues?.CaMissingDecision === "PatientResponds" && action.id === "AllClearAnnounced") {
            return {
              ...action,
              disabled: true
            };
          }

          if (actionId === "MissingPatientDecisionLogged" && formValues?.CaMissingDecision === "AllClear" && action.id === "MissingSecurityContacted") {
            return {
              ...action,
              disabled: true
            };
          }

          if (actionId === "DeconCommandCenterContacted" && formValues?.CaCallMediaRelations !== true && action.id === "DeconMediaRelationsNotified") {
            return {
              ...action,
              disabled: true
            };
          }

          if (actionId === "DeconCommandCenterContacted" && formValues?.CaCallReno !== true && action.id === "DeconRenoNotified") {
            return {
              ...action,
              disabled: true
            };
          }

          return action;
        });
        const isCodeAlertComplete = isGuidedCodeAlertComplete(candidate, actions);
        shouldLaunchEmergencyOperationsPlan =
          shouldLaunchEmergencyOperationsPlan ||
          ((candidate.workflowKind === "Decontamination" || candidate.workflowKind === "HazardousMaterialsSpillRelease") &&
            actionId === "RiskmasterDemoCompleted" &&
            (formValues?.CaActivateEop === true || candidate.formValues?.CaActivateEop === true));

        return {
          ...candidate,
          bodyText: isCodeAlertComplete ? `${candidate.title} workflow logged.` : this.getUpdatedBodyText(candidate, actionId),
          formValues: {
            ...candidate.formValues,
            ...formValues
          },
          terminalState: isCodeAlertComplete ? `${candidate.title} workflow complete. Returning to the switchboard log.` : undefined,
          actions
        };
      }) ?? [];

    if (shouldLaunchEmergencyOperationsPlan) {
      const eopRule = getAppOwnedDefinition("CaFacilityEmergencyOperationsPlan");
      if (eopRule) {
        const sourceMessage = message;
        this.messages = [
          ...(this.messages ?? []),
          this.createMessage(eopRule, this.messages?.length ?? 0, "EmergencyOperationsPlan", {
            CaLocation: String(formValues?.CaLocation ?? sourceMessage.formValues?.CaLocation ?? sourceMessage.subtitle ?? "Command Center"),
            CaInstructions: `Created from ${sourceMessage.title} Command Center decision.`
          })
        ];
      }
    }

    return this.copyMessages();
  }

  private createMessages(rules: CodeAlertWorkflowDefinition[]): AppPopupMessage[] {
    const now = Date.now();

    return rules.map((rule, index) => this.createMessage(rule, index, getLaunchKindForRule(rule), undefined, now));
  }

  private createMessage(
    rule: CodeAlertWorkflowDefinition,
    index: number,
    launchKind: AppPopupLaunchKind,
    initialValues?: AppPopupFormValues,
    timestamp = Date.now()
  ): AppPopupMessage {
    if (launchKind === "OrCallIn") {
      return this.createOrCallInMessage(index, initialValues, timestamp);
    }

    if (launchKind === "DuiIntake") {
      return this.createDuiMessage(index, initialValues, timestamp);
    }

    if (launchKind === "PagingLog") {
      return this.createPagingMessage(index, initialValues, timestamp);
    }

    const defaultValues = getDefaultFormValues(launchKind, timestamp);
    const formFields =
      launchKind === "FireAlarmPanel"
        ? getAlarmPanelFormFields()
        : isCodeAlertLaunchKind(launchKind)
          ? []
          : rule.formSchema.fields.length > 0
            ? rule.formSchema.fields.map(mapFormField)
            : getDefaultFormFields(rule);
    const formValues = {
      ...defaultValues,
      ...initialValues
    };
    const isAllClearWorkflow = isAllClearRequest(formValues.CaRequestType);
    const baseActions =
      launchKind === "FireAlarmPanel"
        ? getAlarmPanelActions()
        : isAllClearWorkflow
          ? [mapAction("Acknowledge"), mapAction("AnnouncementCompleted")]
          : rule.actionSchema.actions.length > 0
            ? rule.actionSchema.actions.map(mapAction)
            : getDefaultActions(rule);
    const actions = launchKind === "FireAlarmPanel" || isAllClearWorkflow ? baseActions : ensureRiskmasterAction(baseActions);
    const subtitle = String(formValues.CaLocation ?? defaultValues.CaLocation ?? "");

    return {
      id: `POP-${launchKind}-${timestamp}`,
      messageType: launchKind === "FireAlarmPanel" ? "AlarmPanel" : "CodeAlert",
      workflowKind: launchKind,
      priority: rule.CaCategory === "Medical" ? "Critical" : "High",
      title: isAllClearWorkflow ? `${getPopupTitle(rule, launchKind)} All Clear` : getPopupTitle(rule, launchKind),
      subtitle,
      elapsedSinceUtc: new Date(timestamp).toISOString(),
      bodyText:
        launchKind === "FireAlarmPanel"
          ? "Record the panel location and maintenance contact status before adding the log note."
          : "",
      announcementTemplate:
        launchKind === "FireAlarmPanel"
          ? undefined
          : isAllClearWorkflow
            ? `${rule.CaPlainLanguagePrefix} + ${rule.CaAlertType} + {Location} + All Clear`
            : rule.CaAnnouncementTemplate,
      allClearTemplate: launchKind === "FireAlarmPanel" ? undefined : rule.CaAllClearTemplate,
      procedureHtml: launchKind === "FireAlarmPanel" || isCodeAlertLaunchKind(launchKind) ? undefined : rule.CaProcedureHtml,
      formFields,
      formValues,
      canDismiss: false,
      actions
    };
  }

  private createOrCallInMessage(index: number, initialValues?: AppPopupFormValues, timestamp = Date.now()): AppPopupMessage {
    const formValues = {
      ...getDefaultFormValues("OrCallIn", timestamp),
      ...initialValues
    };

    return {
      id: `POP-OrCallIn-${timestamp}`,
      messageType: "OrCallIn",
      workflowKind: "OrCallIn",
      priority: "High",
      title: "OR Call-In",
      subtitle: String(formValues.OrProcedure ?? "OR team call-in"),
      elapsedSinceUtc: new Date(timestamp - (index === 0 ? 15000 : 60000)).toISOString(),
      bodyText: "",
      formValues,
      canDismiss: false,
      actions: getOrCallInActions()
    };
  }

  private createDuiMessage(index: number, initialValues?: AppPopupFormValues, timestamp = Date.now()): AppPopupMessage {
    const formValues = {
      ...getDefaultFormValues("DuiIntake", timestamp),
      ...initialValues
    };

    return {
      id: `POP-DuiIntake-${timestamp}`,
      messageType: "DuiIntake",
      workflowKind: "DuiIntake",
      priority: "High",
      title: "DUI Intake",
      subtitle: String(formValues.DuNameLastFirst ?? "Synthetic demo intake"),
      elapsedSinceUtc: new Date(timestamp - (index === 0 ? 15000 : 60000)).toISOString(),
      bodyText: "",
      formValues,
      canDismiss: false,
      actions: getDuiActions()
    };
  }

  private createPagingMessage(index: number, initialValues?: AppPopupFormValues, timestamp = Date.now()): AppPopupMessage {
    const formValues = {
      ...getDefaultFormValues("PagingLog", timestamp),
      ...initialValues
    };

    return {
      id: `POP-PagingLog-${timestamp}`,
      messageType: "PagingLog",
      workflowKind: "PagingLog",
      priority: "High",
      title: "Paging Log",
      subtitle: String(formValues.PgWhoNeededPaged ?? "Synthetic page request"),
      elapsedSinceUtc: new Date(timestamp - (index === 0 ? 15000 : 60000)).toISOString(),
      bodyText: "",
      formValues,
      canDismiss: false,
      actions: getPagingActions()
    };
  }

  private createAlarmPanelMessage(index: number, initialValues?: AppPopupFormValues, timestamp = Date.now()): AppPopupMessage {
    const formValues = {
      ...getDefaultFormValues("FireAlarmPanel", timestamp),
      ...initialValues
    };

    return {
      id: `POP-AlarmPanel-${timestamp}`,
      messageType: "AlarmPanel",
      workflowKind: "FireAlarmPanel",
      priority: "High",
      title: "Alarm Panel Log",
      subtitle: String(formValues.AlAlarmSource ?? "Select alarm source"),
      elapsedSinceUtc: new Date(timestamp - (index === 0 ? 15000 : 60000)).toISOString(),
      bodyText: "",
      formValues,
      canDismiss: false,
      actions: getAlarmPanelActions()
    };
  }

  private getUpdatedBodyText(message: AppPopupMessage, actionId: string): string {
    const actionLabel = actionLabels[actionId] ?? actionId;
    return `${actionLabel} recorded. Continue through the remaining required actions before closing this alert.`;
  }

  private copyMessages(): AppPopupMessage[] {
    return (this.messages ?? []).map((message) => ({
      ...message,
      formFields: message.formFields?.map((field) => ({ ...field })),
      formValues: { ...message.formValues },
      actions: message.actions.map((action) => ({ ...action }))
    }));
  }
}

function mapAction(actionId: string): AppPopupAction {
  return {
    id: actionId,
    label: actionLabels[actionId] ?? actionId,
    emphasis: actionId === "Acknowledge" || actionId === "OrSubmit" || actionId === "DuiSubmit" || actionId === "PgSubmit" || actionId === "AlSubmit" ? "primary" : "secondary"
  };
}

function isUpdateOnlyPopupAction(actionId: string): boolean {
  return (
    actionId === "BombThreatEvidenceSaved" ||
    actionId === "BombThreatEvidenceClosed" ||
    actionId === "BombThreatEvidenceReopened" ||
    actionId === "MissingPatientPageAttemptLogged"
  );
}

function mapFormField(field: CodeAlertWorkflowDefinition["formSchema"]["fields"][number]): AppPopupFormField {
  return {
    name: field.name,
    label: getFieldLabel(field.name),
    type: field.type,
    required: field.required
  };
}

function getFieldLabel(fieldName: string): string {
  const labels: Record<string, string> = {
    CaLocation: "Room / Location",
    CaInstructions: "Instructions",
    CaFireConfirmed: "Fire confirmed",
    CaFalseAlarm: "False alarm"
  };

  return labels[fieldName] ?? fieldName;
}

function getPopupTitle(rule: CodeAlertWorkflowDefinition, launchKind: AppPopupLaunchKind): string {
  if (launchKind === "FireAlarmPanel") {
    return "Fire Alarm Panel";
  }

  return rule.CaDisplayLabel || rule.CaAlertType;
}

function getDefaultActions(rule: CodeAlertWorkflowDefinition): AppPopupAction[] {
  const actionIds =
    rule.CaRuleId === "CaFacilityFireAlarm"
      ? [
          "Acknowledge",
          "AnnouncementCompleted",
          "Call911Confirmed",
          "SecurityConfirmedNotified",
          "MaintenanceConfirmedNotified",
          "FireAlarmConfirmationLogged",
          "FireAdministratorNotified",
          "FirePresidentNotified",
          "FireCancel911Confirmed",
          "AllClearAnnounced",
          "DailyNoteLogged"
        ]
      : ["Acknowledge", "AnnouncementCompleted", "EpicBedPlanningConfirmedSent", "EpicRespiratoryConfirmedSent", "DailyNoteLogged"];

  return actionIds.map(mapAction);
}

function ensureRiskmasterAction(actions: AppPopupAction[]): AppPopupAction[] {
  if (actions.some((action) => action.id === "RiskmasterDemoCompleted")) {
    return actions;
  }

  const dailyNoteIndex = actions.findIndex((action) => action.id === "DailyNoteLogged");
  const riskmasterAction = mapAction("RiskmasterDemoCompleted");

  if (dailyNoteIndex === -1) {
    return [...actions, riskmasterAction];
  }

  return [...actions.slice(0, dailyNoteIndex), riskmasterAction, ...actions.slice(dailyNoteIndex)];
}

function getDefaultFormFields(rule: CodeAlertWorkflowDefinition): AppPopupFormField[] {
  if (rule.CaRuleId === "CaFacilityFireAlarm") {
    return getAlarmPanelFormFields();
  }

  return [{ name: "CaLocation", label: getFieldLabel("CaLocation"), type: "Text", required: true }];
}

function getAlarmPanelActions(): AppPopupAction[] {
  return ["AlSubmit"].map(mapAction);
}

function getOrCallInActions(): AppPopupAction[] {
  return ["OrSubmit"].map(mapAction);
}

function getDuiActions(): AppPopupAction[] {
  return ["DuiSecurityNotified", "DuiLabNotified", "DuiRegistrationRecorded", "DuiSubmit"].map(mapAction);
}

function getPagingActions(): AppPopupAction[] {
  return ["PgSubmit"].map(mapAction);
}

function getAlarmPanelFormFields(): AppPopupFormField[] {
  return [];
}

function getRuleIdForLaunchKind(kind: AppPopupLaunchKind): string {
  if (kind === "FireAlarmPanel") {
    return "CaFacilityFireAlarm";
  }

  return getCodeAlertLaunchOption(kind)?.ruleId ?? "CaMedicalCodeBlueAdult";
}

function getLaunchKindForRule(rule: CodeAlertWorkflowDefinition): AppPopupLaunchKind {
  if (rule.CaRuleId === "CaFacilityFireAlarm") {
    return "FireAlarmPanel";
  }

  return getCodeAlertLaunchOptionByRuleId(rule.CaRuleId)?.kind ?? "CodeBlueAdult";
}

function getDefaultFormValues(kind: AppPopupLaunchKind, timestamp = Date.now()): AppPopupFormValues {
  if (kind === "FireAlarmPanel") {
    return {
      AlAlarmSource: "",
      AlPanelGroup: "",
      AlAlarmDetails: "",
      AlMaintenanceContacted: false,
      AlMaintenanceContactedAt: "",
      AlMaintenanceScript: "",
      AlCodeAlertCalled: false
    };
  }

  if (kind === "OrCallIn") {
    return {
      OrDate: formatDefaultHtmlDate(timestamp),
      OrTimeContacted: formatDefaultHtmlTime(timestamp),
      OrAodName: "",
      OrProcedure: "",
      OrSurgeon: "",
      OrSurgeryDate: "",
      OrSurgeryTime: "",
      OrSurgeryStatus: "",
      OrCovidStatus: "Unknown",
      OrCArmRequired: false,
      OrAodCallbackTime: "",
      OrOperatorInitials: "",
      OrNotes: "",
      OrContactsJson: ""
    };
  }

  if (kind === "DuiIntake") {
    return {
      DuDate: formatDefaultDuiDate(timestamp),
      DuDob: "",
      DuSsn: "",
      DuNameLastFirst: "",
      DuPoliceDepartment: "State Police",
      DuPoliceOfficer: "",
      DuPoliceIncidentNumber: "",
      DuRegistrationNumber: "",
      DuNotes: ""
    };
  }

  if (kind === "PagingLog") {
    return {
      PgDate: formatDefaultPagingDate(timestamp),
      PgTime: formatDefaultPagingTime(timestamp),
      PgWhoCalled: "",
      PgFromWhere: "",
      PgCallbackNumber: "",
      PgWhoNeededPaged: "",
      PgDepartment: "",
      PgPersonOnCallPhoneNumber: "",
      PgNotes: ""
    };
  }

  return {
    CaLocation: "ED Room 12"
  };
}

function isCodeAlertLaunchKind(kind: AppPopupLaunchKind): boolean {
  return kind !== "FireAlarmPanel" && kind !== "OrCallIn" && kind !== "DuiIntake" && kind !== "PagingLog";
}

function isAllClearRequest(value: unknown): boolean {
  return String(value ?? "").replace(/\s+/g, "").toLowerCase() === "allclear";
}

function isGuidedCodeAlertComplete(message: AppPopupMessage, actions: AppPopupAction[]): boolean {
  if (message.messageType !== "CodeAlert") {
    return false;
  }

  const requiredActions = actions.filter((action) => !terminalActions.has(action.id));
  return (
    requiredActions.length > 0 &&
    requiredActions.every((requiredAction) =>
      actions.some((action) => action.id === requiredAction.id && action.disabled === true)
    )
  );
}

function getAppOwnedDefinition(ruleId: string): CodeAlertWorkflowDefinition | undefined {
  const source = codeAlertWorkflowDefinitionSources.find((item) => item.CaRuleId === ruleId);

  if (!source) {
    return undefined;
  }

  return {
    ...source,
    actionSchema: parseActionSchema(source.CaActionSchemaJson),
    formSchema: parseFormSchema(source.CaFormSchemaJson)
  };
}

function parseActionSchema(value: string): CodeAlertWorkflowDefinition["actionSchema"] {
  try {
    const parsed = JSON.parse(value) as Partial<CodeAlertWorkflowDefinition["actionSchema"]>;
    return { actions: Array.isArray(parsed.actions) ? parsed.actions.filter((action): action is string => typeof action === "string") : [] };
  } catch {
    return { actions: [] };
  }
}

function parseFormSchema(value: string): CodeAlertWorkflowDefinition["formSchema"] {
  try {
    const parsed = JSON.parse(value) as Partial<CodeAlertWorkflowDefinition["formSchema"]>;
    return {
      fields: Array.isArray(parsed.fields)
        ? parsed.fields
            .filter((field) => field && typeof field.name === "string" && isKnownFieldType(field.type))
            .map((field) => ({
              name: field.name,
              type: field.type,
              required: Boolean(field.required)
            }))
        : []
    };
  } catch {
    return { fields: [] };
  }
}

function isKnownFieldType(value: unknown): value is "Text" | "MultilineText" | "Boolean" {
  return value === "Text" || value === "MultilineText" || value === "Boolean";
}

function updateOrCallInActionState(message: AppPopupMessage, actionId: string, formValues?: AppPopupFormValues): AppPopupMessage {
  const nextFormValues: AppPopupFormValues = {
    ...message.formValues,
    ...formValues
  };

  if (actionId === "OrSubmit") {
    return {
      ...message,
      subtitle: String(nextFormValues.OrProcedure ?? "OR team call-in"),
      bodyText: "OR Call-In saved.",
      formValues: nextFormValues,
      terminalState: "OR Call-In saved. Returning to the switchboard log.",
      actions: message.actions.map((action) => ({
        ...action,
        disabled: true
      }))
    };
  }

  return {
    ...message,
    subtitle: String(nextFormValues.OrProcedure ?? "OR team call-in"),
    formValues: nextFormValues
  };
}

function updateDuiActionState(message: AppPopupMessage, actionId: string, formValues?: AppPopupFormValues): AppPopupMessage {
  const actionTimeIso = new Date().toISOString();
  const nextFormValues: AppPopupFormValues = {
    ...message.formValues,
    ...formValues
  };

  if (actionId === "DuiSecurityNotified") {
    nextFormValues.DuSecurityNotified = true;
    nextFormValues.DuSecurityNotifiedAt = actionTimeIso;
  }

  if (actionId === "DuiLabNotified") {
    nextFormValues.DuLabNotified = true;
    nextFormValues.DuLabNotifiedAt = actionTimeIso;
  }

  if (actionId === "DuiRegistrationRecorded") {
    nextFormValues.DuRegistered = true;
    nextFormValues.DuRegisteredAt = actionTimeIso;
  }

  if (actionId === "DuiSubmit") {
    return {
      ...message,
      subtitle: String(nextFormValues.DuNameLastFirst ?? "Synthetic demo intake"),
      bodyText: "DUI intake saved.",
      formValues: nextFormValues,
      terminalState: "DUI intake saved. Returning to the switchboard log.",
      actions: message.actions.map((action) => ({
        ...action,
        disabled: true
      }))
    };
  }

  return {
    ...message,
    subtitle: String(nextFormValues.DuNameLastFirst ?? "Synthetic demo intake"),
    bodyText: `${actionLabels[actionId] ?? actionId} recorded.`,
    formValues: nextFormValues,
    actions: message.actions.map((action) =>
      action.id === actionId
        ? {
            ...action,
            disabled: true
          }
        : action
    )
  };
}

function updateAlarmPanelActionState(message: AppPopupMessage, actionId: string, formValues?: AppPopupFormValues): AppPopupMessage {
  const actionTimeIso = new Date().toISOString();
  const nextFormValues: AppPopupFormValues = {
    ...message.formValues,
    ...formValues
  };

  if (actionId === "AlSubmit") {
    nextFormValues.AlLoggedAt = actionTimeIso;

    return {
      ...message,
      subtitle: String(nextFormValues.AlAlarmSource ?? "Alarm panel log"),
      bodyText: "Alarm panel log saved.",
      formValues: nextFormValues,
      terminalState: "Alarm panel log saved. Returning to the switchboard log.",
      actions: message.actions.map((action) => ({
        ...action,
        disabled: true
      }))
    };
  }

  return {
    ...message,
    subtitle: String(nextFormValues.AlAlarmSource ?? "Alarm panel log"),
    formValues: nextFormValues
  };
}
function updatePagingActionState(message: AppPopupMessage, actionId: string, formValues?: AppPopupFormValues): AppPopupMessage {
  const actionTimeIso = new Date().toISOString();
  const nextFormValues: AppPopupFormValues = {
    ...message.formValues,
    ...formValues
  };

  if (actionId === "PgSubmit") {
    nextFormValues.PgSuccess = true;
    nextFormValues.PgSuccessAt = String(nextFormValues.PgSuccessAt ?? actionTimeIso);

    return {
      ...message,
      subtitle: String(nextFormValues.PgWhoNeededPaged ?? "Synthetic page request"),
      bodyText: "Paging log saved.",
      formValues: nextFormValues,
      terminalState: "Paging log saved. Returning to the switchboard log.",
      actions: message.actions.map((action) => ({
        ...action,
        disabled: true
      }))
    };
  }

  return {
    ...message,
    subtitle: String(nextFormValues.PgWhoNeededPaged ?? "Synthetic page request"),
    bodyText: `${actionLabels[actionId] ?? actionId} recorded.`,
    formValues: nextFormValues,
    actions: message.actions.map((action) =>
      action.id === actionId
        ? {
            ...action,
            disabled: true
          }
        : action
    )
  };
}

function formatDefaultDuiDate(timestamp: number): string {
  const date = new Date(timestamp);
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const year = `${date.getFullYear()}`;
  return `${year}-${month}-${day}`;
}

function formatDefaultPagingDate(timestamp: number): string {
  const date = new Date(timestamp);
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const year = `${date.getFullYear()}`;
  return `${month}/${day}/${year}`;
}

function formatDefaultPagingTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit"
  });
}




function formatDefaultHtmlDate(timestamp: number): string {
  const date = new Date(timestamp);
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const year = `${date.getFullYear()}`;
  return `${year}-${month}-${day}`;
}

function formatDefaultHtmlTime(timestamp: number): string {
  const date = new Date(timestamp);
  return `${`${date.getHours()}`.padStart(2, "0")}:${`${date.getMinutes()}`.padStart(2, "0")}`;
}

