import { RmDemoEntryItem } from "../../models/RmDemoEntryItem";

export interface IRmDemoEntriesService {
  createEntry(item: RmDemoEntryItem): Promise<RmDemoEntryItem>;
  markCopiedBack(receiptCode: string): Promise<void>;
}
