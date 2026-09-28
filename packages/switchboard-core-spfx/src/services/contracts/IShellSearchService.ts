import { SwDailyNoteItem } from "../../models/SwDailyNoteItem";
import { SwSearchQuery } from "../../models/SwSearchQuery";

export interface IShellSearchService {
  search(query: SwSearchQuery): Promise<SwDailyNoteItem[]>;
}
