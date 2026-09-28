# SharePoint Wiring

This package now supports two runtime service modes:

- `Mock`
- `SharePoint`

## Why

The same shell UI should be able to run:

- against mock data during early build and UI shaping
- against live SharePoint lists from the SPFx page context

## Runtime Service Bundle

The shell consumes a `ShellServiceBundle`, which includes:

- `notesService`
- `drawerCountService`
- `popupHostService`
- `pageLogService`
- `riskmasterService`
- `currentUserName`
- optional `siteUrl`
- `useMockData`

## SharePoint Mode

`createSharePointShellServices` builds:

- `SwDailyNotesService`
- `SwDrawerCountService`
- `SharePointRestListClient`
- `AppOwnedPopupHostService`
- `PgOverheadPageLogService`
- `RmDemoEntriesService`

This gives the shell a real list-backed adapter path for:

- retrieving notes by day
- searching/filtering notes
- creating manual notes
- loading and saving drawer-count JSON metadata
- launching app-owned operator/test Code Alert workflows
- writing simulated Riskmaster entries
- writing idempotent structured overhead page-log rows
- writing correlated final Daily Notes summaries

## SPFx Web Part Wiring

`src/webparts/switchboardShell/SwitchboardShellWebPart.ts` is now a real SPFx `BaseClientSideWebPart`.

It renders the shell with:

- `createMockShellServices` when `Mode` is `Mock`
- `createSharePointShellServices` when `Mode` is `SharePoint`

The web part properties are:

- `Mode`
- `TargetSiteUrl`
- `UsePrintView`

The web part writes standard UTC ISO timestamps. SharePoint Regional Settings control local display time; no application offset is applied.

The default `TargetSiteUrl` is:

```text
https://darkmatter.sharepoint.com/sites/EDSwitchboard
```

## Current Testing Target

Live tests run on the internal developer site only:

```text
https://darkmatter.sharepoint.com/sites/EDSwitchboard
```

Safety review before testing persistence:

1. Writes must go only to internal demo SharePoint lists.
2. Test entries must be fake/synthetic.
3. No external hospital system write path is involved.
4. Use `SharePoint` mode only against the configured internal demo site.
5. Code Alert test values must remain obviously synthetic.

## Manual Developer-Site Setup

See:

- `packages/switchboard-core-spfx/docs/DEV_SITE_SETUP.md`
- `provisioning/switchboard-core/SwDailyNotes.fields.md`
- `provisioning/switchboard-core/SwShellState.fields.md`

These documents describe the shell foundation lists. Code Alert completion additionally uses `RmDemoEntries` and `PgOverheadPageLog`; see `docs/SHAREPOINT_DEPLOYMENT.md` and `docs/CODE_ALERT_FORM_PHASE_CLOSEOUT.md`.
