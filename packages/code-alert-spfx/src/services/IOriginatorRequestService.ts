import {
  OriginatorRequest,
  RequestAllClearInput,
  SubmitOriginatorAlertInput
} from "../models/OriginatorRequest";

export interface IOriginatorRequestService {
  getActiveRequests(): Promise<OriginatorRequest[]>;
  submitAlert(input: SubmitOriginatorAlertInput): Promise<OriginatorRequest>;
  requestAllClear(input: RequestAllClearInput): Promise<OriginatorRequest>;
}
