import { AppPopupLaunchKind, AppPopupMessage } from "../models/AppPopupMessage";

export interface CodeAlertLaunchOption {
  kind: AppPopupLaunchKind;
  label: string;
  ruleId: string;
  colorClass: string;
}

export const codeAlertLaunchOptions: CodeAlertLaunchOption[] = [
  { kind: "CodeBlueAdult", label: "Code Blue Adult", ruleId: "CaMedicalCodeBlueAdult", colorClass: "codeBlueAdult" },
  { kind: "CodeBluePediatric", label: "Code Blue Pediatric", ruleId: "CaMedicalCodeBluePediatric", colorClass: "codeBluePediatric" },
  { kind: "ConditionHelp", label: "Condition Help", ruleId: "CaMedicalConditionHelp", colorClass: "conditionHelp" },
  { kind: "WelfareCheck", label: "Welfare Check", ruleId: "CaMedicalWelfareCheck", colorClass: "welfareCheck" },
  { kind: "ObstetricEmergency", label: "Obstetrics Emergency", ruleId: "CaMedicalObstetricsEmergency", colorClass: "obstetricEmergency" },
  { kind: "RapidResponseAdult", label: "Rapid Response Adult", ruleId: "CaMedicalRapidResponseAdult", colorClass: "rapidResponseAdult" },
  { kind: "RapidResponsePediatric", label: "Rapid Response Pediatric", ruleId: "CaMedicalRapidResponsePediatric", colorClass: "rapidResponsePediatric" },
  { kind: "StrokeAlert", label: "Stroke Alert", ruleId: "CaMedicalStrokeAlert", colorClass: "strokeAlert" },
  { kind: "OutsideMedicalEmergency", label: "Outside Medical Emergency", ruleId: "CaMedicalOutsideMedicalEmergency", colorClass: "outsideMedicalEmergency" },
  { kind: "EnhancedSecurityMeasures", label: "Enhanced Security Measures", ruleId: "CaSecurityEnhancedSecurityMeasures", colorClass: "enhancedSecurityMeasures" },
  { kind: "ConditionSupport", label: "Condition Support", ruleId: "CaSecurityConditionSupport", colorClass: "conditionSupport" },
  { kind: "ArmedSubjectActiveShooter", label: "Armed Subject/Active Shooter", ruleId: "CaSecurityArmedSubjectActiveShooter", colorClass: "armedSubjectActiveShooter" },
  { kind: "FireAlarm", label: "Fire Alarm", ruleId: "CaFacilityFireAlarm", colorClass: "fireAlarm" },
  { kind: "SevereWeatherEventActivation", label: "Severe Weather Event Activation", ruleId: "CaFacilitySevereWeatherEventActivation", colorClass: "severeWeatherEventActivation" },
  { kind: "TraumaAlert", label: "Trauma Alert", ruleId: "CaMedicalTraumaAlert", colorClass: "traumaAlert" },
  { kind: "BombThreat", label: "Bomb Threat", ruleId: "CaSecurityBombThreat", colorClass: "bombThreat" },
  { kind: "ChildAbduction", label: "Child Abduction", ruleId: "CaSecurityChildAbduction", colorClass: "childAbduction" },
  { kind: "InfantAbduction", label: "Infant Abduction", ruleId: "CaSecurityInfantAbduction", colorClass: "infantAbduction" },
  { kind: "MissingPersonMissingChild", label: "Missing Person/Missing Child", ruleId: "CaSecurityMissingPersonMissingChild", colorClass: "missingPersonMissingChild" },
  { kind: "Decontamination", label: "Decontamination", ruleId: "CaFacilityDecontamination", colorClass: "decontamination" },
  { kind: "HazardousMaterialsSpillRelease", label: "Hazardous Materials Spill/Release", ruleId: "CaFacilityHazardousMaterialsSpillRelease", colorClass: "hazardousMaterialsSpillRelease" },
  { kind: "MassCasualtyIncident", label: "Mass Casualty Incident", ruleId: "CaFacilityMassCasualtyIncident", colorClass: "massCasualtyIncident" },
  { kind: "EmergencyOperationsPlan", label: "Emergency Operations Plan", ruleId: "CaFacilityEmergencyOperationsPlan", colorClass: "emergencyOperationsPlan" }
];

export function getCodeAlertLaunchOption(kind: AppPopupLaunchKind): CodeAlertLaunchOption | undefined {
  return codeAlertLaunchOptions.find((option) => option.kind === kind);
}

export function getCodeAlertLaunchOptionByRuleId(ruleId: string): CodeAlertLaunchOption | undefined {
  return codeAlertLaunchOptions.find((option) => option.ruleId === ruleId);
}

export function getAlertColorClass(message: AppPopupMessage): string {
  if (message.workflowKind === "FireAlarmPanel") {
    return "fireAlarm";
  }

  if (!message.workflowKind) {
    return "";
  }

  return getCodeAlertLaunchOption(message.workflowKind)?.colorClass ?? "";
}

