import * as React from "react";
import { ShellConstants } from "../../constants/ShellConstants";
import { formatDisplayDate } from "../../utils/dateFormatting";

export interface ShellHeaderProps {
  selectedDate: string;
  currentTimeLabel: string;
}

export function ShellHeader(props: ShellHeaderProps): JSX.Element {
  return (
    <div className="swShellHeader">
      <div className="swShellHeaderTitle">{ShellConstants.Title}</div>
      <div className="swShellHeaderMeta">
        <span>{formatDisplayDate(props.selectedDate)}</span>
        <span>{props.currentTimeLabel}</span>
      </div>
    </div>
  );
}
