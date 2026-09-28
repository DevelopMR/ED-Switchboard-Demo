# Visual Style

This document defines the first-pass visual direction for the ED Switchboard shell and Daily Notes experience.

## Goals

- Keep a consistent, recognizable house style built on one deep purple accent
- Keep the shell calm and operational rather than promotional
- Use color for hierarchy and urgency, not decoration
- Preserve high readability in long shifts and stressful moments

## Reference Palette

The project uses its own restrained palette: a deep purple primary accent, cool neutral grays, and a small set of secondary accent colors.

- Primary purple: `#4D104A`. Use it as an accent, not as the dominant color in a layout.
- Neutral grays for hierarchy and contrast:
  - Gray 11 `#363533`
  - Gray 9 `#78777A`
  - Gray 7 `#9A9A9B`
  - Gray 4 `#BDBBBB`
  - Gray 1 `#DBD9D6`

Secondary accent colors appropriate for restrained use:

- `#47C6E6`
- `#0092B4`
- `#FBAF5D`
- `#F47721`
- `#CDDC29`
- `#A9B533`
- `#F37F89`
- `#BB2253`

## Recommended Shell Palette

Use the palette conservatively:

- Primary shell accent: `#4D104A`
- Secondary deep purple for stronger emphasis when needed: `#3C1053`
- Working-surface text: `#111111`
- Strong neutral text and borders: `#363533`
- Mid neutral lines and separators: `#9A9A9B`
- Soft section fills and ruled-form bands: `#DBD9D6`
- Page working background: white or near-white

## Usage Rules

- The switchboard shell should use the dominant purple mainly in header accents, popup borders, and high-priority action emphasis.
- Accent colors should be reserved for categorization or module distinction and should not become the page background.
- The center Daily Notes form should remain mostly white and neutral gray so printed output remains clear.
- Popup urgency should rely first on layout, wording, and focus behavior, not only on saturated color.
- Avoid turning the shell into a marketing-style brand surface.

## UI Translation

Recommended first-pass mapping:

- Shell header rule and popup border: `#4D104A`
- Module launcher borders and active queue strip states: `#4D104A`
- Section bands: light neutral based on `Gray 1`
- Form rules and structural separators: `Gray 7` to `Gray 9`
- Danger/resolve controls may use a deeper alert tone, but should stay visually compatible with the palette rather than introducing unrelated colors

## Shared Popup Layer Refresh

The August 2026 popup refresh uses the existing Switchboard page as visible context while making the active workflow the only interactive surface.

- A translucent neutral backdrop dims the full SharePoint viewport, including surrounding page chrome.
- The underlying page remains visible for orientation but is unavailable to pointer, keyboard, and assistive-technology interaction while a workflow is active.
- The workflow appears in a large centered white surface with restrained corner rounding and shadow.
- The active queue item, elapsed indicator, active-step border, step marker, and primary workflow actions inherit the alert's release-controlled color.
- Every alert color must define a readable foreground. Light salmon, pink, yellow, and gray accents use dark foreground text rather than relying on white.
- Completed steps compress into a stable four-card row at large desktop widths and wrap predictably at narrower widths.
- The current step remains expanded and is identified by both a number and layout, never by color alone.
- The popup contains no general close control. Escape must not dismiss, cancel, all-clear, resolve, or otherwise complete a workflow.
- Tab and Shift+Tab stay inside the active popup. Focus returns to the launching control only after the workflow reaches its approved terminal behavior.
- Existing approved Code Alert language, task order, persistence, and keyboard submission rules are not changed by the styling pass.

## Notes

- This document uses the public PDF as a design reference only.
- If the project later receives official tenant or department design standards, those should supersede this summary.
