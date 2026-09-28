import * as React from "react";
import { SwDrawerCountState } from "../../models/SwDrawerCountState";
import { SwDailyNoteItem } from "../../models/SwDailyNoteItem";
import { groupNotesForForm } from "../../utils/noteGrouping";
import { CreateManualNoteInput } from "../../hooks/useDailyNotesState";
import { DailyNotesEntryDialog } from "./DailyNotesEntryDialog";
import { DailyNotesToolbar } from "./DailyNotesToolbar";
import { DrawerCountedSection } from "../dailyNotesSections/DrawerCountedSection";
import { OtherImportantNotesSection } from "../dailyNotesSections/OtherImportantNotesSection";
import { RecentAlarmsSection } from "../dailyNotesSections/RecentAlarmsSection";
import { RecentCodesSection } from "../dailyNotesSections/RecentCodesSection";

export interface DailyNotesPanelProps {
  selectedDate: string;
  notes: SwDailyNoteItem[];
  drawerCountState: SwDrawerCountState;
  searchText: string;
  onSearchChange: (value: string) => void;
  onPreviousDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
  onPrint: () => void;
  onOpenEntryDialog: () => void;
  onCloseEntryDialog: () => void;
  onCreateManualNote: (input: CreateManualNoteInput) => Promise<void>;
  onToggleDrawerSlot: (slot: number) => void;
  isEntryDialogOpen: boolean;
}

export function DailyNotesPanel(props: DailyNotesPanelProps): JSX.Element {
  const grouped = groupNotesForForm(props.notes);

  return (
    <div className="swDailyNotesPanel">
      <DailyNotesToolbar
        selectedDate={props.selectedDate}
        searchText={props.searchText}
        onSearchChange={props.onSearchChange}
        onPreviousDay={props.onPreviousDay}
        onNextDay={props.onNextDay}
        onToday={props.onToday}
        onPrint={props.onPrint}
        onAddNote={props.onOpenEntryDialog}
      />
      <div className="swDailyNotesCanvas">
        <RecentCodesSection notes={grouped.recentCodes} />
        <RecentAlarmsSection notes={grouped.recentAlarms} />
        <OtherImportantNotesSection notes={grouped.otherNotes} />
        <DrawerCountedSection state={props.drawerCountState} onToggleSlot={props.onToggleDrawerSlot} />
      </div>
      <DailyNotesEntryDialog
        isOpen={props.isEntryDialogOpen}
        onCancel={props.onCloseEntryDialog}
        onSubmit={props.onCreateManualNote}
      />
    </div>
  );
}
