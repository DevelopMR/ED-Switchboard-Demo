import { CodeAlertCategory } from "./CodeAlertCatalog";

export type OriginatorRequestType = "Alert" | "AllClearRequest";
export type OriginatorIntakeStatus = "Received" | "Validating" | "Promoted" | "Rejected" | "Failed" | "Acknowledged" | "Closed";

export interface OriginatorRequest {
  id: number;
  requestId: string;
  requestType: OriginatorRequestType;
  parentRequestId?: string;
  ruleId: string;
  category: CodeAlertCategory;
  alertType: string;
  location: string;
  evidenceNotes?: string;
  intakeStatus: OriginatorIntakeStatus;
  secureAlertId?: string;
  acknowledgedAt?: Date;
  acknowledgedByName?: string;
  terminalStatus?: string;
  signalWarning?: string;
  created: Date;
  createdByName: string;
}

export interface SubmitOriginatorAlertInput {
  requestId: string;
  ruleId: string;
  category: CodeAlertCategory;
  alertType: string;
  location: string;
  evidenceNotes?: string;
}

export interface RequestAllClearInput {
  requestId: string;
  parentRequestId: string;
  parentRuleId: string;
  parentAlertId?: string;
  parentCategory: CodeAlertCategory;
  parentAlertType: string;
  parentLocation: string;
}

