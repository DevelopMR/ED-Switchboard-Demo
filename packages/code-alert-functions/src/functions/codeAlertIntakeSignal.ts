import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { promoteCodeAlertSignal } from "../services/codeAlertSignalPromotionService";
import { parseCodeAlertSignalRequest } from "../models/codeAlertSignalRequest";

export async function codeAlertIntakeSignal(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const correlationId = context.invocationId;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return {
      status: 400,
      jsonBody: {
        status: "Rejected",
        errorCode: "InvalidJson",
        correlationId
      }
    };
  }

  const parsed = parseCodeAlertSignalRequest(body);
  if (!parsed.ok) {
    return {
      status: 400,
      jsonBody: {
        status: "Rejected",
        errorCode: parsed.errorCode,
        message: parsed.message,
        correlationId
      }
    };
  }

  context.log("Received pointer-only Code Alert signal", {
    requestItemId: parsed.value.requestItemId,
    requestId: parsed.value.requestId,
    originatorId: parsed.value.originatorId,
    switchboardId: parsed.value.switchboardId,
    correlationId
  });

  const result = await promoteCodeAlertSignal(parsed.value, {
    correlationId,
    log: (message, details) => context.log(message, details)
  });

  return {
    status: result.httpStatus,
    jsonBody: {
      status: result.status,
      secureAlertId: result.secureAlertId,
      intakeStatus: result.intakeStatus,
      errorCode: result.errorCode,
      message: result.message,
      correlationId
    }
  };
}

app.http("codeAlertIntakeSignal", {
  methods: ["POST"],
  authLevel: "function",
  route: "code-alerts/intake-signal",
  handler: codeAlertIntakeSignal
});
