import { ListNames } from "../../constants/ListNames";
import { AlarmPanelItem } from "../../models/AlarmPanelItem";
import { IAlarmPanelService } from "../contracts/IAlarmPanelService";
import { ISharePointListClient } from "./ISharePointListClient";
import { mapAlarmPanelItemToCreatePayload } from "./AlarmPanelMapper";

export class AlarmPanelService implements IAlarmPanelService {
  public constructor(private readonly listClient: ISharePointListClient) {}

  public async createLog(item: AlarmPanelItem): Promise<AlarmPanelItem> {
    const created = await this.listClient.createItem(ListNames.AlarmPanelLogs, mapAlarmPanelItemToCreatePayload(item));

    return {
      ...item,
      id: String(created.Id ?? item.id)
    };
  }
}
