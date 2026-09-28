import { SwFields } from "../../constants/SwFields";
import { SwDailyNoteCategory } from "../../models/SwDailyNoteCategory";
import { SwDailyNoteItem } from "../../models/SwDailyNoteItem";
import { SharePointListItemRecord } from "./ISharePointListClient";

export function mapSwDailyNoteItemFromListRecord(record: SharePointListItemRecord): SwDailyNoteItem {
  return {
    id: String(record.Id ?? record[SwFields.SourceItemId] ?? ""),
    logDate: String(record[SwFields.LogDate] ?? ""),
    eventTime: String(record[SwFields.EventTime] ?? ""),
    entryType: mapEntryType(record[SwFields.EntryType]),
    title: String(record[SwFields.Title] ?? record.Title ?? ""),
    summary: String(record[SwFields.Summary] ?? ""),
    details: optionalString(record[SwFields.Details]),
    sourceModule: optionalString(record[SwFields.SourceModule]),
    sourceItemId: optionalString(record[SwFields.SourceItemId]),
    searchText: optionalString(record[SwFields.SearchText]),
    locationText: optionalString(record[SwFields.LocationText]),
    operatorName: optionalString(record[SwFields.OperatorName])
  };
}

export function mapSwDailyNoteItemToCreatePayload(note: SwDailyNoteItem): Record<string, unknown> {
  return {
    Title: note.title,
    [SwFields.LogDate]: note.logDate,
    [SwFields.EventTime]: note.eventTime,
    [SwFields.EntryType]: note.entryType,
    [SwFields.Title]: note.title,
    [SwFields.Summary]: note.summary,
    [SwFields.Details]: note.details ?? "",
    [SwFields.SourceModule]: note.sourceModule ?? "",
    [SwFields.SourceItemId]: note.sourceItemId ?? "",
    [SwFields.SearchText]: note.searchText ?? "",
    [SwFields.LocationText]: note.locationText ?? "",
    [SwFields.CategoryText]: note.entryType,
    [SwFields.OperatorName]: note.operatorName ?? ""
  };
}

function mapEntryType(value: unknown): SwDailyNoteCategory {
  const candidate = String(value ?? "");
  const values = Object.values(SwDailyNoteCategory);
  return values.includes(candidate as SwDailyNoteCategory)
    ? (candidate as SwDailyNoteCategory)
    : SwDailyNoteCategory.GeneralNote;
}

function optionalString(value: unknown): string | undefined {
  const stringValue = String(value ?? "").trim();
  return stringValue.length > 0 ? stringValue : undefined;
}
