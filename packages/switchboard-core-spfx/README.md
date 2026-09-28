# Switchboard Core SPFx

This package is the active implementation for the ED Switchboard proof of concept. Current version: `0.1.24`.

## Scope

- Shell header below the purple header band
- Three-column switchboard layout
- Search-friendly Daily Notes center panel
- Right-column operational module area
- Shell-owned shared popup host for urgent workflows
- Operator/test Code Alert launcher with 23 app-owned workflows
- SharePoint polling intake for secured `CodeAlerts` rows addressed to the configured switchboard
- Automatic popup opening for promoted Code Alerts on the main shell page
- Acknowledgement and terminal-state write-back to `CaOriginatorRequests`
- Internal simulated Riskmaster surface
- Idempotent `PgOverheadPageLog` and correlated `SwDailyNotes` completion logging

The future sophisticated Code Alert Originator interface is a separate phase. See `../../docs/CODE_ALERT_FORM_PHASE_CLOSEOUT.md`.

## Build and Serve

This package now has SPFx 1.22.2 build infrastructure around the hand-scaffolded shell source.

Use Node `v22`.

```powershell
npm install
npm run build
npm run build:retry
npm run start
```

`npm run start` uses `heft start --clean --nobrowser`.

`npm run build:retry` runs the normal production build first. If the build fails, it removes only generated local folders (`dist`, `jest-output`, `lib`, `lib-commonjs`, `release`, and `temp`) and retries once. Use `npm run clean:generated` to run that scoped cleanup directly.

If Windows reports generated-file locks, inspect package-local dev processes with:

```powershell
npm run dev:processes
```

The process helper lists matching local processes by default. To stop them, run `./scripts/StopDevProcesses.ps1 -Stop` from this package and confirm the prompt.

Open the SharePoint debug page manually:

```text
https://darkmatter.sharepoint.com/sites/EDSwitchboard/SitePages/Home.aspx?loadSPFX=true&debugManifestsFile=https://localhost:4321/temp/build/manifests.js
```

Use `Mock` mode for isolated UI work and `SharePoint` mode for internal demo-list integration testing.

## SharePoint Polling Settings

The switchboard shell now exposes these SharePoint runtime settings through the web part property pane and URL overrides:

- `SwitchboardId` or query `SwSwitchboardId`
- `CodeAlertsListTitle` or query `SwCodeAlertsList`
- `IntakeListTitle` or query `SwIntakeList`
- `PopupPollingIntervalSeconds` or query `SwPopupPollingSeconds`

The default polling interval is `5` seconds. The default switchboard ID is `SWITCHBOARDDEMO000000000`.

For browser diagnostics during local debug, add:

- `SwPopupDebug=1`

## Verified Current Behavior

On package `0.1.24` / solution `1.0.0.24`, the current verified path is:

- Originator creates `CaOriginatorRequests`
- Azure Function promotes to secured `CodeAlerts`
- Switchboard polling opens the matching popup automatically
- `Acknowledge` updates the Originator receipt to `Acknowledged`
- full workflow completion updates the Originator receipt to `Closed`
- final workflow completion writes the expected `SwDailyNotes` row

The earlier `Alert Still Active` warning box has not reappeared in the latest two live tests, but continue observing before treating that issue as fully closed.

## First-Pass Structure

```text
src/
  webparts/
  models/
  constants/
  services/
  components/
  hooks/
  utils/
  styles/
```

