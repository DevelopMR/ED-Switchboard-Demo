# ED Switchboard SharePoint POC

This repository contains a working modular SharePoint Online / SPFx proof of concept for an Emergency Department switchboard operator console.

The project centers on:

- A main `switchboard-core` console experience with Daily Notes and module launchers
- A mature switchboard-side Code Alert workflow suite hosted in `switchboard-core-spfx`
- A future dedicated Code Alert Originator interface phase
- Additional operational modules for OR Call-In, DUI Intake, Paging Log, and Alarm Panel workflows

The shell, Daily Notes, and switchboard-side Code Alert form/backend are implemented. The current Code Alert package baseline is `0.1.20`; the Originator interface is intentionally separated into a future phase.

Current status: [Code Alert form/backend closeout](docs/CODE_ALERT_FORM_PHASE_CLOSEOUT.md) and [June 19 handover](docs/HANDOVER_2026-06-19.md).

## Safety

- Demo/proof-of-concept only
- No production hospital system writes
- No real patient data
- Synthetic/mock data only

See [AGENTS.md](AGENTS.md) and the planning documents in [docs](docs).

## Repository Layout

```text
assets/
  screenshots/
  sourceDocs/
docs/
packages/
  shared/
  switchboard-core-spfx/
  code-alert-spfx/
  or-call-in-spfx/
  dui-intake-spfx/
  paging-log-spfx/
  alarm-panel-spfx/
provisioning/
  common/
  switchboard-core/
  code-alert/
  or-call-in/
  dui-intake/
  paging-log/
  alarm-panel/
test-data/
  sharepoint-lists/
  scenarios/
```

## Working Agreement

Start with these docs before implementation:

1. [AGENTS.md](AGENTS.md)
2. [ARCHITECTURE.md](docs/ARCHITECTURE.md)
3. [DATA_MODEL.md](docs/DATA_MODEL.md)
4. [PROJECT_PLAN.md](docs/PROJECT_PLAN.md)
5. [SHAREPOINT_DEPLOYMENT.md](docs/SHAREPOINT_DEPLOYMENT.md)

## Current Development Boundary

- Close only the remaining switchboard Code Alert form/backend decisions.
- Treat the Code Alert Originator interface as a separate focused phase.
- Keep external systems mocked or explicitly approved read-only.
- Continue using only synthetic/demo data.
