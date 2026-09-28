export interface ShellRuntimeContext {
  siteUrl: string;
  currentUserName: string;
  requestDigest?: string;
  fetchImpl?: typeof fetch;
  preloadDemoAlerts?: boolean;
  switchboardId?: string;
  codeAlertsListTitle?: string;
  intakeListTitle?: string;
  popupPollingIntervalMs?: number;
  popupDebugLogging?: boolean;
}
