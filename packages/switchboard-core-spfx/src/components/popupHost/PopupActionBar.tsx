import * as React from "react";
import { AppPopupAction } from "../../models/AppPopupMessage";

export interface PopupActionBarProps {
  actions: AppPopupAction[];
  isBlocked?: boolean;
  onAction: (actionId: string) => void;
}

export function PopupActionBar(props: PopupActionBarProps): JSX.Element {
  return (
    <div className="swPopupActions">
      {props.actions.map((action) => (
        <button
          className={`swPopupAction swPopupAction-${action.emphasis ?? "secondary"}`}
          disabled={action.disabled || props.isBlocked}
          key={action.id}
          type="button"
          onClick={() => props.onAction(action.id)}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
