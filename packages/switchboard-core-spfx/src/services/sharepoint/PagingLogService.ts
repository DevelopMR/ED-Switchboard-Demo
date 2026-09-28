import { ListNames } from "../../constants/ListNames";
import { PagingLogItem } from "../../models/PagingLogItem";
import { IPagingLogService } from "../contracts/IPagingLogService";
import { ISharePointListClient } from "./ISharePointListClient";
import { mapPagingLogItemToCreatePayload } from "./PagingLogMapper";

export class PagingLogService implements IPagingLogService {
  public constructor(private readonly listClient: ISharePointListClient) {}

  public async createLog(item: PagingLogItem): Promise<PagingLogItem> {
    const created = await this.listClient.createItem(ListNames.PagingLogs, mapPagingLogItemToCreatePayload(item));

    return {
      ...item,
      id: String(created.Id ?? item.id)
    };
  }
}
