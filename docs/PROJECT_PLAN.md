# PROJECT_PLAN.md

# ED Switchboard SharePoint Proof-of-Concept Project Plan

## Project Goal

Create a modular SharePoint Online / SPFx demonstration system for an ED switchboard operator console. The system centers around the ED Switchboard Daily Notes log and a set of right-sidebar operational modules:

- Code Alert
- OR Team Call-In
- DUI Intake
- Paging Log
- Alarm Panel Log

The system must be safe, modular, deployable, and proof-of-concept oriented before polish.

## Project Philosophy

The switchboard operator must not have to solve interface puzzles in stressful moments. The UI must show exactly what is needed, in the order it is needed, with stable layouts and obvious actions.

This is an operator console, not a general website.

## Safety and Privacy

- No production system writes.
- No real patient data.
- No PHI.
- No real MRNs, DOBs, SSNs, or patient identities.
- All patient-related examples are synthetic.
- Critical systems such as Epic, Riskmaster, MedTrak, paging systems, phone directories, and production spreadsheets are read-only if approved or fully mocked.

## Deployment Strategy

Each subcomponent should be deployable independently to demonstrate deployment agility.

Some modules will be tested in the ED Switchboard site. Others may be tested in separate SharePoint site collections.

Current repository structure:

```text
/packages
  /switchboard-core-spfx
  /code-alert-spfx
  /code-alert-functions
  /or-call-in-spfx
  /dui-intake-spfx
  /paging-log-spfx
  /alarm-panel-spfx
/provisioning
/test-data
/docs
```

Manual setup is acceptable in Phase 1 if documented. Automation/provisioning can follow.

## Current Status - July 2026

- Phases 0-2 are complete for the proof of concept.
- Phase 2.5 Code Alert rule-list experiment was removed in package `0.1.20`.
- Phase 3 switchboard Code Alert form/backend remains in closeout, with the operator workflow and internal demo logging path behaving as expected in live proof-of-concept testing.
- Phase 3.5 Code Alert Originator is demo-ready. It has a verified Azure Functions promotion path, verified switchboard polling/provider implementation, acknowledgement/closure receipts, and offsite All Clear request promotion into the compact switchboard All Clear workflow.
- The Azure Function latency pass now reuses warm-instance Graph authentication and SharePoint identifiers, supports verified site/list IDs to eliminate discovery calls, and emits PHI-safe stage timings. Package `0.1.8` was deployed and verified on `2026-08-09`; optional direct IDs and Flex Consumption always-ready remain separate manual decisions.
- Phase 4 OR Call-In is functionally complete inside `switchboard-core-spfx`, including timestamp-filtered mock MedTrak roster loading, queue-safe interruption/resume behavior, parent-plus-child SharePoint writes, and Daily Notes logging. Package `1.0.1.24` fixes later-role truncation in multi-month rosters by filtering in SharePoint before applying the query row limit.
- Phase 5 DUI Intake is functionally complete inside `switchboard-core-spfx`, using the shared popup host so Code Alerts can interrupt and the DUI form can be resumed afterward.
- Phase 6 Paging Log is functionally complete inside `switchboard-core-spfx`, including proofed popup interruption/resume behavior and Daily Notes logging.
- Phase 7 Alarm Panel is functionally complete inside `switchboard-core-spfx`, including compact panel selection, conditional Maintenance scripting/contact stamping, `AlarmPanelLogs` writes, and Daily Notes logging.
- A short styling cleanup pass is complete on the switchboard shell, including targeted SharePoint chrome suppression on the operator page, a custom left reference menu driven by `SwReferenceLinks`, image-based workflow launchers in the right rail, and a second pass toward a softer card-based log surface.
- The `Refine Code Alert Forms` phase has started. The switchboard-local Code Alert originator is isolated from the offsite originator path and uses a leaner local launch surface that hands directly into the switchboard popup workflow. The offsite originator launcher/popup is separately demo-ready with acknowledgement, closure, and All Clear status handling.
- No blocking issues are currently open on OR Call-In, DUI Intake, or Paging Log. Remaining work is polish, styling consolidation, and any later workflow refinements.
- See `docs/CODE_ALERT_FORM_PHASE_CLOSEOUT.md` and `docs/CODE_ALERT_AZURE_FUNCTION_SIGNAL_SETUP.md` for the latest verified Code Alert behavior.

## Phase 0: Repo and Safety Setup

Deliverables:

- AGENTS.md with safety rules.
- ARCHITECTURE.md.
- DATA_MODEL.md.
- Project README.
- Basic SPFx workspace.
- Shared naming convention and TypeScript types.

Acceptance:

- CODEX has explicit instructions not to write to production systems.
- No sample data contains real PHI.
- Module prefixes and naming rules are documented.

## Phase 1: Switchboard Console Shell

Build the main ED Switchboard page shell.

Features:

- Three-column layout under existing SharePoint header/banner.
- Compact shell header under the purple header band with `ED Switchboard Log`.
- Left reference column.
- Center Daily Notes panel.
- Right launcher column.
- Leave-page warning concept if practical.
- Launchers for Code Alert, OR Call-In, DUI, Paging Log, Alarm Panel.
- Shared full-screen Alert Surface Panel foundation.
- Search-ready architecture from the beginning.

Acceptance:

- Page visually behaves like an operator console.
- Launchers open placeholder popup panels.
- Shared popup surface is shell-owned and treated as the operator's primary task when active.
- No critical workflow depends on complex responsive layout.

## Phase 2: Daily Notes Core

Build `SwDailyNotes` list and center log display.

Features:

- Display by date.
- Today view.
- Previous/next day controls.
- Search from the start, including date/category-oriented retrieval mindset.
- Manual entry.
- Expandable long entries.
- Print-friendly view.
- Paper-form-inspired visual grouping for:
  - Recent Codes
  - Recent Alarms and Maintenance Calls
  - Other Important Notes
- Drawer-counted interaction stored as simple structured shell metadata, not a separate operational list.

Acceptance:

- Manual entries can be added.
- Module-generated entries can be displayed.
- Notes can be searched by date, category, and relevant text.
- Created/Modified history is preserved.

## Phase 2.5: Removed Code Alert Rule-List Experiment

Status: removed in package `0.1.20`.

The former `CaAlertRules` reference/provisioning experiment and setup surface were completely removed. The 23 released workflows are app-owned and release-controlled, with no SharePoint rule-list runtime dependency. This closes the earlier governance and stale-inventory concern.

## Phase 3: Switchboard Code Alert Form and Backend

Status: late closeout.

Build the switchboard/operator-side Code Alert experience and internal demo logging backend. The operator/test launcher is intentionally not the future Originator interface.

Features:

- Code Alert task flow, branch logic, required actions, and terminal paths are implemented in TypeScript and require a developer release to change.
- Create a small shared Code Alert framework for common popup structure, task rendering, guarded close, copy-text controls, linked-reference popovers, completion handling, and logging hooks.
- Create unique `.tsx` workflow modules for each Code Alert type instead of concentrating all logic in `CodeBlueAdultWorkflow.tsx`.
- Share common components where they reduce duplication without hiding critical alert behavior.
- Twenty-three app-owned alert workflow modules are available from the operator/test launcher.
- Full-screen Alert Surface Panel opens for a launched alert.
- Operator acknowledgment is timestamped.
- Announcement phrase is generated conservatively from approved rule fields.
- Approved instructions and task copy are owned by the app. Linked reference documents may live in a SharePoint document library when useful.
- Logging controls appear close to related instruction text.
- Riskmaster is simulated with an internal demo form opened in a separate window. The operator manually copies the returned fake Riskmaster code back into the Code Alert popup.
- The simulated Riskmaster step writes only to the internal `RmDemoEntries` SharePoint list.
- The Code Alert popup then writes one final switchboard log row and one structured `PgOverheadPageLog` row. The `PgOverheadPageLog` list mirrors the proof-of-concept Excel overhead page log.
- The visible overhead page log spreadsheet remains a spreadsheet artifact for the proof of concept. Appending directly into the workbook can be added after the list-backed flow is stable.
- Complete cross-alert terminal states, refresh restoration, and per-action persistence now extend through the persisted Originator/intake lifecycle.
- Daily Notes entry created where appropriate.

Acceptance:

- Launch a fake Code Alert from the internal operator/test launcher.
- Operator can acknowledge, complete announcement, confirm actions, and resolve.
- No external system writes.
- No production Riskmaster, Epic, paging, spreadsheet, or alarm system writes.
- Riskmaster receipts are fake and generated only by the internal demo surface.
- Site admins cannot change Code Alert task flow through SharePoint list editing.
- Exactly one correlated row is written to each applicable internal demo log.

Implementation direction:

- Extract the current guided Code Alert structure into a default Code Alert framework.
- Keep `CodeBlueAdultWorkflow.tsx` or rename/split it as part of the extraction.
- Add one workflow module per alert, for example:
  - `CodeBlueAdultWorkflow.tsx`
  - `CodeBluePediatricWorkflow.tsx`
  - `ConditionHelpWorkflow.tsx`
  - `WelfareCheckWorkflow.tsx`
  - `ObstetricEmergencyWorkflow.tsx`
  - `RapidResponseAdultWorkflow.tsx`
  - `RapidResponsePediatricWorkflow.tsx`
- Keep styling split between structural classes and alert color classes.
- Treat phone/contact labels as placeholders unless an approved read-only internal source is introduced later.
- Treat any future real Riskmaster URL prefill experiment as a read-only/manual-assist investigation. The released proof of concept must not submit to production Riskmaster.

## Phase 3.5: Code Alert Originator Interface

Status: functionally complete / demo-ready.

Build a lightweight remote Originator web part as an independently installed package. The switchboard remains the hub and does not deploy its operator workflow implementation to remote sites.

Planned scope:

- A collapsed right-rail-style Code Alert launcher using the current Code Alert icon. The launcher opens the remote Originator form in a centered popup layer so partner-team pages keep their own layout intact.
- Originator-specific alert discovery and selection.
- Facility and team/department web part properties preload the location form and title text. Facility is locked in the popup for offsite users; department/team remains editable in the popup. Room and additional-detail remain form-entry fields only, not property-pane presets.
- Editable department/area, floor, direction, room, and additional-location form helpers; individual values may be omitted, but they are submitted as one clear composed `CaLocation` string.
- Clear location and instruction validation, with new request creation blocked while an active offsite request is still awaiting switchboard acknowledgement.
- Submission to a central append-only `CaOriginatorRequests` SharePoint mailbox; internal users can create/read only their own requests and receive no direct permission to secured `CodeAlerts`.
- Immediate Azure Functions pointer-only signal after list creation. The API transmits only request/list routing identifiers, then re-reads SharePoint for authoritative alert details.
- Function-based promotion with endpoint validation, idempotency, service-controlled hub writes, and copied SharePoint `Created`/`Created By` originator values.
- The existing Power Automate promotion flow is retained as a documented fallback/proof path, not the preferred speed-critical transport.
- Category-grouped alert selection using release-controlled frequency ordering.
- Optional evidence/details only for approved alerts, beginning with Bomb Threat and possibly Child Abduction.
- Sent-state display, a fast direct switchboard-to-intake acknowledgement receipt, multiple-active-alert tracking, drop/reload recovery, and an append-only `Request All Clear` command path.
- All Clear requests use the strongest-isolation path: the remote originator creates only a new append-only `AllClearRequest` intake command, while the Azure Function promotes a separate secured `AllClear` switchboard workflow with parent correlation.
- Switchboard intake/polling behind a provider abstraction.
- Synthetic/demo data only and no external-system writes.

Verified so far:

- The Originator package writes `CaOriginatorRequests`.
- Azure Functions promotion moves intake rows from `Received` to `Promoted` and clears stale safe-error codes.
- The switchboard shell polls secured `CodeAlerts` rows by `CaSwitchboardId` and opens matching popup workflows automatically.
- Operator acknowledgement writes the Originator receipt to `Acknowledged`.
- Full workflow completion writes the Originator receipt to `Closed` and updates the switchboard log.
- All Clear implementation is now wired for the offsite originator, Azure Function promotion, and compact two-step switchboard popup workflow. The switchboard core accepts both `AllClear` and the live SharePoint choice value `Allclear`, preserves the original alert color/category, and uses only Acknowledge plus Read Announcement 3 Times with the generated `+ All Clear` announcement. Acknowledged originator rows remain visible for five minutes to support All Clear requests before dropping from the active view.
- Live proof-of-concept testing confirmed the updated Azure communication channel now promotes offsite alerts and All Clear requests through the switchboard popup layer. Phase 3.5 can be shown in demo as a complete remote-originator workflow, with remaining work limited to later styling polish and broader hardening.

Do not treat the existing operator/test launcher as the Originator design starting point without a separate UX review.

## Phase 4: OR Call-In Module

Status: functionally complete in `switchboard-core-spfx`.

Build OR Call-In workspace.

Features:

- Replicate paper OR Call-In Log layout in the shared popup host.
- Trigger mock MedTrak roster lookup manually from the OR team section after surgery date/time is entered.
- Populate rows from the mock roster list while still allowing manual edits.
- Generate a read-back script between the AOD intake fields and the call table.
- Add a `Contacted by AOD` button for the Anesthesiologist row.
- Surgical Tech 1st Assist remains optional and does not block completion.
- Remove the retired SPOK paging step from the workflow.
- Contact buttons stamp the current datetime for each team row.
- Require switchboard operator initials before final submit.
- Aggregate operator-written row notes into `OrTeamCallInNotes` on the parent record.
- Completion creates a parent record, child contact rows, and a Daily Notes entry.
- The OR popup remains queue-safe so Code Alerts can interrupt and the draft can resume afterward.

Acceptance:

- User can complete a mock call-in event.
- Contact timestamps are captured.
- Anesthesiologist `Contacted by AOD` state is preserved.
- Parent and child SharePoint rows are written successfully.
- Daily Notes entry is generated.

## Phase 5: DUI Intake Module

Status: functionally complete in `switchboard-core-spfx`.

Build DUI Intake popup.

Features:

- Replicate DUI intake form in the shared switchboard popup host first.
- Synthetic data only.
- Checklist:
  - Security notified
  - Lab notified
  - DUI registered
- Submit writes `DuiIntakes` and Daily Notes. The popup remains queue-safe so a Code Alert can interrupt without losing the in-progress DUI form.

Acceptance:

- Fake DUI intake can be logged.
- Checklist timestamps are preserved.
- Popup state survives Code Alert interruption and resumes without losing entered data.
- Daily Notes entry is generated.

## Phase 6: Paging Log Module

Status: functionally complete in `switchboard-core-spfx`.

Build Paging Log popup.

Features:

- Replicate paper paging form.
- Phone directory search button stub.
- One required completion task: `Page Complete`, which closes the popup after the log row is written.
- Submit writes `PagingLogs` and Daily Notes.
- Paging draft values remain queued safely if a Code Alert interrupts the form.

Acceptance:

- Paging record can be created.
- Popup state survives Code Alert interruption and resumes without losing entered data.
- Daily Notes entry is generated.

## Phase 6.5: Switchboard Shell Style Cleanup

Status: complete for the current proof-of-concept pass; second visual refinement pass underway.

Build and refine the switchboard-only operator shell presentation so the main log page behaves more like a focused console and less like a general SharePoint site.

Features:

- Hide targeted SharePoint chrome on the switchboard operator page only, including the left app rail, command bar, search box, and site header where appropriate.
- Preserve standard SharePoint behavior outside the switchboard operator surface.
- Replace the native left navigation on the operator page with a custom menu sourced from the `SwReferenceLinks` SharePoint list.
- Support menu preview by query string role override for local testing, while keeping the final design compatible with SharePoint group-based visibility.
- Open reference links in a new browser window so the live switchboard log page is protected from accidental navigation loss.
- Add image-based right-rail workflow launchers with hover text and pointer affordance.
- Tighten right-rail styling so the workflow column reads as a clean utility rail rather than a boxed card stack.
- Add optional `SwIconKey` support for the custom left reference menu so SharePoint list items can show simple operator-friendly navigation icons.
- Move the daily log surface toward the concept-art direction with a softer background, rounded shell edges, light shadows, and rounded internal sections where safe.
- Hide the custom left navigation in print output so printed logs focus on the Daily Notes content.

Acceptance:

- The switchboard operator page shows only the focused console chrome needed for the demo.
- The custom left navigation reads from `SwReferenceLinks` and can display lightweight icons from `SwIconKey`.
- Reference links open away from the live switchboard log page.
- The right workflow rail uses image launchers and remains visually clear during live demonstration.

## Phase 6.75: Shared Popup Layer Styling Refresh

Status: implementation underway on feature/popup-layer-style-refresh.

Refine the shared operator popup layer using the August 2026 concept direction while preserving every approved workflow, action, and demo-only persistence boundary.

Features:

- Keep the underlying SharePoint Switchboard page visible beneath a neutral translucent backdrop for operator orientation.
- Make the underlying page and SharePoint chrome unavailable to pointer, keyboard, and assistive-technology interaction while a popup workflow is active.
- Present the active workflow in a centered white task surface with a calm shadow, restrained rounding, and reliable internal scrolling.
- Combine the active queue card, alert title/location, and elapsed time into one stable popup header.
- Reuse the existing app-owned alert color mapping for queue cards, current-step markers, borders, elapsed state, and primary actions.
- Provide contrast-safe foreground colors for light alert accents.
- Compress completed Code Alert steps into four-card desktop rows while keeping the current task expanded and numbered.
- Preserve multi-alert queue visibility, Code Alert priority, interruption/resume behavior, and draft retention.
- Trap Tab and Shift+Tab inside the active popup, restore focus after terminal close, and prevent Escape from dismissing or completing a workflow.
- Apply the shared surface safely to Code Alerts, OR Call-In, DUI Intake, Paging Log, and Alarm Panel without changing their business logic.

Acceptance:

- Initial and partially completed Stroke Alert states visually follow the approved concept direction.
- Every Code Alert operator timer begins at 0 sec when its popup is created; persisted submission and audit timestamps remain unchanged.
- The staffed Switchboard console defaults to one-second sequential `CodeAlerts` polling and refreshes immediately when its tab regains focus or visibility.
- The underlying SharePoint page remains visible but cannot receive pointer or keyboard interaction.
- Alert colors remain recognizable and readable without relying on color alone.
- Multiple queued workflows remain obvious and selectable when actions are not locked.
- Existing Ctrl+Enter behavior continues where supported, and no keyboard shortcut cancels, clears, deletes, or resolves an alert.
- All workflows retain their current wording, task order, SharePoint writes, and terminal-state behavior.

## Phase 3.75: Refine Code Alert Forms

Status: implementation underway.

Refine the two Code Alert originator surfaces so the switchboard-local version is lean and direct, while the offsite-originator version remains purpose-built for remote initiation and acknowledgement tracking.

Planned scope:

- Rebuild the switchboard-side Code Alert originator surface inside `switchboard-core-spfx` using the stronger pieces of the current offsite-originator form. The first isolated local version is in place and now omits the remote-originator status/acknowledgement clutter.
- Remove switchboard-local UI that is no longer needed when the switchboard operator is the person initiating the alert:
  - remote-originator sent/awaiting acknowledgement status blocks
  - switchboard acknowledgement handoff steps
  - Azure Function promotion dependency for the local switchboard launch path
- Keep the shared alert category selection, alert metadata, and composed location-entry model aligned between switchboard and offsite experiences.
- Add a `Facility` web part parameter to the switchboard Code Alert launcher surface, defaulted to `HOS`, with the form field preloaded but still editable.
- After local switchboard submission, hand control directly into the existing switchboard Code Alert popup workflow so the current guided task flow continues unchanged.
- Refine the offsite originator package separately after the switchboard-local surface is stable.
- Rework the offsite web part into an icon-driven wait state using the `sbCodeAlert-i.png` launcher image in the right rail/right column pattern.
- Add the same configurable default `Facility` parameter to the offsite web part. For offsite users, the Facility field is preloaded and locked, while the team/department preset remains editable.
- Preserve the offsite acknowledgement/promotion channel for remote use cases, because that transport is still needed when the request originates away from the switchboard.
- Add an Obstetrics Emergency refinement branch to the switchboard Code Alert workflow. The current paper process requires overhead page wording plus contact tasks for Obstetrician, Pediatric Hospitalist, Anesthesiologist, Anesthesia Nurse, AOD, and Laboratory.
- Reuse the mock MedTrak roster-loading pattern for Obstetrics Emergency where appropriate. `OrMedTrakRoster` supports `Obstetrician` and `PediatricHospitalist`; static demo contacts cover fixed-number AOD/Laboratory until a broader directory model exists.
- Keep the Obstetrics refinement internal-demo only. It must not call, page, notify, or write to real clinical systems.
- Implementation now uses an isolated Obstetrics popup workflow inside `switchboard-core-spfx`, with ordered contact actions for Obstetrician, Pediatric Hospitalist, Anesthesiologist, Anesthesia Nurse, AOD, and Laboratory. The Pediatric Hospitalist row can be skipped when the birthing center says no Peds.
- Code Alert popup draft preservation now includes Code Alert workflows so roster-loaded contacts and typed operator notes survive interruption by another popup.

Implementation direction:

- Treat the switchboard-local and offsite originator surfaces as separate applications, not one giant conditional form.
- Do not share React components, popup-host code, transport services, or page-specific UI wiring between the two packages unless a later maintenance issue truly forces it.
- Keep any overlap minimal and business-rule oriented: at most tiny shared vocabulary such as alert definitions, payload types, or location-composition rules, and even those may be duplicated when isolation is more valuable.
- Build the switchboard-local refinement first inside `switchboard-core-spfx`, test it thoroughly, and only then begin the offsite-originator cleanup pass.
- Keep switchboard-local submission fully inside approved internal demo SharePoint paths.
- Preserve the current offsite Azure Functions promotion path until the offsite refinement phase is complete and reverified.

Acceptance:

- The switchboard-local Code Alert originator is visually leaner and no longer shows remote-originator acknowledgement clutter.
- A switchboard operator can launch a Code Alert locally and flow directly into the existing popup workflow.
- The offsite originator remains available as a separate remote-start experience.
- Both surfaces honor configurable default location values; offsite Facility is locked for safety, while team/department remains editable.

## Phase 7: Alarm Panel Module

Status: functionally complete in `switchboard-core-spfx`.

Build a one-shot Alarm Panel popup for switchboard-room alarm panels and the Condition A phone. This workflow records the event, requires Maintenance contact only where appropriate, writes one `AlarmPanelLogs` row, and creates a Switchboard Daily Notes entry. There is no long-running status field; once submitted, the event is complete.

Features:

- Upper source selection for the five switchboard alarm/phone sources:
  - Remote Alarm Panel (Boiler/Env)
  - Generator Alarm
  - Medical Gas Master Alarm Panel
  - Fire Alarm (Code Red) Panel
  - Condition A Phone
- Lower detail area changes based on the selected source.
- Remote Alarm Panel choices include Boiler Alarm, AHU-1 through AHU-8 Low Temp Alarm, and Chiller CH-1/CH-2 High Temp Alarm.
- Generator choices include Generator 1 and Generator 2.
- Medical Gas requires a plain text alarm-type detail field.
- Fire Alarm choices include Fire Alarm, Priority 2 Alarm, System Supervisory, and System Trouble.
- Condition A requires a comments field.
- Fire Alarm and Condition A include a boolean `Was Code Alert called?` field, default `No`. This is documentation only and does not trigger a real Code Alert.
- Maintenance contact is required only for Remote Alarm Panel, Generator Alarm, and Medical Gas Master Alarm Panel. The UI instructs the operator to call `333-444-5555`, generates a short two-line WKRC switchboard read script, and stamps the contact time.
- Fire Alarm Code Red and Condition A Phone do not require Maintenance contact or display the Maintenance script/contact section.
- Submit writes `AlarmPanelLogs` and Daily Notes, then closes with the standard green completion response.

`AlarmPanelLogs` schema:

- `Title` - Single line text, app-generated.
- `AlAlarmSource` - Choice, required; stores the selected alarm/sub-option.
- `AlPanelGroup` - Choice, required/app-filled; `Remote Alarm Panel`, `Generator Alarm`, `Medical Gas Master Alarm Panel`, `Fire Alarm Code Red`, `Condition A`.
- `AlAlarmDetails` - Multiple lines of text, plain text; optional generally, required in the UI for Medical Gas and Condition A.
- `AlMaintenanceContacted` - Yes/No, default `No`; required by UI only for Remote Alarm Panel, Generator Alarm, and Medical Gas.
- `AlMaintenanceContactedAt` - Date and time; app-filled when Maintenance contact is stamped.
- `AlMaintenanceScript` - Multiple lines of text, plain text; app-filled from the generated script when Maintenance contact is required.
- `AlCodeAlertCalled` - Yes/No, default `No`; used only for Fire Alarm Code Red and Condition A documentation.
- `AlLoggedAt` - Date and time; app-filled on submit.
- `AlOperatorName` - Single line text; app-filled with the current demo operator name.

Acceptance:

- Alarm event can be logged with no `AlStatus` column.
- Maintenance contact time can be stamped and is required before submit for Remote Alarm Panel, Generator Alarm, and Medical Gas only.
- Fire Alarm Code Red and Condition A Phone submit without Maintenance contact.
- Fire Alarm and Condition A can record whether a Code Alert was separately called without launching one.
- `AlarmPanelLogs` receives one completed row.
- Daily Notes entry is generated.

## Phase 8: Demo Packaging

Package the proof of concept for repeatable setup.

Deliverables:

- SPFx packages.
- List schema documentation.
- Sample fake data.
- Manual setup guide.
- Deployment checklist.
- Known limitations.

## Open Decisions for Later

- Whether to automate SharePoint list provisioning.
- Whether to replace polling with a real-time provider.
- Whether to add two-way originator status receipts.
- Whether to add a read-only Code Alert review UI for admins. Do not add admin-editable Code Alert workflow controls.
- Whether phone directory and MedTrak can be read safely from approved sources.
- Whether a later manual-assist Riskmaster experiment can prepopulate a real Riskmaster form through URL/query parameters without submitting or writing to production.
- Whether `PgOverheadPageLog` rows should later be appended automatically into the proof-of-concept Excel workbook through Graph, Power Automate, or Office Script.
- Whether drawer-count metadata should remain structured text on the shell record or move to a more typed persistence model later.

