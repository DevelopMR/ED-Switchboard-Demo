# SHAREPOINT_DEPLOYMENT.md

# SharePoint Deployment and Proof-of-Concept Strategy

## Deployment Goal

Demonstrate that each switchboard component can be deployed modularly and safely. Proof of concept comes before polish.

## Current Deployed Baseline - June 2026

- Active package: `packages/switchboard-core-spfx` version `0.1.21`.
- Solution package: `sharepoint/solution/ed-switchboard-core.sppkg` version `1.0.0.21`.
- Switchboard-side Code Alert form/backend includes 23 app-owned workflows.
- The current launcher is an internal operator/test launcher. The sophisticated Originator interface is a separate future phase.
- Verified SharePoint completion creates one correlated row in `RmDemoEntries`, `PgOverheadPageLog`, and `SwDailyNotes`.
- See `docs/CODE_ALERT_FORM_PHASE_CLOSEOUT.md` for closeout details.

## Site Collection Strategy

Some modules may be tested in the ED Switchboard site. Others may be tested in separate SharePoint site collections to prove portability and cross-site configuration.

Recommended test sites:

1. ED Switchboard POC Site
   - Main console
   - Daily Notes
   - OR Call-In
   - DUI
   - Paging Log
   - Alarm Panel

2. Code Alert Originator POC Site
   - Originator mode web part
   - Configured target switchboard URL
   - Configured originator/switchboard IDs

3. Code Alert Switchboard POC Site
   - Switchboard mode web part
   - `CodeAlerts`
   - `CaActionLogs`
   - `CodeAlertEndpoints`

## Manual Deployment Steps Phase 1

1. Create SharePoint lists using names from DATA_MODEL.md.
2. Enable version history on operational lists.
3. Configure permissions so normal users cannot delete operational records.
4. Add fake/sample data only.
5. Add SPFx package to app catalog or site app catalog as appropriate.
6. Add web parts to page.
7. Configure web part properties.
8. Test one workflow end to end.
9. Verify no production write paths exist.

## Removed Code Alert Rule-List Provisioning

Package `0.1.20` removes the former `CaAlertRules` list dependency and its setup surface, schemas, seed inventory, and runtime services. Do not provision that list for current deployments. The 23 released popup workflows are app-owned and release-controlled. After `0.1.20` is deployed, the obsolete list may be deleted from the demo site.

## Phase 3 Code Alert Popup Form Slice

Phase 3 uses app-owned Code Alert workflow modules. The current popup suite supports all 23 options listed in `src/constants/CodeAlertLaunchOptions.ts`.

Current behavior:

- The normal operator console starts with no preloaded active popups.
- The right-column `Code Alert` card opens an operator/test launcher with all released alert options.
- Each alert routes to an app-owned workflow module inside the shell-owned popup host.
- Queue locking, guarded close, ordered tasks, compact completed rows, alert-specific branching, and completion handling are implemented.
- EPIC chat steps use generated copy controls; ordinary phone/page scripts are plain quoted text.
- Simulated Riskmaster writes only to `RmDemoEntries` and returns a fake receipt for manual copy-back.
- Final completion writes one idempotent `PgOverheadPageLog` row and one correlated `SwDailyNotes` row.
- Popup source IDs, fake Riskmaster receipt codes, location, category, and timestamps are preserved across logs.
- The Alarm Panel launcher remains distinct from the Code Alert Fire Alarm workflow.
- `OR Team Call-In`, `DUI Intake`, and `Paging Log` are now active shared-popup workflows inside `packages/switchboard-core-spfx`, with list-backed demo writes and Daily Notes logging.

Still deferred:

- Active `CodeAlerts` intake/polling.
- `CaActionLogs`.
- Full all-clear/cancel/not-cleared state machine.
- Persisted active alert rows across page refresh.
- Direct workbook append.

Date/time behavior:

- Write UTC ISO timestamps without a manual offset.
- Configure the SharePoint site's Regional Settings for the intended local display time zone.
- The ED Switchboard demo site is configured for Eastern Time.

Required Phase 3 demo lists:

- `SwDailyNotes`
- `SwShellState`
- `PgOverheadPageLog`
- `RmDemoEntries`

Required Phase 3 demo document artifact:

- `Documents/Switchboard Logs/OverheadPageLog.xlsx`

Riskmaster and overhead page log simulation:

- Riskmaster is simulated inside the proof-of-concept only.
- The simulated Riskmaster form opens in a separate browser window and may be prefilled from alert context.
- Simulated Riskmaster submit writes only to `RmDemoEntries`.
- The response shows a fake plain-text Riskmaster code for manual operator copy-back.
- Code Alert workflows use the copied-back fake Riskmaster code when writing the final `SwDailyNotes` and `PgOverheadPageLog` records.
- `PgOverheadPageLog` is the structured SharePoint mirror of the Excel workbook.
- Direct appending to the workbook is deferred until a later integration slice.
- A future real Riskmaster URL-prefill experiment may be evaluated as manual assist only; it must not submit or write to production Riskmaster.

## Future Originator Web Part Configuration

The following properties are architectural targets for the dedicated Originator phase; they are not the current operator/test launcher configuration.

Originator web part properties:

- `IntakeSiteUrl` default demo value `https://darkmatter.sharepoint.com/sites/EDSwitchboard`
- `IntakeListTitle` default `CaOriginatorRequests`
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

The remote Originator is an independent `code-alert-spfx` package, not a mode of the switchboard web part. Presets populate on fresh load but remain editable. Location helper values are composed into one submitted `CaLocation` string rather than separate intake fields. None of these browser-visible properties is a secret.

## Endpoint ID Setup

Use 24-character uppercase alphanumeric IDs.

Example:

`NWE7K4P9Q2M8T6R3V5X1Z0AB`

Manual setup:

1. Create row in `CodeAlertEndpoints`.
2. Mark active.
3. Copy IDs into web part properties.
4. Configure and validate `CaOriginatorRequests`, the item-created promotion flow, and its least-privilege service connection.
5. Confirm the remote user has no direct permission to the hub `CodeAlerts` list.
6. Submit a test alert from the originator site.
7. Confirm switchboard receives and acknowledges the alert and the remote control receives only its minimal status.

These IDs are not cryptographic security. They help prevent misrouting and misconfiguration. The user's internal SharePoint session and intake-list permissions authorize request creation; active endpoint registration validates routing. Only the promotion service connection and switchboard operator group receive access to secured hub resources.

See `docs/CODE_ALERT_ORIGINATOR_PHASE_PLAN.md`. Form implementation must not begin until the permission/latency spike proves cross-site create/own-read behavior, no edit/delete, promotion idempotency, and direct acknowledgement receipt updates.

## Rich Text Guidance Content

For Phase 1, edit rich HTML externally if needed and paste into the SharePoint rich text field.

Guidelines:

- Keep HTML simple.
- Prefer tables for procedural steps.
- Do not include script tags.
- Do not include event handlers.
- Do not include active controls.
- Web part renders buttons/checkboxes separately.

## Deployment Safety Test Checklist

For every module before demo:

- Confirm only internal demo SharePoint lists are written.
- Confirm no real patient data is present.
- Confirm no production external system write connectors exist.
- Confirm test records use fake names/numbers.
- Confirm deletion is restricted.
- Confirm Created/Modified history is active.
- Confirm popup workflows can be completed with keyboard basics.
- Confirm Daily Notes entries are generated correctly.

## Future Automation

Later phases may add:

- Broader automated list provisioning for all modules.
- Site scripts.
- PnP provisioning.
- Graph-based setup.
- Managed deployment package.
- Real-time alert provider replacing polling.

Do not add those until the proof-of-concept workflows are stable.
