import { PgOverheadPageLogItem } from "../../models/PgOverheadPageLogItem";
import { IPgOverheadPageLogService } from "../contracts/IPgOverheadPageLogService";

export class MockPgOverheadPageLogService implements IPgOverheadPageLogService {
  private items: PgOverheadPageLogItem[] = [];

  public async createPageLog(item: PgOverheadPageLogItem): Promise<PgOverheadPageLogItem> {
    const existing = item.sourceItemId
      ? this.items.find((candidate) => candidate.sourceItemId === item.sourceItemId)
      : undefined;

    if (existing) {
      return existing;
    }

    const saved = {
      ...item,
      id: item.id || `PGL-${Date.now()}`
    };

    this.items = [saved, ...this.items];
    return saved;
  }
}
