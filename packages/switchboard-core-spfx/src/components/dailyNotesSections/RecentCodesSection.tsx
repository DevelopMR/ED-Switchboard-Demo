import * as React from "react";
import { SwDailyNoteItem } from "../../models/SwDailyNoteItem";
import { DailyNotesEntryRow } from "../dailyNotes/DailyNotesEntryRow";
import { FormRuleLines } from "../shared/FormRuleLines";
import { SectionBand } from "../shared/SectionBand";

export interface RecentCodesSectionProps {
  notes: SwDailyNoteItem[];
}

export function RecentCodesSection(props: RecentCodesSectionProps): JSX.Element {
  const blankLineCount = Math.max(0, 6 - props.notes.length);

  return (
    <section className="swFormSection">
      <SectionBand title="Recent Codes:" subtitle="(Code+Location+Time)" />
      {props.notes.map((note) => (
        <DailyNotesEntryRow key={note.id} note={note} />
      ))}
      {blankLineCount > 0 ? <FormRuleLines lines={blankLineCount} /> : null}
    </section>
  );
}
