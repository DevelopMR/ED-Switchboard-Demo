import * as React from "react";
import { getAlertColorClass } from "../../constants/CodeAlertLaunchOptions";
import { AppPopupFormValues, AppPopupMessage } from "../../models/AppPopupMessage";
import { PopupFrame } from "./PopupFrame";
import { PopupGuardDialog } from "./PopupGuardDialog";
import { PopupQueueStrip } from "./PopupQueueStrip";

export interface PopupHostProps {
  messages: AppPopupMessage[];
  onAction: (messageId: string, actionId: string, formValues?: AppPopupMessage["formValues"]) => Promise<void>;
  onResolveOrRoster?: (surgeryDateTimeIso: string) => Promise<import("../../models/OrMedTrakRosterItem").OrMedTrakRosterItem[]>;
}

export function PopupHost(props: PopupHostProps): JSX.Element | null {
  const [activeMessageId, setActiveMessageId] = React.useState<string>(props.messages[0]?.id ?? "");
  const [lockedMessageId, setLockedMessageId] = React.useState<string | undefined>(undefined);
  const [isGuardOpen, setIsGuardOpen] = React.useState<boolean>(false);
  const [draftValuesByMessageId, setDraftValuesByMessageId] = React.useState<Record<string, AppPopupFormValues>>({});
  const onActionRef = React.useRef<PopupHostProps["onAction"]>(props.onAction);
  const previousMessageIdsRef = React.useRef<string[]>(props.messages.map((message) => message.id));
  const hostRef = React.useRef<HTMLDivElement | null>(null);
  const previouslyFocusedElementRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    onActionRef.current = props.onAction;
  }, [props.onAction]);

  React.useEffect(() => {
    if (!props.messages.some((message) => message.id === activeMessageId)) {
      setActiveMessageId(props.messages[0]?.id ?? "");
    }
  }, [activeMessageId, props.messages]);

  React.useEffect(() => {
    if (lockedMessageId && !props.messages.some((message) => message.id === lockedMessageId)) {
      setLockedMessageId(undefined);
    }
  }, [lockedMessageId, props.messages]);

  React.useEffect(() => {
    const activeMessageIds = new Set(props.messages.map((message) => message.id));
    setDraftValuesByMessageId((current) => {
      const nextKeys = Object.keys(current).filter((messageId) => activeMessageIds.has(messageId));
      if (nextKeys.length === Object.keys(current).length) {
        return current;
      }

      const nextValues: Record<string, AppPopupFormValues> = {};
      nextKeys.forEach((messageId) => {
        nextValues[messageId] = current[messageId];
      });

      return nextValues;
    });
  }, [props.messages]);

  React.useEffect(() => {
    const previousIds = new Set(previousMessageIdsRef.current);
    const newCodeAlert = props.messages.find((message) => !previousIds.has(message.id) && message.messageType === "CodeAlert");
    const activeMessage = props.messages.find((message) => message.id === activeMessageId);

    if (newCodeAlert && activeMessage?.messageType !== "CodeAlert") {
      setActiveMessageId(newCodeAlert.id);
    }

    previousMessageIdsRef.current = props.messages.map((message) => message.id);
  }, [activeMessageId, props.messages]);

  const messages = React.useMemo(() => {
    return props.messages.map((message) => {
      const draftValues = draftValuesByMessageId[message.id];
      if (!draftValues || (message.messageType !== "CodeAlert" && message.messageType !== "DuiIntake" && message.messageType !== "PagingLog" && message.messageType !== "OrCallIn" && message.messageType !== "AlarmPanel")) {
        return message;
      }

      return {
        ...message,
        formValues: mergeDraftIntoMessageValues(message.formValues ?? {}, draftValues)
      };
    });
  }, [draftValuesByMessageId, props.messages]);

  const active = messages.find((message) => message.id === activeMessageId) ?? messages[0];
  const isLocked = Boolean(lockedMessageId);
  const activeMessageIdForFocus = active?.id;
  const hasActiveMessages = Boolean(active);

  React.useEffect(() => {
    if (!hasActiveMessages || !hostRef.current) {
      return undefined;
    }

    previouslyFocusedElementRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const restoreOutsideContent = makeOutsideContentInert(hostRef.current);

    return () => {
      restoreOutsideContent();
      const previous = previouslyFocusedElementRef.current;
      if (previous?.isConnected) {
        previous.focus();
      }
      previouslyFocusedElementRef.current = null;
    };
  }, [hasActiveMessages]);

  React.useEffect(() => {
    if (!activeMessageIdForFocus) {
      return undefined;
    }

    const animationFrameId = window.requestAnimationFrame(() => focusInitialPopupControl(hostRef.current ?? undefined));
    return () => window.cancelAnimationFrame(animationFrameId);
  }, [activeMessageIdForFocus]);

  React.useEffect(() => {
    if (!active?.terminalState) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      onActionRef.current(active.id, "__autoClose").catch((error) => {
        console.error("[SwPopupHost] Auto-close failed.", {
          messageId: active.id,
          error
        });
        setIsGuardOpen(true);
      });
    }, 2000);

    return () => window.clearTimeout(timeoutId);
  }, [active?.id, active?.terminalState]);

  if (!active) {
    return null;
  }

  const elapsedLabel = getElapsedLabel(active.elapsedSinceUtc);

  const handleDraftChange = (messageId: string, formValues: AppPopupFormValues): void => {
    setDraftValuesByMessageId((current) => ({
      ...current,
      [messageId]: formValues
    }));
  };

  const handleAction = (actionId: string, formValues?: AppPopupMessage["formValues"]): void => {
    setLockedMessageId(active.id);

    if (formValues && (active.messageType === "CodeAlert" || active.messageType === "DuiIntake" || active.messageType === "PagingLog" || active.messageType === "OrCallIn" || active.messageType === "AlarmPanel")) {
      setDraftValuesByMessageId((current) => ({
        ...current,
        [active.id]: formValues
      }));
    }

    props.onAction(active.id, actionId, formValues).catch((error) => {
      console.error("[SwPopupHost] Popup action failed.", {
        messageId: active.id,
        actionId,
        error
      });
      setIsGuardOpen(true);
    });
  };

  const handleHostKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    if (event.key !== "Tab" || !hostRef.current) {
      return;
    }

    const focusableElements = getFocusableElements(hostRef.current);
    if (focusableElements.length === 0) {
      event.preventDefault();
      hostRef.current.focus();
      return;
    }

    const first = focusableElements[0];
    const last = focusableElements[focusableElements.length - 1];
    const current = document.activeElement;

    if (event.shiftKey && (current === first || current === hostRef.current)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && current === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const alertColorClass = getAlertColorClass(active);

  return (
    <div
      className="swPopupHost"
      role="dialog"
      aria-modal="true"
      aria-labelledby="swPopupActiveTitle"
      onKeyDown={handleHostKeyDown}
      ref={hostRef}
      tabIndex={-1}
    >
      <div className="swPopupBackdrop" aria-hidden="true" />
      <div className={"swPopupSurface " + alertColorClass}>
        <div className="swPopupHostTitle">ED SWITCHBOARD ACTIVE ALERTS</div>
        <div className="swPopupHeader">
          <PopupQueueStrip messages={messages} activeMessageId={active.id} isLocked={isLocked} onSelectMessage={setActiveMessageId} />
          <div className="swPopupHeading">
            <div className="swPopupTitle" id="swPopupActiveTitle">{active.title}</div>
            {active.subtitle ? <div className="swPopupSubtitle">{active.subtitle}</div> : null}
          </div>
          <div className="swPopupMeta" aria-label={elapsedLabel + " elapsed"}>
            <div className="swPopupElapsed"><span className="swPopupElapsedIcon" aria-hidden="true">◷</span>{elapsedLabel}</div>
            <div className="swPopupElapsedLabel">ELAPSED</div>
          </div>
        </div>
        <div className="swPopupHostDivider" />
        <PopupFrame
          message={active}
          elapsedLabel={elapsedLabel}
          onAction={handleAction}
          onDraftChange={handleDraftChange}
          onResolveOrRoster={props.onResolveOrRoster}
        />
      </div>
      <PopupGuardDialog isOpen={isGuardOpen} onCancel={() => setIsGuardOpen(false)} />
    </div>
  );
}

interface OutsideElementState {
  element: HTMLElement;
  ariaHidden?: string;
  inert: boolean;
}

function makeOutsideContentInert(host: HTMLElement): () => void {
  const changedElements: OutsideElementState[] = [];
  let current: HTMLElement = host;

  while (current.parentElement) {
    const parent = current.parentElement;
    Array.from(parent.children).forEach((sibling) => {
      if (sibling === current || !(sibling instanceof HTMLElement)) {
        return;
      }

      const elementWithInert = sibling as HTMLElement & { inert: boolean };
      changedElements.push({
        element: sibling,
        ariaHidden: sibling.getAttribute("aria-hidden") ?? undefined,
        inert: elementWithInert.inert
      });
      sibling.setAttribute("aria-hidden", "true");
      elementWithInert.inert = true;
    });

    current = parent;
    if (parent === document.body) {
      break;
    }
  }

  return () => {
    changedElements.forEach(({ element, ariaHidden, inert }) => {
      const elementWithInert = element as HTMLElement & { inert: boolean };
      elementWithInert.inert = inert;
      if (ariaHidden === undefined) {
        element.removeAttribute("aria-hidden");
      } else {
        element.setAttribute("aria-hidden", ariaHidden);
      }
    });
  };
}

function focusInitialPopupControl(host: HTMLElement | undefined): void {
  if (!host) {
    return;
  }

  const activeStepControl = host.querySelector<HTMLElement>(
    ".swWorkflowStep.isActive button:not(:disabled), .swWorkflowStep.isActive input:not(:disabled), .swWorkflowStep.isActive textarea:not(:disabled), .swWorkflowStep.isActive select:not(:disabled)"
  );
  const firstControl = activeStepControl ?? getFocusableElements(host)[0];
  (firstControl ?? host).focus();
}

function getFocusableElements(host: HTMLElement): HTMLElement[] {
  const selector = [
    "button:not(:disabled)",
    "input:not(:disabled)",
    "textarea:not(:disabled)",
    "select:not(:disabled)",
    "a[href]",
    "[tabindex]:not([tabindex='-1'])"
  ].join(",");

  return Array.from(host.querySelectorAll<HTMLElement>(selector)).filter(
    (element) => element.getClientRects().length > 0 && element.getAttribute("aria-hidden") !== "true"
  );
}

function getElapsedLabel(utcValue: string): string {
  const elapsedMs = Date.now() - new Date(utcValue).getTime();
  const elapsedSeconds = Math.max(0, Math.floor(elapsedMs / 1000));

  if (elapsedSeconds < 60) {
    return `${elapsedSeconds} sec`;
  }

  return `${Math.floor(elapsedSeconds / 60)} min`;
}

function mergeDraftIntoMessageValues(baseValues: AppPopupFormValues, draftValues: AppPopupFormValues): AppPopupFormValues {
  return {
    ...baseValues,
    ...draftValues
  };
}

