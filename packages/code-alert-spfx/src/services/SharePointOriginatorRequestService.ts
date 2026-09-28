import { SPHttpClient, SPHttpClientResponse } from "@microsoft/sp-http";

import {
  OriginatorIntakeStatus,
  OriginatorRequest,
  OriginatorRequestType,
  RequestAllClearInput,
  SubmitOriginatorAlertInput
} from "../models/OriginatorRequest";
import { CodeAlertCategory } from "../models/CodeAlertCatalog";
import { AzureFunctionSignalService } from "./AzureFunctionSignalService";
import { IOriginatorRequestService } from "./IOriginatorRequestService";

export interface SharePointOriginatorRequestServiceOptions {
  spHttpClient: SPHttpClient;
  intakeSiteUrl: string;
  listTitle: string;
  originatorId: string;
  switchboardId: string;
  functionSignalEndpointUrl: string;
  functionSignalKey: string;
  currentUserName: string;
  currentUserEmail: string;
}

interface SharePointItemsResponse {
  value?: SharePointOriginatorRequestItem[];
  d?: { results?: SharePointOriginatorRequestItem[] };
}

interface SharePointOriginatorRequestItem {
  Id?: number;
  ID?: number;
  CaRequestId?: string;
  CaRequestType?: OriginatorRequestType;
  CaParentRequestId?: string;
  CaRuleId?: string;
  CaCategory?: CodeAlertCategory;
  CaAlertType?: string;
  CaLocation?: string;
  CaEvidenceNotes?: string;
  CaIntakeStatus?: OriginatorIntakeStatus;
  CaSecureAlertId?: string;
  CaAcknowledgedAt?: string;
  CaAcknowledgedByName?: string;
  CaTerminalStatus?: string;
  Created?: string;
  Author?: { Title?: string; EMail?: string };
}

export class SharePointOriginatorRequestService implements IOriginatorRequestService {
  public constructor(private readonly options: SharePointOriginatorRequestServiceOptions) {}

  public async getActiveRequests(): Promise<OriginatorRequest[]> {
    const response = await this.options.spHttpClient.get(
      `${this.listUrl}/items?$select=Id,CaRequestId,CaRequestType,CaParentRequestId,CaRuleId,CaCategory,CaAlertType,CaLocation,CaEvidenceNotes,CaIntakeStatus,CaSecureAlertId,CaAcknowledgedAt,CaAcknowledgedByName,CaTerminalStatus,Created,Author/Title,Author/EMail&$expand=Author&$orderby=Created desc&$top=50`,
      SPHttpClient.configurations.v1
    );
    await ensureSuccess(response, "load originator receipts");
    const body = (await response.json()) as SharePointItemsResponse;
    const rows = body.value ?? body.d?.results ?? [];

    return rows
      .filter((row) => isCurrentUser(row.Author, this.options.currentUserName, this.options.currentUserEmail))
      .filter((row) => row.CaRequestType === "Alert" && !isTerminal(row.CaIntakeStatus))
      .map((row) => mapItem(row, this.options.currentUserName));
  }

  public async submitAlert(input: SubmitOriginatorAlertInput): Promise<OriginatorRequest> {
    const body: Record<string, unknown> = {
      Title: safeSingleLine(`${input.alertType} - ${input.location}`),
      CaRequestId: input.requestId,
      CaRequestType: "Alert",
      CaParentRequestId: "",
      CaSwitchboardId: this.options.switchboardId,
      CaRuleId: input.ruleId,
      CaCategory: input.category,
      CaAlertType: input.alertType,
      CaLocation: input.location,
      CaEvidenceNotes: input.evidenceNotes ?? "",
      CaIntakeStatus: "Received"
    };
    body.CaOriginatorId = this.options.originatorId;

    const row = await this.createItem(body, "submit originator alert");
    const created = mapItem(row, this.options.currentUserName, input);
    created.signalWarning = await this.trySignalCreatedAlert(created);
    return created;
  }

  public async requestAllClear(input: RequestAllClearInput): Promise<OriginatorRequest> {
    const body: Record<string, unknown> = {
      Title: safeSingleLine(`Request All Clear - ${input.parentAlertType} - ${input.parentLocation}`),
      CaRequestId: input.requestId,
      CaRequestType: "AllClearRequest",
      CaParentRequestId: input.parentRequestId,
      CaSwitchboardId: this.options.switchboardId,
      CaRuleId: input.parentRuleId,
      CaCategory: input.parentCategory,
      CaAlertType: input.parentAlertType,
      CaLocation: input.parentLocation,
      CaEvidenceNotes: "",
      CaIntakeStatus: "Received"
    };
    body.CaOriginatorId = this.options.originatorId;
    const row = await this.createItem(body, "request All Clear");
    const created = mapItem(row, this.options.currentUserName, {
      requestId: input.requestId,
      ruleId: input.parentRuleId,
      category: input.parentCategory,
      alertType: input.parentAlertType,
      location: input.parentLocation
    });
    created.signalWarning = await this.trySignalCreatedAlert(created);
    return created;
  }

  private async createItem(body: Record<string, unknown>, operation: string): Promise<SharePointOriginatorRequestItem> {
    const response = await this.options.spHttpClient.post(this.itemsUrl, SPHttpClient.configurations.v1, {
      headers: {
        Accept: "application/json;odata=nometadata",
        "Content-Type": "application/json;odata=nometadata"
      },
      body: JSON.stringify(body)
    });
    await ensureSuccess(response, operation);
    const result = (await response.json()) as SharePointOriginatorRequestItem & { d?: SharePointOriginatorRequestItem };
    return result.d ?? result;
  }

  private get listUrl(): string {
    return `${trimSlash(this.options.intakeSiteUrl)}/_api/web/lists/getbytitle('${escapeOData(this.options.listTitle)}')`;
  }

  private get itemsUrl(): string {
    return `${this.listUrl}/items`;
  }

  private async trySignalCreatedAlert(created: OriginatorRequest): Promise<string | undefined> {
    const signalService = new AzureFunctionSignalService({
      endpointUrl: this.options.functionSignalEndpointUrl,
      functionKey: this.options.functionSignalKey,
      originatorId: this.options.originatorId,
      switchboardId: this.options.switchboardId
    });

    if (!signalService.isConfigured) {
      return "Fast Azure Function signal is not configured; request was saved to intake only.";
    }

    try {
      const result = await signalService.sendIntakeSignal({
        requestItemId: created.id,
        requestId: created.requestId
      });
      return result.status === "Accepted" || result.status === "Promoted" ? undefined : result.message;
    } catch (error) {
      return toSafeSignalWarning(error);
    }
  }
}

async function ensureSuccess(response: SPHttpClientResponse, operation: string): Promise<void> {
  if (!response.ok) {
    throw new Error(`Unable to ${operation}. SharePoint returned ${response.status}. Verify list permissions and internal field names.`);
  }
}

function mapItem(
  row: SharePointOriginatorRequestItem,
  fallbackUserName: string,
  fallback?: SubmitOriginatorAlertInput
): OriginatorRequest {
  return {
    id: row.Id ?? row.ID ?? 0,
    requestId: row.CaRequestId ?? fallback?.requestId ?? "",
    requestType: row.CaRequestType ?? "Alert",
    parentRequestId: row.CaParentRequestId,
    ruleId: row.CaRuleId ?? fallback?.ruleId ?? "",
    category: row.CaCategory ?? fallback?.category ?? "Facility",
    alertType: row.CaAlertType ?? fallback?.alertType ?? "Code Alert",
    location: row.CaLocation ?? fallback?.location ?? "Location pending",
    evidenceNotes: row.CaEvidenceNotes ?? fallback?.evidenceNotes,
    intakeStatus: row.CaIntakeStatus ?? "Received",
    secureAlertId: row.CaSecureAlertId,
    acknowledgedAt: parseDate(row.CaAcknowledgedAt),
    acknowledgedByName: row.CaAcknowledgedByName,
    terminalStatus: row.CaTerminalStatus,
    created: parseDate(row.Created) ?? new Date(),
    createdByName: row.Author?.Title ?? fallbackUserName
  };
}

function isTerminal(status?: OriginatorIntakeStatus): boolean {
  return status === "Closed";
}

function parseDate(value?: string): Date | undefined {
  if (!value) {
    return undefined;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function trimSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function escapeOData(value: string): string {
  return value.replace(/'/g, "''");
}

function safeSingleLine(value: string): string {
  return value.slice(0, 255);
}

function toSafeSignalWarning(error: unknown): string {
  const message = error instanceof Error ? error.message : "Fast Azure Function signal failed.";
  return `Saved to intake, but the fast Azure Function signal did not complete: ${message}`;
}

function isCurrentUser(
  author: SharePointOriginatorRequestItem["Author"],
  currentUserName: string,
  currentUserEmail: string
): boolean {
  if (currentUserEmail && author?.EMail) {
    return author.EMail.toLowerCase() === currentUserEmail.toLowerCase();
  }
  return author?.Title === currentUserName;
}

