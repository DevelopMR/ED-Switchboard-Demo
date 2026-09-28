export type AlarmPanelGroup =
  | "Remote Alarm Panel"
  | "Generator Alarm"
  | "Medical Gas Master Alarm Panel"
  | "Fire Alarm Code Red"
  | "Condition A";

export interface AlarmPanelItem {
  id: string;
  title: string;
  alarmSource: string;
  panelGroup: AlarmPanelGroup;
  alarmDetails?: string;
  maintenanceContacted: boolean;
  maintenanceContactedAt?: string;
  maintenanceScript?: string;
  codeAlertCalled: boolean;
  loggedAt: string;
  operatorName?: string;
}


