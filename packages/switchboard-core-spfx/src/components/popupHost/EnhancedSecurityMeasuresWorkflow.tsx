import * as React from "react";
import { AppPopupFormValues, AppPopupMessage } from "../../models/AppPopupMessage";
import { CodeAlertWorkflowShell } from "./CodeAlertWorkflowShell";

export interface EnhancedSecurityMeasuresWorkflowProps {
  message: AppPopupMessage;
  announcementText: string;
  onAction: (actionId: string, formValues?: AppPopupFormValues) => void;
}

export function EnhancedSecurityMeasuresWorkflow(props: EnhancedSecurityMeasuresWorkflowProps): JSX.Element {
  return <CodeAlertWorkflowShell message={props.message} announcementText={props.announcementText} onAction={props.onAction} />;
}
