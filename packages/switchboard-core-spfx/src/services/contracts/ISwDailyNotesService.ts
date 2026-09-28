import { SwDailyNoteItem } from "../../models/SwDailyNoteItem";
import { SwSearchQuery } from "../../models/SwSearchQuery";

export interface ISwDailyNotesService {
  getNotesByDate(logDate: string): Promise<SwDailyNoteItem[]>;
  searchNotes(query: SwSearchQuery): Promise<SwDailyNoteItem[]>;
  createNote(note: SwDailyNoteItem): Promise<SwDailyNoteItem>;
}
