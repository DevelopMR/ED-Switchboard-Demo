import * as React from "react";
import { SwDailyNoteItem } from "../../models/SwDailyNoteItem";
import { formatClockTime } from "../../utils/dateFormatting";

export interface DailyNotesEntryRowProps {
  note: SwDailyNoteItem;
}

export function DailyNotesEntryRow(props: DailyNotesEntryRowProps): JSX.Element {
  return (
    <div className="swEntryRow">
      <div className="swEntryTime">{formatClockTime(props.note.eventTime)}</div>
      <div className="swEntryBody">
        <div className="swEntryTitle">{props.note.title}</div>
        <div className="swEntrySummary">{props.note.summary}</div>
      </div>
    </div>
  );
}
