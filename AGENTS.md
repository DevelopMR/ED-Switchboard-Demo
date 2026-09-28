# ED Switchboard SharePoint Proof-of-Concept

This repository is for a modular SharePoint Online / SPFx proof-of-concept for an Emergency Department switchboard operator console. The project is intended for demonstration, design validation, and safe workflow prototyping only.

## Non-Negotiable Safety Rules

This is a demonstration/proof-of-concept system only.

CODEX must never write, create, update, delete, submit, trigger, notify, or otherwise modify anything in production hospital systems.

External systems may be read only when explicitly approved, but all production write paths are forbidden.

The project must avoid real patient data. Use mock, synthetic, anonymized, or fake data only. Do not store PHI, patient identifiers, MRNs, dates of birth, Social Security numbers, clinical details tied to real people, or any other privacy-sensitive patient information.

All Riskmaster receipts, patient records, alerts, call-ins, condition logs, paging actions, Epic actions, MedTrak data, spreadsheet outputs, phone directory data, and alarm logs must be simulated unless explicitly marked as internal demo SharePoint data.

At every implementation step, privacy and production-system safety must be reviewed before proceeding. When in doubt, choose the safer demo/mock path.

Any attempt to introduce external write capability is a blocking violation and must be rejected or disabled by default.

## Core Product Principle

The interface must reduce operator thinking during stressful moments. It should show exactly what is needed, in the order it is needed, with no visual puzzles.

The switchboard operator's job is hard enough without the interface adding little puzzles. This console must be boring, stable, obvious, and fast.

## Build Style

- Prefer simple, stable HTML layout for critical workflows.
- Tables are acceptable and preferred for procedure/logging alignment.
- Use divs for large containers only.
- Avoid clever responsive grids in critical popup interfaces.
- Avoid unnecessary animations.
- Avoid UI patterns that require the operator to interpret hidden state.
- Keyboard support is required in popup workflows:
  - Tab moves focus.
  - Space toggles or activates the focused control.
  - Ctrl+Enter attempts the primary submit/confirm action.
- No keyboard shortcut may cancel, all-clear, delete, or resolve an alert without explicit focused-button confirmation.

## Naming Conventions

Use PascalCase with alphabetic module prefixes. Do not use spaces, underscores, hyphens, punctuation, or special characters in SharePoint internal names, field names, list names, TypeScript identifiers, or configuration keys.

Recommended prefixes:

- `Ca` = Code Alert
- `Or` = OR Call-In
- `Du` = DUI
- `Pg` = Paging Log
- `Al` = Alarm Panel
- `Sw` = Switchboard / Daily Notes
- `App` = shared application settings

Examples:

- `CaAlertType`
- `CaLocation`
- `OrSurgeryDateTime`
- `DuPoliceDepartment`
- `PgWhoCalled`
- `AlAlarmType`
- `SwLogDate`

## Development Expectations

- Build in small deployable modules.
- Each web part subproject should create or document its own SharePoint lists and resources.
- Some subprojects may be tested in separate SharePoint site collections.
- Modules should be portable and configurable.
- Avoid hardcoded tenant/site/list assumptions when practical.
- Prefer SharePoint lists for demo data, configuration, and rich text guidance.
- Prefer internal demo writes only.
- Treat any external system integration as read-only or mocked.

## First-Phase Technology Direction

- SPFx web parts for the operator console and popup workflows.
- SharePoint Lists as the data/configuration layer.
- SharePoint version history enabled where possible.
- Standard SharePoint permissions for real access control.
- Manual provisioning is acceptable in early proof-of-concept phases.
- Later provisioning can be automated.

## Required Review Habit

Before writing code that touches integrations, lists containing sensitive fields, alert routing, or persistence, stop and verify:

1. Does this write only to internal demo SharePoint lists?
2. Is all patient-related data fake/synthetic?
3. Is any external system interaction read-only?
4. Is this UI reducing operator burden rather than adding decisions?
5. Does this preserve approved Code Alert language without alteration?
