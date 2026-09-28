# CODEX_MASTER_PROMPT.md

# CODEX Starter Prompt

You are helping build a modular SharePoint Online / SPFx proof-of-concept for an ED switchboard operator console.

Before coding, read these files completely:

1. `AGENTS.md`
2. `ARCHITECTURE.md`
3. `DATA_MODEL.md`
4. `PROJECT_PLAN.md`
5. `SHAREPOINT_DEPLOYMENT.md`

## Absolute Safety Directive

This is a demonstration/proof-of-concept system only.

You must never write, create, update, delete, submit, trigger, notify, or otherwise modify anything in production hospital systems.

External systems may be read only when explicitly approved, but all production write paths are forbidden.

Do not use real patient data. Use synthetic/mock data only.

If a requirement would touch Epic, Riskmaster, MedTrak, paging systems, phone directories, production spreadsheets, or any other hospital production system, treat that dependency as read-only or mock it.

## Product Goal

Build an operator console that reduces switchboard operator cognitive burden during stressful workflows.

The UI must be obvious, stable, and minimal. Do not over-modernize critical interfaces. Use simple HTML and predictable layouts. Tables are acceptable for instruction/logging alignment.

## First Build Target

Begin with the Switchboard Console shell and Daily Notes foundation unless instructed otherwise.

The page should support:

- Left reference/navigation column.
- Center ED Switchboard Daily Notes panel.
- Right launcher column.
- Shared full-screen popup / Alert Surface Panel placeholder.

The right launcher modules are:

- Code Alert
- OR Team Call-In
- DUI
- Paging Log
- Alarm Panel Log

## Naming Rules

Use PascalCase with alphabetic module prefixes. No spaces, underscores, hyphens, punctuation, or special characters in internal names.

Examples:

- `CaAlertType`
- `OrSurgeryDateTime`
- `DuPoliceDepartment`
- `PgWhoCalled`
- `AlAlarmType`
- `SwDailyNotes`

## Implementation Bias

Prefer:

- SPFx web parts.
- SharePoint Lists for data/configuration.
- Manual setup first if faster.
- Modular deployment.
- Internal demo writes only.
- Fake data.

Avoid:

- Production writes.
- PHI.
- Overbuilt workflow engines.
- Fancy CSS that risks popup stability.
- Hidden UI state.
- Complex real-time services in Phase 1.

## Code Alert MVP Notes

- The implemented switchboard/operator form suite is separate from the future sophisticated Originator interface.
- The current right-column launcher is for operator/demo testing and does not represent Originator mode.
- A future Originator phase will write `CodeAlerts` items and a future switchboard intake provider will poll or receive them.
- Code Alert workflow behavior is app-owned and developer-release controlled.
- Site admins must not be able to change task flow, required actions, branch logic, or terminal states through SharePoint list edits.
- Linked reference documents may live in SharePoint libraries, but controls and active workflow behavior are implemented in released SPFx modules.
- Announcement language must preserve approved event wording.
- All-clear is optional for all events.
- No two-way originator receipt in MVP.
- Current form/backend status and loose ends are tracked in `docs/CODE_ALERT_FORM_PHASE_CLOSEOUT.md`.

## OR Call-In MVP Notes

- Replicate the paper OR Call-In layout.
- `OrSurgeryDateTime` is required.
- MedTrak/mock roster lookup happens after surgery date/time is entered.
- Contact rows are child rows.
- Small clock icon stamps current datetime.

## DUI MVP Notes

- Synthetic data only.
- Checklist only:
  - Security notified
  - Lab notified
  - DUI registered

## Ask Before Doing

Before introducing any dependency outside SharePoint demo lists, stop and explain why it is needed and how it remains read-only/mock-safe.
