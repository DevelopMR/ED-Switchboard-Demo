import * as React from "react";
import { AppPopupFormValues, AppPopupLaunchRequest, AppPopupMessage } from "../models/AppPopupMessage";
import { IPopupHostService } from "../services/contracts/IPopupHostService";

export interface PopupHostState {
  messages: AppPopupMessage[];
  launchPopup: (request: AppPopupLaunchRequest) => Promise<void>;
  executeAction: (messageId: string, actionId: string, formValues?: AppPopupFormValues) => Promise<void>;
}

export function usePopupHostState(service: IPopupHostService): PopupHostState {
  const [messages, setMessages] = React.useState<AppPopupMessage[]>([]);

  React.useEffect(() => {
    let isDisposed = false;
    let timeoutHandle: number | undefined;
    let currentRefresh: Promise<void> | undefined;
    const pollingIntervalMs = service.getPollingIntervalMs?.();

    const refresh = (): Promise<void> => {
      if (isDisposed) {
        return Promise.resolve();
      }

      if (currentRefresh) {
        return currentRefresh;
      }

      currentRefresh = service
        .getActiveMessages()
        .then((nextMessages) => {
          if (!isDisposed) {
            setMessages(nextMessages);
          }
        })
        .catch((error) => {
          console.error("[SwPopupPolling] Popup host refresh failed.", error);
        })
        .then(() => {
          currentRefresh = undefined;
        });

      return currentRefresh;
    };

    const scheduleNextRefresh = (): void => {
      if (isDisposed || !pollingIntervalMs || pollingIntervalMs <= 0) {
        return;
      }

      timeoutHandle = window.setTimeout(() => {
        runDetached(refresh().then(scheduleNextRefresh));
      }, pollingIntervalMs);
    };

    const refreshWhenVisible = (): void => {
      if (!document.hidden) {
        runDetached(refresh());
      }
    };

    runDetached(refresh().then(scheduleNextRefresh));

    if (pollingIntervalMs && pollingIntervalMs > 0) {
      window.addEventListener("focus", refreshWhenVisible);
      document.addEventListener("visibilitychange", refreshWhenVisible);
    }

    return () => {
      isDisposed = true;
      if (timeoutHandle !== undefined) {
        window.clearTimeout(timeoutHandle);
      }
      window.removeEventListener("focus", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [service]);

  const executeAction = React.useCallback(
    async (messageId: string, actionId: string, formValues?: AppPopupFormValues): Promise<void> => {
      const updatedMessages = await service.executeAction(messageId, actionId, formValues);
      setMessages(updatedMessages);
    },
    [service]
  );

  const launchPopup = React.useCallback(
    async (request: AppPopupLaunchRequest): Promise<void> => {
      const updatedMessages = await service.launchPopup(request);
      setMessages(updatedMessages);
    },
    [service]
  );

  return {
    messages,
    launchPopup,
    executeAction
  };
}

function runDetached(operation: Promise<void>): void {
  operation.catch((error) => {
    console.error("[SwPopupPolling] Detached refresh failed.", error);
  });
}
