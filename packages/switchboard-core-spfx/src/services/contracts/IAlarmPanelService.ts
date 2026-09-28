import { AlarmPanelItem } from "../../models/AlarmPanelItem";

export interface IAlarmPanelService {
  createLog(item: AlarmPanelItem): Promise<AlarmPanelItem>;
}
