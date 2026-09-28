import { SwDailyNoteCategory } from "../../models/SwDailyNoteCategory";
import { SwDailyNoteItem } from "../../models/SwDailyNoteItem";
import { SwSearchQuery } from "../../models/SwSearchQuery";
import { ISwDailyNotesService } from "../contracts/ISwDailyNotesService";

const seedNotes: SwDailyNoteItem[] = [
  {
    id: "SWN-001",
    logDate: "2026-05-09",
    eventTime: "2026-05-09T08:14:00",
    entryType: SwDailyNoteCategory.CodeAlert,
    title: "Code Blue Adult",
    summary: "ED Room 12 announced at 08:14",
    details: "Operator announced code three times. Security confirmation pending.",
    sourceModule: "CodeAlert",
    searchText: "code blue adult ed room 12 announced 0814"
  },
  {
    id: "SWN-002",
    logDate: "2026-05-09",
    eventTime: "2026-05-09T09:02:00",
    entryType: SwDailyNoteCategory.AlarmPanel,
    title: "Fire Alarm Panel",
    summary: "Fire alarm sounded. Maintenance contacted.",
    details: "Maintenance contacted at 09:04. Awaiting clearance.",
    sourceModule: "AlarmPanel",
    searchText: "fire alarm maintenance contacted 0904"
  },
  {
    id: "SWN-003",
    logDate: "2026-05-09",
    eventTime: "2026-05-09T10:25:00",
    entryType: SwDailyNoteCategory.GeneralNote,
    title: "Shift note",
    summary: "Elevator phone intermittent. Watch for repeated calls.",
    details: "Issue reported by registration desk.",
    sourceModule: "Manual",
    searchText: "shift note elevator phone intermittent registration"
  }
];

let mockNotesStore: SwDailyNoteItem[] = [...seedNotes];

export class MockSwDailyNotesService implements ISwDailyNotesService {
  public async getNotesByDate(logDate: string): Promise<SwDailyNoteItem[]> {
    return mockNotesStore.filter((note) => note.logDate === logDate);
  }

  public async searchNotes(query: SwSearchQuery): Promise<SwDailyNoteItem[]> {
    return mockNotesStore.filter((note) => {
      const dateMatch = !query.selectedDate || note.logDate === query.selectedDate;
      const categoryMatch =
        !query.categories || query.categories.length === 0 || query.categories.includes(note.entryType);
      const text = (query.text ?? "").trim().toLowerCase();
      const textMatch =
        text.length === 0 ||
        note.title.toLowerCase().includes(text) ||
        note.summary.toLowerCase().includes(text) ||
        (note.details ?? "").toLowerCase().includes(text) ||
        (note.searchText ?? "").toLowerCase().includes(text);

      return dateMatch && categoryMatch && textMatch;
    });
  }

  public async createNote(note: SwDailyNoteItem): Promise<SwDailyNoteItem> {
    mockNotesStore = [note, ...mockNotesStore];
    return note;
  }
}
