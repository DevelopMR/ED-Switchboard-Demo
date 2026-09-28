import { ListNames } from "../../constants/ListNames";
import { PgOverheadPageLogItem } from "../../models/PgOverheadPageLogItem";
import { IPgOverheadPageLogService } from "../contracts/IPgOverheadPageLogService";
import { ISharePointListClient } from "./ISharePointListClient";
import { mapPgOverheadPageLogToCreatePayload } from "./PgOverheadPageLogMapper";
import { PgFields } from "../../constants/PgFields";

export class PgOverheadPageLogService implements IPgOverheadPageLogService {
  private readonly inFlightBySourceItemId = new Map<string, Promise<PgOverheadPageLogItem>>();

  public constructor(private readonly listClient: ISharePointListClient) {}

  public async createPageLog(item: PgOverheadPageLogItem): Promise<PgOverheadPageLogItem> {
    const sourceItemId = item.sourceItemId?.trim();

    if (!sourceItemId) {
      return this.createPageLogOnce(item);
    }

    const inFlight = this.inFlightBySourceItemId.get(sourceItemId);
    if (inFlight) {
      return inFlight;
    }

    const operation = this.createPageLogOnce(item);
    this.inFlightBySourceItemId.set(sourceItemId, operation);

    try {
      return await operation;
    } finally {
      this.inFlightBySourceItemId.delete(sourceItemId);
    }
  }

  private async createPageLogOnce(item: PgOverheadPageLogItem): Promise<PgOverheadPageLogItem> {
    const sourceItemId = item.sourceItemId?.trim();

    if (sourceItemId) {
      const escapedSourceItemId = sourceItemId.replace(/'/g, "''");
      const existing = await this.listClient.getItems(ListNames.PgOverheadPageLog, {
        select: ["Id", PgFields.SourceItemId],
        filter: `${PgFields.SourceItemId} eq '${escapedSourceItemId}'`,
        top: 1
      });

      if (existing[0]?.Id !== undefined) {
        return {
          ...item,
          id: String(existing[0].Id)
        };
      }
    }

    const created = await this.listClient.createItem(ListNames.PgOverheadPageLog, mapPgOverheadPageLogToCreatePayload(item));

    return {
      ...item,
      id: String(created.Id ?? item.id)
    };
  }
}
