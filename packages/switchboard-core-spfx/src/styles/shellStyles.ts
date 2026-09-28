const styleElementId = "ed-switchboard-shell-styles";

const shellStyles = `
.swOperatorConsolePage .sp-appBar,
.swOperatorConsolePage .sp-appBarContainer,
.swOperatorConsolePage #O365_SearchBoxContainer,
.swOperatorConsolePage #O365_SearchBoxContainer_container,
.swOperatorConsolePage [data-automationid="SearchBox"],
.swOperatorConsolePage #spCommandBar,
.swOperatorConsolePage .spCommandBar,
.swOperatorConsolePage [data-automationid="CommandBar"],
.swOperatorConsolePage div[class*="CommandBarContainer"],
.swOperatorConsolePage .commandBarWrapper,
.swOperatorConsolePage #spSiteHeader,
.swOperatorConsolePage #spLeftNav,
.swOperatorConsolePage .sp-leftNav,
.swOperatorConsolePage [data-automationid="LeftNav"],
.swOperatorConsolePage [data-automation-id="LeftNav"],
.swOperatorConsolePage nav[aria-label="Site navigation"],
.swOperatorConsolePage nav[aria-label="Quick Launch"] {
  display: none !important;
}

.swShell {
  background: #ffffff;
  color: #111111;
  font-family: "Segoe UI", Arial, sans-serif;
}

.swOperatorConsolePage .swShell {
  position: relative;
}

.swOperatorConsolePage .swShellHeader,
.swOperatorConsolePage .swShellBody {
  box-sizing: border-box;
  margin-left: 267px;
  width: calc(100% - 267px);
}

.swLeftNavRail {
  display: none;
}

.swOperatorConsolePage .swLeftNavRail {
  display: block;
  position: fixed;
  top: 48px;
  left: 0;
  bottom: 0;
  width: 267px;
  overflow-y: auto;
  background: #f9f9f9;
  border-right: 1px solid #edebe9;
  padding: 10px 0 20px;
  z-index: 20;
}

.swRiskmasterDemoSurface {
  max-width: 760px;
  margin: 0 auto;
  padding: 24px;
  color: #111111;
  background: #ffffff;
  font-family: "Segoe UI", Arial, sans-serif;
}

.swRiskmasterDemoHeader {
  text-align: center;
  border-bottom: 1px solid #b8b8b8;
  margin-bottom: 18px;
  padding-bottom: 12px;
}

.swRiskmasterDemoHeader span {
  display: block;
  color: #777777;
  font-size: 1.25rem;
  letter-spacing: 0;
  margin-bottom: 12px;
}

.swRiskmasterDemoHeader h1 {
  font-size: 1.6rem;
  margin: 0 0 8px;
}

.swRiskmasterDemoHeader p {
  margin: 0;
  color: #555555;
}

.swRiskmasterDemoForm {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.swRiskmasterDemoField {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-weight: 700;
}

.swRiskmasterDemoField input,
.swRiskmasterDemoField textarea {
  border: 1px solid #b8b8b8;
  font: inherit;
  font-weight: 400;
  padding: 8px;
}

.swRiskmasterDemoError {
  border: 1px solid #9a2d2d;
  color: #7d1f1f;
  padding: 10px;
}

.swRiskmasterDemoReceipt {
  border: 2px solid #3f6f44;
  background: #f3fbf4;
  padding: 14px;
}

.swRiskmasterDemoReceipt h2 {
  margin: 0 0 8px;
  font-size: 1.25rem;
}

.swRiskmasterDemoCode {
  border: 1px solid #8a8a8a;
  background: #ffffff;
  font-size: 1.35rem;
  font-weight: 700;
  padding: 10px;
  user-select: all;
}

.swShellHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #cfc2cb;
  border-top: 1px solid #cfc2cb;
  border-left: 1px solid #cfc2cb;
  border-right: 1px solid #cfc2cb;
  background: #f6f6f7;
  border-radius: 8px 8px 0 0;
  box-shadow: 0 2px 12px rgba(79, 17, 64, 0.12);
}

.swShellHeaderTitle {
  color: #4f1140;
  font-size: 1.8rem;
  font-weight: 700;
}

.swShellHeaderMeta {
  display: flex;
  gap: 16px;
}

.swShellBody {
  display: flex;
  align-items: flex-start;
  width: 100%;
  gap: 0;
  background: #ffffff;
  border-color: #cfc2cb;
  border-width: 1px;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
}
.swDailyNotesPanel,
.swModuleColumn {
  display: block;
  vertical-align: top;
  padding: 12px;
  box-sizing: border-box;
}

.swDailyNotesPanel {
  flex: 1 1 auto;
  min-width: 0;
  width: auto;
  background: #ffffff;
  border-radius: 0 0 0 8px;
  border: 1px solid #cfc2cb;
}

.swModuleColumn {
  flex: 0 0 220px;
  width: 220px;
  min-height: 939px;
  min-width: 220px;
}

.swModuleColumn {
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-left: 1px solid #d0d0d0;
  border-right: 1px solid #cfc2cb;
  border-bottom: 1px solid #cfc2cb;
  border-radius: 0 0 8px 0;
  background: #ffffff;
}

.swModuleSection,
.swReferenceMenuSection {
  border: 1px solid #cfc2cb;
  background: #ffffff;
}

.swModuleSection {
  border: 1px solid #e0dddd;
  background: #f8f8f8;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(79, 17, 64, 0.08);
}

.swModuleSection {
  padding: 10px;
}

.swModuleSection .swModuleLauncherCard + .swModuleLauncherCard {
  margin-top: 8px;
}

.swModuleSectionTitle,
.swReferenceMenuSectionTitle {
  color: #4f1140;
  font-size: 0.95rem;
  font-weight: 700;
}

.swModuleSectionTitle {
  margin-bottom: 6px;
  font-size: 1.2rem;
  text-align: center;
  text-transform: uppercase;
}

.swReferenceMenu {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.swOperatorConsolePage .swLeftNavRail .swReferenceMenu {
  gap: 0;
}

.swMenuPreviewPill {
  border: 1px solid #cfc2cb;
  background: #f8f1f6;
  color: #4f1140;
  font-size: 0.82rem;
  font-weight: 700;
  padding: 6px 8px;
}

.swReferenceMenuSectionTitle {
  background: #f8f1f6;
  border-bottom: 1px solid #dfd4db;
  padding: 6px 8px;
}

.swOperatorConsolePage .swLeftNavRail .swReferenceMenuSection {
  border: 0;
  background: transparent;
}

.swReferenceMenuList {
  list-style: none;
  margin: 0;
  padding: 0;
}

.swReferenceMenuItem + .swReferenceMenuItem {
  border-top: 1px solid #ece5ea;
}

.swOperatorConsolePage .swLeftNavRail .swReferenceMenuItem + .swReferenceMenuItem {
  border-top: 0;
}

.swReferenceMenuLink {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #1a1a1a;
  padding: 8px;
  text-decoration: none;
}

.swOperatorConsolePage .swLeftNavRail .swReferenceMenuLink {
  width: 100%;
  border: 0;
  background: transparent;
  color: #323130;
  font-size: 1rem;
  padding: 14px 20px 14px 30px;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
}

.swReferenceMenuLink:hover,
.swReferenceMenuLink:focus {
  background: #fbf6f9;
  outline: 2px solid #6f1d62;
  outline-offset: -2px;
}

.swReferenceMenuIcon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex: 0 0 20px;
  color: currentColor;
}

.swReferenceMenuIcon svg {
  width: 19px;
  height: 19px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.7;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.swReferenceMenuLinkTitle {
  display: block;
  font-size: 0.96rem;
  font-weight: 600;
}

.swOperatorConsolePage .swLeftNavRail .swReferenceMenuLinkTitle {
  font-size: 0.92rem;
  font-weight: 400;
  line-height: 1.25;
}

.swReferenceMenuDescription {
  display: block;
  color: #666666;
  font-size: 0.8rem;
  margin-top: 2px;
}

.swOperatorConsolePage .swLeftNavRail .swReferenceMenuSection + .swReferenceMenuSection {
  margin-top: 2px;
}

.swOperatorConsolePage .swLeftNavRail .swMenuPreviewPill {
  margin: 0 12px 8px;
  font-size: 0.78rem;
  padding: 4px 6px;
}

.swOperatorConsolePage .swLeftNavRail .swReferenceMenuLink:hover,
.swOperatorConsolePage .swLeftNavRail .swReferenceMenuLink:focus {
  background: #f3f2f1;
  color: #a4262c;
  outline: 0;
}

.swOperatorConsolePage .swLeftNavRail .swReferenceMenuLink:focus-visible {
  outline: 2px solid #6f1d62;
  outline-offset: -2px;
}
.swDailyNotesToolbar {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.swSearchInput {
  flex: 1 1 auto;
  min-width: 280px;
}

.swDateNavigator {
  display: flex;
  align-items: center;
  gap: 6px;
}

.swDateValue {
  min-width: 110px;
  text-align: center;
  font-weight: 600;
}

.swSectionBand {
  background: linear-gradient(180deg, #e6e2df 0%, #d8d4d1 100%);
  border: 1px solid #b8b8b8;
  padding: 4px 8px;
}

.swFormSection {
  margin-bottom: 12px;
  border: 1px solid #b8b8b8;
  background: #ffffff;
  border-radius: 4px;
  overflow: hidden;
}

.swRuleLine {
  height: 30px;
  border-bottom: 1px solid #999999;
}

.swEntryRow {
  display: table;
  width: 100%;
  border-bottom: 1px solid #999999;
  min-height: 30px;
}

.swEntryTime,
.swEntryBody {
  display: table-cell;
  vertical-align: top;
  padding: 6px 8px;
}

.swEntryTime {
  width: 90px;
  font-weight: 600;
}

.swDrawerRow {
  display: table;
  width: 100%;
  table-layout: fixed;
}

.swDrawerBox {
  display: table-cell;
  height: 42px;
  border: 1px solid #999999;
  background: #ffffff;
  width: 25%;
  font-size: 0.8rem;
  text-align: center;
}

.swPopupHost {
  position: fixed;
  inset: 0;
  align-items: center;
  display: flex;
  justify-content: center;
  overflow: hidden;
  padding: 68px 32px 32px;
  z-index: 1000000;
}

.swPopupHost:focus {
  outline: none;
}

.swPopupBackdrop {
  position: absolute;
  inset: 0;
  background: rgba(39, 42, 45, 0.58);
  backdrop-filter: blur(2px);
}

.swPopupSurface {
  --swAlertAccent: #6f1d62;
  --swAlertAccentForeground: #ffffff;
  --swAlertAccentSoft: #f7f0f6;
  position: relative;
  z-index: 1;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: min(1540px, 100%);
  min-height: 430px;
  max-height: calc(100vh - 100px);
  overflow: hidden;
  padding: 26px 42px 30px;
  border: 1px solid rgba(54, 53, 51, 0.16);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 18px 55px rgba(20, 18, 20, 0.34);
}

.swPopupHostTitle {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.swPopupHostDivider {
  flex: 0 0 auto;
  border-top: 1px solid #d7d5d3;
}

.swPopupFrame {
  flex: 1 1 auto;
  min-height: 0;
  margin-top: 0;
  overflow: auto;
  background: transparent;
  border: 0;
  display: flex;
  flex-direction: column;
  padding: 26px 2px 2px;
  scrollbar-gutter: stable;
}

.swPopupHeader {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 28px;
  min-height: 72px;
  padding-bottom: 18px;
}

.swPopupHeading {
  flex: 1 1 auto;
  min-width: 0;
}

.swPopupMeta {
  flex: 0 0 auto;
  min-width: 104px;
  text-align: right;
  color: var(--swAlertAccent);
}

.swPopupTitle {
  color: #242323;
  font-size: 1.45rem;
  font-weight: 700;
  line-height: 1.2;
}

.swPopupSubtitle {
  color: #363533;
  font-size: 1rem;
  font-weight: 600;
  margin-top: 5px;
}

.swPopupElapsed {
  align-items: center;
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  font-size: 1.35rem;
  font-weight: 600;
  line-height: 1;
}

.swPopupElapsedIcon {
  align-items: center;
  display: inline-flex;
  font-size: 1.65rem;
  line-height: 1;
}

.swPopupElapsedLabel {
  color: #6e6c6a;
  font-size: 0.72rem;
  letter-spacing: 0.04em;
  margin-top: 7px;
}

.swPopupQueueStrip {
  display: flex;
  gap: 10px;
  flex: 0 1 390px;
  flex-wrap: wrap;
  max-height: 142px;
  max-width: 40%;
  overflow: auto;
  background: transparent;
  padding: 0;
}

.swPopupQueueItem {
  align-items: center;
  box-sizing: border-box;
  display: flex;
  flex: 1 1 220px;
  gap: 12px;
  min-width: 210px;
  min-height: 58px;
  border: 1px solid var(--swAlertAccent, #6f1d62);
  border-radius: 8px;
  background: #ffffff;
  color: #242323;
  padding: 10px 14px;
  text-align: left;
  box-shadow: 0 2px 7px rgba(28, 26, 27, 0.08);
  cursor: pointer;
}

.swPopupQueueIcon {
  align-items: center;
  border: 2px solid currentColor;
  border-radius: 50%;
  display: inline-flex;
  flex: 0 0 30px;
  font-size: 1.15rem;
  font-weight: 700;
  height: 30px;
  justify-content: center;
  line-height: 1;
}

.swPopupQueueText {
  display: block;
  min-width: 0;
}

.swPopupFrame.codeBlueAdult,
.swPopupQueueItem.codeBlueAdult,
.swAlertWorkflow.codeBlueAdult,
.swAlertTask.codeBlueAdult,
.swAlertTaskBody.codeBlueAdult {
  --swAlertAccent: #1f4e79;
  --swAlertAccentSoft: #eef5fb;
}

.swPopupFrame.codeBluePediatric,
.swPopupQueueItem.codeBluePediatric,
.swAlertWorkflow.codeBluePediatric,
.swAlertTask.codeBluePediatric,
.swAlertTaskBody.codeBluePediatric {
  --swAlertAccent: #1f4e79;
  --swAlertAccentSoft: #eef5fb;
}

.swPopupFrame.conditionHelp,
.swPopupQueueItem.conditionHelp,
.swAlertWorkflow.conditionHelp,
.swAlertTask.conditionHelp,
.swAlertTaskBody.conditionHelp,
.swPopupFrame.welfareCheck,
.swPopupQueueItem.welfareCheck,
.swAlertWorkflow.welfareCheck,
.swAlertTask.welfareCheck,
.swAlertTaskBody.welfareCheck {
  --swAlertAccent: #4f8a5b;
  --swAlertAccentSoft: #eef7f0;
}

.swPopupFrame.obstetricEmergency,
.swPopupQueueItem.obstetricEmergency,
.swAlertWorkflow.obstetricEmergency,
.swAlertTask.obstetricEmergency,
.swAlertTaskBody.obstetricEmergency {
  --swAlertAccent: #24576b;
  --swAlertAccentSoft: #edf5f8;
}

.swPopupFrame.rapidResponseAdult,
.swPopupQueueItem.rapidResponseAdult,
.swAlertWorkflow.rapidResponseAdult,
.swAlertTask.rapidResponseAdult,
.swAlertTaskBody.rapidResponseAdult,
.swPopupFrame.rapidResponsePediatric,
.swPopupQueueItem.rapidResponsePediatric,
.swAlertWorkflow.rapidResponsePediatric,
.swAlertTask.rapidResponsePediatric,
.swAlertTaskBody.rapidResponsePediatric {
  --swAlertAccent: #f07a63;
  --swAlertAccentSoft: #fff2ef;
}

.swPopupFrame.strokeAlert,
.swPopupQueueItem.strokeAlert,
.swAlertWorkflow.strokeAlert,
.swAlertTask.strokeAlert,
.swAlertTaskBody.strokeAlert,
.swPopupFrame.outsideMedicalEmergency,
.swPopupQueueItem.outsideMedicalEmergency,
.swAlertWorkflow.outsideMedicalEmergency,
.swAlertTask.outsideMedicalEmergency,
.swAlertTaskBody.outsideMedicalEmergency {
  --swAlertAccent: #4f8a5b;
  --swAlertAccentSoft: #eef7f0;
}

.swPopupFrame.enhancedSecurityMeasures,
.swPopupQueueItem.enhancedSecurityMeasures,
.swAlertWorkflow.enhancedSecurityMeasures,
.swAlertTask.enhancedSecurityMeasures,
.swAlertTaskBody.enhancedSecurityMeasures,
.swPopupFrame.conditionSupport,
.swPopupQueueItem.conditionSupport,
.swAlertWorkflow.conditionSupport,
.swAlertTask.conditionSupport,
.swAlertTaskBody.conditionSupport {
  --swAlertAccent: #f07a63;
  --swAlertAccentSoft: #fff2ef;
}

.swPopupFrame.armedSubjectActiveShooter,
.swPopupQueueItem.armedSubjectActiveShooter,
.swAlertWorkflow.armedSubjectActiveShooter,
.swAlertTask.armedSubjectActiveShooter,
.swAlertTaskBody.armedSubjectActiveShooter {
  --swAlertAccent: #5a2e2a;
  --swAlertAccentSoft: #f7f1f0;
}

.swPopupFrame.fireAlarm,
.swPopupQueueItem.fireAlarm,
.swAlertWorkflow.fireAlarm,
.swAlertTask.fireAlarm,
.swAlertTaskBody.fireAlarm {
  --swAlertAccent: #d94a4a;
  --swAlertAccentSoft: #fff0f0;
}

.swPopupFrame.severeWeatherEventActivation,
.swPopupQueueItem.severeWeatherEventActivation,
.swAlertWorkflow.severeWeatherEventActivation,
.swAlertTask.severeWeatherEventActivation,
.swAlertTaskBody.severeWeatherEventActivation {
  --swAlertAccent: #8a8a80;
  --swAlertAccentSoft: #f4f4f1;
}

.swPopupFrame.traumaAlert,
.swPopupQueueItem.traumaAlert,
.swAlertWorkflow.traumaAlert,
.swAlertTask.traumaAlert,
.swAlertTaskBody.traumaAlert {
  --swAlertAccent: #f07a63;
  --swAlertAccentSoft: #fff2ef;
}

.swPopupFrame.bombThreat,
.swPopupQueueItem.bombThreat,
.swAlertWorkflow.bombThreat,
.swAlertTask.bombThreat,
.swAlertTaskBody.bombThreat {
  --swAlertAccent: #5b3b7a;
  --swAlertAccentSoft: #f4eff8;
}

.swPopupFrame.childAbduction,
.swPopupQueueItem.childAbduction,
.swAlertWorkflow.childAbduction,
.swAlertTask.childAbduction,
.swAlertTaskBody.childAbduction,
.swPopupFrame.infantAbduction,
.swPopupQueueItem.infantAbduction,
.swAlertWorkflow.infantAbduction,
.swAlertTask.infantAbduction,
.swAlertTaskBody.infantAbduction {
  --swAlertAccent: #d85b86;
  --swAlertAccentSoft: #fff0f5;
}

.swPopupFrame.missingPersonMissingChild,
.swPopupQueueItem.missingPersonMissingChild,
.swAlertWorkflow.missingPersonMissingChild,
.swAlertTask.missingPersonMissingChild,
.swAlertTaskBody.missingPersonMissingChild {
  --swAlertAccent: #4f8a5b;
  --swAlertAccentSoft: #eef7f0;
}

.swPopupFrame.decontamination,
.swPopupQueueItem.decontamination,
.swAlertWorkflow.decontamination,
.swAlertTask.decontamination,
.swAlertTaskBody.decontamination,
.swPopupFrame.hazardousMaterialsSpillRelease,
.swPopupQueueItem.hazardousMaterialsSpillRelease,
.swAlertWorkflow.hazardousMaterialsSpillRelease,
.swAlertTask.hazardousMaterialsSpillRelease,
.swAlertTaskBody.hazardousMaterialsSpillRelease {
  --swAlertAccent: #d6b700;
  --swAlertAccentSoft: #fffbea;
}

.swPopupFrame.emergencyOperationsPlan,
.swPopupQueueItem.emergencyOperationsPlan,
.swAlertWorkflow.emergencyOperationsPlan,
.swAlertTask.emergencyOperationsPlan,
.swAlertTaskBody.emergencyOperationsPlan {
  --swAlertAccent: #8a8a80;
  --swAlertAccentSoft: #f4f4f1;
}

.swPopupFrame.massCasualtyIncident,
.swPopupQueueItem.massCasualtyIncident,
.swAlertWorkflow.massCasualtyIncident,
.swAlertTask.massCasualtyIncident,
.swAlertTaskBody.massCasualtyIncident {
  --swAlertAccent: #8a8a80;
  --swAlertAccentSoft: #f4f4f1;
}

.swPopupSurface.codeBlueAdult,
.swPopupSurface.codeBluePediatric {
  --swAlertAccent: #1f4e79;
  --swAlertAccentSoft: #eef5fb;
}

.swPopupSurface.conditionHelp,
.swPopupSurface.welfareCheck,
.swPopupSurface.strokeAlert,
.swPopupSurface.outsideMedicalEmergency,
.swPopupSurface.missingPersonMissingChild {
  --swAlertAccent: #4f8a5b;
  --swAlertAccentSoft: #eef7f0;
}

.swPopupSurface.obstetricEmergency {
  --swAlertAccent: #24576b;
  --swAlertAccentSoft: #edf5f8;
}

.swPopupSurface.rapidResponseAdult,
.swPopupSurface.rapidResponsePediatric,
.swPopupSurface.enhancedSecurityMeasures,
.swPopupSurface.conditionSupport,
.swPopupSurface.traumaAlert {
  --swAlertAccent: #f07a63;
  --swAlertAccentForeground: #24100c;
  --swAlertAccentSoft: #fff2ef;
}

.swPopupSurface.armedSubjectActiveShooter {
  --swAlertAccent: #5a2e2a;
  --swAlertAccentSoft: #f7f1f0;
}

.swPopupSurface.fireAlarm {
  --swAlertAccent: #d94a4a;
  --swAlertAccentSoft: #fff0f0;
}

.swPopupSurface.severeWeatherEventActivation,
.swPopupSurface.emergencyOperationsPlan,
.swPopupSurface.massCasualtyIncident {
  --swAlertAccent: #8a8a80;
  --swAlertAccentForeground: #151515;
  --swAlertAccentSoft: #f4f4f1;
}

.swPopupSurface.bombThreat {
  --swAlertAccent: #5b3b7a;
  --swAlertAccentSoft: #f4eff8;
}

.swPopupSurface.childAbduction,
.swPopupSurface.infantAbduction {
  --swAlertAccent: #d85b86;
  --swAlertAccentForeground: #241018;
  --swAlertAccentSoft: #fff0f5;
}

.swPopupSurface.decontamination,
.swPopupSurface.hazardousMaterialsSpillRelease {
  --swAlertAccent: #d6b700;
  --swAlertAccentForeground: #211d00;
  --swAlertAccentSoft: #fffbea;
}

.swPopupQueueItem.rapidResponseAdult,
.swPopupQueueItem.rapidResponsePediatric,
.swPopupQueueItem.enhancedSecurityMeasures,
.swPopupQueueItem.conditionSupport,
.swPopupQueueItem.traumaAlert,
.swPopupQueueItem.childAbduction,
.swPopupQueueItem.infantAbduction,
.swPopupQueueItem.severeWeatherEventActivation,
.swPopupQueueItem.emergencyOperationsPlan,
.swPopupQueueItem.massCasualtyIncident,
.swPopupQueueItem.decontamination,
.swPopupQueueItem.hazardousMaterialsSpillRelease {
  --swAlertAccentForeground: #211d1d;
}

.swPopupFrame.traumaAlert,
.swPopupFrame.bombThreat,
.swPopupFrame.childAbduction,
.swPopupFrame.infantAbduction,
.swPopupFrame.missingPersonMissingChild,
.swPopupFrame.decontamination,
.swPopupFrame.hazardousMaterialsSpillRelease,
.swPopupFrame.massCasualtyIncident,
.swPopupFrame.emergencyOperationsPlan,
.swPopupQueueItem.traumaAlert,
.swPopupQueueItem.bombThreat,
.swPopupQueueItem.childAbduction,
.swPopupQueueItem.infantAbduction,
.swPopupQueueItem.missingPersonMissingChild,
.swPopupQueueItem.decontamination,
.swPopupQueueItem.hazardousMaterialsSpillRelease,
.swPopupQueueItem.massCasualtyIncident,
.swPopupQueueItem.emergencyOperationsPlan {
  border-color: var(--swAlertAccent);
}

.swPopupQueueItem.traumaAlert.isActive,
.swPopupQueueItem.bombThreat.isActive,
.swPopupQueueItem.childAbduction.isActive,
.swPopupQueueItem.infantAbduction.isActive,
.swPopupQueueItem.missingPersonMissingChild.isActive,
.swPopupQueueItem.decontamination.isActive,
.swPopupQueueItem.hazardousMaterialsSpillRelease.isActive,
.swPopupQueueItem.massCasualtyIncident.isActive,
.swPopupQueueItem.emergencyOperationsPlan.isActive {
  background: var(--swAlertAccent);
}

.swPopupFrame.codeBlueAdult,
.swPopupFrame.codeBluePediatric,
.swPopupFrame.conditionHelp,
.swPopupFrame.welfareCheck,
.swPopupFrame.obstetricEmergency,
.swPopupFrame.rapidResponseAdult,
.swPopupFrame.rapidResponsePediatric,
.swPopupFrame.strokeAlert,
.swPopupFrame.outsideMedicalEmergency,
.swPopupFrame.enhancedSecurityMeasures,
.swPopupFrame.conditionSupport,
.swPopupFrame.armedSubjectActiveShooter,
.swPopupFrame.severeWeatherEventActivation,
.swPopupFrame.fireAlarm {
  border-color: var(--swAlertAccent);
}

.swPopupQueueItem.codeBlueAdult,
.swPopupQueueItem.codeBluePediatric,
.swPopupQueueItem.conditionHelp,
.swPopupQueueItem.welfareCheck,
.swPopupQueueItem.obstetricEmergency,
.swPopupQueueItem.rapidResponseAdult,
.swPopupQueueItem.rapidResponsePediatric,
.swPopupQueueItem.strokeAlert,
.swPopupQueueItem.outsideMedicalEmergency,
.swPopupQueueItem.enhancedSecurityMeasures,
.swPopupQueueItem.conditionSupport,
.swPopupQueueItem.armedSubjectActiveShooter,
.swPopupQueueItem.severeWeatherEventActivation,
.swPopupQueueItem.fireAlarm {
  border-color: var(--swAlertAccent);
}

.swPopupQueueItem.isActive {
  background: #6f1d62;
  color: var(--swAlertAccentForeground, #ffffff);
}

.swPopupQueueItem.codeBlueAdult.isActive,
.swPopupQueueItem.codeBluePediatric.isActive,
.swPopupQueueItem.conditionHelp.isActive,
.swPopupQueueItem.welfareCheck.isActive,
.swPopupQueueItem.obstetricEmergency.isActive,
.swPopupQueueItem.rapidResponseAdult.isActive,
.swPopupQueueItem.rapidResponsePediatric.isActive,
.swPopupQueueItem.strokeAlert.isActive,
.swPopupQueueItem.outsideMedicalEmergency.isActive,
.swPopupQueueItem.enhancedSecurityMeasures.isActive,
.swPopupQueueItem.conditionSupport.isActive,
.swPopupQueueItem.armedSubjectActiveShooter.isActive,
.swPopupQueueItem.severeWeatherEventActivation.isActive,
.swPopupQueueItem.fireAlarm.isActive {
  background: var(--swAlertAccent);
}

.swPopupQueueItem.isDisabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.swPopupQueueTitle,
.swPopupQueueSubtitle {
  display: block;
}

.swPopupQueueTitle {
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.2;
}

.swPopupQueueSubtitle {
  font-size: 0.86rem;
  line-height: 1.25;
  margin-top: 3px;
}

.swPopupAction {
  min-height: 38px;
  margin-right: 8px;
  border: 1px solid #aaa7a5;
  border-radius: 4px;
  background: #ffffff;
  color: #292827;
  font: inherit;
  font-weight: 600;
  padding: 8px 13px;
  cursor: pointer;
}

.swPopupAction-primary {
  background: #6f1d62;
  color: #ffffff;
  border-color: #6f1d62;
}

.swPopupFrame.codeBlueAdult .swPopupAction-primary,
.swPopupFrame.codeBluePediatric .swPopupAction-primary,
.swPopupFrame.conditionHelp .swPopupAction-primary,
.swPopupFrame.welfareCheck .swPopupAction-primary,
.swPopupFrame.obstetricEmergency .swPopupAction-primary,
.swPopupFrame.rapidResponseAdult .swPopupAction-primary,
.swPopupFrame.rapidResponsePediatric .swPopupAction-primary,
.swPopupFrame.strokeAlert .swPopupAction-primary,
.swPopupFrame.outsideMedicalEmergency .swPopupAction-primary,
.swPopupFrame.enhancedSecurityMeasures .swPopupAction-primary,
.swPopupFrame.conditionSupport .swPopupAction-primary,
.swPopupFrame.armedSubjectActiveShooter .swPopupAction-primary,
.swPopupFrame.severeWeatherEventActivation .swPopupAction-primary,
.swPopupFrame.fireAlarm .swPopupAction-primary {
  background: var(--swAlertAccent);
  border-color: var(--swAlertAccent);
  color: var(--swAlertAccentForeground, #ffffff);
}

.swPopupFrame.traumaAlert .swPopupAction-primary,
.swPopupFrame.bombThreat .swPopupAction-primary,
.swPopupFrame.childAbduction .swPopupAction-primary,
.swPopupFrame.infantAbduction .swPopupAction-primary,
.swPopupFrame.missingPersonMissingChild .swPopupAction-primary,
.swPopupFrame.decontamination .swPopupAction-primary,
.swPopupFrame.hazardousMaterialsSpillRelease .swPopupAction-primary,
.swPopupFrame.massCasualtyIncident .swPopupAction-primary,
.swPopupFrame.emergencyOperationsPlan .swPopupAction-primary {
  background: var(--swAlertAccent);
  border-color: var(--swAlertAccent);
  color: var(--swAlertAccentForeground, #ffffff);
}

.swPopupAction:focus-visible,
.swPopupQueueItem:focus-visible,
.swPopupFrame button:focus-visible,
.swPopupFrame input:focus-visible,
.swPopupFrame textarea:focus-visible,
.swPopupFrame select:focus-visible,
.swPopupFrame a:focus-visible {
  outline: 3px solid #111111;
  outline-offset: 3px;
}

.swPopupAction:disabled {
  cursor: not-allowed;
  opacity: 0.62;
}

.swPopupFrame .swAcknowledgeAction,
.swPopupFrame.codeBlueAdult .swAcknowledgeAction,
.swPopupFrame.codeBluePediatric .swAcknowledgeAction,
.swPopupFrame.conditionHelp .swAcknowledgeAction,
.swPopupFrame.welfareCheck .swAcknowledgeAction,
.swPopupFrame.obstetricEmergency .swAcknowledgeAction,
.swPopupFrame.rapidResponseAdult .swAcknowledgeAction,
.swPopupFrame.rapidResponsePediatric .swAcknowledgeAction,
.swPopupFrame.strokeAlert .swAcknowledgeAction,
.swPopupFrame.outsideMedicalEmergency .swAcknowledgeAction,
.swPopupFrame.enhancedSecurityMeasures .swAcknowledgeAction,
.swPopupFrame.conditionSupport .swAcknowledgeAction,
.swPopupFrame.armedSubjectActiveShooter .swAcknowledgeAction,
.swPopupFrame.severeWeatherEventActivation .swAcknowledgeAction,
.swPopupFrame.fireAlarm .swAcknowledgeAction {
  background: #a23a3a;
  border-color: #7f2929;
  color: #ffffff;
  font-size: 1.2rem;
  font-weight: 700;
  padding: 8px 16px;
}

.swPopupFrame .swAcknowledgeAction:disabled {
  background: #d0d0d0;
  color: #666666;
}

.swPopupAction-danger {
  background: #aa2222;
  color: #ffffff;
}

.swPopupAnnouncement,
.swPopupForm,
.swPopupProcedure {
  border: 1px solid #cfcdcb;
  border-radius: 6px;
  padding: 14px 16px;
  margin: 12px 0;
}

.swPopupAnnouncement {
  background: #f7f7f7;
  font-size: 1.05rem;
}

.swPopupSectionLabel {
  font-weight: 700;
  margin-bottom: 6px;
}

.swPopupReadNote,
.swPopupValidation {
  margin-top: 10px;
  font-size: 0.9rem;
}

.swPopupValidation {
  color: #aa2222;
}

.swPopupFormField,
.swPopupCheckboxField {
  display: block;
  margin-bottom: 10px;
}

.swPopupFormField span {
  display: block;
  font-weight: 600;
  margin-bottom: 4px;
}

.swPopupFormField input,
.swPopupFormField textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #aaa7a5;
  border-radius: 4px;
  font: inherit;
  padding: 9px 10px;
}

.swPopupFormField textarea {
  min-height: 72px;
}

.swPopupCheckboxField {
  display: flex;
  align-items: center;
  gap: 8px;
}

.swPopupProcedure h2 {
  margin-top: 0;
  font-size: 1.1rem;
}

.swAlertWorkflow,
.swCodeAlertWorkflow {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1 1 auto;
  min-height: 0;
  overflow: visible;
  --swAlertAccent: #6f1d62;
  --swAlertAccentForeground: #ffffff;
  --swAlertAccentSoft: #f7f0f6;
}

.swWorkflowStep {
  overflow: hidden;
  border: 1px solid #cfcdcb;
  border-radius: 8px;
  background: #fafafa;
  box-shadow: 0 1px 3px rgba(31, 29, 30, 0.06);
}

.swAlertWorkflow .swWorkflowStep {
  border-left: 1px solid #cfcdcb;
}

.swWorkflowStep.isActive {
  background: #ffffff;
  border-color: #6f1d62;
}

.swAlertWorkflow .swWorkflowStep.isActive {
  border: 2px solid var(--swAlertAccent);
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(31, 29, 30, 0.12);
}

.swAlertWorkflow .swWorkflowStep.isActive .swWorkflowStepHeader {
  background: #ffffff;
}

.swWorkflowStep.isComplete {
  background: linear-gradient(90deg, var(--swAlertAccentSoft), #ffffff);
}

.swAlertWorkflow .swWorkflowStep.isComplete {
  border-color: #c9d4cb;
}

.swWorkflowCompactRow {
  display: flex;
  gap: 16px;
}

.swWorkflowCompactRow .swWorkflowStep {
  flex: 1 1 0;
  min-width: 0;
}

.swWorkflowCompactRow .swWorkflowStepHeader {
  align-items: center;
}

.swWorkflowCompactRow .swWorkflowStepTitle {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.swWorkflowStepHeader {
  align-items: center;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  min-height: 44px;
  padding: 8px 14px;
  font-weight: 700;
}

.swWorkflowStepHeading {
  align-items: center;
  display: flex;
  gap: 11px;
  min-width: 0;
}

.swWorkflowStepMarker {
  align-items: center;
  border-radius: 50%;
  background: var(--swAlertAccent);
  color: var(--swAlertAccentForeground, #ffffff);
  display: inline-flex;
  flex: 0 0 28px;
  font-size: 0.9rem;
  font-weight: 700;
  height: 28px;
  justify-content: center;
  line-height: 28px;
}

.swWorkflowStepMarker.isComplete {
  font-size: 1rem;
}

.swWorkflowStepTitle {
  min-width: 0;
  line-height: 1.25;
}

.swWorkflowStepDisclosure {
  color: var(--swAlertAccent);
  flex: 0 0 auto;
  font-size: 1.4rem;
  font-weight: 700;
  line-height: 1;
}

.swWorkflowStepBody {
  border-top: 1px solid #e3e1df;
  padding: 20px 24px 22px;
}

.swWorkflowStepText {
  font-size: 1.05rem;
  line-height: 1.45;
  margin-bottom: 14px;
  white-space: pre-line;
}

.swWorkflowStepText a,
.swReferencePlaceholder,
.swInlineReferenceButton {
  color: var(--swAlertAccent, #6f1d62);
  font-weight: 700;
}

.swReferencePlaceholder {
  text-decoration: underline;
}

.swInlineReferenceButton {
  border: 0;
  background: transparent;
  padding: 0;
  text-decoration: underline;
  cursor: pointer;
  font: inherit;
}

.swWorkflowDecisionHelp {
  position: relative;
}

.swWorkflowDecisionHelp.isExamplesOpen {
  padding-bottom: 310px;
}

.swExamplesAnchor {
  position: relative;
  display: inline-block;
}

.swDecisionPopover {
  position: absolute;
  top: 30px;
  left: 50%;
  z-index: 5;
  width: 920px;
  max-width: 920px;
  transform: translateX(-50%);
  border: 2px solid var(--swAlertAccent, #6f1d62);
  background: #ffffff;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
}

.swDecisionPopover::before {
  content: "";
  position: absolute;
  top: -10px;
  left: calc(50% - 10px);
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-bottom: 10px solid var(--swAlertAccent, #6f1d62);
}

.swDecisionIntro {
  text-align: center;
  font-weight: 700;
  margin-bottom: 10px;
}

.swDecisionColumns,
.swDecisionResults {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.swDecisionColumns > div,
.swDecisionResults > div {
  border: 1px solid #c8c8c8;
  padding: 10px;
  background: #fafafa;
}

.swDecisionColumns h4 {
  margin: 0 0 6px;
}

.swDecisionColumns ul {
  margin: 0;
  padding-left: 20px;
}

.swDecisionResults {
  margin-top: 10px;
}

.swDecisionResults strong,
.swDecisionResults span {
  display: block;
}

.swDecisionPdfLink {
  display: inline-block;
  margin-top: 10px;
  color: var(--swAlertAccent, #6f1d62);
  font-weight: 700;
}

.swInlineDocumentButton {
  margin-top: 8px;
}

.swInlineDocumentCell {
  position: relative;
}

.swInlineDocumentCell label {
  display: block;
  font-weight: 700;
  margin: 0 28px 4px 0;
}

.swInlineDocumentCell textarea {
  display: block;
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 8px;
  resize: none;
}

.swInlineDocumentClose {
  position: absolute;
  top: -2px;
  right: 0;
  border: 0;
  background: transparent;
  font-weight: 700;
  cursor: pointer;
}

.swGeneratedTextBox,
.swCopyTextBox {
  border: 1px solid #999999;
  border-left: 5px solid var(--swAlertAccent, #6f1d62);
  background: #ffffff;
  padding: 8px 10px;
  font-size: 1.05rem;
  overflow-wrap: anywhere;
  white-space: pre-line;
}

.swGeneratedTextBox {
  margin-bottom: 10px;
}

.swCopyTextRow {
  display: flex;
  align-items: stretch;
  gap: 8px;
  margin-bottom: 10px;
}

.swCopyTextBox {
  flex: 1 1 auto;
  min-height: 34px;
  display: flex;
  align-items: center;
}

.swCopyButton {
  min-width: 76px;
}

.swRiskmasterWorkflowStep {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-start;
}

.swRiskmasterCodeField {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  max-width: 420px;
  font-weight: 700;
}

.swRiskmasterCodeField input {
  border: 1px solid #999999;
  font: inherit;
  font-weight: 400;
  padding: 8px;
  text-transform: uppercase;
}

.swDecisionActionRow {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.swGeneratedTextActionRow {
  display: flex;
  gap: 8px;
  align-items: stretch;
  margin-bottom: 10px;
}

.swGeneratedTextActionRow .swGeneratedTextBox {
  flex: 1 1 auto;
  margin-bottom: 0;
}

.swPageAttemptButton {
  flex: 0 0 auto;
  white-space: nowrap;
}

.swAllClearGuidance p {
  margin: 0 0 8px;
}

.swAllClearGuidance ul {
  margin: 0 0 10px;
  padding-left: 22px;
}

.swBombThreatEvidencePanel {
  position: absolute;
  top: 52px;
  right: 16px;
  z-index: 6;
  width: 560px;
  max-width: calc(100% - 32px);
  border: 2px solid var(--swAlertAccent, #6f1d62);
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
}

.swBombThreatEvidenceHeader {
  background: var(--swAlertAccentSoft, #f7f0f6);
  border-bottom: 1px solid #d0d0d0;
  font-weight: 700;
  padding: 6px 8px;
}

.swBombThreatQuestionGrid {
  display: table;
  width: 100%;
  table-layout: fixed;
  border-bottom: 1px solid #d0d0d0;
}

.swBombThreatQuestionGrid > div {
  display: table-cell;
  padding: 8px;
  vertical-align: top;
  width: 50%;
}

.swBombThreatQuestionGrid ul {
  margin: 6px 0 0;
  padding-left: 20px;
}

.swBombThreatNotes {
  display: block;
  padding: 8px;
  font-weight: 700;
}

.swBombThreatNotes textarea {
  display: block;
  width: 100%;
  box-sizing: border-box;
  margin-top: 4px;
  resize: none;
  font: inherit;
  font-weight: 400;
}

.swBombThreatEvidenceActions {
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #d0d0d0;
  padding: 8px;
}

.swEvidenceReopenButton {
  margin-bottom: 8px;
}

.swReferenceActionButton {
  margin-bottom: 10px;
}

.swMiniForm {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
}

.swMiniFormField {
  display: block;
  width: 100%;
  font-weight: 700;
}

.swMiniFormField span {
  display: block;
  margin-bottom: 4px;
}

.swMiniFormField input,
.swMiniFormField textarea {
  width: 100%;
  box-sizing: border-box;
  font: inherit;
  font-weight: 400;
  padding: 6px;
}

.swChoiceRow {
  border: 1px solid #d0d0d0;
  margin: 0;
  padding: 8px;
}

.swChoiceRow legend {
  font-weight: 700;
}

.swChoiceRow label {
  margin-right: 12px;
}

.swDeconCommandGrid {
  display: table;
  width: 100%;
  table-layout: fixed;
  border-collapse: separate;
  border-spacing: 8px 0;
  margin: 0 -8px 8px;
}

.swDeconCommandCell {
  display: table-cell;
  border: 1px solid #d0d0d0;
  padding: 8px;
  vertical-align: top;
}

.swDeconCommandCell .swChoiceRow {
  border: 0;
  padding: 0;
}

.swDeconOptionalCalls {
  border-top: 1px solid #d0d0d0;
  margin-top: 12px;
  padding-top: 10px;
}

.swDeconOptionalCalls > span {
  display: block;
  font-weight: 700;
  margin-bottom: 6px;
}

.swDeconOptionalCalls .swPopupCheckboxField {
  display: block;
  margin: 6px 0;
}

.swCommunicationScriptQuote {
  width: 100%;
  margin-bottom: 8px;
  font-style: italic;
  white-space: pre-line;
}

.swContactTable {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 10px;
}

.swContactTable th,
.swContactTable td {
  border: 1px solid #c8c8c8;
  padding: 6px 8px;
  text-align: left;
  vertical-align: top;
}

.swContactTable th {
  background: var(--swAlertAccentSoft, #f7f0f6);
}

.swPopupCompletion {
  border: 1px solid #2f6f3e;
  color: #1f512b;
  font-weight: 700;
  padding: 10px;
  background: #f0f8f2;
}

.swDialogBackdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.swDialogFrame {
  width: 100%;
  max-width: 720px;
  background: #ffffff;
  border: 2px solid #6f1d62;
  padding: 16px;
}

.swDialogField {
  display: block;
  margin-bottom: 12px;
}

.swDialogField span {
  display: block;
  font-weight: 600;
  margin-bottom: 4px;
}

.swDialogField input,
.swDialogField textarea,
.swDialogField select {
  width: 100%;
  box-sizing: border-box;
}

.swDialogHint {
  color: #555555;
  margin: -4px 0 10px 0;
}

.swDialogCheckboxField {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.swDialogActions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.swPopupGuardBackdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
}

.swPopupGuardFrame {
  background: #ffffff;
  border: 2px solid #6f1d62;
  padding: 16px;
  max-width: 520px;
}

.swPopupGuardActions {
  display: flex;
  justify-content: flex-end;
}

.swModuleLauncherCard {
  border-top: 1px solid #e1dfdf;
  border-bottom: 0;
  border-left: 0;
  border-right: 0;
  background: #f9f9f9; 
  text-align: center;
  /* padding: 4px 8px 10px; */
  width: 100%;
  cursor: pointer;
}

.swModuleLauncherCard:hover,
.swModuleLauncherCard:focus {
  cursor: pointer;
}

.swModuleLauncherCard:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.swModuleLauncherIconWrap {
  display: flex;
  justify-content: center;
  margin-bottom: 8px;
}

.swModuleLauncherIcon {
  display: block;
  width: 132px;
  max-width: 100%;
  height: auto;
}

.swModuleLauncherTitle,
.swModuleLauncherSubtitle {
  display: block;
}

.swModuleLauncherTitle {
  color: #5b5b5b;
  font-size: 0.92rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  margin-bottom: 2px;
  text-transform: uppercase;
}


.swAlarmPanelWorkflow {
  --swAlertAccent: #a4262c;
  --swAlertAccentSoft: #f8e9eb;
}

.swAlarmPanelGroupGrid {
  display: grid;
  grid-template-columns: repeat(2, minmax(240px, 1fr));
  gap: 12px;
}

.swAlarmPanelGroup {
  border: 1px solid #b8b8b8;
  padding: 10px;
  margin: 0;
}

.swAlarmPanelGroup legend {
  color: #4f1140;
  font-weight: 700;
  padding: 0 6px;
}

.swAlarmPanelGroupRemote {
  grid-column: 1 / -1;
}

.swAlarmPanelGroupRemote .swAlarmPanelOptions {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.swAlarmPanelGroupFire,
.swAlarmPanelGroupGenerator,
.swAlarmPanelGroupCondition,
.swAlarmPanelGroupMedicalGas {
  min-height: 60px;
}

.swAlarmPanelOptions {
  display: block;
}

.swAlarmPanelChoice {
  display: block;
  width: 100%;
  min-height: 36px;
  margin: 0 0 8px 0;
  padding: 7px 10px;
  border: 1px solid #b8b8b8;
  border-left: 6px solid var(--swAlertAccent, #a4262c);
  background: #f7f7f7;
  color: #111111;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.swAlarmPanelGroupRemote .swAlarmPanelChoice {
  margin-bottom: 0;
}

.swAlarmPanelChoice:hover,
.swAlarmPanelChoice:focus,
.swAlarmPanelChoice.isSelected {
  border-color: #4f1140;
  background: var(--swAlertAccentSoft, #f8e9eb);
  outline: 2px solid transparent;
}

.swAlarmPanelSelected {
  border-left: 6px solid var(--swAlertAccent, #a4262c);
  background: var(--swAlertAccentSoft, #f8e9eb);
  font-weight: 700;
  margin-bottom: 10px;
  padding: 10px 12px;
}


.swAlarmPanelMaintenanceButton.isStamped {
  background: #f8f8f8;
  color: #666666;
  border-color: #c8c8c8;
}

.swAlarmPanelMaintenanceButton.isStamped:hover:not(:disabled) {
  background: #eeeeee;
  color: #333333;
}
.swAlarmPanelCheckbox {
  align-items: center;
  font-weight: 700;
  margin-top: 8px;
}

.swAlarmPanelScriptBox {
  border-left: 6px solid var(--swAlertAccent, #a4262c);
  background: #ffffff;
  margin-bottom: 10px;
  padding: 10px 12px;
  font-size: 1.05rem;
  line-height: 1.35;
  white-space: pre-line;
}
.swAdminPanel {
  background: #ffffff;
  color: #111111;
  font-family: "Segoe UI", Arial, sans-serif;
  padding: 20px;
  border-top: 4px solid #6f1d62;
}

.swAdminHeader {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 2px solid #6f1d62;
  padding-bottom: 12px;
  margin-bottom: 16px;
}

.swAdminHeader h1 {
  margin: 0;
  font-size: 1.6rem;
}

.swAdminEyebrow,
.swAdminMeta {
  color: #555555;
}

.swAdminMeta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: right;
}

.swAdminNotice {
  border: 1px solid #b8b8b8;
  background: #f7f7f7;
  padding: 10px 12px;
  margin-bottom: 14px;
}

.swAdminActions {
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
}

.swAdminPrimary {
  background: #6f1d62;
  color: #ffffff;
}

.swAdminStatusText,
.swAdminError {
  margin-bottom: 12px;
}

.swAdminError {
  border: 1px solid #aa2222;
  color: #aa2222;
  padding: 10px 12px;
}

.swAdminStatusGrid {
  display: grid;
  grid-template-columns: repeat(4, minmax(120px, 1fr));
  gap: 12px;
}

.swAdminCard,
.swAdminSection {
  border: 1px solid #b8b8b8;
  padding: 10px 12px;
}

.swAdminCard span,
.swAdminCard strong {
  display: block;
}

.swAdminCard strong {
  font-size: 1.1rem;
  margin-top: 4px;
}

.swAdminSection {
  grid-column: span 2;
}

.swAdminSectionWide {
  grid-column: 1 / -1;
}

.swAdminSection h2 {
  font-size: 1rem;
  margin: 0 0 8px 0;
}

.swPopupFrame.duiIntake,
.swPopupQueueItem.duiIntake,
.swDuiWorkflow {
  --swAlertAccent: #3c6e47;
  --swAlertAccentSoft: #eef7f0;
}

.swPopupFrame.duiIntake,
.swPopupQueueItem.duiIntake {
  border-color: var(--swAlertAccent);
}

.swPopupQueueItem.duiIntake.isActive {
  background: var(--swAlertAccent);
}

.swPopupFrame.duiIntake .swPopupAction-primary {
  background: var(--swAlertAccent);
}

.swDuiWorkflow {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  width: 100%;
  max-width: 1000px;
  align-self: flex-start;
}

.swDuiPaperForm,
.swDuiChecklistPanel,
.swDuiSubmitPanel {
  border: 1px solid #b8b8b8;
  padding: 10px 12px;
  background: #ffffff;
}

.swDuiHint {
  margin-bottom: 10px;
  color: #444444;
}

.swDuiFieldGrid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 14px;
  max-width: 1000px;
}

.swDuiFieldRow {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-weight: 700;
}

.swDuiFieldRowWide {
  grid-column: 1 / -1;
}

.swDuiFieldRow input,
.swDuiFieldRow textarea,
.swDuiFieldRow select {
  width: 100%;
  box-sizing: border-box;
  font: inherit;
  font-weight: 400;
  padding: 8px;
  border: 1px solid #b8b8b8;
  background: #ffffff;
}

.swDuiFieldRow select {
  font-size: 1rem;
  min-height: 40px;
}

.swDuiFieldRow small {
  color: #666666;
  font-weight: 400;
}

.swDuiChecklistRow {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  border-top: 1px solid #d0d0d0;
  padding: 10px 0;
}

.swDuiChecklistRow:first-of-type {
  border-top: 0;
  padding-top: 0;
}

.swPagingCompletionRow {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}

.swDuiSubmitPanel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}


.swDuiActionButton {
  border: 1px solid #8a8a8a;
  background: #efefef;
  color: #111111;
  font: inherit;
  font-size: 1rem;
  font-weight: 700;
  padding: 10px 16px;
  min-width: 220px;
}

.swDuiActionButton:hover:not(:disabled) {
  background: #e4e4e4;
}

.swDuiActionButton:disabled {
  background: #dcdcdc;
  color: #666666;
  border-color: #b8b8b8;
}

.swDuiActionButton-submit {
  min-width: 180px;
}

.swOrWorkflow {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  width: 100%;
  max-width: 1420px;
  align-self: flex-start;
}

.swOrToolbar {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.swOrStatusNote {
  color: #444444;
  font-weight: 400;
}

.swOrScriptBox {
  font-size: 1.125rem;
  line-height: 1.5;
  white-space: pre-line;
}

.swOrContactTable {
  table-layout: fixed;
}

.swOrDepartmentHint {
  margin-top: 4px;
  font-size: 0.95rem;
  color: #444444;
}

.swOrContactInput {
  width: 100%;
  box-sizing: border-box;
  font: inherit;
  font-weight: 400;
  padding: 8px;
  border: 0px solid #FFF;
  background: #ffffff;
}

.swOrStaffNameInput {
  font-size: 1.125rem;
}

.swOrPhoneNumberInput {
  font-size: 1.125rem;
}

.swOrContactState {
  margin-top: 10px;
  font-size: 1.05rem;
  font-weight: 600;
}

.swOrContactState-pending {
  color: #b42318;
}

.swOrContactState-complete {
  color: #107c10;
}

.swOrInitialsInput {
  width: 96px;
  max-width: 96px;
}

.swOrPhoneStack,
.swOrActionStack {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

@media (max-width: 1200px) {
  .swPopupHost {
    padding: 60px 20px 20px;
  }

  .swPopupSurface {
    max-height: calc(100vh - 80px);
    padding: 22px 26px 26px;
  }

  .swPopupHeader {
    gap: 20px;
  }

  .swPopupQueueStrip {
    flex-basis: 330px;
  }

  .swWorkflowCompactRow {
    flex-wrap: wrap;
  }

  .swWorkflowCompactRow .swWorkflowStep {
    flex-basis: calc(50% - 8px);
  }
}

@media (max-width: 900px) {
  .swPopupHost {
    align-items: stretch;
    padding: 54px 10px 10px;
  }

  .swPopupSurface {
    max-height: calc(100vh - 64px);
    min-height: 0;
    padding: 18px;
    border-radius: 10px;
  }

  .swPopupHeader {
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 14px;
  }

  .swPopupQueueStrip {
    flex: 1 1 100%;
    max-width: none;
    order: 1;
  }

  .swPopupHeading {
    flex-basis: calc(100% - 120px);
    order: 2;
  }

  .swPopupMeta {
    order: 3;
  }

  .swPopupFrame {
    padding-top: 18px;
  }

  .swDuiFieldGrid {
    grid-template-columns: 1fr;
  }

  .swDuiChecklistRow,
  .swDuiSubmitPanel,
  .swOrToolbar {
    flex-direction: column;
    align-items: stretch;
  }
}

@media (max-width: 620px) {
  .swWorkflowCompactRow .swWorkflowStep {
    flex-basis: 100%;
  }

  .swPopupTitle {
    font-size: 1.25rem;
  }

  .swPopupElapsed {
    font-size: 1.1rem;
  }

  .swWorkflowStepBody {
    padding: 16px;
  }
}

@media print {
  .swLeftNavRail,
  .swModuleColumn,
  .swDailyNotesToolbar,
  .swPopupHost {
    display: none !important;
  }

  .swOperatorConsolePage .swShellHeader,
  .swOperatorConsolePage .swShellBody {
    margin-left: 0 !important;
    width: 100% !important;
    box-shadow: none !important;
  }

  .swDailyNotesPanel {
    width: 100% !important;
    display: block !important;
    box-shadow: none !important;
  }
}
.swObWorkflow .swWorkflowStepBody {
  gap: 12px;
}

.swObAnnouncementBox {
  font-size: 1.15rem;
  font-weight: 700;
}

.swObRosterToolbar {
  align-items: center;
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.swObNoPedsToggle {
  margin-bottom: 12px;
}

.swObContactTable th:first-child,
.swObContactTable td:first-child {
  width: 54px;
}

.swObContactTable th,
.swObContactTable td {
  padding: 4px 6px;
}

.swObContactTable th:last-child,
.swObContactTable td:last-child {
  width: 190px;
}

.swObContactTable .swOrContactNotesInput {
  min-height: 48px;
}

.swObPhoneLine {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 8px 18px;
  min-height: 28px;
}

.swObPhoneNumber {
  font-size: 1.05rem;
  font-weight: 500;
  white-space: nowrap;
}

.swObSkippedRow {
  background: #f7f7f7;
  color: #666666;
}
`;

export function ensureShellStyles(): void {
  if (document.getElementById(styleElementId)) {
    return;
  }

  const styleElement = document.createElement("style");
  styleElement.id = styleElementId;
  styleElement.textContent = shellStyles;
  document.head.appendChild(styleElement);
}













