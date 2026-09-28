import * as React from "react";
import { AppPopupMessage } from "../../models/AppPopupMessage";
import { getAlertColorClass } from "../../constants/CodeAlertLaunchOptions";

export interface PopupQueueStripProps {
  messages: AppPopupMessage[];
  activeMessageId: string;
  isLocked: boolean;
  onSelectMessage: (messageId: string) => void;
}

export function PopupQueueStrip(props: PopupQueueStripProps): JSX.Element {
  return (
    <div className="swPopupQueueStrip">
      {props.messages.map((message) => {
        const isActive = message.id === props.activeMessageId;
        const isDisabled = props.isLocked && !isActive;
        const alertColorClass = getAlertColorClass(message);

        return (
          <button
            className={`swPopupQueueItem ${alertColorClass}${isActive ? " isActive" : ""}${isDisabled ? " isDisabled" : ""}`}
            disabled={isDisabled}
            key={message.id}
            type="button"
            onClick={() => props.onSelectMessage(message.id)}
          >
            <span className="swPopupQueueIcon" aria-hidden="true">{message.messageType === "CodeAlert" ? "!" : "•"}</span>
            <span className="swPopupQueueText">
              <span className="swPopupQueueTitle">{message.title}</span>
              {message.subtitle ? <span className="swPopupQueueSubtitle">{message.subtitle}</span> : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}
