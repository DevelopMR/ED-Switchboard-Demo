import { AlarmPanelFields } from "../../constants/AlarmPanelFields";
import { AlarmPanelItem } from "../../models/AlarmPanelItem";

export function mapAlarmPanelItemToCreatePayload(item: AlarmPanelItem): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    Title: item.title,
    [AlarmPanelFields.AlarmSource]: item.alarmSource,
    [AlarmPanelFields.PanelGroup]: item.panelGroup,
    [AlarmPanelFields.MaintenanceContacted]: item.maintenanceContacted,
    [AlarmPanelFields.CodeAlertCalled]: item.codeAlertCalled,
    [AlarmPanelFields.LoggedAt]: item.loggedAt,
    [AlarmPanelFields.OperatorName]: item.operatorName
  };

  setIfPresent(payload, AlarmPanelFields.AlarmDetails, item.alarmDetails);
  setIfPresent(payload, AlarmPanelFields.MaintenanceContactedAt, item.maintenanceContactedAt);
  setIfPresent(payload, AlarmPanelFields.MaintenanceScript, item.maintenanceScript);

  return payload;
}

function setIfPresent(payload: Record<string, unknown>, fieldName: string, value: unknown): void {
  if (value === undefined || value === null) {
    return;
  }

  if (typeof value === "string" && value.trim().length === 0) {
    return;
  }

  payload[fieldName] = value;
}



