import * as React from "react";
import { SwDailyNoteItem } from "../../models/SwDailyNoteItem";
import { DailyNotesEntryRow } from "../dailyNotes/DailyNotesEntryRow";
import { FormRuleLines } from "../shared/FormRuleLines";
import { SectionBand } from "../shared/SectionBand";

export interface OtherImportantNotesSectionProps {
  notes: SwDailyNoteItem[];
}

export function OtherImportantNotesSection(props: OtherImportantNotesSectionProps): JSX.Element {
  const blankLineCount = Math.max(0, 8 - props.notes.length);

  return (
    <section className="swFormSection">
      <SectionBand title="Any Other Important Notes To Pass Along" />
      {props.notes.map((note) => (
        <DailyNotesEntryRow key={note.id} note={note} />
      ))}
      {blankLineCount > 0 ? <FormRuleLines lines={blankLineCount} /> : null}
    </section>
  );
}
