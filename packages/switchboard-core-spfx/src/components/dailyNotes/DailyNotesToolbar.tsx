import * as React from "react";
import { DateNavigator } from "../shared/DateNavigator";
import { DailyNotesSearchBar } from "./DailyNotesSearchBar";

export interface DailyNotesToolbarProps {
  selectedDate: string;
  searchText: string;
  onSearchChange: (value: string) => void;
  onPreviousDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
  onPrint: () => void;
  onAddNote: () => void;
}

export function DailyNotesToolbar(props: DailyNotesToolbarProps): JSX.Element {
  return (
    <div className="swDailyNotesToolbar">
      <DateNavigator
        selectedDate={props.selectedDate}
        onPreviousDay={props.onPreviousDay}
        onNextDay={props.onNextDay}
        onToday={props.onToday}
      />
      <DailyNotesSearchBar value={props.searchText} onChange={props.onSearchChange} />
      <button type="button" onClick={props.onPrint}>
        Print
      </button>
      <button type="button" onClick={props.onAddNote}>
        Add Note
      </button>
    </div>
  );
}
