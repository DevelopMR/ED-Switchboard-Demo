import { SwDailyNoteCategory } from "./SwDailyNoteCategory";

export interface SwDailyNoteItem {
  id: string;
  logDate: string;
  eventTime: string;
  entryType: SwDailyNoteCategory;
  title: string;
  summary: string;
  details?: string;
  sourceModule?: string;
  sourceItemId?: string;
  searchText?: string;
  locationText?: string;
  operatorName?: string;
}
