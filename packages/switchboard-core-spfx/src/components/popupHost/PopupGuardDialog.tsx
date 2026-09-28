import * as React from "react";

export interface PopupGuardDialogProps {
  isOpen: boolean;
  onCancel: () => void;
}

export function PopupGuardDialog(props: PopupGuardDialogProps): JSX.Element | null {
  if (!props.isOpen) {
    return null;
  }

  return (
    <div className="swPopupGuardBackdrop" role="dialog" aria-modal="true" aria-label="Alert still active">
      <div className="swPopupGuardFrame">
        <h3>Alert Still Active</h3>
        <p>This alert cannot be dismissed yet. The popup remains the operator's primary task until it reaches an allowed state.</p>
        <div className="swPopupGuardActions">
          <button type="button" onClick={props.onCancel}>
            Return To Alert
          </button>
        </div>
      </div>
    </div>
  );
}
