# ED Switchboard Agent Handoff

Date: `2026-08-03`

This is the current starter document for a fresh Codex/Codex-like agent. Read this before making code changes.

## Safety Contract

This repository is a SharePoint/SPFx proof of concept only. Do not write to production hospital systems. Do not use real patient data, PHI, MRNs, SSNs, phone numbers tied to real people, diagnoses tied to real people, or production clinical identifiers. All workflow writes must remain internal demo SharePoint list writes unless the user explicitly approves a safe read-only external check.

Before touching alert routing, persistence, Azure Functions, or SharePoint list writes, verify that the change preserves the demo-only boundary.

## Repository

```text
D:\dev\SharePoint\DoctoralPresentation\ed-switchboard
```

Primary active packages:

```text
packages/switchboard-core-spfx
packages/code-alert-spfx
packages/code-alert-functions
```

Current package baselines:

- `packages/switchboard-core-spfx`: npm `1.0.1.24`, SPFx solution `1.0.1.24`.
- `packages/code-alert-spfx`: npm `0.1.10`, SPFx solution `1.0.0.10`.
- `packages/code-alert-functions`: npm `0.1.8`.

Local runtime decision:

- The SPFx packages declare Node `>=22.14.0 <23.0.0`, but the user has chosen to keep Node 24 on this workstation and accepts the compatibility-warning risk.
- SPFx `1.22.2`.
- SharePoint package output for core: `packages/switchboard-core-spfx/sharepoint/solution/ed-switchboard-core.sppkg`.
- SharePoint package output for offsite originator: `packages/code-alert-spfx/sharepoint/solution/ed-code-alert-originator.sppkg`.

## Current Demo-Ready Phase Status

- Phase 0 repo/safety: complete.
- Phase 1 switchboard shell: complete for proof of concept.
- Phase 2 Daily Notes: complete for proof of concept.
- Phase 3 switchboard Code Alert workflow/backend: functional with later polish/refinement ongoing.
- Phase 3.5 Offsite Code Alert Originator: demo-ready, including Azure Functions promotion, switchboard acknowledgement/closure receipts, and All Clear requests.
- Phase 4 OR Call-In: functionally complete.
- Phase 5 DUI Intake: functionally complete.
- Phase 6 Paging Log: functionally complete.
- Phase 7 Alarm Panel: functionally complete.
- Styling cleanup: active; custom left reference menu and right workflow rail are in place, and the shared popup layer refresh is underway on feature/popup-layer-style-refresh.
- Refine Code Alert Forms: active; switchboard-local and offsite-originator surfaces are intentionally isolated.

## Critical Architecture Decisions

The switchboard-local Code Alert originator and the offsite Code Alert originator are intentionally separate applications. Do not merge their popup host, transport, or page-specific UI code unless there is a strong maintenance reason and the user agrees.

The offsite originator writes an append-only intake item to `CaOriginatorRequests`, then sends a pointer-only Azure Function signal. The function re-reads SharePoint and promotes to secured `CodeAlerts`. The browser must not send alert details, PHI, or free-text clinical detail to the Azure Function payload.

The Function source now reuses its Graph client, expiration-aware token, and resolved SharePoint IDs while an instance stays warm. Optional verified `CodeAlertHubSiteId`, `CodeAlertIntakeListId`, and `CodeAlertSecuredListId` settings remove discovery calls. PHI-safe stage timings distinguish host startup delay from Graph/SharePoint time. Package `0.1.8` was deployed to the demo Function App on `2026-08-09` and the HTTP trigger was verified. The optional ID settings and Flex Consumption always-ready have not been enabled.

The switchboard core owns operator workflows and popup orchestration. It polls `CodeAlerts` and opens guided popup tasks. It also hosts DUI Intake, Paging Log, OR Call-In, and Alarm Panel workflows in the same queue-safe popup host.

## Recently Verified Code Alert Behavior

Phase 3.5 Offsite Originator is ready for demo.

Verified live behavior:

- Offsite launcher opens a centered popup with facility/team presentation.
- Facility is property-driven and locked for offsite users; team/department preset remains editable.
- Originator creates `CaOriginatorRequests` rows and the Azure Function promotion channel works.
- Switchboard receives promoted alerts and opens the operator popup.
- Switchboard acknowledgement updates the originator view.
- Switchboard closure updates the originator view and Switchboard log.
- Acknowledged originator alerts remain visible for five minutes so the originator can request All Clear.
- `Request All Clear` creates an append-only `AllClearRequest` intake command.
- Azure Function promotes All Clear into a secured `CodeAlerts` workflow.
- Switchboard All Clear popup uses the original alert color/category and only requires Acknowledge plus Read Announcement 3 Times.
- All Clear announcement text appends `+ All Clear`; the form already instructs the operator to read the announcement three times.

Important SharePoint naming note:

- `CodeAlerts` uses `CaOriginatorID` with capital `ID` in the live list.
- `CaOriginatorRequests` has live-created internal names that may differ from display names. The Azure Function contains internal-name fallback logic for originator-created-by fields.
- `CaRequestType` choices currently include normal alert and All Clear values. The code accepts `AllClear` and the live SharePoint choice casing `Allclear`.

## Core Module Notes

OR Call-In:

- Uses `OrMedTrakRoster` mock roster loading.
- Package `1.0.1.24` filters the SharePoint roster query by the selected surgery timestamp before applying the row limit. This prevents later roles such as Scrub/OR Tech, Surgical Tech 1st Assist, and Recovery Nurse from being truncated as the multi-month demo roster grows.
- Writes one parent `OrCallIns` row and related `OrCallInContacts` rows.
- Writes Switchboard Daily Notes.
- Surgical Tech 1st Assist is optional.
- Obstetrics Emergency Code Alert also reuses roster concepts for Obstetrician/Pediatric Hospitalist/Anesthesia roles.

DUI Intake:

- Uses synthetic-only data.
- Allows interruption by Code Alerts and resumes with form data preserved.
- Writes `DuiIntakes` and Switchboard Daily Notes.

Paging Log:

- One-shot form.
- `Page Complete` writes `PagingLogs`, sets `PgSuccess`, writes Switchboard Daily Notes, and closes.

Alarm Panel:

- One-shot form.
- Writes `AlarmPanelLogs` and Switchboard Daily Notes.
- Maintenance is required only where appropriate; Condition A and Fire Alarm paths do not require Maintenance contact.
- No `AlDailyNoteId` field is needed; it was intentionally removed from the model.

## Current Styling Surface

The switchboard log page suppresses selected SharePoint chrome only on the operator page. It uses a custom left menu backed by `SwReferenceLinks`, and a right workflow rail with image-based launchers.

Current/near-current styling direction:

- Operator page should feel stable, low-friction, and paper/log inspired.
- Critical popups prefer simple HTML/table alignment over clever responsive layout.
- Avoid hidden state, unnecessary animation, and visual puzzles.
- Use icons where they reduce reading burden, but keep hover text and keyboard behavior accessible.

Current popup refresh direction:

- Keep the underlying SharePoint page visible beneath a translucent dimming backdrop, but make it inert while a workflow is active.
- Use one centered, non-dismissible task surface for the shared popup host.
- Place the active queue card, workflow heading/location, and elapsed time in one stable header.
- Reuse each Code Alert's existing app-owned accent color with contrast-safe foreground text.
- Show completed Code Alert tasks as compact four-card desktop rows and keep the current numbered task expanded.
- Trap keyboard focus inside the popup and restore focus only after the workflow closes through its approved terminal behavior.
- Do not add an Escape, backdrop-click, or general close path.

## Build and Verification Habits

Preferred core build:

```powershell
cd packages\switchboard-core-spfx
npm run build
```

Retry helper exists:

```powershell
npm run build:retry
```

Preferred local debug server:

```powershell
npm run start
```

Typical SharePoint debug URL pattern:

```text
https://darkmatter.sharepoint.com/sites/EDSwitchboard/SitePages/Home.aspx?loadSPFX=true&debugManifestsFile=https://localhost:4321/temp/build/manifests.js&SwPopupDebug=1
```

Do not build or publish without checking with the user if they mention they may have last-minute edits. The user usually handles GitHub commits and syncs.

## Known Environment Friction

The Windows sandbox sometimes reports setup refresh errors. If an important read/build command fails because of sandboxing, retry with a scoped escalation request rather than broad permissions.

Node 24 can emit SPFx engine warnings because the package engine range still targets Node 22. The user explicitly chose to retain Node 24; do not change the installed runtime without a new request.

Browser/agent sharing in VS Code is under exploration. Do not assume reliable direct browser control unless the tool is visible in the current session.

## Good Next-Agent First Steps

1. Read `AGENTS.md` and this handoff.
2. Run `git status --short` and do not revert user changes.
3. Read `docs/PROJECT_PLAN.md`, especially Phase 3.5, Refine Code Alert Forms, and Phase 7.
4. If working on Code Alerts, read `docs/CODE_ALERT_AZURE_FUNCTION_SIGNAL_SETUP.md` and `docs/CODE_ALERT_FORM_PHASE_CLOSEOUT.md`.
5. Build only after user approval or a clear request.
6. Keep changes small, demo-safe, and easy to verify in SharePoint.
