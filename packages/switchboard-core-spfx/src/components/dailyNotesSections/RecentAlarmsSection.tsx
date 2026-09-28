import * as React from "react";
import { SwDailyNoteItem } from "../../models/SwDailyNoteItem";
import { DailyNotesEntryRow } from "../dailyNotes/DailyNotesEntryRow";
import { FormRuleLines } from "../shared/FormRuleLines";
import { SectionBand } from "../shared/SectionBand";

export interface RecentAlarmsSectionProps {
  notes: SwDailyNoteItem[];
}

export function RecentAlarmsSection(props: RecentAlarmsSectionProps): JSX.Element {
  const blankLineCount = Math.max(0, 8 - props.notes.length);

  return (
    <section className="swFormSection">
      <SectionBand title="Recent Alarms & Maintenance Calls" subtitle="(What alarm went off + time + who was contacted)" />
      {props.notes.map((note) => (
        <DailyNotesEntryRow key={note.id} note={note} />
      ))}
      {blankLineCount > 0 ? <FormRuleLines lines={blankLineCount} /> : null}
    </section>
  );
}
