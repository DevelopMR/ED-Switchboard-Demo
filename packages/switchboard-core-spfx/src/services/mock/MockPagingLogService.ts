import { PagingLogItem } from "../../models/PagingLogItem";
import { IPagingLogService } from "../contracts/IPagingLogService";

export class MockPagingLogService implements IPagingLogService {
  private items: PagingLogItem[] = [];

  public async createLog(item: PagingLogItem): Promise<PagingLogItem> {
    const saved = {
      ...item,
      id: item.id || `PAGING-${Date.now()}`
    };

    this.items = [saved, ...this.items];
    return saved;
  }
}
