import { CodeAlertSignalRequest } from "../models/codeAlertSignalRequest";
import {
  CodeAlertIntakePointer,
  CodeAlertPromotionConfig,
  CreateCodeAlertResult,
  ExistingCodeAlertPointer,
  SharePointPromotionClient
} from "../models/codeAlertPromotionModels";

export class StubSharePointPromotionClient implements SharePointPromotionClient {
  public constructor(private readonly config: CodeAlertPromotionConfig) {}

  public async getIntakePointer(signal: CodeAlertSignalRequest): Promise<CodeAlertIntakePointer> {
    void this.config;
    return {
      requestItemId: signal.requestItemId,
      requestId: signal.requestId,
      originatorId: signal.originatorId,
      switchboardId: signal.switchboardId,
      requestType: "Alert"
    };
  }

  public async findExistingCodeAlert(_intake: CodeAlertIntakePointer): Promise<ExistingCodeAlertPointer | undefined> {
    return undefined;
  }

  public async createCodeAlert(intake: CodeAlertIntakePointer): Promise<CreateCodeAlertResult> {
    return {
      secureAlertId: `CA-${intake.requestId}`,
      created: false
    };
  }

  public async markIntakePromoted(_intake: CodeAlertIntakePointer, _secureAlertId: string): Promise<void> {
    return undefined;
  }
}
