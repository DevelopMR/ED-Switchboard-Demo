import { AppPopupLaunchKind } from "./AppPopupMessage";

export type SwitchboardCodeAlertCategory = "Medical" | "Security" | "Facility";

export interface SwitchboardCodeAlertOption {
  kind: AppPopupLaunchKind;
  ruleId: string;
  alertType: string;
  category: SwitchboardCodeAlertCategory;
  color: string;
  instructionsLabel?: string;
  personNameLabel?: string;
}

export const switchboardCodeAlertCatalog: SwitchboardCodeAlertOption[] = [
  alert("RapidResponseAdult", "CaMedicalRapidResponseAdult", "Rapid Response Adult", "Medical", "#f07a63"),
  alert("CodeBlueAdult", "CaMedicalCodeBlueAdult", "Code Blue Adult", "Medical", "#1f4e79"),
  alert("StrokeAlert", "CaMedicalStrokeAlert", "Stroke Alert", "Medical", "#4f8a5b"),
  alert("TraumaAlert", "CaMedicalTraumaAlert", "Trauma Alert", "Medical", "#8b1e3f"),
  alert("ConditionHelp", "CaMedicalConditionHelp", "Condition Help", "Medical", "#4f8a5b"),
  alert("WelfareCheck", "CaMedicalWelfareCheck", "Welfare Check", "Medical", "#4f8a5b"),
  alert("RapidResponsePediatric", "CaMedicalRapidResponsePediatric", "Rapid Response Pediatric", "Medical", "#f07a63"),
  alert("CodeBluePediatric", "CaMedicalCodeBluePediatric", "Code Blue Pediatric", "Medical", "#1f4e79"),
  alert("ObstetricEmergency", "CaMedicalObstetricsEmergency", "Obstetrics Emergency", "Medical", "#24576b"),
  alert("OutsideMedicalEmergency", "CaMedicalOutsideMedicalEmergency", "Outside Medical Emergency", "Medical", "#4f8a5b"),
  alert("ConditionSupport", "CaSecurityConditionSupport", "Condition Support", "Security", "#f07a63"),
  alert("EnhancedSecurityMeasures", "CaSecurityEnhancedSecurityMeasures", "Enhanced Security Measures", "Security", "#f07a63"),
  alert("MissingPersonMissingChild", "CaSecurityMissingPersonMissingChild", "Missing Person/Missing Child", "Security", "#d7bd31", "Safe physical/clothing description and direction of travel", "Missing person / child name (demo only)"),
  alert("BombThreat", "CaSecurityBombThreat", "Bomb Threat", "Security", "#d7bd31", "Threat wording, object description, observed location, or direction of travel"),
  alert("ChildAbduction", "CaSecurityChildAbduction", "Child Abduction", "Security", "#d7bd31", "Safe physical/clothing description and direction of travel"),
  alert("InfantAbduction", "CaSecurityInfantAbduction", "Infant Abduction", "Security", "#d7bd31"),
  alert("ArmedSubjectActiveShooter", "CaSecurityArmedSubjectActiveShooter", "Armed Subject/Active Shooter", "Security", "#c62828"),
  alert("FireAlarm", "CaFacilityFireAlarm", "Fire Alarm", "Facility", "#c62828"),
  alert("SevereWeatherEventActivation", "CaFacilitySevereWeatherEventActivation", "Severe Weather Event Activation", "Facility", "#d7bd31"),
  alert("HazardousMaterialsSpillRelease", "CaFacilityHazardousMaterialsSpillRelease", "Hazardous Materials Spill/Release", "Facility", "#d7bd31"),
  alert("Decontamination", "CaFacilityDecontamination", "Decontamination", "Facility", "#d7bd31"),
  alert("EmergencyOperationsPlan", "CaFacilityEmergencyOperationsPlan", "Emergency Operations Plan", "Facility", "#7e57c2"),
  alert("MassCasualtyIncident", "CaFacilityMassCasualtyIncident", "Mass Casualty Incident", "Facility", "#7e57c2")
];

export function getSwitchboardCodeAlert(kind: AppPopupLaunchKind | ""): SwitchboardCodeAlertOption | undefined {
  return switchboardCodeAlertCatalog.find((item) => item.kind === kind);
}

function alert(
  kind: AppPopupLaunchKind,
  ruleId: string,
  alertType: string,
  category: SwitchboardCodeAlertCategory,
  color: string,
  instructionsLabel?: string,
  personNameLabel?: string
): SwitchboardCodeAlertOption {
  return {
    kind,
    ruleId,
    alertType,
    category,
    color,
    instructionsLabel,
    personNameLabel
  };
}
