# ARCHITECTURE.md

# ED Switchboard SharePoint Architecture

## Purpose

Build a modular SharePoint Online proof-of-concept for an ED switchboard operator console. The console centers on a living Daily Notes log and several right-sidebar operational web parts that open full-screen popup workflows.

The system is a demonstration platform. It must not write to critical production systems and must not use real patient data.

## High-Level Console Layout

The main Switchboard page keeps the normal SharePoint corporate shell/header but replaces the content below the main purple site banner with a focused three-column operator console.

Visual tone:

- Keep a consistent house style built on one deep purple accent
- Use the dominant purple as an accent, not as a flood color
- Keep the working surface mostly neutral, bright, and print-friendly
- Avoid homepage-style promotional treatments below the purple band

### Left Column: Reference and Navigation

Stable low-urgency information:

- Back link to the main Patient Registration site.
- Common address and phone number.
- Small address book icon opening the corporate phone directory search in a new browser window.
- Important unit hours.
- Clock/schedule icon opening a full schedule list in a new browser window.
- Expandable operator utility sections:
  - Forms
  - Documents
  - Process
  - Apps

Navigation links must not pull the user away from the switchboard page unless explicitly intended. Secondary lookups should open in a new browser tab/window.

Consider a leave-warning popup when the user attempts to navigate away:

> You are leaving the ED Switchboard Console. You may not receive incoming alerts while away from this page. Are you sure you want to continue?

### Center Column: ED Switchboard Daily Notes

The center panel is the operational timeline and should visually echo a paper switchboard daily-notes log, while remaining backed by a search-friendly SharePoint list model.

Core behavior:

- Date navigation with previous/next arrows.
- Today shortcut.
- Print icon.
- Search.
- Add/edit manual log entries.
- Expand entries for long text and comment/history views.
- Accept automated entries from sidebar modules.
- Visually group content into the paper-inspired sections:
  - Recent Codes
  - Recent Alarms and Maintenance Calls
  - Other Important Notes
- Keep the on-screen experience as custom HTML/React, not as an active PDF.

This is the primary living record for shift continuity and operator review.

### Right Column: Operational Launchers

Small calm web part launcher blocks in wait mode:

- Code Alert
- OR Team Call-In
- DUI
- Paging Log
- Alarm Panel Log

Each launcher opens the shared Alert Surface Panel or a module-specific popup/workspace. Launcher colors should match the accordion band colors used inside the shared panel.

## Shared Alert Surface Panel

A high-value reusable full-screen popup interface used by major workflows.

Design rules:

- Full-page/frame takeover, not a tiny modal.
- Simple, stable HTML.
- Tables for critical instruction/logging alignment.
- Minimal CSS complexity.
- No unnecessary animation.
- Accordion queue for concurrent work items.
- Code Alerts sort to the top of the queue.
- Popup cannot fully close until each active alert/work item reaches a terminal state.
- When visible, the popup is the operator's primary task and should be hard to leave accidentally.

Accordion strip content example:

`CODE BLUE ADULT | ED Room 12 | 45 sec`

Elapsed time display:

- 0-60 seconds as seconds.
- After 60 seconds as whole minutes.
- Timer is for operator benefit and is not audit logged unless an action is clicked.

## Code Alert Architecture

### Current Implementation Boundary - June 2026

The switchboard/operator-side Code Alert form and internal demo logging backend are implemented inside `packages/switchboard-core-spfx`. Twenty-three alert types use app-owned workflow modules routed through the shell-owned popup host.

The current right-column launcher is an operator/test launcher, not the future Originator interface. Originator UX, persisted `CodeAlerts` transport, endpoint routing, and switchboard polling are a separate future phase.

Current completion writes only to internal demo SharePoint resources:

- simulated Riskmaster submission to `RmDemoEntries`
- one idempotent structured page-log row in `PgOverheadPageLog`
- one correlated final summary in `SwDailyNotes`

See `docs/CODE_ALERT_FORM_PHASE_CLOSEOUT.md` for verified behavior and closeout decisions.

### Independent Deployable Controls

The remote Originator and switchboard hub are separate independently deployable SPFx packages:

1. `packages/code-alert-spfx` provides the lightweight remote Originator control.
2. `packages/switchboard-core-spfx` provides the hub receiver and operator workflows.
3. `packages/code-alert-functions` provides the Azure Functions fast signal API for pointer-only Code Alert intake notifications.

They share dependency-light contracts and alert catalog metadata through `packages/shared`; they do not share a deployable web part or bundle operator workflow code into remote sites.

### Originator Mode

Status: architecture target for the dedicated Originator phase; not implemented by the current operator/test launcher.

Used by departments/teams to submit Code Alerts.

Behavior:

- Web part may be configured with default location context.
- User chooses category/type and location.
- User may enter additional instructions/details.
- Web part creates an immutable request in central `CaOriginatorRequests`.
- Web part then sends a pointer-only Azure Functions signal containing only request/list routing identifiers. It must not send location, alert details, evidence notes, patient-looking values, or approved procedure content through the API.
- The Function re-reads the authoritative intake item and promotes validated requests; remote users do not receive direct access to the target switchboard site's secured `CodeAlerts` list.
- After submission, an `Alert Sent` screen stays visible.
- Originator can later submit Cancel or All Clear if instructed/appropriate.
- MVP does not send two-way status receipts back to originator.

### Switchboard Mode

Used on the ED Switchboard page.

Behavior:

- Polls the `CodeAlerts` list every 1 second while the staffed console page is active. Polls run sequentially so a slow SharePoint response cannot create overlapping requests, and the console refreshes immediately when its tab regains visibility or window focus.
- Detects unresolved incoming alerts.
- Opens the full-screen Alert Surface Panel.
- Requires operator acknowledgment for initial alert.
- Shows generated announcement phrase.
- Shows approved procedure instructions from app-owned workflow modules.
- Shows logging controls close to related instruction text.
- Allows Cancel, All Clear, Not Cleared, or other terminal states where implemented in the released workflow.

### Alert Transport

The remote-to-hub boundary uses a central SharePoint intake mailbox, `CaOriginatorRequests`, plus a fast Azure Functions signal path.

Authenticated internal users may create and read only their own immutable intake requests. After the intake row exists, the Originator web part calls an Azure Function using a pointer-only payload:

- `requestItemId`
- `requestId`
- `originatorId`
- `switchboardId`

The API payload must not include patient data, location text, alert type, evidence notes, procedure language, or any other descriptive alert detail. The Function uses a function key plus registered originator/switchboard IDs as the initial demo gate, then re-reads the authoritative SharePoint intake item before writing the secured `CodeAlerts` row.

The earlier item-created Power Automate promotion remains a documented legacy/fallback path only. It is not the preferred transport for the speed-critical Code Alert signal because SharePoint trigger latency is not guaranteed to behave like an immediate phone call.

Switchboard acknowledgement writes directly back to the linked intake receipt for speed. Remote controls with active alerts poll only their own receipts every few seconds; no second acknowledgement flow is required for the normal path. A reconciliation process repairs failed/stale receipt synchronization.

The switchboard starts with simple fast polling behind the hub boundary. It receives only a "new alert exists" signal or detects newly submitted `CodeAlerts`, then retrieves operational detail from secured SharePoint lists.

Implement behind an abstraction so a later real-time provider can replace polling:

- `SharePointOriginatorIntakeProvider`
- `SharePointPollingProvider`
- `AzureFunctionSignalProvider`
- future `RealtimeProvider`

Do not introduce complex real-time infrastructure in the first Azure Functions slice. SignalR/WebSocket push can be considered later if measured fast polling plus the Function signal is still not fast enough.

### Web Part Parameters

Use PascalCase property names:

- `OriginatorId`
- `SwitchboardId`
- `DefaultFacility`
- `DefaultDepartment`
- `DefaultUnit`
- `DefaultFloor`
- `DefaultDirection`
- `DefaultRoom`
- `DefaultAdditionalLocation`
- `AllowedCategories`
- `BrokerResource`
- `StatusPollingIntervalSeconds`

Location presets are optional and editable, including room. At least one composed location value must be present at submission.

### Endpoint IDs

Use 24-character uppercase alphanumeric IDs.

Example: `NWE7K4P9Q2M8T6R3V5X1Z0AB`

These IDs are routing/misconfiguration protection, not true cryptographic security. The user's internal SharePoint session and central intake-list permissions authorize creation; active endpoint registration validates routing. The promotion flow's service connection, not remote users, receives least-privilege write access to secured hub lists.

A switchboard registry list should store valid originator/switchboard pairings.

Function keys are also configuration gates, not a complete authorization model. The production-hardened direction is Entra/managed identity plus least-privilege SharePoint access. The demo starts with function key plus routing IDs so the project can validate speed and operator flow without giving originators secured-list access.

## Code Alert Rules and Instructions

Code Alert workflow behavior is app-owned and release-controlled.

Earlier planning considered SharePoint-list-driven Code Alert rules and admin-editable action schemas. That direction has been rejected for active Code Alert behavior because it creates governance risk. Site admins should not be able to change Code Alert task flow, required actions, branch logic, or terminal states through list editing.

Do not alter approved Code Alert event language.

Use TypeScript workflow modules for alert behavior and app-owned content. Linked reference documents may live in a SharePoint document library when useful, but the workflow itself is controlled by developer releases.

Useful app-owned structure:

- a shared Code Alert framework for popup layout, task state, guarded close, copy controls, linked-reference popovers, and logging hooks
- unique `.tsx` workflow modules for each alert type
- structural CSS classes for common layout
- alert color classes for code-specific accents

Do not build a general-purpose admin workflow editor for Code Alerts.

SharePoint can still store operational and audit data:

- submitted `CodeAlerts`
- append-only lifecycle audit events in `CaActionLogs` during the Originator/intake phase
- `PgOverheadPageLog`
- final `SwDailyNotes` summaries

Reference/inventory fields may include:

- alert category
- alert type
- legacy code
- announcement template
- whether location is required
- whether instructions are allowed
- whether Epic chat confirmation is required
- whether Security/911/Maintenance confirmation is required
- color
- sort order
- active flag

Linked or app-owned reference content may include:

- full procedure instructions
- Bomb Threat questions/table
- Emergency Operations Plan content
- long special guidance
- Welfare Check decision-tree text laid out like alert guidance

Do not embed scripts or active controls inside rich text. The web part renders controls near the instruction text.

## Announcement Engine

The Announcement Engine should produce the phrase for the operator to read. General pattern:

`[Category Alert] + [Approved Event Name] + [Location] + [Instructions if present]`

Repeat count is displayed as “Read three times.”

All-Clear is optional for every event. Official guidance appears to allow all-clear for all categories, but operators announce all-clear only when instructed.

Track phrases that do not follow the general rules for later human review. Do not auto-correct approved language without confirmation.

## Epic, Riskmaster, MedTrak, Paging, Directory

- Epic chats are handled in Epic only. The system logs past-tense confirmations such as `Epic Chat Confirmed Sent` and may provide copy/paste text.
- Riskmaster is demo/mock only. The app may open an internal simulated Riskmaster form in a separate browser window, prefilled from the active alert context. Submitting that simulated form writes only to `RmDemoEntries` and returns a fake plain-text receipt code such as `RM-DEMO-20260614-0001`.
- The operator manually copies the fake Riskmaster code back into the active Code Alert popup. That copy-back step unlocks the final structured logging path.
- A later manual-assist experiment may test whether a real Riskmaster page accepts URL/query-string prefill. That experiment must remain non-submitting and must not write to production Riskmaster.
- MedTrak may be read if approved. No writes.
- Paging actions are logged internally only.
- Phone directory search is a future stub unless approved read-only access is available.

## Overhead Page Log Spreadsheet Strategy

The overhead page log remains an Excel workbook for the proof of concept, matching the physical/spreadsheet process used by operators.

Implementation direction:

- `PgOverheadPageLog` is the app-facing structured SharePoint write target.
- The Excel workbook is stored in a SharePoint document library, recommended path `Documents/Switchboard Logs/OverheadPageLog.xlsx`.
- Code Alert workflows write a single structured `PgOverheadPageLog` row after the fake Riskmaster code is copied back and the alert logging step is complete.
- Direct workbook appends are deferred until the list-backed flow is reliable. Later options include Graph workbook APIs, Power Automate, or Office Script.
- Spreadsheet columns may include patient-looking fields for process fidelity, but all test/demo values must be obviously fake.

## OR Call-In Architecture

Sidebar launcher opens a full-page/popup OR Call-In workspace.

Behavior:

- Layout replicates paper `OR CALL IN LOG`.
- Header fields are entered during phone call with AOD.
- `OrSurgeryDateTime` is required.
- Mock MedTrak lookup is triggered manually from the OR team section after Surgery Date/Time is entered.
- The `OrMedTrakRoster` SharePoint query filters active rows by `OrOnCallStart`/`OrOnCallEnd` for the selected surgery timestamp before applying its row limit; local time-window validation remains as a defensive check.
- Team member rows are populated from the mock roster list based on the surgery date/time and can still be edited manually.
- Each contact row has a contact-time stamp control.
- The Anesthesiologist row includes a dedicated `Contacted by AOD` control.
- Notes are editable per row and are also aggregated into a parent `OrTeamCallInNotes` field on submit.
- Switchboard operator initials are required before final submit.
- Completion writes the OR parent record, OR child contact rows, and a Daily Notes entry.
- The draft remains queue-safe if a Code Alert interrupts the form.

Contact rows should be stored as child rows for flexibility.

## DUI Architecture

Sidebar launcher opens DUI Intake popup.

Replicate the DUI intake paper form fields using synthetic data only:

- Date
- DOB
- SSN
- Name Last First
- Police Department
- Police Officer
- Police Incident Number
- Registration Number

Checklist:

- Security notified
- Lab notified
- DUI registered

The switchboard does not see the patient. The workflow is based on a 911/police dispatcher call alerting staff that officers are en route with a subject requiring a legal blood draw.

Submit writes to `DuiIntakes` and creates a Daily Notes entry. The draft remains queue-safe if a Code Alert interrupts the form.

## Paging Log Architecture

Replicate paper paging log form:

- Date
- Time
- Who Called
- From Where
- Callback Number
- Who Needed Paged
- Department
- Person On Call Phone Number

Future phone directory integration is a stub.

One required completion task, `Page Complete`, closes the popup after the log row is written. Submit writes to `PagingLogs` and creates a Daily Notes entry. The draft remains queue-safe if a Code Alert interrupts the form.

## Alarm Panel Architecture

Used when an alarm panel sounds in the switchboard room.

Alarm choices:

- Boiler Alarm
- Gen1
- Gen2
- Fire Alarm
- Bathroom
- Condition A
- Medical Gas Panel

Fields:

- AlarmType
- AlarmTime
- Description
- MaintenanceContactedTime
- ActionTaken
- Notes

Submit writes to `AlarmPanelLogs` and creates a Daily Notes entry.

## Shared Logging

SharePoint native fields provide Created, Created By, Modified, Modified By, and version history.

Use module-specific action logs where needed, especially for Code Alert actions.

A shared contact/action child row concept can be used where modules need repeated contact timestamps, but do not overbuild it for modules that only need one or two checklist confirmations.

Deletion should be prohibited for normal users. Use status changes instead.

## Switchboard Core Shell Architecture

The `switchboard-core-spfx` package should own the shell experience below the purple header band.

Primary shell responsibilities:

- Render the stable three-column layout
- Host the local shell header with `ED Switchboard Log`
- Render the Daily Notes center panel
- Render the right-column module surfaces
- Host the shared popup overlay used by urgent workflows
- Manage leave-warning behavior where practical

Recommended top-level shell components:

- `SwitchboardShell`
- `ShellHeader`
- `ReferenceColumn`
- `DailyNotesPanel`
- `ModuleColumn`
- `PopupHost`

The popup host belongs to the shell, not to Code Alert. Modules provide message content and workflow actions, but the shell owns screen takeover, focus behavior, queue handling, and guarded close behavior.

See `docs/VISUAL_STYLE.md` for the current shell palette guidance for the project's palette.
