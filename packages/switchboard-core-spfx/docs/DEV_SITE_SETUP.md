# Developer Site Setup

Use this checklist to prepare the shell foundation lists for `switchboard-core-spfx` in your developer site.

## Scope

This document covers the two shell foundation lists:

- `SwDailyNotes`
- `SwShellState`

The current Code Alert form/backend also requires manually provisioned internal demo resources documented in `docs/SHAREPOINT_DEPLOYMENT.md`:

- `RmDemoEntries`
- `PgOverheadPageLog`

The two lists below support:

- loading Daily Notes entries
- searching/filtering by date and category
- creating manual notes
- persisting drawer-count JSON metadata

## Before You Start

- Work in a developer or non-production SharePoint site only
- Use fake/synthetic data only
- Turn on version history for both lists
- Restrict delete permissions for normal users if practical

## List 1: SwDailyNotes

Create a custom list named:

- `SwDailyNotes`

Recommended columns:

1. `Title`
   - Single line of text
   - Keep this because SharePoint expects it and the adapter writes it

2. `SwLogDate`
   - Date only

3. `SwEventTime`
   - Date and time

4. `SwEntryType`
   - Choice
   - Choices:
     - `GeneralNote`
     - `CodeAlert`
     - `OrCallIn`
     - `Dui`
     - `Paging`
     - `AlarmPanel`
     - `RiskmasterDemo`
     - `Other`

5. `SwTitle`
   - Single line of text

6. `SwSummary`
   - Multiple lines of text
   - Plain text is fine for the first pass

7. `SwDetails`
   - Multiple lines of text
   - Rich text optional

8. `SwSourceModule`
   - Single line of text

9. `SwSourceItemId`
   - Single line of text

10. `SwSearchText`
    - Multiple lines of text
    - Plain text

11. `SwLocationText`
    - Single line of text

12. `SwCategoryText`
    - Single line of text

13. `SwOperatorName`
    - Single line of text

14. `SwShift`
    - Choice
    - Optional for now

15. `SwIsPrinted`
    - Yes/No
    - Optional for now

## Suggested SwDailyNotes Views

1. `Today`
   - Filter `SwLogDate` equals today
   - Sort by `SwEventTime` descending

2. `ByDate`
   - Sort by `SwLogDate` descending
   - Then `SwEventTime` descending

3. `ByEntryType`
   - Group or sort by `SwEntryType`

4. `Search`
   - No special formatting required yet

## Sample SwDailyNotes Items

Create 3 fake entries so we can test retrieval later:

1. General note
   - `SwLogDate`: today
   - `SwEventTime`: current time
   - `SwEntryType`: `GeneralNote`
   - `SwTitle`: `Shift note`
   - `SwSummary`: `Elevator phone intermittent. Watch for repeated calls.`

2. Code alert note
   - `SwLogDate`: today
   - `SwEventTime`: current time
   - `SwEntryType`: `CodeAlert`
   - `SwTitle`: `Code Blue Adult`
   - `SwSummary`: `ED Room 12 announced`

3. Alarm note
   - `SwLogDate`: today
   - `SwEventTime`: current time
   - `SwEntryType`: `AlarmPanel`
   - `SwTitle`: `Fire Alarm Panel`
   - `SwSummary`: `Maintenance contacted`

## List 2: SwShellState

Create a second custom list named:

- `SwShellState`

Recommended columns:

1. `Title`
   - Single line of text
   - Use this to store the date key such as `2026-05-09`

2. `SwStateDate`
   - Date only
   - Optional but recommended for admin readability

3. `SwDrawerCountData`
   - Multiple lines of text
   - Plain text

4. `SwStateNotes`
   - Multiple lines of text
   - Optional

## Sample SwShellState Item

Create one fake item:

- `Title`: today in `YYYY-MM-DD`
- `SwStateDate`: today
- `SwDrawerCountData`:

```json
{"boxes":[{"slot":1},{"slot":2},{"slot":3},{"slot":4}]}
```

## Site Information To Keep Handy

Once the lists exist, keep these available:

- site URL
- exact list titles
- whether internal field names exactly match the planned names
- whether any columns were auto-adjusted by SharePoint

## Current Verification

`SwDailyNotes` and `SwShellState` are live on the internal developer site. Code Alert tests confirmed timestamp alignment, `SwLocationText` persistence, source-ID correlation, and one final note per alert.
