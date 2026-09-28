export type AppPopupPriority = "Critical" | "High" | "Normal";

export interface AppPopupAction {
  id: string;
  label: string;
  emphasis?: "primary" | "secondary" | "danger";
  disabled?: boolean;
}

export type AppPopupFormFieldType = "Text" | "MultilineText" | "Boolean";

export interface AppPopupFormField {
  name: string;
  label: string;
  type: AppPopupFormFieldType;
  required?: boolean;
}

export type AppPopupFormValues = Record<string, string | boolean | undefined>;

export type AppPopupLaunchKind =
  | "CodeBlueAdult"
  | "CodeBluePediatric"
  | "ConditionHelp"
  | "WelfareCheck"
  | "ObstetricEmergency"
  | "RapidResponseAdult"
  | "RapidResponsePediatric"
  | "StrokeAlert"
  | "OutsideMedicalEmergency"
  | "EnhancedSecurityMeasures"
  | "ConditionSupport"
  | "ArmedSubjectActiveShooter"
  | "FireAlarm"
  | "SevereWeatherEventActivation"
  | "TraumaAlert"
  | "BombThreat"
  | "ChildAbduction"
  | "InfantAbduction"
  | "MissingPersonMissingChild"
  | "Decontamination"
  | "HazardousMaterialsSpillRelease"
  | "MassCasualtyIncident"
  | "EmergencyOperationsPlan"
  | "OrCallIn"
  | "DuiIntake"
  | "PagingLog"
  | "FireAlarmPanel";

export interface AppPopupLaunchRequest {
  kind: AppPopupLaunchKind;
  formValues?: AppPopupFormValues;
}

export interface AppPopupMessage {
  id: string;
  messageType: string;
  workflowKind?: AppPopupLaunchKind;
  priority: AppPopupPriority;
  title: string;
  subtitle?: string;
  elapsedSinceUtc: string;
  bodyText: string;
  announcementTemplate?: string;
  allClearTemplate?: string;
  procedureHtml?: string;
  formFields?: AppPopupFormField[];
  formValues?: AppPopupFormValues;
  canDismiss: boolean;
  terminalState?: string;
  actions: AppPopupAction[];
}
