import { ListNames } from "../../constants/ListNames";
import { RmDemoEntryItem } from "../../models/RmDemoEntryItem";
import { IRmDemoEntriesService } from "../contracts/IRmDemoEntriesService";
import { ISharePointListClient } from "./ISharePointListClient";
import { mapRmDemoEntryToCreatePayload } from "./RmDemoEntriesMapper";
import { RmFields } from "../../constants/RmFields";

export class RmDemoEntriesService implements IRmDemoEntriesService {
  public constructor(private readonly listClient: ISharePointListClient) {}

  public async createEntry(item: RmDemoEntryItem): Promise<RmDemoEntryItem> {
    const created = await this.listClient.createItem(ListNames.RmDemoEntries, mapRmDemoEntryToCreatePayload(item));
    return {
      ...item,
      id: String(created.Id ?? item.id)
    };
  }

  public async markCopiedBack(receiptCode: string): Promise<void> {
    const normalizedReceiptCode = receiptCode.trim().toUpperCase();
    const escapedReceiptCode = normalizedReceiptCode.replace(/'/g, "''");
    const matches = await this.listClient.getItems(ListNames.RmDemoEntries, {
      select: ["Id", RmFields.ReceiptCode, RmFields.Status],
      filter: `${RmFields.ReceiptCode} eq '${escapedReceiptCode}'`,
      top: 1
    });
    const itemId = matches[0]?.Id;

    if (itemId === undefined) {
      throw new Error(`No simulated Riskmaster entry was found for receipt ${normalizedReceiptCode}.`);
    }

    await this.listClient.updateItem(ListNames.RmDemoEntries, itemId, {
      [RmFields.Status]: "CopiedBack"
    });
  }
}
