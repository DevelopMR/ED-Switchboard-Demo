import { CodeAlertSignalRequest } from "../models/codeAlertSignalRequest";
import {
  CodeAlertIntakePointer,
  loadPromotionConfig,
  SharePointPromotionClient
} from "../models/codeAlertPromotionModels";
import { GraphSharePointPromotionClient } from "./graphSharePointPromotionClient";
import { StubSharePointPromotionClient } from "./stubSharePointPromotionClient";

export interface PromotionLogger {
  correlationId: string;
  log(message: string, details?: unknown): void;
}

export interface CodeAlertSignalPromotionResult {
  httpStatus: number;
  status: "Accepted" | "Promoted" | "Rejected" | "Failed";
  intakeStatus: "SignalReceived" | "Promoted" | "Rejected" | "Failed";
  secureAlertId?: string;
  errorCode?: string;
  message: string;
}

let cachedPromotionClientKey: string | undefined;
let cachedPromotionClient: SharePointPromotionClient | undefined;

export async function promoteCodeAlertSignal(
  signal: CodeAlertSignalRequest,
  logger: PromotionLogger
): Promise<CodeAlertSignalPromotionResult> {
  const pipelineStartedAt = Date.now();
  logger.log("Code Alert signal promotion pipeline started", {
    requestItemId: signal.requestItemId,
    requestId: signal.requestId,
    correlationId: logger.correlationId
  });

  let config;
  try {
    config = loadPromotionConfig();
  } catch (error) {
    return finishPromotion({
      httpStatus: 500,
      status: "Failed",
      intakeStatus: "Failed",
      errorCode: "MissingFunctionConfiguration",
      message: safeErrorMessage(error)
    }, logger, pipelineStartedAt);
  }

  const client = createPromotionClient(config);
  let intake: CodeAlertIntakePointer | undefined;

  try {
    intake = await runTimedStage("ReadIntake", logger, () => client.getIntakePointer(signal));
    const validation = validatePointerMatch(signal, intake);
    if (validation) {
      if (client.markIntakeFailed) {
        await runTimedStage("MarkIntakeFailed", logger, () =>
          client.markIntakeFailed!(intake!, validation.errorCode ?? "SignalValidationFailed")
        );
      }
      return finishPromotion(validation, logger, pipelineStartedAt);
    }

    const requiredValidation = validateRequiredAlertFields(intake);
    if (requiredValidation) {
      if (client.markIntakeFailed) {
        await runTimedStage("MarkIntakeFailed", logger, () =>
          client.markIntakeFailed!(intake!, requiredValidation.errorCode ?? "MissingRequiredField")
        );
      }
      return finishPromotion(requiredValidation, logger, pipelineStartedAt);
    }

    const existing = await runTimedStage("FindExistingAlert", logger, () => client.findExistingCodeAlert(intake!));
    if (existing) {
      await runTimedStage("MarkIntakePromoted", logger, () => client.markIntakePromoted(intake!, existing.secureAlertId));
      logger.log("Code Alert signal matched existing secured alert", {
        requestItemId: signal.requestItemId,
        requestId: signal.requestId,
        correlationId: logger.correlationId
      });

      return finishPromotion({
        httpStatus: 200,
        status: "Promoted",
        intakeStatus: "Promoted",
        secureAlertId: existing.secureAlertId,
        message: "Signal matched an existing secured Code Alert."
      }, logger, pipelineStartedAt);
    }

    const created = await runTimedStage("CreateSecuredAlert", logger, () => client.createCodeAlert(intake!));
    if (created.created) {
      await runTimedStage("MarkIntakePromoted", logger, () => client.markIntakePromoted(intake!, created.secureAlertId));
      logger.log("Code Alert signal promoted into secured alert", {
        requestItemId: signal.requestItemId,
        requestId: signal.requestId,
        correlationId: logger.correlationId
      });

      return finishPromotion({
        httpStatus: 201,
        status: "Promoted",
        intakeStatus: "Promoted",
        secureAlertId: created.secureAlertId,
        message: "Signal promoted into secured Code Alert."
      }, logger, pipelineStartedAt);
    }

    logger.log("Code Alert signal reached stub promotion boundary", {
      requestItemId: signal.requestItemId,
      requestId: signal.requestId,
      promotionMode: config.promotionMode,
      correlationId: logger.correlationId
    });

    return finishPromotion({
      httpStatus: 202,
      status: "Accepted",
      intakeStatus: "SignalReceived",
      secureAlertId: created.secureAlertId,
      errorCode: "PromotionStubbed",
      message:
        "Pointer-only signal accepted. Server-side promotion pipeline reached the SharePoint stub boundary."
    }, logger, pipelineStartedAt);
  } catch (error) {
    logger.log("Code Alert signal promotion failed", {
      requestItemId: signal.requestItemId,
      requestId: signal.requestId,
      errorCode: "PromotionFailed",
      correlationId: logger.correlationId
    });

    if (intake) {
      await runTimedStage("MarkIntakeFailed", logger, () =>
        client.markIntakeFailed!(intake!, "PromotionFailed")
      ).catch(() => undefined);
    }

    return finishPromotion({
      httpStatus: 500,
      status: "Failed",
      intakeStatus: "Failed",
      errorCode: "PromotionFailed",
      message: safeErrorMessage(error)
    }, logger, pipelineStartedAt);
  }
}

function validatePointerMatch(
  signal: CodeAlertSignalRequest,
  intake: CodeAlertIntakePointer
): CodeAlertSignalPromotionResult | undefined {
  if (intake.requestItemId !== signal.requestItemId || intake.requestId !== signal.requestId) {
    return {
      httpStatus: 409,
      status: "Rejected",
      intakeStatus: "Rejected",
      errorCode: "SignalIntakeMismatch",
      message: "Signal identifiers do not match the intake item."
    };
  }

  if (intake.originatorId !== signal.originatorId || intake.switchboardId !== signal.switchboardId) {
    return {
      httpStatus: 403,
      status: "Rejected",
      intakeStatus: "Rejected",
      errorCode: "SignalRouteMismatch",
      message: "Signal routing identifiers do not match the intake item."
    };
  }

  if (intake.requestType !== "Alert" && intake.requestType !== "AllClearRequest") {
    return {
      httpStatus: 422,
      status: "Rejected",
      intakeStatus: "Rejected",
      errorCode: "UnsupportedRequestType",
      message: "Only Alert and AllClearRequest intake requests can be promoted."
    };
  }

  return undefined;
}

function validateRequiredAlertFields(intake: CodeAlertIntakePointer): CodeAlertSignalPromotionResult | undefined {
  const missing = [
    ["CaRuleId", intake.ruleId],
    ["CaCategory", intake.category],
    ["CaAlertType", intake.alertType],
    ["CaLocation", intake.location]
  ]
    .filter(([, value]) => !value)
    .map(([fieldName]) => fieldName);

  if (intake.requestType === "AllClearRequest" && !intake.parentRequestId) {
    missing.push("CaParentRequestId");
  }

  if (missing.length > 0) {
    return {
      httpStatus: 422,
      status: "Rejected",
      intakeStatus: "Rejected",
      errorCode: "MissingRequiredIntakeField",
      message: `Intake item is missing required field(s): ${missing.join(", ")}.`
    };
  }

  return undefined;
}

function createPromotionClient(config: ReturnType<typeof loadPromotionConfig>): SharePointPromotionClient {
  if (config.promotionMode !== "Graph") {
    return new StubSharePointPromotionClient(config);
  }

  const cacheKey = JSON.stringify({
    hubSiteUrl: config.hubSiteUrl,
    hubSiteId: config.hubSiteId,
    intakeListTitle: config.intakeListTitle,
    intakeListId: config.intakeListId,
    securedListTitle: config.securedListTitle,
    securedListId: config.securedListId,
    originatorIdFieldName: config.originatorIdFieldName
  });

  if (!cachedPromotionClient || cachedPromotionClientKey !== cacheKey) {
    cachedPromotionClient = new GraphSharePointPromotionClient(config);
    cachedPromotionClientKey = cacheKey;
  }

  return cachedPromotionClient;
}

async function runTimedStage<T>(
  stage: string,
  logger: PromotionLogger,
  operation: () => Promise<T>
): Promise<T> {
  const startedAt = Date.now();
  try {
    const result = await operation();
    logger.log("Code Alert promotion stage completed", {
      stage,
      durationMs: Date.now() - startedAt,
      correlationId: logger.correlationId
    });
    return result;
  } catch (error) {
    logger.log("Code Alert promotion stage failed", {
      stage,
      durationMs: Date.now() - startedAt,
      errorCode: "PromotionStageFailed",
      correlationId: logger.correlationId
    });
    throw error;
  }
}

function finishPromotion(
  result: CodeAlertSignalPromotionResult,
  logger: PromotionLogger,
  pipelineStartedAt: number
): CodeAlertSignalPromotionResult {
  logger.log("Code Alert signal promotion pipeline completed", {
    durationMs: Date.now() - pipelineStartedAt,
    status: result.status,
    intakeStatus: result.intakeStatus,
    errorCode: result.errorCode,
    correlationId: logger.correlationId
  });
  return result;
}

function safeErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Function promotion failed.";
}
