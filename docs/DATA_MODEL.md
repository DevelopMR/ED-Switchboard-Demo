# DATA_MODEL.md

# SharePoint List and Field Model

Use PascalCase internal names with no spaces or special characters. Enable version history for operational lists. Normal users should not delete records.

## Shared Field Principles

Every operational list should include native SharePoint fields plus explicit status fields where useful.

Native SharePoint fields:

- `Created`
- `Author`
- `Modified`
- `Editor`
- Version history

Common custom fields:

- `AppStatus`
- `AppNotes`
- `AppSourceModule`
- `AppSourceItemId`

## List: SwDailyNotes

Primary living switchboard log.

Suggested fields:

- `SwLogDate` Date
- `SwEventTime` DateTime
- `SwEntryType` Choice: GeneralNote, CodeAlert, OrCallIn, Dui, Paging, AlarmPanel, RiskmasterDemo, Other
- `SwTitle` Single line text
- `SwSummary` Multiple lines text
- `SwDetails` Multiple lines text/rich text
- `SwSourceModule` Single line text
- `SwSourceItemId` Single line text
- `SwSearchText` Multiple lines text/plain text optional normalized search helper
- `SwLocationText` Single line text optional
- `SwCategoryText` Single line text optional display/search helper
- `SwShift` Choice optional
- `SwOperatorName` Person/Text
- `SwIsPrinted` YesNo optional

Views:

- Today
- ByDate
- ByEntryType
- ByCategory
- Recent
- Search view

Notes:

- This list is the primary search-friendly datasource for the center Daily Notes experience.
- Right-column workflows should create corresponding `SwDailyNotes` entries with the appropriate `SwEntryType`.
- The UI may visually group entries into paper-form-inspired sections, but the storage model remains one-item-per-entry for searchability and simple filtering.
- Current Code Alert completion writes `SwLocationText`, uses `SwSourceItemId` for correlation/idempotency, and aligns `SwEventTime` with the demo SharePoint display-time path.

## Optional List: SwShellState

Optional lightweight shell metadata list if the project later needs date-level shell state that does not belong in `SwDailyNotes`.

Possible uses:

- Drawer counted metadata
- Future shell-only status indicators

Suggested fields:

- `SwStateDate` Date
- `SwDrawerCountData` Multiple lines text/plain text storing a structured JSON object
- `SwStateNotes` Multiple lines text optional

Notes:

- This list is optional and should only be introduced if drawer-count persistence needs to survive page reloads independently of normal note entries.
- Phase 1 should avoid overbuilding this area.

## Removed Code Alert Rule List

The former `CaAlertRules` SharePoint reference/provisioning list was removed in package `0.1.20`, along with its schema, seed data, setup UI, services, and runtime reads. Code Alert task flow, approved wording, branches, required actions, and terminal states are app-owned and developer-release controlled. The obsolete list may be deleted from the demo site after `0.1.20` is deployed.

## List: CodeAlerts

Operational alert items submitted by originator web parts or switchboard.

Suggested fields:

- `CaAlertId` Text unique
- `CaRuleId` Text required indexed
- `CaCategory` Text
- `CaAlertType` Text
- `CaShortLabel` Text
- `CaLocation` Text
- `CaEvidenceNotes` Multiple lines text optional and permitted only for approved alert types
- `CaClientRequestId` Text unique within originator endpoint for idempotency
- `CaOriginatorRequestItemId` Number, zero decimals, indexed source `CaOriginatorRequests` item ID
- `CaRequestType` Choice: Alert, AllClear
- `CaParentRequestId` Text optional; populated for All Clear rows with the original intake request ID
- `CaParentAlertId` Text optional; populated for All Clear rows with the original secured alert ID when found
- `CaSubmittedByName` Person/Text
- `CaSubmittedByObjectId` Text copied from the authoritative intake-list identity when available
- `CaSubmittedFromSiteUrl` Hyperlink/Text
- `CaOriginatorId` Text 24 chars
- `CaSwitchboardId` Text 24 chars
- `CaStatus` Choice: Submitted, Acknowledged, AnnouncementCompleted, Active, CancelRequested, Cancelled, AllClearRequested, AllClearAnnounced, NotCleared, Complete
- `CaSubmittedAt` DateTime
- `CaOriginatorRequestCreatedAt` DateTime copied from intake system `Created`
- `CaOriginatorRequestCreatedByName` Text copied from intake system `Created By`
- `CaOriginatorRequestCreatedByLogin` Text copied from intake identity
- `CaAcknowledgedAt` DateTime
- `CaAcknowledgedBy` Person/Text
- `CaAnnouncementCompletedAt` DateTime
- `CaAnnouncementCompletedBy` Person/Text
- `CaAllClearRequestedAt` DateTime
- `CaAllClearAnnouncedAt` DateTime
- `CaCancelledAt` DateTime
- `CaNotClearedAt` DateTime
- `CaResolutionNotes` Multiple lines text
- `CaDailyNoteId` Text optional indexed
- `CaPageLogId` Text optional indexed reference to the resulting `PgOverheadPageLog` item

The secured item's system `Created` and `Created By` identify the promotion process/service connection. The dedicated originator fields preserve the authoritative creation values from `CaOriginatorRequests`. `CaOriginatorRequestItemId` provides the direct acknowledgement-receipt update path; downstream IDs correlate final Daily Notes and page-log rows.

All Clear uses a paired but intentionally different request-type vocabulary. `CaOriginatorRequests.CaRequestType=AllClearRequest` means the remote originator asked switchboard to issue an All Clear. The Azure Function promotes that command into a secured `CodeAlerts` row with `CaRequestType=AllClear`, linked back to the original request/alert through `CaParentRequestId` and `CaParentAlertId`. The original secured alert is updated with `CaAllClearRequestedAt`; the All Clear announcement itself is tracked on the new All Clear row.

The speed-critical Azure Function signal must not carry these descriptive fields. The Function receives only identifiers, then reads the authoritative `CaOriginatorRequests` item before creating or updating `CodeAlerts`.

## List: CaOriginatorRequests

Central internal intake mailbox and originator receipt channel. It is available across site collections to authenticated internal SharePoint users through tightly scoped list permissions. Originators may create and read only their own items and may not edit/delete them.

Suggested fields:

- `Title` Text safe summary
- `CaRequestId` Text unique per originator endpoint
- `CaRequestType` Choice: Alert, AllClearRequest
- `CaParentRequestId` Text required for All Clear requests
- `CaOriginatorId` Text 24 chars
- `CaSwitchboardId` Text 24 chars
- `CaRuleId` Text
- `CaCategory` Text
- `CaAlertType` Text
- `CaLocation` Text composed display location
- `CaEvidenceNotes` Multiple lines text optional for approved alert types
- `CaIntakeStatus` Choice: Received, Validating, Promoted, Rejected, Failed, Acknowledged, Closed
- `CaSecureAlertId` Text service-written
- `CaAcknowledgedAt` DateTime service/switchboard-written
- `CaAcknowledgedByName` Text service/switchboard-written
- `CaTerminalStatus` Text service/switchboard-written
- `CaProcessedAt` DateTime service-written
- `CaSafeErrorCode` Text service-written; no payload echo

System `Created` and `Created By` are authoritative. Versioning is enabled. The Originator UI may offer facility, department/area, floor, direction, room, and additional-detail helpers, but it composes them into the single persisted `CaLocation` value. All Clear is a new append-only intake item with `CaRequestType=AllClearRequest` referencing the original request; originators never edit the original alert request.

The first Azure Functions signal endpoint accepts only the following pointer fields after this item is created:

- `requestItemId` Number matching the SharePoint item `ID`
- `requestId` Text matching `CaRequestId`
- `originatorId` Text matching `CaOriginatorId`
- `switchboardId` Text matching `CaSwitchboardId`

No `CaLocation`, `CaAlertType`, `CaCategory`, `CaEvidenceNotes`, patient-looking value, approved alert text, or free-text description may be sent through the signal payload.

## Azure Functions Signal Endpoint

Initial package: `packages/code-alert-functions`.

Initial route:

- `POST /api/code-alerts/intake-signal`

Initial request body:

- `requestItemId` positive integer
- `requestId` short alphanumeric/hyphen pointer
- `originatorId` alphanumeric routing identifier
- `switchboardId` alphanumeric routing identifier

Initial response body:

- `status` Accepted, Promoted, Rejected, or Failed
- `intakeStatus` safe originator-facing status
- `secureAlertId` optional when promotion has completed
- `errorCode` optional safe machine-readable code
- `message` safe human-readable message
- `correlationId` Function invocation identifier

The endpoint uses function key plus routing identifiers for the first demo slice. The function must re-read SharePoint by `requestItemId`/`requestId` and must not trust browser-supplied descriptive fields.

## List: CaActionLogs

Append-only action log for Code Alert actions.

Implementation status: modeled but not required for the basic Originator control. Intake/secured-list version history, flow history, and existing switchboard logs provide the planned demonstration record. Do not add click, keystroke, or navigation logging.

Suggested fields:

- `CaAlertId` Text
- `CaActionType` Choice: Acknowledge, AnnouncementCompleted, EpicBedPlanningConfirmedSent, EpicRespiratoryConfirmedSent, SecurityConfirmedNotified, MaintenanceConfirmedNotified, Call911Confirmed, CancelRequested, Cancelled, AllClearRequested, AllClearAnnounced, NotCleared, NotesUpdated
- `CaActionTime` DateTime
- `CaActionBy` Person/Text
- `CaActionNotes` Multiple lines text
- `CaEndpointId` Text
- `CaClientRequestId` Text
- `CaOutcome` Text

## List: RmDemoEntries

Internal demo-only record for simulated Riskmaster submissions.

This list must never represent a production Riskmaster submission. It stores the fake form submission, fake returned Riskmaster code, and enough source metadata for the Code Alert popup to confirm the manual copy-back step.

Suggested fields:

- `Title` Single line text summary
- `RmSubmittedAt` DateTime
- `RmOperator` Text
- `RmAlertType` Choice: Medical, Facility, Security, Other
- `RmCondition` Text
- `RmLocation` Text
- `RmFacility` Text
- `RmDepartment` Text
- `RmRoom` Text
- `RmDateOfCall` DateTime
- `RmAllClearDateTime` DateTime optional
- `Rm911Alerted` YesNo
- `Rm911Cancelled` YesNo
- `RmEventDescription` Multiple lines text/plain text
- `RmReceiptCode` Text fake code, for example `RM-DEMO-20260614-0001`
- `RmStatus` Choice: Staged, Submitted, CodeReturned, CopiedBack, LoggedToSpreadsheet, Cancelled
- `RmSourcePopupId` Text
- `RmSourceAlertId` Text optional
- `RmPayloadJson` Multiple lines text/plain text optional internal demo payload
- `RmNotes` Multiple lines text

Notes:

- Use only clearly fake patient-like values when test data needs to exercise sensitive-looking fields.
- Do not connect this list to production Riskmaster.
- A later manual-assist experiment may test whether a real Riskmaster page can be prepopulated through URL/query parameters, but it must not submit or write to production.
- Current implementation creates a row with `RmStatus = CodeReturned` and updates it to `CopiedBack` when the operator confirms the returned fake receipt in the popup.

## List: PgOverheadPageLog

Structured SharePoint mirror for the proof-of-concept overhead page log spreadsheet.

The visible proof-of-concept artifact remains an Excel workbook stored in a SharePoint document library. This list is the app-facing structured write target. A later phase may append list rows into the workbook through Graph, Power Automate, or Office Script.

Suggested fields:

- `Title` Single line text
- `PgPageDateTime` DateTime
- `PgPageType` Choice: CodeAlert, Paging, AlarmPanel, Other
- `PgMessageText` Multiple lines text/plain text
- `PgLocation` Text
- `PgAlertCategory` Choice: Medical, Facility, Security, Other
- `PgDescriptionOfAlert` Multiple lines text/plain text
- `PgCallerName` Text
- `PgUnitDepartment` Text
- `PgPatientName` Text fake/synthetic only
- `PgPatientMrn` Text fake/synthetic only
- `PgPatientDob` Date fake/synthetic only
- `PgPatientSsn` Text fake/synthetic only
- `PgAllClearDateTime` DateTime optional
- `PgAdditionalInfo` Multiple lines text/plain text
- `PgSwitchboard` Text
- `PgRiskmasterCode` Text fake code copied back from `RmDemoEntries`
- `PgSourceModule` Text
- `PgSourceItemId` Text
- `PgOperatorName` Text
- `PgStatus` Choice: Logged, Cancelled, AllClear, Test
- `PgNotes` Multiple lines text

Notes:

- The list mirrors spreadsheet columns while preserving searchable SharePoint records.
- `PgPageType` remains the broad workflow type. `PgAlertCategory` stores Medical, Facility, or Security.
- Sensitive-looking columns are allowed for demo fidelity but must contain only obvious fake values.
- Current service deduplicates final rows by `PgSourceItemId` so repeated completion handling does not create duplicate page-log rows.

## List: CodeAlertEndpoints

Routing/validation registry on switchboard site.

Suggested fields:

- `EndpointId` Text 24 chars
- `EndpointType` Choice: Originator, Switchboard
- `DisplayName` Text
- `SiteUrl` Hyperlink/Text
- `OriginatorId` Text 24 chars
- `SwitchboardId` Text 24 chars
- `IsActive` YesNo
- `AllowedCategories` Multiple lines text or controlled JSON
- `AllowedAlertTypes` Multiple lines text or controlled JSON
- `DefaultFacility` Text
- `DefaultDepartment` Text
- `DefaultUnit` Text
- `DefaultFloor` Text
- `DefaultDirection` Text
- `DefaultRoom` Text
- `DefaultAdditionalLocation` Text
- `Notes` Multiple lines text

Endpoint IDs are visible routing identifiers, not passwords. The promotion flow validates routing and copies authoritative SharePoint intake identity/timestamps before writing `CodeAlerts`.

## List: OrCallIns

Parent OR Call-In record.

Suggested fields:

- `OrCallInId` Text unique
- `OrDate` Date
- `OrTimeContacted` DateTime
- `OrAodName` Text
- `OrProcedure` Text
- `OrSurgeon` Text
- `OrSurgeryDateTime` DateTime required
- `OrSurgeryStatus` Choice: Stat, UrgentEmergent, Routine
- `OrCovidStatus` Choice: Yes, No, Unknown
- `OrCArmRequired` YesNo
- `OrRadiologyContactedTime` DateTime
- `OrAodCallbackTime` DateTime
- `OrOperatorInitials` Text
- `OrCallInScript` Multiple lines text or plain text
- `OrStatus` Choice: Draft, Calling, Complete, Issue
- `OrNotes` Multiple lines text
- `OrTeamCallInNotes` Multiple lines text
- `OrDailyNoteId` Text/Lookup

## List: OrCallInContacts

Child rows for OR role contacts.

Suggested fields:

- `OrCallInId` Text/Lookup
- `OrRole` Text/Choice: Anesthesiologist, AnesthesiaNurse, OrNurse, ScrubOrTech, SurgicalTechFirstAssist, RecoveryNurse, Radiology
- `OrStaffName` Text
- `OrPhoneOne` Text
- `OrPhoneTwo` Text
- `OrTimeContacted` DateTime
- `OrContactNotes` Multiple lines text
- `OrSortOrder` Number

## List: DuiIntakes

DUI intake record. Use synthetic data only.

Suggested fields:

- `DuIntakeId` Text unique
- `DuDate` DateTime
- `DuDob` Text or Date for synthetic demo only
- `DuSsn` Text for fake data only
- `DuNameLastFirst` Text
- `DuPoliceDepartment` Choice with fill-in allowed; default `State Police`
- `DuPoliceOfficer` Text
- `DuPoliceIncidentNumber` Text
- `DuRegistrationNumber` Text fake only
- `DuSecurityNotified` YesNo
- `DuSecurityNotifiedAt` DateTime
- `DuLabNotified` YesNo
- `DuLabNotifiedAt` DateTime
- `DuRegistered` YesNo
- `DuRegisteredAt` DateTime
- `DuNotes` Multiple lines text
- `DuDailyNoteId` Text/Lookup

## List: PagingLogs

Paging log record.

Suggested fields:

- `PgLogId` Text unique
- `PgDateTime` DateTime
- `PgWhoCalled` Text
- `PgFromWhere` Text
- `PgCallbackNumber` Text
- `PgWhoNeededPaged` Text
- `PgDepartment` Text
- `PgPersonOnCallPhoneNumber` Text
- `PgSuccess` YesNo default `No`
- `PgNotes` Multiple lines text
- `PgDailyNoteId` Text/Lookup

## List: AlarmPanelLogs

Alarm panel event record.

Suggested fields:

- `AlLogId` Text unique
- `AlAlarmType` Choice: BoilerAlarm, Gen1, Gen2, FireAlarm, Bathroom, ConditionA, MedicalGasPanel
- `AlAlarmTime` DateTime
- `AlDescription` Multiple lines text
- `AlMaintenanceContactedTime` DateTime
- `AlActionTaken` Multiple lines text
- `AlNotes` Multiple lines text
- `AlDailyNoteId` Text/Lookup

## Optional Shared Action/Contact Pattern

Earlier discussion used the term `ContactLogs`. This should not become mandatory infrastructure unless useful. It means a reusable child-row list for modules that need multiple contact timestamps.

For this project, use module-specific child rows where the module clearly needs them:

- OR Call-In uses `OrCallInContacts`.
- Code Alerts use `CaActionLogs`.
- DUI can store its three checklist timestamps directly on `DuiIntakes`.
- Alarm Panel can store Maintenance timestamp directly.
- Paging Log can store one record directly.

Avoid overbuilding a universal shared contact log in Phase 1.





