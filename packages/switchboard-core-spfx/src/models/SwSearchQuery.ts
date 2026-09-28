import { SwDailyNoteCategory } from "./SwDailyNoteCategory";

export interface SwSearchQuery {
  selectedDate?: string;
  text?: string;
  categories?: SwDailyNoteCategory[];
}
