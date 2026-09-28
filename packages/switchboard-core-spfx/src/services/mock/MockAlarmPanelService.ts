import { AlarmPanelItem } from "../../models/AlarmPanelItem";
import { IAlarmPanelService } from "../contracts/IAlarmPanelService";

export class MockAlarmPanelService implements IAlarmPanelService {
  private items: AlarmPanelItem[] = [];

  public async createLog(item: AlarmPanelItem): Promise<AlarmPanelItem> {
    const saved = {
      ...item,
      id: item.id || `ALARM-${Date.now()}`
    };

    this.items = [saved, ...this.items];
    return saved;
  }
}
