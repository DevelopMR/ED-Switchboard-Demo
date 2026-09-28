export interface CodeAlertSignalRequest {
  requestItemId: number;
  requestId: string;
  originatorId: string;
  switchboardId: string;
}

type ParseResult =
  | { ok: true; value: CodeAlertSignalRequest }
  | { ok: false; errorCode: string; message: string };

const SAFE_ID_PATTERN = /^[A-Za-z0-9-]{3,64}$/;
const ROUTING_ID_PATTERN = /^[A-Za-z0-9]{8,64}$/;

export function parseCodeAlertSignalRequest(body: unknown): ParseResult {
  if (!isRecord(body)) {
    return reject("InvalidBody", "Request body must be a JSON object.");
  }

  const requestItemId = body.requestItemId;
  const requestId = body.requestId;
  const originatorId = body.originatorId;
  const switchboardId = body.switchboardId;

  if (!isPositiveInteger(requestItemId)) {
    return reject("InvalidRequestItemId", "requestItemId must be a positive integer.");
  }

  if (!isSafeId(requestId)) {
    return reject("InvalidRequestId", "requestId must be a short alphanumeric pointer.");
  }

  if (!isRoutingId(originatorId)) {
    return reject("InvalidOriginatorId", "originatorId must be an alphanumeric routing identifier.");
  }

  if (!isRoutingId(switchboardId)) {
    return reject("InvalidSwitchboardId", "switchboardId must be an alphanumeric routing identifier.");
  }

  const allowedKeys = new Set(["requestItemId", "requestId", "originatorId", "switchboardId"]);
  const extraKeys = Object.keys(body).filter((key) => !allowedKeys.has(key));
  if (extraKeys.length > 0) {
    return reject("UnexpectedSignalField", "Signal payload contains fields that are not allowed.");
  }

  return {
    ok: true,
    value: {
      requestItemId,
      requestId,
      originatorId,
      switchboardId
    }
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPositiveInteger(value: unknown): value is number {
  return Number.isInteger(value) && typeof value === "number" && value > 0;
}

function isSafeId(value: unknown): value is string {
  return typeof value === "string" && SAFE_ID_PATTERN.test(value);
}

function isRoutingId(value: unknown): value is string {
  return typeof value === "string" && ROUTING_ID_PATTERN.test(value);
}

function reject(errorCode: string, message: string): ParseResult {
  return { ok: false, errorCode, message };
}
