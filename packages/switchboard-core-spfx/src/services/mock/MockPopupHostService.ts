import { AppPopupFormValues, AppPopupLaunchRequest, AppPopupMessage } from "../../models/AppPopupMessage";
import { codeAlertLaunchOptions, getCodeAlertLaunchOption } from "../../constants/CodeAlertLaunchOptions";
import { IPopupHostService } from "../contracts/IPopupHostService";
import { codeAlertWorkflowDefinitionSources } from "../popup/codeAlertWorkflowDefinitionSources";

export class MockPopupHostService implements IPopupHostService {
  private messages: AppPopupMessage[];

  public constructor() {
    this.messages = this.createSeedMessages();
  }

  public async getActiveMessages(): Promise<AppPopupMessage[]> {
    return this.copyMessages();
  }

  public async launchPopup(request: AppPopupLaunchRequest): Promise<AppPopupMessage[]> {
    const now = Date.now();
    const values = request.formValues ?? {};
    const message = request.kind === "FireAlarmPanel"
      ? this.createAlarmPanelMessage(values, now)
      : request.kind === "OrCallIn"
        ? this.createOrCallInMessage(values, now)
        : request.kind === "DuiIntake"
          ? this.createDuiMessage(values, now)
          : request.kind === "PagingLog"
            ? this.createPagingMessage(values, now)
            : this.createCodeAlertMessage(request.kind, values, now);

    this.messages = [...this.messages, message];
    return this.copyMessages();
  }

  public async executeAction(messageId: string, actionId: string, formValues?: AppPopupFormValues): Promise<AppPopupMessage[]> {
    const message = this.messages.find((candidate) => candidate.id === messageId);

    if (!message) {
      return this.copyMessages();
    }

    if (actionId === "__autoClose" || actionId === "announce" || actionId === "noted") {
      this.messages = this.messages.filter((candidate) => candidate.id !== messageId);
      return this.copyMessages();
    }

    this.messages = this.messages.map((candidate) => {
      if (candidate.id !== messageId) {
        return candidate;
      }

      switch (candidate.messageType) {
        case "OrCallIn":
          return this.updateOneShotActionState(candidate, actionId, formValues, "OrSubmit", "OR Call-In saved.", "OR Call-In saved. Returning to the switchboard log.", "OrProcedure", "OR team call-in");
        case "DuiIntake":
          return this.updateDuiActionState(candidate, actionId, formValues);
        case "PagingLog":
          return this.updatePagingActionState(candidate, actionId, formValues);
        case "AlarmPanel":
          return this.updateAlarmPanelActionState(candidate, actionId, formValues);
        default:
          return this.updateCodeAlertActionState(candidate, actionId, formValues);
      }
    });

    return this.copyMessages();
  }

  private createCodeAlertMessage(kind: AppPopupLaunchRequest["kind"], values: AppPopupLaunchRequest["formValues"], now: number): AppPopupMessage {
    const option = getCodeAlertLaunchOption(kind) ?? codeAlertLaunchOptions[0];
    const definitionSource = codeAlertWorkflowDefinitionSources.find((item) => item.CaRuleId === option.ruleId);
    const location = String(values?.CaLocation ?? "ED Room 12");

    return {
      id: `POP-CODE-${now}`,
      messageType: "CodeAlert",
      workflowKind: kind,
      priority: "Critical",
      title: option.label,
      subtitle: location,
      elapsedSinceUtc: new Date(now).toISOString(),
      bodyText: "",
      announcementTemplate: definitionSource?.CaAnnouncementTemplate ?? `Medical Alert + ${option.label} + {Location}`,
      formValues: {
        CaLocation: location,
        ...values
      },
      formFields: [],
      canDismiss: false,
      actions: ensureRiskmasterActionIds(getActionIds(definitionSource?.CaActionSchemaJson).filter((actionId) => actionId !== "DailyNoteLogged")).map((actionId, index) => ({
        id: actionId,
        label: getActionLabel(actionId),
        emphasis: index === 0 ? "primary" : "secondary"
      }))
    };
  }

  private createOrCallInMessage(values: AppPopupFormValues | undefined, now: number): AppPopupMessage {
    return {
      id: `POP-OR-${now}`,
      messageType: "OrCallIn",
      workflowKind: "OrCallIn",
      priority: "High",
      title: "OR Call-In",
      subtitle: String(values?.OrProcedure ?? "OR team call-in"),
      elapsedSinceUtc: new Date(now).toISOString(),
      bodyText: "",
      formValues: {
        OrDate: formatDefaultDate(now),
        OrTimeContacted: formatDefaultTime(now),
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
        OrContactsJson: "",
        ...values
      },
      canDismiss: false,
      actions: [{ id: "OrSubmit", label: "Finalize OR Call-In", emphasis: "primary" }]
    };
  }

  private createDuiMessage(values: AppPopupFormValues | undefined, now: number): AppPopupMessage {
    return {
      id: `POP-DUI-${now}`,
      messageType: "DuiIntake",
      workflowKind: "DuiIntake",
      priority: "High",
      title: "DUI Intake",
      subtitle: String(values?.DuNameLastFirst ?? "Synthetic demo intake"),
      elapsedSinceUtc: new Date(now).toISOString(),
      bodyText: "",
      formValues: {
        DuDate: formatDefaultHtmlDate(now),
        DuDob: "",
        DuSsn: "",
        DuNameLastFirst: "",
        DuPoliceDepartment: "State Police",
        DuPoliceOfficer: "",
        DuPoliceIncidentNumber: "",
        DuRegistrationNumber: "",
        DuNotes: "",
        ...values
      },
      canDismiss: false,
      actions: [
        { id: "DuiSecurityNotified", label: "Security Notified", emphasis: "secondary" },
        { id: "DuiLabNotified", label: "Lab Notified", emphasis: "secondary" },
        { id: "DuiRegistrationRecorded", label: "Registration Number Recorded", emphasis: "secondary" },
        { id: "DuiSubmit", label: "Final Submit", emphasis: "primary" }
      ]
    };
  }

  private createPagingMessage(values: AppPopupFormValues | undefined, now: number): AppPopupMessage {
    return {
      id: `POP-PAGING-${now}`,
      messageType: "PagingLog",
      workflowKind: "PagingLog",
      priority: "High",
      title: "Paging Log",
      subtitle: String(values?.PgWhoNeededPaged ?? "Synthetic page request"),
      elapsedSinceUtc: new Date(now).toISOString(),
      bodyText: "",
      formValues: {
        PgDate: formatDefaultDate(now),
        PgTime: formatDefaultTime(now),
        PgWhoCalled: "",
        PgFromWhere: "",
        PgCallbackNumber: "",
        PgWhoNeededPaged: "",
        PgDepartment: "",
        PgPersonOnCallPhoneNumber: "",
        PgNotes: "",
        ...values
      },
      canDismiss: false,
      actions: [{ id: "PgSubmit", label: "Page Complete", emphasis: "primary" }]
    };
  }

  private createAlarmPanelMessage(values: AppPopupFormValues | undefined, now: number): AppPopupMessage {
    return {
      id: `POP-ALARM-${now}`,
      messageType: "AlarmPanel",
      workflowKind: "FireAlarmPanel",
      priority: "High",
      title: "Alarm Panel Log",
      subtitle: String(values?.AlAlarmSource ?? "Select alarm source"),
      elapsedSinceUtc: new Date(now).toISOString(),
      bodyText: "",
      formValues: {
        AlAlarmSource: "",
        AlPanelGroup: "",
        AlAlarmDetails: "",
        AlMaintenanceContacted: false,
        AlMaintenanceContactedAt: "",
        AlMaintenanceScript: "",
        AlCodeAlertCalled: false,
        ...values
      },
      canDismiss: false,
      actions: [{ id: "AlSubmit", label: "Submit Alarm Log", emphasis: "primary" }]
    };
  }

  private updateOneShotActionState(
    message: AppPopupMessage,
    actionId: string,
    formValues: AppPopupFormValues | undefined,
    submitActionId: string,
    bodyText: string,
    terminalState: string,
    subtitleFieldName: string,
    fallbackSubtitle: string
  ): AppPopupMessage {
    const nextFormValues: AppPopupFormValues = {
      ...message.formValues,
      ...formValues
    };

    if (actionId === submitActionId) {
      return {
        ...message,
        subtitle: String(nextFormValues[subtitleFieldName] ?? fallbackSubtitle),
        bodyText,
        formValues: nextFormValues,
        terminalState,
        actions: message.actions.map((action) => ({ ...action, disabled: true }))
      };
    }

    return {
      ...message,
      subtitle: String(nextFormValues[subtitleFieldName] ?? fallbackSubtitle),
      formValues: nextFormValues
    };
  }

  private updateDuiActionState(message: AppPopupMessage, actionId: string, formValues?: AppPopupFormValues): AppPopupMessage {
    const actionTimeIso = new Date().toISOString();
    const nextFormValues: AppPopupFormValues = { ...message.formValues, ...formValues };

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
        actions: message.actions.map((action) => ({ ...action, disabled: true }))
      };
    }

    return {
      ...message,
      subtitle: String(nextFormValues.DuNameLastFirst ?? "Synthetic demo intake"),
      formValues: nextFormValues,
      actions: message.actions.map((action) => action.id === actionId ? { ...action, disabled: true } : action)
    };
  }

  private updatePagingActionState(message: AppPopupMessage, actionId: string, formValues?: AppPopupFormValues): AppPopupMessage {
    const nextFormValues: AppPopupFormValues = { ...message.formValues, ...formValues };

    if (actionId === "PgSubmit") {
      nextFormValues.PgSuccess = true;
      nextFormValues.PgSuccessAt = String(nextFormValues.PgSuccessAt ?? new Date().toISOString());
      return {
        ...message,
        subtitle: String(nextFormValues.PgWhoNeededPaged ?? "Synthetic page request"),
        bodyText: "Paging log saved.",
        formValues: nextFormValues,
        terminalState: "Paging log saved. Returning to the switchboard log.",
        actions: message.actions.map((action) => ({ ...action, disabled: true }))
      };
    }

    return { ...message, subtitle: String(nextFormValues.PgWhoNeededPaged ?? "Synthetic page request"), formValues: nextFormValues };
  }

  private updateAlarmPanelActionState(message: AppPopupMessage, actionId: string, formValues?: AppPopupFormValues): AppPopupMessage {
    const nextFormValues: AppPopupFormValues = { ...message.formValues, ...formValues };

    if (actionId === "AlSubmit") {
      nextFormValues.AlLoggedAt = String(nextFormValues.AlLoggedAt ?? new Date().toISOString());
      return {
        ...message,
        subtitle: String(nextFormValues.AlAlarmSource ?? "Alarm panel log"),
        bodyText: "Alarm panel log saved.",
        formValues: nextFormValues,
        terminalState: "Alarm panel log saved. Returning to the switchboard log.",
        actions: message.actions.map((action) => ({ ...action, disabled: true }))
      };
    }

    return { ...message, subtitle: String(nextFormValues.AlAlarmSource ?? "Alarm panel log"), formValues: nextFormValues };
  }

  private updateCodeAlertActionState(message: AppPopupMessage, actionId: string, formValues?: AppPopupFormValues): AppPopupMessage {
    if (actionId === "ContactNurseConcernLogged") {
      return {
        ...message,
        bodyText: "Nurse contact concern documented.",
        formValues: { ...message.formValues, ...formValues },
        terminalState: `${message.title} nurse-contact path complete. Returning to the switchboard log.`,
        actions: message.actions.map((action) => ({ ...action, disabled: true }))
      };
    }

    const actions = message.actions.map((action) => action.id === actionId ? { ...action, disabled: true } : action);
    const requiredActions = actions.filter((action) => action.id !== "DailyNoteLogged");
    const isComplete = requiredActions.every((requiredAction) => requiredAction.disabled === true);

    return {
      ...message,
      formValues: { ...message.formValues, ...formValues },
      bodyText: isComplete ? `${message.title} workflow logged.` : message.bodyText,
      terminalState: isComplete ? `${message.title} workflow complete. Returning to the switchboard log.` : undefined,
      actions
    };
  }

  private copyMessages(): AppPopupMessage[] {
    return this.messages.map((message) => ({
      ...message,
      formValues: { ...message.formValues },
      actions: message.actions.map((action) => ({ ...action }))
    }));
  }

  private createSeedMessages(): AppPopupMessage[] {
    const now = Date.now();

    return [
      this.createCodeAlertMessage("CodeBlueAdult", { CaLocation: "ED Room 12" }, now - 45000),
      this.createAlarmPanelMessage(undefined, now - 185000)
    ];
  }
}

function getActionIds(actionSchemaJson: string | undefined): string[] {
  if (!actionSchemaJson) {
    return ["Acknowledge", "AnnouncementCompleted", "EpicBedPlanningConfirmedSent", "EpicRespiratoryConfirmedSent"];
  }

  try {
    const parsed = JSON.parse(actionSchemaJson) as { actions?: unknown[] };
    return Array.isArray(parsed.actions) ? parsed.actions.filter((action): action is string => typeof action === "string") : [];
  } catch {
    return ["Acknowledge", "AnnouncementCompleted", "EpicBedPlanningConfirmedSent", "EpicRespiratoryConfirmedSent"];
  }
}

function getActionLabel(actionId: string): string {
  const labels: Record<string, string> = {
    Acknowledge: "Acknowledge",
    AnnouncementCompleted: "Announcement Complete",
    EpicBedPlanningConfirmedSent: "Epic Bed Planning Confirmed",
    EpicRespiratoryConfirmedSent: "Epic Respiratory Confirmed",
    SecurityConfirmedNotified: "Security Contacted",
    DecisionPathLogged: "Decision Path Logged",
    ContactChecklistLogged: "Contact Checklist Logged",
    RiskmasterDemoCompleted: "Riskmaster Demo Completed"
  };

  return labels[actionId] ?? actionId;
}

function ensureRiskmasterActionIds(actionIds: string[]): string[] {
  if (actionIds.includes("RiskmasterDemoCompleted")) {
    return actionIds;
  }

  return [...actionIds, "RiskmasterDemoCompleted"];
}

function formatDefaultHtmlDate(timestamp: number): string {
  const date = new Date(timestamp);
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const year = `${date.getFullYear()}`;
  return `${year}-${month}-${day}`;
}

function formatDefaultDate(timestamp: number): string {
  const date = new Date(timestamp);
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const year = `${date.getFullYear()}`;
  return `${month}/${day}/${year}`;
}

function formatDefaultTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit"
  });
}
