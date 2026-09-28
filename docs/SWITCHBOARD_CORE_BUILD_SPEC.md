# Switchboard Core Build Spec

This document defines the first-pass implementation structure for `packages/switchboard-core-spfx`.

## Current Status - June 2026

The first-pass shell structure is implemented and now also hosts the mature switchboard-side Code Alert workflow suite. Current package version is `0.1.20`. The package owns the popup host, 23 alert workflow modules, simulated Riskmaster surface, `PgOverheadPageLog` writes, and correlated `SwDailyNotes` summaries. See `docs/CODE_ALERT_FORM_PHASE_CLOSEOUT.md`.

## Goals

- Build the primary ED Switchboard shell first
- Keep the center Daily Notes experience search-friendly
- Keep the visual layout close to the paper `ED Switchboard Daily Notes` form
- Keep the urgent popup surface owned by the shell
- Keep implementation simple enough to move quickly

## Primary Shell Components

- `SwitchboardShell`
- `ShellHeader`
- `ReferenceColumn`
- `DailyNotesPanel`
- `ModuleColumn`
- `PopupHost`

## Daily Notes Direction

The center panel is not just a generic feed. It should visually group entries into sections inspired by the paper form:

- Recent Codes
- Recent Alarms and Maintenance Calls
- Other Important Notes

The backing data model should stay simple:

- one main `SwDailyNotes` SharePoint list
- one item per log entry
- entries searchable by date, category, and text
- module workflows write into the same list with the correct `SwEntryType`

This keeps the UI familiar while preserving straightforward filtering and search.

## Drawer Count Direction

Drawer counted should not become a separate operational list in Phase 1.

Recommended first-pass behavior:

- render clickable boxes on the form
- when clicked, record current user and current datetime
- store the values as a structured object serialized into a single plain-text field if persistence is needed

Example concept:

```json
{
  "boxes": [
    {
      "slot": 1,
      "countedAt": "2026-05-09T12:00:00Z",
      "countedBy": "Operator Name"
    }
  ]
}
```

This should remain lightweight until a stronger persistence need appears.

## Recommended Folder Layout

```text
packages/
  switchboard-core-spfx/
    config/
    sharepoint/
    src/
      webparts/
        switchboardShell/
      models/
      constants/
      services/
        sharepoint/
        mock/
        contracts/
      components/
        shell/
        referenceColumn/
        dailyNotes/
        dailyNotesSections/
        moduleColumn/
        popupHost/
        shared/
      hooks/
      utils/
      styles/
      testData/
    docs/
```

## Suggested Source Areas

### `models`

- `SwDailyNoteItem`
- `SwDailyNoteCategory`
- `SwDrawerCountState`
- `SwSearchQuery`
- `SwSearchResult`
- `AppPopupMessage`
- `AppPopupAction`
- `ShellViewState`

### `constants`

- `ListNames`
- `SwFields`
- `ShellConstants`

### `services/contracts`

- `ISwDailyNotesService`
- `ISwDrawerCountService`
- `IShellSearchService`
- `IPopupHostService`

### `services/sharepoint`

- `SwDailyNotesService`
- `SwDrawerCountService`
- `ShellSearchService`
- `ShellStateService`

### `services/mock`

- `MockSwDailyNotesService`
- `MockSwDrawerCountService`
- `MockShellSearchService`

### `components/shell`

- `SwitchboardShell`
- `ShellLayout`
- `ShellHeader`
- `ShellBody`

### `components/dailyNotes`

- `DailyNotesPanel`
- `DailyNotesToolbar`
- `DailyNotesFormCanvas`
- `DailyNotesSearchBar`
- `DailyNotesSearchResults`
- `DailyNotesEntryList`
- `DailyNotesEntryRow`
- `DailyNotesEntryDialog`
- `DailyNotesEmptyState`

### `components/dailyNotesSections`

- `RecentCodesSection`
- `RecentAlarmsSection`
- `OtherImportantNotesSection`
- `DrawerCountedSection`

### `components/moduleColumn`

- `ModuleColumn`
- `ModuleLauncherCard`
- `CodeAlertStatusCard`

### `components/popupHost`

- `PopupHost`
- `PopupQueueStrip`
- `PopupFrame`
- `PopupActionBar`
- `PopupGuardDialog`

## Popup Host Rules

- Full-screen or near-full-screen takeover below the purple header band
- Hard to leave accidentally
- No casual dismissal of unresolved urgent items
- Queue handling belongs to the shell
- Modules provide message content and actions, but not the host itself

## Packaging Guidance

Keep `packages/shared` lightweight at first.

Good early candidates to move there later:

- shared list-name constants
- shared field-name constants
- popup message contracts
- action contracts
- pure utility contracts

Do not force early formal packaging until the shared surface proves stable.
