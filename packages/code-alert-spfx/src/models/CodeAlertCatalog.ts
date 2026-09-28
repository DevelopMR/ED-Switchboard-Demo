export type CodeAlertCategory = "Medical" | "Security" | "Facility";

export interface CodeAlertOption {
  ruleId: string;
  alertType: string;
  category: CodeAlertCategory;
  color: string;
  supportsEvidence: boolean;
  evidenceLabel?: string;
}

export const codeAlertCatalog: CodeAlertOption[] = [
  alert("CaMedicalRapidResponseAdult", "Rapid Response Adult", "Medical", "#f07a63"),
  alert("CaMedicalCodeBlueAdult", "Code Blue Adult", "Medical", "#1f4e79"),
  alert("CaMedicalStrokeAlert", "Stroke Alert", "Medical", "#4f8a5b"),
  alert("CaMedicalTraumaAlert", "Trauma Alert", "Medical", "#8b1e3f"),
  alert("CaMedicalConditionHelp", "Condition Help", "Medical", "#4f8a5b"),
  alert("CaMedicalWelfareCheck", "Welfare Check", "Medical", "#4f8a5b"),
  alert("CaMedicalRapidResponsePediatric", "Rapid Response Pediatric", "Medical", "#f07a63"),
  alert("CaMedicalCodeBluePediatric", "Code Blue Pediatric", "Medical", "#1f4e79"),
  alert("CaMedicalObstetricsEmergency", "Obstetrics Emergency", "Medical", "#24576b"),
  alert("CaMedicalOutsideMedicalEmergency", "Outside Medical Emergency", "Medical", "#4f8a5b"),
  alert("CaSecurityConditionSupport", "Condition Support", "Security", "#f07a63"),
  alert("CaSecurityEnhancedSecurityMeasures", "Enhanced Security Measures", "Security", "#f07a63"),
  alert("CaSecurityMissingPersonMissingChild", "Missing Person/Missing Child", "Security", "#d7bd31"),
  alert("CaSecurityBombThreat", "Bomb Threat", "Security", "#d7bd31", "Threat wording, object description, observed location, or direction of travel"),
  alert("CaSecurityChildAbduction", "Child Abduction", "Security", "#d7bd31", "Safe physical/clothing description and direction of travel"),
  alert("CaSecurityInfantAbduction", "Infant Abduction", "Security", "#d7bd31"),
  alert("CaSecurityArmedSubjectActiveShooter", "Armed Subject/Active Shooter", "Security", "#c62828"),
  alert("CaFacilityFireAlarm", "Fire Alarm", "Facility", "#c62828"),
  alert("CaFacilitySevereWeatherEventActivation", "Severe Weather Event Activation", "Facility", "#d7bd31"),
  alert("CaFacilityHazardousMaterialsSpillRelease", "Hazardous Materials Spill/Release", "Facility", "#d7bd31"),
  alert("CaFacilityDecontamination", "Decontamination", "Facility", "#d7bd31"),
  alert("CaFacilityEmergencyOperationsPlan", "Emergency Operations Plan", "Facility", "#7e57c2"),
  alert("CaFacilityMassCasualtyIncident", "Mass Casualty Incident", "Facility", "#7e57c2")
];

function alert(
  ruleId: string,
  alertType: string,
  category: CodeAlertCategory,
  color: string,
  evidenceLabel?: string
): CodeAlertOption {
  return {
    ruleId,
    alertType,
    category,
    color,
    supportsEvidence: Boolean(evidenceLabel),
    evidenceLabel
  };
}
