import { ManagedIdentityCredential } from "@azure/identity";
import { CodeAlertSignalRequest } from "../models/codeAlertSignalRequest";
import {
  CodeAlertIntakePointer,
  CodeAlertPromotionConfig,
  CreateCodeAlertResult,
  ExistingCodeAlertPointer,
  SharePointPromotionClient
} from "../models/codeAlertPromotionModels";

interface GraphListItem<TFields extends Record<string, unknown> = Record<string, unknown>> {
  id: string;
  createdDateTime?: string;
  createdBy?: {
    user?: {
      displayName?: string;
      email?: string;
      userPrincipalName?: string;
    };
  };
  fields?: TFields & {
    Title?: string;
  };
}

interface GraphListCollection {
  value?: Array<{
    id: string;
    displayName?: string;
  }>;
}

interface GraphListItemCollection {
  value?: Array<GraphListItem>;
}

export class GraphSharePointPromotionClient implements SharePointPromotionClient {
  private readonly credential = new ManagedIdentityCredential();
  private accessToken: string | undefined;
  private accessTokenExpiresOn = 0;
  private accessTokenPromise: Promise<string> | undefined;
  private siteId: string | undefined;
  private siteIdPromise: Promise<string> | undefined;
  private intakeListId: string | undefined;
  private intakeListIdPromise: Promise<string> | undefined;
  private securedListId: string | undefined;
  private securedListIdPromise: Promise<string> | undefined;

  public constructor(private readonly config: CodeAlertPromotionConfig) {
    this.siteId = config.hubSiteId;
    this.intakeListId = config.intakeListId;
    this.securedListId = config.securedListId;
  }

  public async getIntakePointer(signal: CodeAlertSignalRequest): Promise<CodeAlertIntakePointer> {
    const listId = await this.getIntakeListId();
    const item = await this.graph<GraphListItem>(
      `/sites/${encodeURIComponent(await this.getSiteId())}/lists/${listId}/items/${signal.requestItemId}?expand=fields`
    );
    const fields = item.fields ?? {};

    return {
      requestItemId: signal.requestItemId,
      requestId: textField(fields, "CaRequestId"),
      originatorId: textField(fields, "CaOriginatorId"),
      switchboardId: textField(fields, "CaSwitchboardId"),
      requestType: requestTypeField(fields, "CaRequestType"),
      parentRequestId: optionalTextField(fields, "CaParentRequestId"),
      ruleId: optionalTextField(fields, "CaRuleId"),
      category: optionalTextField(fields, "CaCategory"),
      alertType: optionalTextField(fields, "CaAlertType"),
      location: optionalTextField(fields, "CaLocation"),
      evidenceNotes: optionalTextField(fields, "CaEvidenceNotes"),
      title: optionalTextField(fields, "Title"),
      createdAt: item.createdDateTime,
      createdByName: item.createdBy?.user?.displayName,
      createdByLogin: item.createdBy?.user?.userPrincipalName ?? item.createdBy?.user?.email
    };
  }

  public async findExistingCodeAlert(intake: CodeAlertIntakePointer): Promise<ExistingCodeAlertPointer | undefined> {
    const listId = await this.getSecuredListId();
    const filter = `fields/CaClientRequestId eq '${escapeODataString(intake.requestId)}'`;
    const response = await this.graph<GraphListItemCollection>(
      `/sites/${encodeURIComponent(await this.getSiteId())}/lists/${listId}/items?expand=fields&$filter=${encodeURIComponent(filter)}`,
      {
        headers: {
          Prefer: "HonorNonIndexedQueriesWarningMayFailRandomly"
        }
      }
    );
    const match = response.value?.[0];
    const secureAlertId = match?.fields ? optionalTextField(match.fields, "CaAlertId") : undefined;
    return secureAlertId ? { secureAlertId } : undefined;
  }

  public async createCodeAlert(intake: CodeAlertIntakePointer): Promise<CreateCodeAlertResult> {
    const listId = await this.getSecuredListId();
    const secureAlertId = `CA-${intake.requestId}`;
    const nowIso = new Date().toISOString();
    const isAllClear = intake.requestType === "AllClearRequest";
    const parentAlertId = isAllClear ? await this.findSecureAlertIdByRequestId(intake.parentRequestId) : undefined;
    const fields: Record<string, unknown> = {
      Title: isAllClear
        ? `All Clear - ${intake.alertType ?? "Code Alert"} - ${intake.location ?? "Location pending"}`
        : intake.title ?? `${intake.alertType ?? "Code Alert"} - ${intake.location ?? "Location pending"}`,
      CaAlertId: secureAlertId,
      CaClientRequestId: intake.requestId,
      CaRequestType: isAllClear ? "Allclear" : "Alert",
      CaParentRequestId: isAllClear ? intake.parentRequestId : undefined,
      CaParentAlertId: parentAlertId,
      CaCategory: requireIntakeText(intake.category, "CaCategory"),
      CaAlertType: requireIntakeText(intake.alertType, "CaAlertType"),
      CaShortLabel: isAllClear ? `${intake.alertType ?? "Code Alert"} All Clear` : intake.alertType ?? "Code Alert",
      CaLocation: requireIntakeText(intake.location, "CaLocation"),
      CaEvidenceNotes: intake.evidenceNotes ?? "",
      CaOriginatorRequestItemId: intake.requestItemId,
      [this.config.originatorIdFieldName]: intake.originatorId,
      CaSwitchboardId: intake.switchboardId,
      CaRuleId: requireIntakeText(intake.ruleId, "CaRuleId"),
      CaStatus: "Submitted",
      CaSubmittedAt: nowIso,
      CaAllClearRequestedAt: isAllClear ? nowIso : undefined,
      CaOriginatorRequestCreatedAt: intake.createdAt,
      CaOriginatorRequestCreatedByName: intake.createdByName,
      CaOriginatorRequestCreatedByLogi: intake.createdByLogin
    };

    removeUndefinedFields(fields);

    await this.graph(`/sites/${encodeURIComponent(await this.getSiteId())}/lists/${listId}/items`, {
      method: "POST",
      body: {
        fields
      }
    });

    if (isAllClear && intake.parentRequestId) {
      await this.markParentAllClearRequested(intake.parentRequestId, nowIso);
    }

    return {
      secureAlertId,
      created: true
    };
  }

  public async markIntakePromoted(intake: CodeAlertIntakePointer, secureAlertId: string): Promise<void> {
    await this.patchIntakeFields(intake.requestItemId, {
      CaIntakeStatus: "Promoted",
      CaSecureAlertId: secureAlertId,
      CaProcessedAt: new Date().toISOString(),
      // SharePoint text fields do not reliably clear through Graph when sent as null.
      CaSafeErrorCode: ""
    });
  }

  public async markIntakeFailed(intake: CodeAlertIntakePointer, errorCode: string): Promise<void> {
    await this.patchIntakeFields(intake.requestItemId, {
      CaIntakeStatus: "Failed",
      CaProcessedAt: new Date().toISOString(),
      CaSafeErrorCode: errorCode
    });
  }


  private async findSecureAlertIdByRequestId(requestId: string | undefined): Promise<string | undefined> {
    if (!requestId) {
      return undefined;
    }

    const listId = await this.getSecuredListId();
    const filter = `fields/CaClientRequestId eq '${escapeODataString(requestId)}'`;
    const response = await this.graph<GraphListItemCollection>(
      `/sites/${encodeURIComponent(await this.getSiteId())}/lists/${listId}/items?expand=fields&$filter=${encodeURIComponent(filter)}`,
      {
        headers: {
          Prefer: "HonorNonIndexedQueriesWarningMayFailRandomly"
        }
      }
    );
    const match = response.value?.[0];
    return match?.fields ? optionalTextField(match.fields, "CaAlertId") : undefined;
  }

  private async markParentAllClearRequested(parentRequestId: string, requestedAtIso: string): Promise<void> {
    const listId = await this.getSecuredListId();
    const filter = `fields/CaClientRequestId eq '${escapeODataString(parentRequestId)}'`;
    const response = await this.graph<GraphListItemCollection>(
      `/sites/${encodeURIComponent(await this.getSiteId())}/lists/${listId}/items?expand=fields&$filter=${encodeURIComponent(filter)}`,
      {
        headers: {
          Prefer: "HonorNonIndexedQueriesWarningMayFailRandomly"
        }
      }
    );
    const parent = response.value?.[0];
    if (!parent?.id) {
      return;
    }

    await this.graph(`/sites/${encodeURIComponent(await this.getSiteId())}/lists/${listId}/items/${parent.id}/fields`, {
      method: "PATCH",
      body: {
        CaAllClearRequestedAt: requestedAtIso
      }
    });
  }
  private async patchIntakeFields(requestItemId: number, fields: Record<string, unknown>): Promise<void> {
    const listId = await this.getIntakeListId();
    await this.graph(`/sites/${encodeURIComponent(await this.getSiteId())}/lists/${listId}/items/${requestItemId}/fields`, {
      method: "PATCH",
      body: fields
    });
  }

  private async getSiteId(): Promise<string> {
    if (this.siteId) {
      return this.siteId;
    }

    if (!this.siteIdPromise) {
      this.siteIdPromise = this.resolveSiteId();
    }

    try {
      this.siteId = await this.siteIdPromise;
      return this.siteId;
    } finally {
      this.siteIdPromise = undefined;
    }
  }

  private async resolveSiteId(): Promise<string> {
    const siteUrl = new URL(this.config.hubSiteUrl);
    const site = await this.graph<{ id: string }>(
      `/sites/${siteUrl.hostname}:${siteUrl.pathname}?$select=id`
    );
    return site.id;
  }

  private async getIntakeListId(): Promise<string> {
    if (this.intakeListId) {
      return this.intakeListId;
    }

    if (!this.intakeListIdPromise) {
      this.intakeListIdPromise = this.getListId(this.config.intakeListTitle);
    }

    try {
      this.intakeListId = await this.intakeListIdPromise;
      return this.intakeListId;
    } finally {
      this.intakeListIdPromise = undefined;
    }
  }

  private async getSecuredListId(): Promise<string> {
    if (this.securedListId) {
      return this.securedListId;
    }

    if (!this.securedListIdPromise) {
      this.securedListIdPromise = this.getListId(this.config.securedListTitle);
    }

    try {
      this.securedListId = await this.securedListIdPromise;
      return this.securedListId;
    } finally {
      this.securedListIdPromise = undefined;
    }
  }

  private async getListId(displayName: string): Promise<string> {
    const filter = `displayName eq '${escapeODataString(displayName)}'`;
    const response = await this.graph<GraphListCollection>(
      `/sites/${encodeURIComponent(await this.getSiteId())}/lists?$select=id,displayName&$filter=${encodeURIComponent(filter)}`
    );
    const list = response.value?.[0];
    if (!list?.id) {
      throw new Error(`SharePoint list not found: ${displayName}`);
    }
    return list.id;
  }

  private async graph<TResponse = unknown>(
    path: string,
    options: {
      method?: "GET" | "POST" | "PATCH";
      headers?: Record<string, string>;
      body?: unknown;
    } = {}
  ): Promise<TResponse> {
    const token = await this.getGraphToken();
    const response = await fetch(`https://graph.microsoft.com/v1.0${path}`, {
      method: options.method ?? "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
        ...options.headers
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Graph request failed ${response.status}: ${safeGraphErrorText(errorText)}`);
    }

    if (response.status === 204) {
      return undefined as TResponse;
    }

    return (await response.json()) as TResponse;
  }

  private async getGraphToken(): Promise<string> {
    const refreshBufferMs = 5 * 60 * 1000;
    if (this.accessToken && Date.now() < this.accessTokenExpiresOn - refreshBufferMs) {
      return this.accessToken;
    }

    if (!this.accessTokenPromise) {
      this.accessTokenPromise = this.refreshGraphToken();
    }

    try {
      return await this.accessTokenPromise;
    } finally {
      this.accessTokenPromise = undefined;
    }
  }

  private async refreshGraphToken(): Promise<string> {
    const token = await this.credential.getToken("https://graph.microsoft.com/.default");
    if (!token?.token) {
      throw new Error("Managed identity did not return a Microsoft Graph token.");
    }

    this.accessToken = token.token;
    this.accessTokenExpiresOn = token.expiresOnTimestamp;
    return this.accessToken;
  }
}

function textField(fields: Record<string, unknown>, name: string): string {
  const value = optionalTextField(fields, name);
  if (!value) {
    throw new Error(`Intake item is missing ${name}.`);
  }
  return value;
}

function optionalTextField(fields: Record<string, unknown>, name: string): string | undefined {
  const value = fields[name];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function requestTypeField(fields: Record<string, unknown>, name: string): "Alert" | "AllClearRequest" {
  const value = textField(fields, name);
  if (value === "Alert" || value === "AllClearRequest") {
    return value;
  }
  throw new Error(`Unsupported intake request type ${value}.`);
}

function requireIntakeText(value: string | undefined, fieldName: string): string {
  if (!value) {
    throw new Error(`Intake item is missing ${fieldName}.`);
  }
  return value;
}

function removeUndefinedFields(fields: Record<string, unknown>): void {
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined) {
      delete fields[key];
    }
  }
}

function escapeODataString(value: string): string {
  return value.replace(/'/g, "''");
}

function safeGraphErrorText(errorText: string): string {
  return errorText.length > 500 ? `${errorText.slice(0, 500)}...` : errorText;
}



