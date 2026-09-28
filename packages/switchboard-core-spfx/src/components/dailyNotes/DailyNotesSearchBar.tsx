import * as React from "react";
import { ShellConstants } from "../../constants/ShellConstants";

export interface DailyNotesSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function DailyNotesSearchBar(props: DailyNotesSearchBarProps): JSX.Element {
  return (
    <input
      aria-label="Search daily notes"
      className="swSearchInput"
      placeholder={ShellConstants.SearchPlaceholder}
      type="search"
      value={props.value}
      onChange={(event) => props.onChange(event.currentTarget.value)}
    />
  );
}
