import { SwDailyNoteItem } from "../../models/SwDailyNoteItem";
import { SwSearchQuery } from "../../models/SwSearchQuery";
import { ListNames } from "../../constants/ListNames";
import { SwFields } from "../../constants/SwFields";
import { ISwDailyNotesService } from "../contracts/ISwDailyNotesService";
import { ISharePointListClient } from "./ISharePointListClient";
import { mapSwDailyNoteItemFromListRecord, mapSwDailyNoteItemToCreatePayload } from "./SwDailyNotesMapper";

export class SwDailyNotesService implements ISwDailyNotesService {
  public constructor(private readonly listClient: ISharePointListClient) {}

  public async getNotesByDate(logDate: string): Promise<SwDailyNoteItem[]> {
    const records = await this.listClient.getItems(ListNames.SwDailyNotes, {
      select: [
        "Id",
        "Title",
        SwFields.LogDate,
        SwFields.EventTime,
        SwFields.EntryType,
        SwFields.Title,
        SwFields.Summary,
        SwFields.Details,
        SwFields.SourceModule,
        SwFields.SourceItemId,
        SwFields.SearchText,
        SwFields.LocationText,
        SwFields.OperatorName
      ],
      filter: `${SwFields.LogDate} eq '${logDate}'`,
      orderBy: `${SwFields.EventTime} desc`,
      top: 200
    });

    return records.map(mapSwDailyNoteItemFromListRecord);
  }

  public async searchNotes(query: SwSearchQuery): Promise<SwDailyNoteItem[]> {
    const filterParts: string[] = [];

    if (query.selectedDate) {
      filterParts.push(`${SwFields.LogDate} eq '${query.selectedDate}'`);
    }

    if (query.categories && query.categories.length > 0) {
      const categoryFilter = query.categories.map((category) => `${SwFields.EntryType} eq '${category}'`).join(" or ");
      filterParts.push(`(${categoryFilter})`);
    }

    const records = await this.listClient.getItems(ListNames.SwDailyNotes, {
      select: [
        "Id",
        "Title",
        SwFields.LogDate,
        SwFields.EventTime,
        SwFields.EntryType,
        SwFields.Title,
        SwFields.Summary,
        SwFields.Details,
        SwFields.SourceModule,
        SwFields.SourceItemId,
        SwFields.SearchText,
        SwFields.LocationText,
        SwFields.OperatorName
      ],
      filter: filterParts.length > 0 ? filterParts.join(" and ") : undefined,
      orderBy: `${SwFields.EventTime} desc`,
      top: 200
    });

    const mapped = records.map(mapSwDailyNoteItemFromListRecord);
    const searchText = (query.text ?? "").trim().toLowerCase();

    if (!searchText) {
      return mapped;
    }

    return mapped.filter((note) => {
      return (
        note.title.toLowerCase().includes(searchText) ||
        note.summary.toLowerCase().includes(searchText) ||
        (note.details ?? "").toLowerCase().includes(searchText) ||
        (note.searchText ?? "").toLowerCase().includes(searchText) ||
        (note.locationText ?? "").toLowerCase().includes(searchText)
      );
    });
  }

  public async createNote(note: SwDailyNoteItem): Promise<SwDailyNoteItem> {
    const created = await this.listClient.createItem(ListNames.SwDailyNotes, mapSwDailyNoteItemToCreatePayload(note));
    return {
      ...note,
      id: String(created.Id ?? note.id)
    };
  }
}
