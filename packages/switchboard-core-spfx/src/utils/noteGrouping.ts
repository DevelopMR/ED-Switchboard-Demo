import { SwDailyNoteCategory } from "../models/SwDailyNoteCategory";
import { SwDailyNoteItem } from "../models/SwDailyNoteItem";

export interface GroupedNotes {
  recentCodes: SwDailyNoteItem[];
  recentAlarms: SwDailyNoteItem[];
  otherNotes: SwDailyNoteItem[];
}

export function groupNotesForForm(notes: SwDailyNoteItem[]): GroupedNotes {
  return {
    recentCodes: notes.filter((note) => note.entryType === SwDailyNoteCategory.CodeAlert),
    recentAlarms: notes.filter((note) => note.entryType === SwDailyNoteCategory.AlarmPanel),
    otherNotes: notes.filter(
      (note) => note.entryType !== SwDailyNoteCategory.CodeAlert && note.entryType !== SwDailyNoteCategory.AlarmPanel
    )
  };
}
