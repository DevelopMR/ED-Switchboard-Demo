import { CodeAlertSignalRequest } from "./codeAlertSignalRequest";

export interface CodeAlertPromotionConfig {
  hubSiteUrl: string;
  hubSiteId?: string;
  intakeListTitle: string;
  intakeListId?: string;
  securedListTitle: string;
  securedListId?: string;
  originatorIdFieldName: string;
  promotionMode: "Stub" | "Graph";
}

export interface CodeAlertIntakePointer {
  requestItemId: number;
  requestId: string;
  originatorId: string;
  switchboardId: string;
  requestType: "Alert" | "AllClearRequest";
  parentRequestId?: string;
  ruleId?: string;
  category?: string;
  alertType?: string;
  location?: string;
  evidenceNotes?: string;
  title?: string;
  createdAt?: string;
  createdByName?: string;
  createdByLogin?: string;
}

export interface ExistingCodeAlertPointer {
  secureAlertId: string;
}

export interface CreateCodeAlertResult {
  secureAlertId: string;
  created: boolean;
}

export interface SharePointPromotionClient {
  getIntakePointer(signal: CodeAlertSignalRequest): Promise<CodeAlertIntakePointer>;
  findExistingCodeAlert(intake: CodeAlertIntakePointer): Promise<ExistingCodeAlertPointer | undefined>;
  createCodeAlert(intake: CodeAlertIntakePointer): Promise<CreateCodeAlertResult>;
  markIntakePromoted(intake: CodeAlertIntakePointer, secureAlertId: string): Promise<void>;
  markIntakeFailed?(intake: CodeAlertIntakePointer, errorCode: string): Promise<void>;
}

export function loadPromotionConfig(): CodeAlertPromotionConfig {
  return {
    hubSiteUrl: requiredSetting("CodeAlertHubSiteUrl"),
    hubSiteId: optionalSetting("CodeAlertHubSiteId"),
    intakeListTitle: requiredSetting("CodeAlertIntakeListTitle"),
    intakeListId: optionalSetting("CodeAlertIntakeListId"),
    securedListTitle: requiredSetting("CodeAlertSecuredListTitle"),
    securedListId: optionalSetting("CodeAlertSecuredListId"),
    originatorIdFieldName: optionalSetting("CodeAlertOriginatorIdFieldName") ?? "CaOriginatorID",
    promotionMode: readPromotionMode()
  };
}

function requiredSetting(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required Function app setting ${name}.`);
  }
  return value;
}

function optionalSetting(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

function readPromotionMode(): "Stub" | "Graph" {
  const value = optionalSetting("CodeAlertPromotionMode") ?? "Stub";
  if (value === "Stub" || value === "Graph") {
    return value;
  }

  throw new Error("CodeAlertPromotionMode must be Stub or Graph.");
}


