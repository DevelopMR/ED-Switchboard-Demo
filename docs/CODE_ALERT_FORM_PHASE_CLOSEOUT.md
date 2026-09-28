# Code Alert Form and Backend Phase Closeout

Date: `2026-06-19`

## Scope

This phase covers the switchboard/operator-side Code Alert launcher, full-screen guided workflows, simulated Riskmaster handoff, and final internal demo logging. It does not cover the future Code Alert Originator interface, persisted incoming-alert transport, or production integrations.

Current package baseline:

- package: `packages/switchboard-core-spfx`
- package version: `0.1.21`
- SPFx solution version: `1.0.0.21`
- output: `packages/switchboard-core-spfx/sharepoint/solution/ed-switchboard-core.sppkg`

## Implemented

- Twenty-three app-owned Code Alert launch options and dedicated workflow modules.
- Shell-owned full-screen popup host with queue locking, guarded close, elapsed time, ordered tasks, and compact completed-task rows.
- Approved alert names and announcement patterns owned by released TypeScript code.
- Operator-entered real room/location text; demo data elsewhere remains synthetic.
- Keyboard-safe workflows: normal focus navigation, Space activation, and no destructive shortcut.
- Alert-specific branching for Fire Alarm, Welfare Check, Missing Person/Missing Child, Decontamination, Hazardous Materials Spill/Release, Mass Casualty Incident, Emergency Operations Plan, and Bomb Threat.
- EPIC chat copy controls only where a generated EPIC chat is appropriate. Phone/page scripts are plain quoted text.
- Internal simulated Riskmaster form in a separate window. It writes only to `RmDemoEntries` and returns a fake `RM-DEMO-*` receipt.
- Final completion writes one correlated `SwDailyNotes` row and one idempotent `PgOverheadPageLog` row.
- `PgOverheadPageLog` deduplicates by `PgSourceItemId`.
- Daily Notes stores `SwLocationText`; all three downstream logs now write standard UTC ISO timestamps.
- Timestamp writes now use standard UTC ISO values; SharePoint Regional Settings control local display time. The former manual display-offset workaround was retired after correcting the demo site's time zone to Eastern Time.
- Manual Riskmaster receipt confirmation updates the matching internal demo row to `RmStatus = CopiedBack`.
- Hazardous Materials Spill/Release writes `PgAlertCategory = Facility`.
- Embedded First Hour Response PDF for applicable workflows.
- App-owned workflow definitions with no SharePoint rule-list dependency or provisioning surface.

## Verified End-to-End

Code Blue Adult and Bomb Threat were tested in SharePoint mode after clearing the internal demo lists.

Verified results:

- exactly one `RmDemoEntries` row per alert
- exactly one `PgOverheadPageLog` row per alert
- exactly one `SwDailyNotes` row per alert
- timestamps aligned across the three lists
- locations persisted to `SwLocationText`
- fake Riskmaster receipts and popup source IDs correlated across lists
- Bomb Threat evidence propagated into Riskmaster Event Description, page-log Additional Info, and Daily Notes Details
- Hazardous Materials Spill/Release persisted `Facility`, the selected location, and the completed action summary correctly
- manual Riskmaster receipt confirmation changed matching demo rows to `CopiedBack`
- package `0.1.20` continued to launch and complete alerts after the obsolete `CaAlertRules` site list was deleted
- the post-deletion Code Blue test preserved the selected location and aligned the page-log and Daily Notes event times at 1:23 AM
- after correcting the SharePoint site from Pacific to Eastern Time and removing the application `+180` minute workaround, a fresh Code Blue test displayed `5:40 PM` consistently in `PgOverheadPageLog`, `RmDemoEntries`, and `SwDailyNotes`

The post-deletion Riskmaster capture contains two rows with the same source popup ID and different receipts. The latest row reached `CopiedBack`, but duplicate Riskmaster submission for one popup should be reviewed before the backend phase is declared fully closed.

## Explicitly Deferred to the Originator Phase

- sophisticated Originator user experience
- originator-specific alert selection, defaults, validation, and confirmation
- persisted `CodeAlerts` submission and switchboard polling
- endpoint registry and originator/switchboard routing validation
- cancel/all-clear requests originating outside the switchboard
- two-way originator status receipts

The current right-column Code Alert launcher is an operator/test launcher. It is not the future Originator interface.

## Implemented in 0.1.19 - Verified in SharePoint

1. Added `HazardousMaterialsSpillRelease` to the `PgAlertCategory` Facility mapping.
2. Added Riskmaster receipt lookup and `RmStatus` transition from `CodeReturned` to `CopiedBack` when the popup confirms the copied receipt.
3. The temporary runtime-configurable timestamp offset was later removed after the underlying SharePoint site time-zone mismatch was identified. Current packages write unshifted UTC ISO timestamps.

## Removed in 0.1.20

The former `CaAlertRules` SharePoint list integration was completely removed. Runtime reads, mapping, provisioning UI/services, schemas, seed data, and list-name constants no longer exist. The 23 released workflows remain app-owned and release-controlled. After deploying `0.1.20`, the obsolete list may be deleted from the demo site.

## Removed in 0.1.21

The temporary SharePoint display-offset property, URL override, and timestamp-shifting write helper were removed after the demo site's Regional Settings were corrected from Pacific to Eastern Time. Daily Notes, popup completion logs, and Riskmaster demo entries now write standard UTC ISO timestamps and rely on SharePoint for local display conversion.

## Remaining Loose Ends for Closeout Review

These items belong to the switchboard form/backend phase or require an explicit decision before that phase is closed:

- Review duplicate Riskmaster submission behavior. A single source popup ID should not create multiple demo receipts accidentally; prefer idempotent create/reuse behavior keyed by source popup ID.
- The direct Excel workbook append remains deferred; `PgOverheadPageLog` is the authoritative app-facing structured write target.
- Trauma Alert intentionally retains its explicit demo-copy warning because final approved wording is unavailable for this demonstration.
- All Hazards Manual and After Hours call-list links intentionally remain app-owned demo placeholders.
- Placeholder contact names/numbers must be replaced only through an approved, safe release-controlled source.
- Automated tests have not been added; current verification is build plus manual SharePoint workflow testing.

## Deferred by Phase-Closure Decision

- `CaActionLogs`: defer to the Originator/intake phase. The existing final Daily Notes and page-log records are sufficient for this proof of concept; per-action append-only persistence should be built against the future persisted alert ID rather than creating an independent audit stream now.
- Complete terminal states: defer the cross-alert Cancel, All Clear, and Not Cleared lifecycle to the Originator/intake phase. The current operator workflows may complete their approved local paths, but a reliable terminal-state system requires persisted `CodeAlerts`, originator requests, switchboard acknowledgements, and correlated status receipts.
- Refresh persistence: defer restoration of active popup state to the same persisted-alert lifecycle. Current popup state remains in memory and a browser refresh restarts the operator experience. Avoid a temporary `localStorage` or `sessionStorage` state model that could become stale, diverge from SharePoint, or retain entered data unexpectedly.

## Safety Boundary

- No production hospital writes.
- No real patient data or PHI.
- EPIC actions are operator-confirmed demo steps only.
- Riskmaster is an internal simulation only.
- Spreadsheet output is represented by an internal SharePoint list; the workbook is not written directly.
- External systems remain read-only when explicitly approved or otherwise mocked.
