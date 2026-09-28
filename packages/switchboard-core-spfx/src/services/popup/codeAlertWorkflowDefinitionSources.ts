import { CodeAlertWorkflowDefinitionSource } from "../../models/CodeAlertWorkflowDefinitionSource";

const standardMedicalActionSchema =
  '{"actions":["Acknowledge","AnnouncementCompleted","EpicBedPlanningConfirmedSent","EpicRespiratoryConfirmedSent","DailyNoteLogged"]}';
const locationFormSchema = '{"fields":[{"name":"CaLocation","type":"Text","required":true}]}';

export const codeAlertWorkflowDefinitionSources: CodeAlertWorkflowDefinitionSource[] = [
  medicalRule({
    title: "Code Blue Adult",
    ruleId: "CaMedicalCodeBlueAdult",
    sortOrder: 10,
    alertType: "Code Blue Adult",
    legacyCode: "Condition A",
    color: "#1F4E79",
    procedureHtml:
      "<section><h2>Code Blue Adult</h2><p>Read the generated announcement three times. Send required internal demo confirmations and document the code on the overhead page log.</p><p><strong>Demo contacts:</strong> [AOD], [Respiratory].</p></section>",
    sourceReference: "Untitled3.png"
  }),
  medicalRule({
    title: "Code Blue Pediatric",
    ruleId: "CaMedicalCodeBluePediatric",
    sortOrder: 20,
    alertType: "Code Blue Pediatric",
    legacyCode: "Condition A PALS",
    color: "#1F4E79",
    procedureHtml:
      "<section><h2>Code Blue Pediatric</h2><p>Read the generated announcement three times. Send required internal demo confirmations and document the code on the overhead page log.</p><p><strong>Demo contacts:</strong> [AOD], [Respiratory].</p></section>",
    sourceReference: "Untitled3.png"
  }),
  medicalRule({
    title: "Condition Help",
    ruleId: "CaMedicalConditionHelp",
    sortOrder: 30,
    alertType: "Condition Help",
    legacyCode: "Condition H",
    color: "#4F8A5B",
    procedureHtml:
      "<section><h2>Condition Help</h2><p>Read the generated announcement three times. Follow the approved decision guidance, confirm internal demo notifications, and document the code on the overhead page log.</p><p><strong>Demo contacts:</strong> [AOD].</p></section>",
    sourceReference: "Untitled4.png",
    requiresEpicRespiratoryConfirm: false,
    actionSchemaJson:
      '{"actions":["Acknowledge","AnnouncementCompleted","EpicBedPlanningConfirmedSent","DailyNoteLogged"]}'
  }),
  medicalRule({
    title: "Welfare Check",
    ruleId: "CaMedicalWelfareCheck",
    sortOrder: 40,
    alertType: "Welfare Check",
    legacyCode: "Code Green",
    color: "#4F8A5B",
    procedureHtml:
      "<section><h2>Welfare Check</h2><p>Use the approved welfare-check decision tree. For critical clinical concerns, activate the Welfare Check path. For routine concerns, document the concern and notify the unit charge nurse in the demo workflow.</p><p><strong>Demo contacts:</strong> [AOD], [Security], [UnitChargeNurse].</p></section>",
    sourceReference: "Untitled3.png; Untitled5.png",
    requiresEpicRespiratoryConfirm: false,
    requiresSecurityConfirm: true,
    actionSchemaJson:
      '{"actions":["Acknowledge","DecisionPathLogged","AnnouncementCompleted","EpicBedPlanningConfirmedSent","SecurityConfirmedNotified","RiskmasterDemoCompleted","DailyNoteLogged"]}',
    formSchemaJson:
      '{"fields":[{"name":"CaLocation","type":"Text","required":true},{"name":"CaConcernType","type":"Choice","choices":["CriticalClinicalConcern","RoutineConcern"],"required":true},{"name":"CaDecisionPathNotes","type":"MultilineText","required":true}]}',
    redactionNote: "Real contact names and phone numbers are replaced with placeholders. Riskmaster is mock/demo only."
  }),
  medicalRule({
    title: "Obstetrics Emergency",
    ruleId: "CaMedicalObstetricsEmergency",
    sortOrder: 50,
    alertType: "Obstetrics Emergency",
    legacyCode: "Condition O",
    color: "#24576B",
    procedureHtml:
      "<section><h2>Obstetrics Emergency</h2><p>Read the generated announcement three times: Medical Alert + Obstetric Emergency + Department and Room Number.</p><p>Load synthetic MedTrak contacts, then notify the ordered contact list. If the birthing center says no Peds, do not include the Pediatric Hospitalist.</p><p><strong>Demo contacts:</strong> Obstetrician, Pediatric Hospitalist, Anesthesiologist, Anesthesia Nurse, AOD, Laboratory.</p></section>",
    sourceReference: "Untitled6.png",
    requiresEpicBedPlanningConfirm: false,
    requiresEpicRespiratoryConfirm: false,
    actionSchemaJson:
      '{"actions":["Acknowledge","AnnouncementCompleted","ContactObstetrician","ContactPediatricHospitalist","ContactAnesthesiologist","ContactAnesthesiaNurse","ContactAod","ContactLaboratory","ContactChecklistLogged","DailyNoteLogged"]}',
    formSchemaJson:
      '{"fields":[{"name":"CaLocation","type":"Text","required":true},{"name":"CaNoPediatricsRequested","type":"Boolean","required":false}]}'
  }),
  medicalRule({
    title: "Rapid Response Adult",
    ruleId: "CaMedicalRapidResponseAdult",
    sortOrder: 60,
    alertType: "Rapid Response Adult",
    legacyCode: "Condition C",
    color: "#F07A63",
    procedureHtml:
      "<section><h2>Rapid Response Adult</h2><p>Read the generated announcement three times. Send required internal demo confirmations and document the code on the overhead page log.</p><p><strong>Demo contacts:</strong> [AOD], [Respiratory].</p></section>",
    sourceReference: "Untitled4.png"
  }),
  medicalRule({
    title: "Rapid Response Pediatric",
    ruleId: "CaMedicalRapidResponsePediatric",
    sortOrder: 70,
    alertType: "Rapid Response Pediatric",
    legacyCode: "Condition C",
    color: "#F07A63",
    procedureHtml:
      "<section><h2>Rapid Response Pediatric</h2><p>Read the generated announcement three times. Send required internal demo confirmations and document the code on the overhead page log.</p><p><strong>Demo contacts:</strong> [AOD], [Respiratory].</p></section>",
    sourceReference: "Untitled4.png"
  }),
  medicalRule({
    title: "Stroke Alert",
    ruleId: "CaMedicalStrokeAlert",
    sortOrder: 80,
    alertType: "Stroke Alert",
    legacyCode: "Code Stroke",
    color: "#4F8A5B",
    procedureHtml:
      "<section><h2>Stroke Alert</h2><p>Read the generated announcement three times. Send required internal demo confirmations and document the code on the overhead page log.</p><p><strong>Demo contacts:</strong> [AOD], [Respiratory].</p></section>",
    sourceReference: "Untitled7.png"
  }),
  medicalRule({
    title: "Outside Medical Emergency",
    ruleId: "CaMedicalOutsideMedicalEmergency",
    sortOrder: 90,
    alertType: "Outside Medical Emergency",
    legacyCode: "",
    color: "#4F8A5B",
    procedureHtml:
      "<section><h2>Outside Medical Emergency</h2><p>Read the generated announcement three times. Send the approved placeholder planning notification, notify Security, and document the code on the overhead page log.</p><p><strong>Demo contacts:</strong> [AOD], Security 123-456-FAKE.</p></section>",
    sourceReference: "Untitled7.png",
    requiresEpicRespiratoryConfirm: false,
    requiresSecurityConfirm: true,
    actionSchemaJson:
      '{"actions":["Acknowledge","AnnouncementCompleted","EpicBedPlanningConfirmedSent","SecurityConfirmedNotified","DailyNoteLogged"]}'
  }),
  securityRule({
    title: "Enhanced Security Measures",
    ruleId: "CaSecurityEnhancedSecurityMeasures",
    sortOrder: 160,
    alertType: "Enhanced Security Measures",
    legacyCode: "Code 222",
    color: "#F07A63",
    procedureHtml:
      "<section><h2>Enhanced Security Measures</h2><p>Announce the generated security alert over the approved placeholder path. If there is no response, notify Security. Document on the overhead page log.</p><p><strong>Demo contacts:</strong> [Security].</p></section>",
    sourceReference: "Untitled8.png",
    actionSchemaJson:
      '{"actions":["Acknowledge","AnnouncementCompleted","SecurityConfirmedNotified","DailyNoteLogged"]}'
  }),
  securityRule({
    title: "Condition Support",
    ruleId: "CaSecurityConditionSupport",
    sortOrder: 170,
    alertType: "Condition Support",
    legacyCode: "Condition Support",
    color: "#F07A63",
    procedureHtml:
      "<section><h2>Condition Support</h2><p>Read the generated announcement three times. Send the approved placeholder planning notification, notify Security, and document the code on the overhead page log.</p><p><strong>Demo contacts:</strong> [AOD], [Security].</p></section>",
    sourceReference: "Untitled9.png",
    actionSchemaJson:
      '{"actions":["Acknowledge","AnnouncementCompleted","EpicBedPlanningConfirmedSent","SecurityConfirmedNotified","DailyNoteLogged"]}'
  }),
  securityRule({
    title: "Armed Subject/Active Shooter",
    ruleId: "CaSecurityArmedSubjectActiveShooter",
    sortOrder: 180,
    alertType: "Armed Subject/Active Shooter",
    legacyCode: "Bronze",
    color: "#5A2E2A",
    announcementTemplate: "Security Alert + Armed Subject/Active Shooter + {Location}",
    procedureHtml:
      "<section><h2>Armed Subject/Active Shooter</h2><p>Announce the generated alert. Safety guidance is shown before the all-clear task for operator awareness but is not a separate loggable task. Announce all-clear only when instructed.</p></section>",
    sourceReference: "Untitled7.png",
    actionSchemaJson:
      '{"actions":["Acknowledge","AnnouncementCompleted","AllClearAnnounced","DailyNoteLogged"]}'
  }),
  {
    Title: "Fire Alarm",
    CaRuleId: "CaFacilityFireAlarm",
    CaIsActive: true,
    CaSortOrder: 230,
    CaCategory: "Facility",
    CaPlainLanguagePrefix: "Facility Alert",
    CaAlertType: "Fire Alarm",
    CaLegacyCode: "Code Red",
    CaDisplayLabel: "Fire Alarm",
    CaShortLabel: "Fire Alarm",
    CaDisplayColor: "#D94A4A",
    CaAnnouncementTemplate: "Facility Alert + Fire Alarm + {Location} + {Instructions}",
    CaAllClearTemplate: "Facility Alert + Fire Alarm + {Location} + All Clear",
    CaCancelTemplate: "Cancel + Fire Alarm + {Location}",
    CaProcedureHtml:
      "<section><h2>Fire Alarm</h2><p>Read the generated announcement three times. Confirm demo 911, security, and maintenance notifications. When notified, use the all-clear phrase.</p><p><strong>Demo contacts:</strong> [911], [Security], [Maintenance], [AdministratorOnCall], [President].</p></section>",
    CaRequiresLocation: true,
    CaAllowsInstructions: true,
    CaRequiresAcknowledgement: true,
    CaRequiresEpicBedPlanningConfirm: false,
    CaRequiresEpicRespiratoryConfirm: false,
    CaRequiresSecurityConfirm: true,
    CaRequiresMaintenanceConfirm: true,
    CaRequires911Confirm: true,
    CaAllowsCancel: true,
    CaAllowsAllClear: true,
    CaAllowsNotCleared: true,
    CaNotClearedDelayMinutes: 10,
    CaActionSchemaJson:
      '{"actions":["Acknowledge","AnnouncementCompleted","Call911Confirmed","SecurityConfirmedNotified","MaintenanceConfirmedNotified","FireAlarmConfirmationLogged","FireAdministratorNotified","FirePresidentNotified","FireCancel911Confirmed","AllClearAnnounced","DailyNoteLogged"]}',
    CaFormSchemaJson:
      '{"fields":[{"name":"CaLocation","type":"Text","required":true},{"name":"CaInstructions","type":"MultilineText","required":false},{"name":"CaFireConfirmed","type":"Boolean","required":false},{"name":"CaFalseAlarm","type":"Boolean","required":false}]}',
    CaSourceReference: "Untitled11.png; Untitled15.png",
    CaRedactionNote: "Real contact names and phone numbers are replaced with placeholders."
  },
  facilityRule({
    title: "Severe Weather Event Activation",
    ruleId: "CaFacilitySevereWeatherEventActivation",
    sortOrder: 240,
    alertType: "Severe Weather Event Activation",
    legacyCode: "Code Grey",
    color: "#8A8A80",
    procedureHtml:
      "<section><h2>Severe Weather Event Activation</h2><p>Read the generated announcement. Remain in your area and follow approved placeholder instructions.</p></section>",
    sourceReference: "Untitled11.png",
    actionSchemaJson:
      '{"actions":["Acknowledge","AnnouncementCompleted","DailyNoteLogged"]}'
  }),
  medicalRule({
    title: "Trauma Alert",
    ruleId: "CaMedicalTraumaAlert",
    sortOrder: 100,
    alertType: "Trauma Alert",
    legacyCode: "Code Triage Standby",
    color: "#F07A63",
    procedureHtml:
      "<section><h2>Trauma Alert</h2><p><strong>*DEMO COPY*</strong> Read the generated announcement three times. Use placeholder internal notifications and document the alert through the demo Riskmaster and overhead page path.</p></section>",
    sourceReference: "Demo copy pending approved source",
    actionSchemaJson:
      '{"actions":["Acknowledge","DemoCopyCaveatAcknowledged","AnnouncementCompleted","EpicBedPlanningConfirmedSent","EpicRespiratoryConfirmedSent","RiskmasterDemoCompleted","DailyNoteLogged"]}'
  }),
  securityRule({
    title: "Bomb Threat",
    ruleId: "CaSecurityBombThreat",
    sortOrder: 120,
    alertType: "Bomb Threat",
    legacyCode: "Code Purple",
    color: "#5B3B7A",
    procedureHtml:
      "<section><h2>Bomb Threat</h2><p>Ask the caller for specific information, record exact words, announce the approved script, and notify the listed demo contacts.</p></section>",
    sourceReference: "Untitled10.png",
    actionSchemaJson:
      '{"actions":["Acknowledge","BombThreatIntakeAnnouncementCompleted","BombPresidentDesigneeNotified","BombAdministratorNotified","BombAodNotified","Call911Confirmed","SecurityConfirmedNotified","MaintenanceConfirmedNotified","BombPatientAccessManagerNotified","BombMaterialsManagerNotified","BombMarketingNotified","RiskmasterDemoCompleted","DailyNoteLogged"]}'
  }),
  securityRule({
    title: "Child Abduction",
    ruleId: "CaSecurityChildAbduction",
    sortOrder: 130,
    alertType: "Child Abduction",
    legacyCode: "Condition I",
    color: "#D85B86",
    procedureHtml:
      "<section><h2>Child Abduction</h2><p>Read the generated announcement three times. Confirm demo 911, Bed Planning, Security, and watch-exits steps.</p></section>",
    sourceReference: "Untitled9.png",
    actionSchemaJson:
      '{"actions":["Acknowledge","AnnouncementCompleted","Call911Confirmed","EpicBedPlanningConfirmedSent","SecurityConfirmedNotified","WatchExitsConfirmed","RiskmasterDemoCompleted","DailyNoteLogged"]}'
  }),
  securityRule({
    title: "Infant Abduction",
    ruleId: "CaSecurityInfantAbduction",
    sortOrder: 140,
    alertType: "Infant Abduction",
    legacyCode: "Condition I",
    color: "#D85B86",
    procedureHtml:
      "<section><h2>Infant Abduction</h2><p>Read the generated announcement three times. Confirm demo 911, Bed Planning, Security, and watch-exits steps.</p></section>",
    sourceReference: "Untitled9.png",
    actionSchemaJson:
      '{"actions":["Acknowledge","AnnouncementCompleted","Call911Confirmed","EpicBedPlanningConfirmedSent","SecurityConfirmedNotified","WatchExitsConfirmed","RiskmasterDemoCompleted","DailyNoteLogged"]}'
  }),
  securityRule({
    title: "Missing Person/Missing Child",
    ruleId: "CaSecurityMissingPersonMissingChild",
    sortOrder: 150,
    alertType: "Missing Person/Missing Child",
    legacyCode: "Condition L",
    color: "#4F8A5B",
    procedureHtml:
      "<section><h2>Missing Person/Missing Child</h2><p>Announce the alert and patient description if provided, page the patient by name, and follow the patient-response or all-clear path.</p></section>",
    sourceReference: "Untitled8.png",
    actionSchemaJson:
      '{"actions":["Acknowledge","AnnouncementCompleted","MissingPatientPageCompleted","MissingPatientDecisionLogged","MissingSecurityContacted","AllClearAnnounced","RiskmasterDemoCompleted","DailyNoteLogged"]}'
  }),
  facilityRule({
    title: "Decontamination",
    ruleId: "CaFacilityDecontamination",
    sortOrder: 210,
    alertType: "Decontamination",
    legacyCode: "Code White/Code Yellow",
    color: "#D6B700",
    procedureHtml:
      "<section><h2>Decontamination</h2><p>Announce the alert, direct people away from the location, notify the listed demo contacts, verify command-center instructions, and complete demo Riskmaster logging.</p></section>",
    sourceReference: "Untitled19.png",
    actionSchemaJson:
      '{"actions":["Acknowledge","AnnouncementCompleted","DeconHazardGuidanceAcknowledged","DeconErPhysicianNotified","DeconAodNotified","DeconAdministratorNotified","DeconMedicalStaffLeadershipNotified","DeconDepartmentManagersNotified","DeconCommandCenterContacted","DeconMediaRelationsNotified","DeconRenoNotified","RiskmasterDemoCompleted","DailyNoteLogged"]}'
  }),
  facilityRule({
    title: "Hazardous Materials Spill/Release",
    ruleId: "CaFacilityHazardousMaterialsSpillRelease",
    sortOrder: 212,
    alertType: "Hazardous Materials Spill/Release",
    legacyCode: "Code White/Code Yellow",
    color: "#D6B700",
    procedureHtml:
      "<section><h2>Hazardous Materials Spill/Release</h2><p>Announce the alert, direct people away from the hazard, notify the listed demo contacts, verify Command Center instructions, and complete demo Riskmaster logging.</p></section>",
    sourceReference: "Untitled19.png",
    actionSchemaJson:
      '{"actions":["Acknowledge","AnnouncementCompleted","DeconHazardGuidanceAcknowledged","DeconErPhysicianNotified","DeconAodNotified","DeconAdministratorNotified","DeconMedicalStaffLeadershipNotified","DeconDepartmentManagersNotified","DeconCommandCenterContacted","DeconMediaRelationsNotified","DeconRenoNotified","RiskmasterDemoCompleted","DailyNoteLogged"]}'
  }),
  facilityRule({
    title: "Mass Casualty Incident",
    ruleId: "CaFacilityMassCasualtyIncident",
    sortOrder: 215,
    alertType: "Mass Casualty Incident",
    legacyCode: "Code White",
    color: "#8A8A80",
    procedureHtml:
      "<section><h2>Mass Casualty Incident</h2><p><strong>*DEMO COPY*</strong> Acknowledge the alert, call 911, open First Hour Response, confirm Command Center briefing, review disaster care areas, and complete demo Riskmaster logging.</p></section>",
    sourceReference: "Untitled17.png; Untitled18.png",
    actionSchemaJson:
      '{"actions":["Acknowledge","DemoCopyCaveatAcknowledged","Call911Confirmed","FirstHourResponseReviewed","MassCasualtyCommandCenterBriefingConfirmed","MassCasualtyCareAreasReviewed","RiskmasterDemoCompleted","DailyNoteLogged"]}'
  }),
  facilityRule({
    title: "Emergency Operations Plan",
    ruleId: "CaFacilityEmergencyOperationsPlan",
    sortOrder: 220,
    alertType: "Emergency Operations Plan Activation",
    legacyCode: "Code White",
    color: "#8A8A80",
    procedureHtml:
      "<section><h2>Emergency Operations Plan</h2><p><strong>*DEMO COPY*</strong> Acknowledge the alert, call 911, and open the First Hour Response reference.</p></section>",
    sourceReference: "Untitled18.png",
    actionSchemaJson:
      '{"actions":["Acknowledge","Call911Confirmed","FirstHourResponseReviewed","RiskmasterDemoCompleted","DailyNoteLogged"]}'
  })
];

function medicalRule(options: {
  title: string;
  ruleId: string;
  sortOrder: number;
  alertType: string;
  legacyCode: string;
  color: string;
  procedureHtml: string;
  sourceReference: string;
  requiresEpicBedPlanningConfirm?: boolean;
  requiresEpicRespiratoryConfirm?: boolean;
  requiresSecurityConfirm?: boolean;
  actionSchemaJson?: string;
  formSchemaJson?: string;
  redactionNote?: string;
}): CodeAlertWorkflowDefinitionSource {
  return {
    Title: options.title,
    CaRuleId: options.ruleId,
    CaIsActive: true,
    CaSortOrder: options.sortOrder,
    CaCategory: "Medical",
    CaPlainLanguagePrefix: "Medical Alert",
    CaAlertType: options.alertType,
    CaLegacyCode: options.legacyCode,
    CaDisplayLabel: options.alertType,
    CaShortLabel: options.alertType,
    CaDisplayColor: options.color,
    CaAnnouncementTemplate: `Medical Alert + ${options.alertType} + {Location}`,
    CaAllClearTemplate: `Medical Alert + ${options.alertType} + {Location} + All Clear`,
    CaCancelTemplate: `Cancel + ${options.alertType} + {Location}`,
    CaProcedureHtml: options.procedureHtml,
    CaRequiresLocation: true,
    CaAllowsInstructions: false,
    CaRequiresAcknowledgement: true,
    CaRequiresEpicBedPlanningConfirm: options.requiresEpicBedPlanningConfirm ?? true,
    CaRequiresEpicRespiratoryConfirm: options.requiresEpicRespiratoryConfirm ?? true,
    CaRequiresSecurityConfirm: options.requiresSecurityConfirm ?? false,
    CaRequiresMaintenanceConfirm: false,
    CaRequires911Confirm: false,
    CaAllowsCancel: true,
    CaAllowsAllClear: true,
    CaAllowsNotCleared: true,
    CaNotClearedDelayMinutes: 10,
    CaActionSchemaJson: options.actionSchemaJson ?? standardMedicalActionSchema,
    CaFormSchemaJson: options.formSchemaJson ?? locationFormSchema,
    CaSourceReference: options.sourceReference,
    CaRedactionNote: options.redactionNote ?? "Real contact names and phone numbers are replaced with placeholders."
  };
}

function securityRule(options: {
  title: string;
  ruleId: string;
  sortOrder: number;
  alertType: string;
  legacyCode: string;
  color: string;
  procedureHtml: string;
  sourceReference: string;
  actionSchemaJson: string;
  announcementTemplate?: string;
}): CodeAlertWorkflowDefinitionSource {
  return {
    Title: options.title,
    CaRuleId: options.ruleId,
    CaIsActive: true,
    CaSortOrder: options.sortOrder,
    CaCategory: "Security",
    CaPlainLanguagePrefix: "Security Alert",
    CaAlertType: options.alertType,
    CaLegacyCode: options.legacyCode,
    CaDisplayLabel: options.alertType,
    CaShortLabel: options.alertType,
    CaDisplayColor: options.color,
    CaAnnouncementTemplate: options.announcementTemplate ?? `Security Alert + ${options.alertType} + {Location} + {Instructions}`,
    CaAllClearTemplate: `Security Alert + ${options.alertType} + {Location} + All Clear`,
    CaCancelTemplate: `Cancel + ${options.alertType} + {Location}`,
    CaProcedureHtml: options.procedureHtml,
    CaRequiresLocation: true,
    CaAllowsInstructions: true,
    CaRequiresAcknowledgement: true,
    CaRequiresEpicBedPlanningConfirm: false,
    CaRequiresEpicRespiratoryConfirm: false,
    CaRequiresSecurityConfirm: true,
    CaRequiresMaintenanceConfirm: false,
    CaRequires911Confirm: false,
    CaAllowsCancel: true,
    CaAllowsAllClear: true,
    CaAllowsNotCleared: true,
    CaNotClearedDelayMinutes: 10,
    CaActionSchemaJson: options.actionSchemaJson,
    CaFormSchemaJson:
      '{"fields":[{"name":"CaLocation","type":"Text","required":true},{"name":"CaInstructions","type":"MultilineText","required":false}]}',
    CaSourceReference: options.sourceReference,
    CaRedactionNote: "Real contact names and phone numbers are replaced with placeholders."
  };
}

function facilityRule(options: {
  title: string;
  ruleId: string;
  sortOrder: number;
  alertType: string;
  legacyCode: string;
  color: string;
  procedureHtml: string;
  sourceReference: string;
  actionSchemaJson: string;
}): CodeAlertWorkflowDefinitionSource {
  return {
    Title: options.title,
    CaRuleId: options.ruleId,
    CaIsActive: true,
    CaSortOrder: options.sortOrder,
    CaCategory: "Facility",
    CaPlainLanguagePrefix: "Facility Alert",
    CaAlertType: options.alertType,
    CaLegacyCode: options.legacyCode,
    CaDisplayLabel: options.alertType,
    CaShortLabel: options.alertType,
    CaDisplayColor: options.color,
    CaAnnouncementTemplate: `Facility Alert + ${options.alertType} + {Location} + {Instructions}`,
    CaAllClearTemplate: `Facility Alert + ${options.alertType} + {Location} + All Clear`,
    CaCancelTemplate: `Cancel + ${options.alertType} + {Location}`,
    CaProcedureHtml: options.procedureHtml,
    CaRequiresLocation: true,
    CaAllowsInstructions: true,
    CaRequiresAcknowledgement: true,
    CaRequiresEpicBedPlanningConfirm: false,
    CaRequiresEpicRespiratoryConfirm: false,
    CaRequiresSecurityConfirm: false,
    CaRequiresMaintenanceConfirm: false,
    CaRequires911Confirm: false,
    CaAllowsCancel: true,
    CaAllowsAllClear: true,
    CaAllowsNotCleared: true,
    CaNotClearedDelayMinutes: 10,
    CaActionSchemaJson: options.actionSchemaJson,
    CaFormSchemaJson:
      '{"fields":[{"name":"CaLocation","type":"Text","required":true},{"name":"CaInstructions","type":"MultilineText","required":false}]}',
    CaSourceReference: options.sourceReference,
    CaRedactionNote: "Real contact names and phone numbers are replaced with placeholders."
  };
}
