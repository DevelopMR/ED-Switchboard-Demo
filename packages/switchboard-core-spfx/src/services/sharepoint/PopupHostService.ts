import { AppPopupFormValues, AppPopupLaunchRequest, AppPopupMessage } from "../../models/AppPopupMessage";
import { getCodeAlertLaunchOptionByRuleId } from "../../constants/CodeAlertLaunchOptions";
import { ListNames } from "../../constants/ListNames";
import { ISharePointListClient, SharePointListItemRecord } from "./ISharePointListClient";
import { IPopupHostService } from "../contracts/IPopupHostService";
import { AppOwnedPopupHostService } from "../popup/AppOwnedPopupHostService";

interface SharePointCodeAlertItem extends SharePointListItemRecord {
  Id?: number;
  Title?: string;
  CaAlertId?: string;
  CaOriginatorRequestItemId?: number;
  CaSwitchboardId?: string;
  CaRuleId?: string;
  CaCategory?: string;
  CaAlertType?: string;
  CaLocation?: string;
  CaEvidenceNotes?: string;
  CaStatus?: string;
  CaRequestType?: "Alert" | "AllClear" | "Allclear";
  CaParentRequestId?: string;
  CaParentAlertId?: string;
  CaAllClearRequestedAt?: string;
  CaSubmittedAt?: string;
  CaAcknowledgedAt?: string;
}

interface TrackedSharePointAlert {
  externalMessageId: string;
  internalMessageId: string;
  alert: SharePointCodeAlertItem;
}

const activeStatuses = new Set([
  "Submitted",
  "Acknowledged",
  "AnnouncementCompleted",
  "Active",
  "CancelRequested",
  "AllClearRequested"
]);

export interface PopupHostServiceOptions {
  listClient: ISharePointListClient;
  currentUserName: string;
  switchboardId?: string;
  codeAlertsListTitle?: string;
  intakeListTitle?: string;
  pollingIntervalMs?: number;
  debugLogging?: boolean;
}

export class PopupHostService implements IPopupHostService {
  private readonly workflowService = new AppOwnedPopupHostService({ preloadDemoAlerts: false });
  private readonly trackedAlerts = new Map<string, TrackedSharePointAlert>();
  private readonly codeAlertsListTitle: string;
  private readonly intakeListTitle: string;

  public constructor(private readonly options: PopupHostServiceOptions) {
    this.codeAlertsListTitle = options.codeAlertsListTitle ?? ListNames.CodeAlerts;
    this.intakeListTitle = options.intakeListTitle ?? ListNames.CaOriginatorRequests;
  }

  public getPollingIntervalMs(): number | undefined {
    return this.options.pollingIntervalMs;
  }

  public async getActiveMessages(): Promise<AppPopupMessage[]> {
    await this.syncSharePointAlerts();
    return this.getTransformedMessages();
  }

  public async launchPopup(request: AppPopupLaunchRequest): Promise<AppPopupMessage[]> {
    await this.workflowService.launchPopup(request);
    return this.getActiveMessages();
  }

  public async executeAction(messageId: string, actionId: string, formValues?: AppPopupFormValues): Promise<AppPopupMessage[]> {
    const tracked = this.trackedAlerts.get(messageId);

    if (!tracked) {
      await this.workflowService.executeAction(messageId, actionId, formValues);
      return this.getActiveMessages();
    }

    const updatedInternalMessages = await this.workflowService.executeAction(tracked.internalMessageId, actionId, formValues);
    const updatedInternalMessage = updatedInternalMessages.find((message) => message.id === tracked.internalMessageId);
    await this.persistTrackedAlertAction(tracked, actionId, formValues, updatedInternalMessage);
    return this.getActiveMessages();
  }

  private async syncSharePointAlerts(): Promise<void> {
    if (!this.options.switchboardId) {
      this.logDebug("Switchboard ID is not set. SharePoint popup polling is disabled.");
      return;
    }

    let alerts: SharePointCodeAlertItem[] = [];

    try {
      alerts = (await this.options.listClient.getItems(this.codeAlertsListTitle, {
        select: [
          "Id",
          "Title",
          "CaAlertId",
          "CaOriginatorRequestItemId",
          "CaSwitchboardId",
          "CaRuleId",
          "CaCategory",
          "CaAlertType",
          "CaLocation",
          "CaEvidenceNotes",
          "CaStatus",
          "CaRequestType",
          "CaParentRequestId",
          "CaParentAlertId",
          "CaAllClearRequestedAt",
          "CaSubmittedAt",
          "CaAcknowledgedAt"
        ],
        filter: buildActiveAlertsFilter(this.options.switchboardId),
        orderBy: "CaSubmittedAt asc",
        top: 25
      })) as SharePointCodeAlertItem[];
    } catch (error) {
      this.logError("SharePoint popup polling failed while reading CodeAlerts.", error);
      throw error;
    }

    this.logDebug(`Fetched ${alerts.length} active CodeAlerts item(s).`, {
      listTitle: this.codeAlertsListTitle,
      switchboardId: this.options.switchboardId,
      alertIds: alerts.map((alert) => alert.CaAlertId ?? `ID:${alert.Id ?? "?"}`)
    });

    const currentInternalMessages = await this.workflowService.getActiveMessages();
    const activeExternalIds = new Set<string>();

    for (const alert of alerts) {
      const externalMessageId = getExternalMessageId(alert);
      activeExternalIds.add(externalMessageId);
      const tracked = this.trackedAlerts.get(externalMessageId);

      if (tracked && currentInternalMessages.some((message) => message.id === tracked.internalMessageId)) {
        tracked.alert = alert;
        this.logDebug("Reused already-tracked popup message.", {
          externalMessageId,
          internalMessageId: tracked.internalMessageId,
          ruleId: alert.CaRuleId,
          status: alert.CaStatus
        });
        continue;
      }

      await this.createTrackedAlert(alert, externalMessageId);
    }

    for (const [externalMessageId, tracked] of Array.from(this.trackedAlerts.entries())) {
      if (activeExternalIds.has(externalMessageId)) {
        continue;
      }

      try {
        await this.workflowService.executeAction(tracked.internalMessageId, "__autoClose");
      } catch {
        // Ignore cleanup failures for already-closed popups.
      }

      this.logDebug("Removed inactive tracked popup message.", {
        externalMessageId,
        internalMessageId: tracked.internalMessageId
      });
      this.trackedAlerts.delete(externalMessageId);
    }
  }

  private async createTrackedAlert(alert: SharePointCodeAlertItem, externalMessageId: string): Promise<void> {
    const option = alert.CaRuleId ? getCodeAlertLaunchOptionByRuleId(alert.CaRuleId) : undefined;

    if (!option) {
      this.logError("No popup workflow mapping was found for CodeAlert rule.", {
        externalMessageId,
        ruleId: alert.CaRuleId,
        alertId: alert.CaAlertId,
        sharePointItemId: alert.Id
      });
      return;
    }

    const before = await this.workflowService.getActiveMessages();
    const after = await this.workflowService.launchPopup({
      kind: option.kind,
      formValues: buildAlertFormValues(alert)
    });
    const newMessage = after.find((candidate) => !before.some((existing) => existing.id === candidate.id)) ?? after[after.length - 1];

    if (!newMessage) {
      this.logError("A popup workflow was launched but no new popup message was created.", {
        externalMessageId,
        workflowKind: option.kind,
        ruleId: alert.CaRuleId,
        alertId: alert.CaAlertId
      });
      return;
    }

    this.trackedAlerts.set(externalMessageId, {
      externalMessageId,
      internalMessageId: newMessage.id,
      alert
    });

    this.logDebug("Created tracked popup message from CodeAlert.", {
      externalMessageId,
      internalMessageId: newMessage.id,
      workflowKind: option.kind,
      ruleId: alert.CaRuleId,
      alertId: alert.CaAlertId,
      location: alert.CaLocation
    });
  }

  private async getTransformedMessages(): Promise<AppPopupMessage[]> {
    const internalMessages = await this.workflowService.getActiveMessages();

    return internalMessages.map((message) => {
      const tracked = Array.from(this.trackedAlerts.values()).find((item) => item.internalMessageId === message.id);
      if (!tracked) {
        return message;
      }

      const baseFormValues = buildAlertFormValues(tracked.alert);
      return {
        ...message,
        id: tracked.externalMessageId,
        subtitle: tracked.alert.CaLocation ?? message.subtitle,
        elapsedSinceUtc: message.elapsedSinceUtc,
        formValues: {
          ...baseFormValues,
          ...message.formValues
        }
      };
    });
  }

  private async persistTrackedAlertAction(
    tracked: TrackedSharePointAlert,
    actionId: string,
    formValues: AppPopupFormValues | undefined,
    updatedInternalMessage: AppPopupMessage | undefined
  ): Promise<void> {
    const actionTimeIso = new Date().toISOString();

    if (actionId === "Acknowledge") {
      await this.options.listClient.updateItem(this.codeAlertsListTitle, requireItemId(tracked.alert), {
        CaStatus: "Acknowledged",
        CaAcknowledgedAt: actionTimeIso
      });

      if (tracked.alert.CaOriginatorRequestItemId) {
        await this.options.listClient.updateItem(this.intakeListTitle, tracked.alert.CaOriginatorRequestItemId, {
          CaIntakeStatus: "Acknowledged",
          CaAcknowledgedAt: actionTimeIso,
          CaAcknowledgedByName: this.options.currentUserName
        });
      }

      this.applyTrackedAlertUpdates(tracked, {
        CaStatus: "Acknowledged",
        CaAcknowledgedAt: actionTimeIso
      });

      this.logDebug("Acknowledged tracked CodeAlert popup.", {
        externalMessageId: tracked.externalMessageId,
        alertId: tracked.alert.CaAlertId,
        actionId
      });
    }

    if (actionId === "AnnouncementCompleted" || actionId === "BombThreatIntakeAnnouncementCompleted") {
      const isAllClear = isAllClearRequest(tracked.alert.CaRequestType);
      const announcementStatus = isAllClear ? "AllClearAnnounced" : "AnnouncementCompleted";
      const announcementPayload: Record<string, unknown> = {
        CaStatus: announcementStatus,
        CaAnnouncementCompletedAt: actionTimeIso
      };

      if (isAllClear) {
        announcementPayload.CaAllClearAnnouncedAt = actionTimeIso;
      }

      await this.options.listClient.updateItem(this.codeAlertsListTitle, requireItemId(tracked.alert), announcementPayload);

      this.applyTrackedAlertUpdates(tracked, {
        CaStatus: announcementStatus
      });

      this.logDebug("Marked tracked CodeAlert popup announcement complete.", {
        externalMessageId: tracked.externalMessageId,
        alertId: tracked.alert.CaAlertId,
        actionId
      });
    }

    if (!updatedInternalMessage?.terminalState) {
      return;
    }

    const terminalStatus = actionId === "AllClearAnnounced" || isAllClearRequest(tracked.alert.CaRequestType) ? "AllClearAnnounced" : "Complete";
    const codeAlertPayload: Record<string, unknown> = {
      CaStatus: terminalStatus,
      CaResolutionNotes: buildResolutionNotes(this.options.currentUserName, formValues)
    };

    if (actionId === "AllClearAnnounced") {
      codeAlertPayload.CaAllClearAnnouncedAt = actionTimeIso;
    }

    await this.options.listClient.updateItem(this.codeAlertsListTitle, requireItemId(tracked.alert), codeAlertPayload);

    if (tracked.alert.CaOriginatorRequestItemId) {
      await this.options.listClient.updateItem(this.intakeListTitle, tracked.alert.CaOriginatorRequestItemId, {
        CaIntakeStatus: "Closed",
        CaTerminalStatus: terminalStatus,
        CaProcessedAt: actionTimeIso
      });
    }

    this.applyTrackedAlertUpdates(tracked, {
      CaStatus: terminalStatus
    });

    this.logDebug("Completed tracked CodeAlert popup terminal state.", {
      externalMessageId: tracked.externalMessageId,
      alertId: tracked.alert.CaAlertId,
      actionId,
      terminalStatus
    });
  }

  private applyTrackedAlertUpdates(tracked: TrackedSharePointAlert, updates: Partial<SharePointCodeAlertItem>): void {
    tracked.alert = {
      ...tracked.alert,
      ...updates
    };
  }

  private logDebug(message: string, details?: unknown): void {
    if (!this.options.debugLogging) {
      return;
    }

    if (typeof details === "undefined") {
      console.info(`[SwPopupPolling] ${message}`);
      return;
    }

    console.info(`[SwPopupPolling] ${message}`, details);
  }

  private logError(message: string, details?: unknown): void {
    if (typeof details === "undefined") {
      console.error(`[SwPopupPolling] ${message}`);
      return;
    }

    console.error(`[SwPopupPolling] ${message}`, details);
  }
}

function buildActiveAlertsFilter(switchboardId: string): string {
  const statusFilter = Array.from(activeStatuses)
    .map((status) => `CaStatus eq '${status}'`)
    .join(" or ");

  return `CaSwitchboardId eq '${escapeODataValue(switchboardId)}' and (${statusFilter})`;
}

function getExternalMessageId(alert: SharePointCodeAlertItem): string {
  return String(alert.CaAlertId ?? `CAITEM-${requireItemId(alert)}`);
}

function buildAlertFormValues(alert: SharePointCodeAlertItem): AppPopupFormValues {
  const values: AppPopupFormValues = {
    CaLocation: alert.CaLocation ?? "Location pending",
    CaRequestType: alert.CaRequestType ?? "Alert",
    CaParentRequestId: alert.CaParentRequestId,
    CaParentAlertId: alert.CaParentAlertId
  };

  const evidenceNotes = String(alert.CaEvidenceNotes ?? "").trim();
  if (evidenceNotes.length > 0) {
    values.CaBombThreatEvidenceNotes = evidenceNotes;
    values.CaBombEvidenceClosed = true;
  }

  return values;
}

function isAllClearRequest(value: unknown): boolean {
  return String(value ?? "").replace(/\s+/g, "").toLowerCase() === "allclear";
}

function buildResolutionNotes(currentUserName: string, formValues?: AppPopupFormValues): string {
  const submittedNotes = typeof formValues?.CaResolutionNotes === "string" ? formValues.CaResolutionNotes.trim() : "";
  return submittedNotes.length > 0 ? submittedNotes : `Switchboard workflow completed by ${currentUserName}.`;
}

function requireItemId(item: SharePointCodeAlertItem): number {
  if (!item.Id || item.Id <= 0) {
    throw new Error("SharePoint Code Alert item is missing a valid Id.");
  }

  return item.Id;
}

function escapeODataValue(value: string): string {
  return value.replace(/'/g, "''");
}

