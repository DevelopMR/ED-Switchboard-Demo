import { AppPopupFormValues, AppPopupLaunchRequest, AppPopupMessage } from "../../models/AppPopupMessage";

export interface IPopupHostService {
  getActiveMessages(): Promise<AppPopupMessage[]>;
  launchPopup(request: AppPopupLaunchRequest): Promise<AppPopupMessage[]>;
  executeAction(messageId: string, actionId: string, formValues?: AppPopupFormValues): Promise<AppPopupMessage[]>;
  getPollingIntervalMs?(): number | undefined;
}
