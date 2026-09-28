# Repository Structure

This repository is organized as a modular planning-first monorepo so each SharePoint component can be scaffolded and deployed with minimal coupling.

## Principles

- Keep the switchboard shell separate from portable module packages.
- Keep SharePoint provisioning artifacts close to the module they support.
- Keep fake data and demo scenarios outside implementation packages.
- Add shared code intentionally rather than letting it leak across packages.

## Package Layout

- `packages/switchboard-core-spfx`
  - Active implementation: console shell, Daily Notes, operator/test Code Alert launcher, 23 app-owned alert workflows, simulated Riskmaster, and internal demo logging
- `packages/code-alert-spfx`
  - Reserved scaffold for the future dedicated Originator/interface phase; not the current active Code Alert implementation
- `packages/or-call-in-spfx`
  - OR Team Call-In workflow
- `packages/dui-intake-spfx`
  - DUI Intake workflow
- `packages/paging-log-spfx`
  - Paging Log workflow
- `packages/alarm-panel-spfx`
  - Alarm Panel workflow
- `packages/shared`
  - Shared models, contracts, utilities, and service abstractions

## Provisioning Layout

- `provisioning/common`
  - Cross-module setup notes and reusable schema templates
- `provisioning/<module>`
  - Module-specific list schema notes and setup artifacts

## Test Data Layout

- `test-data/sharepoint-lists`
  - Safe seed data files by list
- `test-data/scenarios`
  - End-to-end walkthrough datasets and narrative scenarios

## Current Implementation Order

1. Close the remaining switchboard Code Alert form/backend decisions in `switchboard-core-spfx`.
2. Plan and build the sophisticated Originator interface as its own phase.
3. Continue remaining module packages in priority order from `PROJECT_PLAN.md`.

## Switchboard Core Build Shape

The first full implementation target is `packages/switchboard-core-spfx`.

Recommended internal areas:

- `webparts`
  - SPFx entrypoint and property pane wiring
- `models`
  - Daily Notes, search, popup, and shell state contracts
- `constants`
  - List names, field names, and shell constants
- `services`
  - SharePoint-backed services, mock services, and service interfaces
- `components`
  - Shell layout, Daily Notes, module column, popup host, and shared UI parts
- `hooks`
  - Local shell state helpers
- `utils`
  - Formatting, grouping, print, and search helpers
- `styles`
  - Shared shell styling and print styles

See `docs/SWITCHBOARD_CORE_BUILD_SPEC.md` for the concrete first-pass structure.
