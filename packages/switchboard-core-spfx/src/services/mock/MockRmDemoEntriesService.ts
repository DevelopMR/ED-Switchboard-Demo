import { RmDemoEntryItem } from "../../models/RmDemoEntryItem";
import { IRmDemoEntriesService } from "../contracts/IRmDemoEntriesService";

export class MockRmDemoEntriesService implements IRmDemoEntriesService {
  private items: RmDemoEntryItem[] = [];

  public async createEntry(item: RmDemoEntryItem): Promise<RmDemoEntryItem> {
    const created = {
      ...item,
      id: item.id || `RM-${this.items.length + 1}`
    };

    this.items = [...this.items, created];
    return created;
  }

  public async markCopiedBack(receiptCode: string): Promise<void> {
    const normalizedReceiptCode = receiptCode.trim().toUpperCase();
    const itemIndex = this.items.findIndex((item) => item.receiptCode.toUpperCase() === normalizedReceiptCode);

    if (itemIndex === -1) {
      return;
    }

    this.items = this.items.map((item, index) =>
      index === itemIndex
        ? {
            ...item,
            status: "CopiedBack"
          }
        : item
    );
  }
}
