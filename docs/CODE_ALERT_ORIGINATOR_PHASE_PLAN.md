# Code Alert Remote Originator Phase Plan

Date: `2026-06-20`

## Purpose

Build a lightweight, independently deployable remote Code Alert Originator web part. It submits safe demo alerts to the ED Switchboard hub without deploying the switchboard operator workflows or granting remote users access to the hub's `CodeAlerts` list.

The first implementation targets several dozen registered originator installations and manual testing with up to three simultaneous originators.

## Package Boundary

- `packages/code-alert-spfx`: remote Originator web part and central intake client only.
- `packages/switchboard-core-spfx`: hub receiver, operator popup workflows, acknowledgements, and switchboard logging.
- `packages/shared`: dependency-light alert IDs, categories, labels, ordering, transport request/response types, status enums, and safe formatting utilities used by both packages.

The remote package must not contain or deploy switchboard procedure workflows, Riskmaster simulation, Daily Notes, page-log services, or operator-only controls. Shared code is compile-time code reuse, not a shared deployable web part.

The eventual application installation should be delivered as a coordinated deployment bundle:

- independently deployable SPFx packages;
- SharePoint fields, content types, lists, views, forms, permissions, and feature assets;
- Azure Functions endpoint configuration, function keys/identity, app settings, CORS, and monitoring;
- a solution-aware Power Automate fallback/reconciliation flow with connection references/environment configuration if retained;
- setup validation and safe demo seed/configuration instructions.

Azure Functions, Power Automate, and tenant/site permissions are separate platform artifacts from an `.sppkg`; a tidy installer may orchestrate them together, but must not pretend they are physically one SPFx package.

## Transport Boundary

Remote users will not receive direct permission to the hub `CodeAlerts` list.

Target flow:

1. The remote SPFx web part creates an append-only item in the central `CaOriginatorRequests` intake list using the user's normal SharePoint session.
2. The list's system `Created` and `Created By` values are the authoritative originator submission time and identity.
3. The remote SPFx web part sends a pointer-only signal to Azure Functions containing only the intake item ID, request ID, originator ID, and switchboard ID.
4. The Azure Function validates the signal, re-reads the authoritative intake row, validates active endpoint registration, then promotes it into the secured `CodeAlerts` list using a controlled service identity.
5. The Function copies the intake item's system creation time and user identity into dedicated originator fields on the secured alert. The secured item's own system fields continue to identify the function/service connection.
6. The switchboard receives or polls for the secured alert and the operator acknowledges it.
7. On acknowledgement, the switchboard app updates both the secured alert and the linked intake receipt directly. This is the preferred fast return path and does not wait for a second Power Automate flow.
8. The remote control polls only the current user's own active intake receipts and displays acknowledgement/status changes.
9. An originator submits `Request All Clear` as a new append-only intake command referencing the original request. The Function or a fallback workflow promotes the command; the switchboard operator decides and issues the actual All Clear.

## Central Intake Permission Model

`CaOriginatorRequests` is an internal mailbox, not a generally editable collaboration list:

- `Everyone except external users` may add items and read only items they created.
- Originators may not edit or delete items, including their own.
- External/guest users have no access.
- A controlled Azure Function service identity can read/update all items and create secured alerts.
- A controlled Power Automate service connection may remain available for fallback/reconciliation while the Function path is proven.
- The switchboard operator group can read/update all intake receipts for acknowledgement and terminal status.
- Versioning is enabled.
- The list is omitted from ordinary navigation, but hiding it is not treated as security.

This intentionally mirrors the existing policy that any employee may call in a Code Alert. SharePoint supplies authenticated `Created By` attribution without maintaining a separate application user roster. Endpoint registration remains routing/configuration validation, not user authentication.

The permission spike must prove create-only behavior, own-item visibility, service/switchboard updates, cross-site access, and protection from edit/delete before form implementation begins.

## Fast Acknowledgement Channel

- The Azure Function signal path is the preferred speed-critical channel. The Originator sends a pointer-only signal immediately after the SharePoint intake item is created.
- The item-created Power Automate flow is now a legacy/fallback option. Its actual tenant latency must be measured rather than assumed and should not be relied on for phone-call-speed alert creation.
- The switchboard hub should poll promoted alerts on a short configurable interval during the demo.
- The switchboard acknowledgement handler writes the linked intake receipt immediately after the secured acknowledgement succeeds.
- An originator with an active alert polls its own receipt every few seconds. Polling backs off when there are no active alerts and pauses when the page is hidden.
- Browser polling is ordinary list retrieval and is not tied to a SharePoint timer-job interval.
- If the direct receipt update fails, the secured acknowledgement remains authoritative and a reconciliation flow/job repairs stale intake receipts.

SignalR/WebSocket push would require additional realtime infrastructure. It is unnecessary for the basic proof of concept unless measured Function signal plus fast polling latency is unacceptable.

## Identity and Registration

- Installation properties use `OriginatorId` and `SwitchboardId` as routing identifiers, not passwords or cryptographic secrets.
- IDs stored in SPFx properties are visible to browser users and must never be treated as authentication.
- The hub maintains an app-owned registration record for each remote installation, including enabled state, display name, expected target, allowed alert types/categories, and default location metadata.
- Authentication and broad authorization come from the user's internal SharePoint session and the intake-list permission assignment. Active endpoint registration validates routing and configuration.
- SharePoint system fields, not browser-submitted identity fields, record authoritative current-user identity and event time.
- Do not maintain patient rosters or patient identifiers for authorization.

## Basic Originator Experience

### Fresh Load

- Load editable installation presets for facility, department/area, floor, direction, room, and additional location detail. These are form-composition helpers; submission stores one composed location string.
- Show all 23 Code Alerts grouped by category.
- Use stable buttons and plain labels; do not hide choices in a search-only control.
- Preserve app-owned alert wording and category assignments.

### Provisional Display Order

Medical:

1. Rapid Response Adult
2. Code Blue Adult
3. Stroke Alert
4. Trauma Alert
5. Condition Help
6. Welfare Check
7. Rapid Response Pediatric
8. Code Blue Pediatric
9. Obstetrics Emergency
10. Outside Medical Emergency

Security:

1. Condition Support
2. Enhanced Security Measures
3. Missing Person/Missing Child
4. Bomb Threat
5. Child Abduction
6. Infant Abduction
7. Armed Subject/Active Shooter

Facility:

1. Fire Alarm
2. Severe Weather Event Activation
3. Hazardous Materials Spill/Release
4. Decontamination
5. Emergency Operations Plan
6. Mass Casualty Incident

Ordering is release-controlled and provisional until local reviewers provide actual frequency data. Frequency ordering must never alter urgency handling after submission.

### Location

Editable fields:

- Facility
- Department/unit or area
- Floor
- Direction: North, South, East, West, or a safe free-text equivalent
- Room
- Additional location detail, for example `3 South, Rm 314 W [window]`

Individual location fields are optional because some departments have no floor or room. Submission must still produce a clear, non-empty composite location in `CaLocation`. The individual helper fields are not persisted as separate intake columns. Installation presets populate on every fresh load but remain fully editable for events outside the originator's usual department.

Keyboard focus follows the visible form flow using natural DOM order: active-alert controls, alert category/type selection, location helpers, conditional descriptor field, review, and Send. Do not use positive `tabindex` values. Conditional controls enter the cycle only when visible.

### Evidence and Additional Details

- Bomb Threat: optional multiline evidence/details field.
- Child Abduction: candidate optional multiline description/evidence field, pending wording approval.
- Do not request patient name, MRN, date of birth, diagnosis, or other PHI.
- Display a concise warning not to enter patient identifiers or sensitive clinical information.
- Evidence/details are transmitted only when the selected alert supports the field.
- Client-side validation blocks recognizable SSN and phone-number patterns, contiguous 12-digit MRNs, and contiguous 16-digit visit codes before creating the intake item.
- The promotion flow repeats validation and refuses to copy a bypassed/invalid payload into `CodeAlerts`.
- The Azure Function signal rejects any browser payload that contains more than the approved pointer fields.
- Structured room/location fields must not be rejected merely for containing ordinary room or floor numbers.
- Regex screening is a guardrail, not a complete PHI detector. A client-side check can be bypassed, so the UI must not claim that regex guarantees privacy.

### Send and Acknowledgement

- Require an explicit Send confirmation showing alert type and composed location.
- Disable repeat Send while the request is in flight.
- Generate a client request ID for idempotency; the promotion flow generates the authoritative secured alert ID.
- Show `Sending`, `Sent - awaiting switchboard acknowledgement`, `Acknowledged`, and clear error/retry states.
- Acknowledgement includes the switchboard acknowledgement time and a minimal safe reply. It must not expose operator-only procedure details.

### All Clear

- All Clear is unavailable until switchboard acknowledgement.
- Show approved explanatory copy before the control.
- Label the remote action `Request All Clear` unless policy explicitly authorizes the originator to declare the terminal state.
- Require confirmation before submitting the request.
- The originator may close the web part experience without requesting All Clear.
- After acknowledgement, an alert remains visible in the originator popup for five minutes so the originator has time to request All Clear.
- Reload/reopen behavior queries the user's own active intake receipts. The popup does not need to remain open and no client-only state is required, though already acknowledged rows may only be retained client-side after the secured workflow has closed.
- Multiple active alerts are supported. A persistent bar above the origination form shows each ongoing alert, elapsed time from SharePoint `Created`, acknowledgement state, and `Request All Clear` when eligible.
- `Request All Clear` creates a new append-only `CaOriginatorRequests` row with `CaRequestType=AllClearRequest` and `CaParentRequestId` pointing to the original request.
- The Azure Function promotes that command into a secured `CodeAlerts` row with `CaRequestType=AllClear`, same rule/category/type/location as the parent alert, and parent correlation fields.
- The switchboard All Clear popup is deliberately short: Acknowledge plus one overhead announcement line ending in `+ All Clear`. It skips Riskmaster and the extended alert-specific tasks.

## Audit and History

The Originator control does not create a separate interaction audit. Durable evidence comes from:

- intake-list system `Created`, `Created By`, `Modified`, and version history;
- secured `CodeAlerts` lifecycle fields and history;
- Power Automate run history and safe processing status;
- existing switchboard Daily Notes/page logs where applicable.

Do not log field focus, clicks, keystrokes, or duplicate free-text evidence in diagnostics.

## Reliability and Concurrency

- Every command carries a unique client request ID.
- Function promotion writes are idempotent by originator endpoint plus request ID.
- Send and All Clear controls lock while pending.
- Retries reuse the same request ID until the outcome is known.
- Three simultaneous test originators must not overwrite or acknowledge one another's alerts.
- SharePoint permissions scope originator reads to items created by that user; the UI additionally filters by active status and endpoint.
- Hub polling and queue behavior remain behind transport interfaces so the intermediary implementation can change later.

## Privacy and Safety

- Internal demo SharePoint data only.
- Synthetic content only; no PHI or patient identifiers.
- No production paging, Epic, Riskmaster, alarm, phone, or clinical-system writes.
- Remote users receive create/own-read access only to the central intake list and never receive secured hub-list access.
- Browser properties contain routing configuration only, never secrets.
- Broker/service permissions follow least privilege and are limited to required demo resources.

## Implementation Sequence

1. Approve the remaining authorization and wording decisions below.
2. Complete the central intake permission, cross-site access, Azure Function setup, and direct acknowledgement spike.
3. Define shared alert catalog and transport contracts in `packages/shared`.
4. Provision/document `CaOriginatorRequests`, demo `CodeAlerts`, and endpoint-registration resources at the hub.
5. Implement Azure Function pointer-only signal validation, SharePoint re-read, promotion, idempotency, and stale-item reconciliation.
6. Scaffold the independent remote `code-alert-spfx` package and basic form.
7. Connect hub intake and acknowledgement.
8. Add active-alert tracking, direct receipt updates, status recovery, and append-only All Clear requests.
9. Test one, then three simultaneous remote originators.
10. Perform security, privacy, keyboard, retry, replay, and failure-state review.

The earlier manual Power Automate promotion-flow setup is documented in `docs/CODE_ALERT_PROMOTION_FLOW_SETUP.md` as a legacy/fallback reference.

## Implementation Status

Package `packages/code-alert-spfx` baseline `0.1.3` now includes:

- an independently packaged SPFx Originator web part;
- all 23 ranked/category-grouped alerts;
- natural keyboard tab order matching visible form flow;
- editable location composition persisted as one `CaLocation` value;
- Bomb Threat and Child Abduction descriptor fields;
- client-side SSN, phone, 12-digit MRN, and 16-digit visit-code screening;
- explicit review and create-only Send behavior;
- SharePoint and mock intake service abstractions;
- current-user display;
- multiple-active-alert tracking with elapsed time and acknowledgement state;
- append-only `Request All Clear` command creation after acknowledgement;
- five-minute acknowledged-alert retention in the Originator popup;
- Azure Function promotion for both `Alert` and `AllClearRequest` intake commands;
- secured switchboard `AllClear` workflow rows with parent alert correlation;
- Windows-lock-aware clean/build retry scripts.

Live tests confirmed that the Originator renders correctly, composes one location, creates a durable intake row, and restores it in the ongoing-alert bar. The corrected Originator ID field uses the confirmed SharePoint internal name `CaOriginatorId`; the temporary misspelled `aOriginatorId` column is no longer referenced. The secured `CodeAlerts` list and its correlation columns are manually provisioned and confirmed.

The item-created Power Automate promotion flow was built and tested as a proof/fallback path: it validates required fields, checks `CaClientRequestId` for idempotency, creates one secured alert, copies authoritative intake creation identity/time, and returns `Promoted` plus `CaSecureAlertId` to the intake row. A controlled resubmit followed the existing-alert branch and created no duplicate secured row. Because Code Alert speed must compare favorably to a phone call, the active direction has shifted to an Azure Functions Flex Consumption signal path with SharePoint list data as the authoritative detail source.

Package `packages/code-alert-functions` baseline `0.1.0` has been scaffolded with a pointer-only HTTP trigger stub. It accepts only `requestItemId`, `requestId`, `originatorId`, and `switchboardId`; extra fields are rejected before any promotion logic runs. Real SharePoint promotion remains stubbed until Azure identity, function keys, permissions, and CORS are configured.

## Decisions Still Required

1. Approve the Child Abduction descriptor label and explicitly prohibited content.
2. Measure Azure Function signal plus switchboard polling latency in the target tenant.
3. Decide how long completed/abandoned intake receipts remain visible and retained.

## Explicit Non-Goals for the Basic Version

- No deployment of switchboard operator workflows to remote sites.
- No client-stored shared secret or hashcode authentication.
- No direct remote access to secured `CodeAlerts`, Daily Notes, Riskmaster demo, or page logs.
- No patient lookup or patient data.
- No production-system notification.
- No general-purpose workflow editor.
