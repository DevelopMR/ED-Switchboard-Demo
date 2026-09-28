import * as React from "react";

export interface DateNavigatorProps {
  selectedDate: string;
  onPreviousDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
}

export function DateNavigator(props: DateNavigatorProps): JSX.Element {
  return (
    <div className="swDateNavigator">
      <button type="button" onClick={props.onPreviousDay} aria-label="Previous day">
        Prev
      </button>
      <span className="swDateValue">{props.selectedDate}</span>
      <button type="button" onClick={props.onNextDay} aria-label="Next day">
        Next
      </button>
      <button type="button" onClick={props.onToday}>
        Today
      </button>
    </div>
  );
}
