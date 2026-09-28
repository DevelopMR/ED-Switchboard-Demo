import * as React from "react";
import { AppPopupFormValues, AppPopupMessage } from "../../models/AppPopupMessage";
import { OrMedTrakRosterItem } from "../../models/OrMedTrakRosterItem";
import { ArmedSubjectActiveShooterWorkflow } from "./ArmedSubjectActiveShooterWorkflow";
import { BombThreatWorkflow } from "./BombThreatWorkflow";
import { ChildAbductionWorkflow } from "./ChildAbductionWorkflow";
import { CodeBlueAdultWorkflow } from "./CodeBlueAdultWorkflow";
import { CodeBluePediatricWorkflow } from "./CodeBluePediatricWorkflow";
import { ConditionHelpWorkflow } from "./ConditionHelpWorkflow";
import { ConditionSupportWorkflow } from "./ConditionSupportWorkflow";
import { DecontaminationWorkflow } from "./DecontaminationWorkflow";
import { EmergencyOperationsPlanWorkflow } from "./EmergencyOperationsPlanWorkflow";
import { EnhancedSecurityMeasuresWorkflow } from "./EnhancedSecurityMeasuresWorkflow";
import { FireAlarmWorkflow } from "./FireAlarmWorkflow";
import { HazardousMaterialsSpillReleaseWorkflow } from "./HazardousMaterialsSpillReleaseWorkflow";
import { InfantAbductionWorkflow } from "./InfantAbductionWorkflow";
import { MassCasualtyIncidentWorkflow } from "./MassCasualtyIncidentWorkflow";
import { MissingPersonMissingChildWorkflow } from "./MissingPersonMissingChildWorkflow";
import { ObstetricEmergencyWorkflow } from "./ObstetricEmergencyWorkflow";
import { OutsideMedicalEmergencyWorkflow } from "./OutsideMedicalEmergencyWorkflow";
import { RapidResponseAdultWorkflow } from "./RapidResponseAdultWorkflow";
import { RapidResponsePediatricWorkflow } from "./RapidResponsePediatricWorkflow";
import { SevereWeatherEventActivationWorkflow } from "./SevereWeatherEventActivationWorkflow";
import { StrokeAlertWorkflow } from "./StrokeAlertWorkflow";
import { TraumaAlertWorkflow } from "./TraumaAlertWorkflow";
import { WelfareCheckWorkflow } from "./WelfareCheckWorkflow";

export interface CodeAlertWorkflowRouterProps {
  message: AppPopupMessage;
  announcementText: string;
  onAction: (actionId: string, formValues?: AppPopupFormValues) => void;
  onDraftChange?: (formValues: AppPopupFormValues) => void;
  onResolveRoster?: (surgeryDateTimeIso: string) => Promise<OrMedTrakRosterItem[]>;
}

export function CodeAlertWorkflowRouter(props: CodeAlertWorkflowRouterProps): JSX.Element {
  switch (props.message.workflowKind) {
    case "CodeBluePediatric":
      return <CodeBluePediatricWorkflow {...props} />;
    case "ConditionHelp":
      return <ConditionHelpWorkflow {...props} />;
    case "WelfareCheck":
      return <WelfareCheckWorkflow {...props} />;
    case "ObstetricEmergency":
      return <ObstetricEmergencyWorkflow {...props} />;
    case "RapidResponseAdult":
      return <RapidResponseAdultWorkflow {...props} />;
    case "RapidResponsePediatric":
      return <RapidResponsePediatricWorkflow {...props} />;
    case "StrokeAlert":
      return <StrokeAlertWorkflow {...props} />;
    case "OutsideMedicalEmergency":
      return <OutsideMedicalEmergencyWorkflow {...props} />;
    case "EnhancedSecurityMeasures":
      return <EnhancedSecurityMeasuresWorkflow {...props} />;
    case "ConditionSupport":
      return <ConditionSupportWorkflow {...props} />;
    case "ArmedSubjectActiveShooter":
      return <ArmedSubjectActiveShooterWorkflow {...props} />;
    case "FireAlarm":
      return <FireAlarmWorkflow {...props} />;
    case "SevereWeatherEventActivation":
      return <SevereWeatherEventActivationWorkflow {...props} />;
    case "TraumaAlert":
      return <TraumaAlertWorkflow {...props} />;
    case "BombThreat":
      return <BombThreatWorkflow {...props} />;
    case "ChildAbduction":
      return <ChildAbductionWorkflow {...props} />;
    case "InfantAbduction":
      return <InfantAbductionWorkflow {...props} />;
    case "MissingPersonMissingChild":
      return <MissingPersonMissingChildWorkflow {...props} />;
    case "Decontamination":
      return <DecontaminationWorkflow {...props} />;
    case "HazardousMaterialsSpillRelease":
      return <HazardousMaterialsSpillReleaseWorkflow {...props} />;
    case "MassCasualtyIncident":
      return <MassCasualtyIncidentWorkflow {...props} />;
    case "EmergencyOperationsPlan":
      return <EmergencyOperationsPlanWorkflow {...props} />;
    case "CodeBlueAdult":
    default:
      return <CodeBlueAdultWorkflow {...props} />;
  }
}