# Legacy Code Alert Promotion Flow Setup

Date: `2026-06-22`

## Purpose

Promote an immutable internal request from `CaOriginatorRequests` into secured `CodeAlerts`, then update the originator receipt. This flow does not open the switchboard popup by itself; the switchboard polling/provider slice consumes the secured row later.

Status: legacy/fallback reference. This Power Automate path was built and tested successfully, but the active Code Alert Originator architecture now uses Azure Functions Flex Consumption for the speed-critical initial signal and promotion path. Keep this document for reconciliation/fallback design and for understanding the field mappings already proven in the tenant.

Designer labels can vary slightly between Power Automate versions. Use internal SharePoint field names in expressions and OData filters.

## Workflow-Building Communication Protocol

Build and verify Power Automate flows incrementally because the designer can introduce automatic loops, stale fields, and ambiguous dynamic-content tokens.

- Discuss and configure only one step at a time, normally no more than one or two controls.
- For a typical SharePoint `Update item` control, configure and verify `Id` and `Title` first.
- After `Id` and `Title` are confirmed, map fields in batches of four.
- Name every control before expressions or downstream references depend on it.
- State every field mapping explicitly; do not use shorthand such as "preserve the original fields."
- Say whether a field should be omitted, included with an empty value, populated with dynamic content, or assigned a literal value. Never type the word `blank` when an empty value is intended.
- After each batch, pause for confirmation and inspect the designer for an automatically inserted `Apply to each` / `For each` control.
- When selecting `ID`, identify the source control explicitly. Intake updates use the system `ID` from `When an item is created`, not an ID returned by `Get items` or `Create item`.
- Review and save each complete branch before moving to testing.

## Prerequisites

- Trigger connection can read/update `CaOriginatorRequests`.
- Flow service connection can create/read `CodeAlerts`.
- `CaClientRequestId` is unique/indexed in `CodeAlerts`.
- `CaAlertId`, `CaStatus`, `CaRuleId`, `CaOriginatorId`, `CaSwitchboardId`, and `CaOriginatorRequestItemId` have the confirmed settings in `docs/DATA_MODEL.md`.
- Intake choices include `Received`, `Promoted`, `Rejected`, and `Failed`.
- Secured status choices include `Submitted`.

## Flow Header

Suggested name: `CaPromoteOriginatorRequest`

### Trigger: When an item is created

Connector: SharePoint

- Site Address: `https://darkmatter.sharepoint.com/sites/EDSwitchboard`
- List Name: `CaOriginatorRequests`

Trigger settings:

- Do not add a trigger condition yet; the Switch control below separates Alert and All Clear commands.
- Leave concurrency control off for the first test. Default concurrency permits the planned small simultaneous test. Do not force degree `1` unless ordered serialization is later required.

## Control 1: Switch - Request Type

Add `Switch` immediately after the trigger.

- Rename: `Switch - Request Type`
- On: trigger dynamic content `CaRequestType`

Cases:

- `Alert`
- `AllClearRequest`

Default handles unknown values.

The `AllClearRequest` case remains a safe placeholder until the command-promotion slice. Add a `Compose` named `Deferred - All Clear promotion` with text `All Clear command promotion is not implemented in this slice.` Do not mark the request failed.

## Alert Case

### Intake update preservation mapping

Every standard SharePoint `Update item` action in this flow should carry forward the original intake values so the connector cannot clear them while changing status. In addition to the action-specific status fields, map:

- `Title`: trigger `Title`
- `CaRequestId`: trigger `CaRequestId`
- `CaRequestType`: trigger `CaRequestType`
- `CaParentRequestId`: trigger `CaParentRequestId`
- `CaOriginatorId`: trigger `CaOriginatorId`
- `CaSwitchboardId`: trigger `CaSwitchboardId`
- `CaRuleId`: trigger `CaRuleId`
- `CaCategory`: trigger `CaCategory`
- `CaAlertType`: trigger `CaAlertType`
- `CaLocation`: trigger `CaLocation`
- `CaEvidenceNotes`: trigger `CaEvidenceNotes`

Service-written receipt fields are then set or preserved as appropriate. Do not map the old misspelled Originator ID column.

### Control 2: Condition - Required alert values present

Add a Condition inside the `Alert` case. Rename it `Condition - Required alert values present`.

Use AND rows and require each dynamic value to be not equal to blank:

- `CaRequestId`
- `CaRuleId`
- `CaCategory`
- `CaAlertType`
- `CaLocation`
- `CaOriginatorId`
- `CaSwitchboardId`

Do not validate optional `CaEvidenceNotes` as required.

#### If No: Update item - Reject missing values

Connector: SharePoint, action `Update item`

- Site Address: demo site
- List Name: `CaOriginatorRequests`
- Id: trigger `ID`
- Title: trigger `Title`

Apply the intake update preservation mapping above. Set:

- `CaIntakeStatus`: `Rejected`
- `CaProcessedAt`: expression `utcNow()`
- `CaSafeErrorCode`: `MissingRequiredValue`

Do not copy the submitted payload into the error field.

After this action add `Terminate`:

- Status: `Succeeded`
- Message: `Request rejected safely.`

This is a handled business rejection, not a failed flow run.

#### If Yes: Scope - Promote Alert

Add a Scope and rename it `Scope - Promote Alert`.

### Control 3: Get items - Existing secured alert

Inside the promotion scope add SharePoint `Get items`:

- Site Address: demo site
- List Name: `CodeAlerts`
- Filter Query: `CaClientRequestId eq '<CaRequestId dynamic value>'`
- Top Count: `1`

The resulting filter should resemble:

```text
CaClientRequestId eq 'OR-MQN4VLVA-5P7C93TE'
```

Because generated request IDs contain only safe letters, numbers, and hyphens, no free text is inserted into this filter.

### Control 4: Condition - Secured alert already exists

Add a Condition after Get items. Rename it `Condition - Secured alert already exists`.

Left expression:

```text
length(body('Get_items_-_Existing_secured_alert')?['value'])
```

Operator: `is greater than`

Right value: `0`

Use the action's actual internal designer name if Power Automate generates a different expression token.

#### If Yes: Compose - Existing alert ID

Add Compose named `Compose - Existing alert ID`:

```text
first(body('Get_items_-_Existing_secured_alert')?['value'])?['CaAlertId']
```

Then add `Update item - Mark intake promoted` using the mapping in Control 6 below, with `CaSecureAlertId` set to this Compose output. This is the idempotent retry path; do not create another secured alert.

#### If No: Compose - New alert ID

Add Compose named `Compose - New alert ID`:

```text
concat('CA-', triggerBody()?['CaRequestId'])
```

### Control 5: Create item - Secured CodeAlert

After the new alert ID Compose, add SharePoint `Create item`:

- Site Address: demo site
- List Name: `CodeAlerts`

Map fields:

| CodeAlerts field | Value |
|---|---|
| `Title` | trigger `Title` |
| `CaAlertId` | output of `Compose - New alert ID` |
| `CaRuleId` | trigger `CaRuleId` |
| `CaCategory` | trigger `CaCategory` |
| `CaAlertType` | trigger `CaAlertType` |
| `CaShortLabel` | trigger `CaAlertType` for this first slice |
| `CaLocation` | trigger `CaLocation` |
| `CaEvidenceNotes` | trigger `CaEvidenceNotes` |
| `CaClientRequestId` | trigger `CaRequestId` |
| `CaOriginatorRequestItemId` | trigger system `ID` |
| `CaSubmittedByName` | trigger `Created By Email` |
| `CaSubmittedByObjectId` | blank for the first slice unless a trusted object ID is already available |
| `CaSubmittedFromSiteUrl` | blank until the remote-site source URL is added to intake/registration |
| `CaOriginatorId` | trigger `CaOriginatorId` |
| `CaSwitchboardId` | trigger `CaSwitchboardId` |
| `CaStatus` | `Submitted` |
| `CaSubmittedAt` | expression `utcNow()` |
| `CaOriginatorRequestCreatedAt` | trigger system `Created` |
| `CaOriginatorRequestCreatedByName` | trigger `Created By DisplayName` |
| `CaOriginatorRequestCreatedByLogin` | trigger `Created By Email` |

Leave acknowledgement, announcement, All Clear, cancellation, resolution, Daily Note, and page-log fields blank.

For `CaSubmittedByName`, the Person field normally accepts the trigger's `Created By Email`. If the tenant does not resolve it, leave that Person field blank temporarily; the dedicated name/login text fields remain authoritative for the demo.

### Control 6: Update item - Mark intake promoted

After Create item add SharePoint `Update item`:

- Site Address: demo site
- List Name: `CaOriginatorRequests`
- Id: trigger system `ID`
- Title: trigger `Title`

Apply the intake update preservation mapping above. Set:

- `CaIntakeStatus`: `Promoted`
- `CaSecureAlertId`: output of `Compose - New alert ID`
- `CaProcessedAt`: expression `utcNow()`
- `CaSafeErrorCode`: blank

The duplicate/If Yes branch uses the same update action pattern but sets `CaSecureAlertId` from `Compose - Existing alert ID`.

## Control 7: Scope - Mark Promotion Failed

In the same validation `If Yes` branch, outside and immediately after `Scope - Promote Alert`, add another Scope named `Scope - Mark Promotion Failed`.

Open its menu, choose `Configure run after`, and select only:

- has failed
- has timed out

Do not select `is successful`.

Inside it add `Update item - Mark intake failed`:

- Site Address: demo site
- List Name: `CaOriginatorRequests`
- Id: trigger `ID`
- Title: trigger `Title`
- apply the intake update preservation mapping above
- `CaIntakeStatus`: `Failed`
- `CaProcessedAt`: `utcNow()`
- `CaSafeErrorCode`: `PromotionFailed`

Do not put connector errors or submitted evidence in `CaSafeErrorCode`.

## Default Switch Case

For an unknown request type, add `Update item - Reject request type`:

- trigger `ID` plus the intake update preservation mapping above
- `CaIntakeStatus`: `Rejected`
- `CaProcessedAt`: `utcNow()`
- `CaSafeErrorCode`: `UnsupportedRequestType`

Then terminate as Succeeded with `Unsupported request type rejected safely.`

## Save and First Test

1. Save the flow and use Flow Checker.
2. Submit one new Originator alert; do not reuse the existing pre-flow row for the first trigger test.
3. Confirm exactly one secured `CodeAlerts` row.
4. Confirm the secured row has the same `CaClientRequestId`, location, category, type, Originator ID, and source item ID.
5. Confirm the intake row changes from `Received` to `Promoted` and receives `CaSecureAlertId` and `CaProcessedAt`.
6. Confirm the Originator tracking bar changes to `Sent - awaiting acknowledgement` after its next poll.
7. Run a controlled idempotency test by resubmitting/replaying the same trigger payload only after the basic path is clean; confirm no second secured row is created.
8. Inspect version history on both lists.

## Known Deliberate Gaps

- Flow-side regex/PHI screening is not implemented by standard SharePoint controls in this first recipe. The Originator UI blocks configured patterns, but promotion-side content validation remains an explicit safety gap to close before any non-synthetic use.
- `AllClearRequest` promotion is deferred.
- The switchboard does not yet poll `CodeAlerts`; a promoted row will not open a popup until that code slice is implemented.
- Acknowledgement return to the intake receipt is part of the switchboard polling/acknowledgement slice.
