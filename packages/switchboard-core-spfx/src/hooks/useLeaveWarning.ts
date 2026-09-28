import { useEffect } from "react";
import { ShellConstants } from "../constants/ShellConstants";

export function useLeaveWarning(isActive: boolean): void {
  useEffect(() => {
    if (!isActive) {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent): string => {
      event.preventDefault();
      event.returnValue = ShellConstants.PopupWarningText;
      return ShellConstants.PopupWarningText;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isActive]);
}
