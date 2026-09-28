import {
  OriginatorRequest,
  RequestAllClearInput,
  SubmitOriginatorAlertInput
} from "../models/OriginatorRequest";
import { IOriginatorRequestService } from "./IOriginatorRequestService";

export class MockOriginatorRequestService implements IOriginatorRequestService {
  private readonly requests: OriginatorRequest[] = [];

  public constructor(private readonly currentUserName: string) {}

  public async getActiveRequests(): Promise<OriginatorRequest[]> {
    return this.requests.filter((item) => item.requestType === "Alert" && item.intakeStatus !== "Closed");
  }

  public async submitAlert(input: SubmitOriginatorAlertInput): Promise<OriginatorRequest> {
    const item: OriginatorRequest = {
      id: this.requests.length + 1,
      requestId: input.requestId,
      requestType: "Alert",
      ruleId: input.ruleId,
      category: input.category,
      alertType: input.alertType,
      location: input.location,
      evidenceNotes: input.evidenceNotes,
      intakeStatus: "Received",
      created: new Date(),
      createdByName: this.currentUserName
    };
    this.requests.unshift(item);
    return item;
  }

  public async requestAllClear(input: RequestAllClearInput): Promise<OriginatorRequest> {
    const item: OriginatorRequest = {
      id: this.requests.length + 1,
      requestId: input.requestId,
      requestType: "AllClearRequest",
      parentRequestId: input.parentRequestId,
      ruleId: input.parentRuleId,
      category: input.parentCategory,
      alertType: input.parentAlertType,
      location: input.parentLocation,
      intakeStatus: "Received",
      created: new Date(),
      createdByName: this.currentUserName
    };
    this.requests.push(item);
    return item;
  }
}

