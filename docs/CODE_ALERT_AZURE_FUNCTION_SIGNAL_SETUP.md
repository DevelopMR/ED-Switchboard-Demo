# Code Alert Azure Function Signal Setup

Date: `2026-06-23`

## Purpose

Replace the speed-critical initial Code Alert promotion path with an Azure Functions Flex Consumption signal endpoint while keeping SharePoint lists as the authoritative data source.

The Originator web part still creates a `CaOriginatorRequests` item first. The Function receives only a pointer to that item, then the server-side promotion layer reads SharePoint and writes the secured `CodeAlerts` row.

## Safety Contract

The Function signal payload is intentionally tiny.

Allowed fields:

- `requestItemId`
- `requestId`
- `originatorId`
- `switchboardId`

Forbidden in the API payload:

- patient names
- MRNs
- SSNs
- dates of birth
- phone numbers
- diagnosis or clinical details
- alert location text
- alert type/category
- evidence notes
- procedure text
- free-text descriptors

If the endpoint receives any extra JSON fields, it rejects the request before promotion logic runs.

## Initial Runtime Choice

- Azure Functions v4
- Node.js / TypeScript
- Flex Consumption for the first deployed slice
- Function auth level: `function`
- Additional demo gate: registered `originatorId` + `switchboardId`
- Future hardening: Entra authentication and managed identity / certificate-based SharePoint access

## Repository Package

```text
packages/code-alert-functions
```

Current route:

```text
POST /api/code-alerts/intake-signal
```

Current implementation:

- parses JSON
- rejects malformed or extra-field payloads
- logs only pointer/routing fields
- runs the server-side promotion pipeline shape
- validates pointer consistency at the promotion boundary
- supports two server-side promotion modes:
  - `Stub`, the safe default, returns `202 Accepted` with `PromotionStubbed`
  - `Graph`, reads and writes demo SharePoint lists through the Function managed identity
- keeps the browser/API signal pointer-only in both modes
- promotes both normal `Alert` intake rows and append-only `AllClearRequest` intake rows

## Target Runtime Flow

```text
Originator SPFx
  1. Create CaOriginatorRequests item with safe list permissions
  2. POST pointer-only signal to Azure Function

Azure Function
  3. Validate pointer payload
  4. Re-read CaOriginatorRequests by item ID/request ID
  5. Validate endpoint registration and required fields
  6. Create or locate secured CodeAlerts row idempotently
  7. Update CaOriginatorRequests receipt fields
  8. Return safe acknowledgement to the Originator web part

Switchboard SPFx
  9. Fast-poll secured CodeAlerts
  10. Retrieve alert details from SharePoint
  11. Open operator popup
  12. Write acknowledgement / terminal receipt updates back to intake
```

## Azure Setup Walkthrough Draft

These are the expected first manual setup steps. Exact portal labels may vary.

1. Create a Function App.
   - Runtime stack: Node.js
   - Hosting: Flex Consumption
   - Region: close to the SharePoint tenant/users when practical
   - Application Insights: enabled

2. Configure CORS.
   - Allow the demo SharePoint origin, for example `https://darkmatter.sharepoint.com`.
   - Keep the list narrow; do not use broad wildcard origins for the demo.

3. Add app settings.
   - `CodeAlertHubSiteUrl`
   - `CodeAlertIntakeListTitle`
   - `CodeAlertSecuredListTitle`
   - optional performance settings, using verified IDs only:
     - `CodeAlertHubSiteId`
     - `CodeAlertIntakeListId`
     - `CodeAlertSecuredListId`
   - optional while testing: `CodeAlertPromotionMode`
     - omit or set `Stub` for no SharePoint promotion writes
     - set `Graph` only after managed identity and site-specific permissions are confirmed
   - optional if SharePoint internal naming differs: `CodeAlertOriginatorIdFieldName`

4. Deploy the function package.

5. Retrieve a Function key for the `codeAlertIntakeSignal` endpoint.

6. Configure the Originator web part with:
   - Function endpoint URL
   - Function key
   - `OriginatorId`
   - `SwitchboardId`

7. Submit a synthetic alert and confirm:
   - `CaOriginatorRequests` item is created
   - Function receives only pointer fields
   - Function returns a safe acknowledgement
   - no descriptive alert payload appears in Function request logs

## Latency Optimization

The Function promotion client is cached at module scope so a warm Function instance can reuse its managed-identity credential state, Graph access token, resolved SharePoint site ID, and resolved list IDs. Token reuse is expiration-aware and refreshes before expiry. Concurrent initialization calls share the same in-flight lookup.

Configure the three optional ID settings above to eliminate the site and list discovery requests even on a cold instance. Copy only verified IDs from the demo site/list configuration; an incorrect ID will fail the request rather than fall back silently.

The promotion pipeline emits PHI-safe duration logs for `ReadIntake`, `FindExistingAlert`, `CreateSecuredAlert`, `MarkIntakePromoted`, and failure receipt updates, plus a total pipeline duration. These logs contain stage/status/correlation data and do not add alert descriptions, locations, or patient-related fields. Use Application Insights to separate Function cold-start delay from Graph/SharePoint request time.

These code changes reduce work after the host starts but cannot remove Flex Consumption cold starts. If cold-start measurements remain the dominant delay, the next non-Premium hosting option to evaluate is a small Flex Consumption always-ready instance. That is an Azure configuration and cost decision; it is not enabled by this repository change.

## Open Implementation Tasks

- Continue validating cross-alert behavior through the verified `Acknowledged` and `Closed` receipt path.
- Keep observing the earlier switchboard `Alert Still Active` warning behavior before treating it as fully closed.
- Keep the Power Automate promotion flow disabled or clearly marked fallback during speed tests.

## Deployment Notes

Initial Azure Function App created on `2026-06-24`:

- Function App: `<function-app-name>`
- Resource group: `<resource-group>`
- Region: East US
- Plan type: Flex Consumption
- Instance memory: 2048 MB
- Runtime: Node.js on Linux
- CORS allowed origin: `https://darkmatter.sharepoint.com`
- Route: `https://<function-app-host>.azurewebsites.net/api/code-alerts/intake-signal`

The function key is intentionally not stored in project documentation. Real resource names and IDs for the demo deployment are kept in a local, git-ignored `docs/AZURE_DEMO_SETTINGS.local.md`.

Live endpoint tests:

- Pointer-only payload returned `Accepted` / `SignalReceived`.
- Payload containing forbidden descriptive field `CaLocation` returned `Rejected` with `UnexpectedSignalField`.
- Portal navigation for invocation review: Function App Overview, select `codeAlertIntakeSignal` from the Functions list, then open the `Invocations` tab.

Originator package `0.1.4` added property-pane fields for the Function signal endpoint URL and Function signal key.

Originator package `0.1.5` wires the configured signal endpoint into alert submission. After the intake row is created, the Originator sends only `requestItemId`, `requestId`, `originatorId`, and `switchboardId` to the Azure Function. If the Function call fails, the intake row remains created and the UI shows a safe warning instead of encouraging duplicate submission.

Function package `0.1.1` replaces the single placeholder promotion response with a server-side promotion pipeline stub:

- loads Function app settings;
- creates a SharePoint promotion client through an interface boundary;
- validates that signal pointers match the intake pointer;
- checks the idempotent existing-alert seam;
- reaches a SharePoint read/write stub boundary;
- returns `Accepted` / `SignalReceived` with safe error code `PromotionStubbed`.

Function package `0.1.2` adds the managed-identity Microsoft Graph promotion client:

- dependency: `@azure/identity`;
- safe default remains `CodeAlertPromotionMode=Stub`;
- `CodeAlertPromotionMode=Graph` enables real demo SharePoint promotion;
- reads `CaOriginatorRequests` by pointer item ID;
- checks `CodeAlerts` by `CaClientRequestId` for idempotency;
- creates a secured `CodeAlerts` row when no existing row is found;
- updates the intake row with `Promoted`, `CaSecureAlertId`, and `CaProcessedAt`;
- updates the intake row with `Failed` and `CaSafeErrorCode=PromotionFailed` if promotion fails after intake is read.

Function package `0.1.5` extends the same pointer-only signal path to All Clear requests:

- accepts `CaOriginatorRequests.CaRequestType=AllClearRequest` after re-reading the authoritative intake row;
- requires `CaParentRequestId` for All Clear requests;
- creates a secured `CodeAlerts` row with `CaRequestType=AllClear`, copied category/type/location/rule values, and parent correlation fields;
- marks the parent secured alert with `CaAllClearRequestedAt` when it can locate the original `CaClientRequestId`;
- keeps the browser signal payload unchanged and still rejects descriptive fields in the HTTP request.

The current Function source adds warm-instance performance safeguards:

- reuses the Graph promotion client and expiration-aware access token across warm invocations;
- caches site/list IDs and deduplicates concurrent discovery calls;
- accepts optional verified site/list IDs as app settings to skip discovery calls;
- logs PHI-safe per-stage and total promotion durations for latency diagnosis.

Latency optimization deployment on `2026-08-09`:

- deployed Function package `0.1.8` to `<function-app-name>`;
- used Functions Core Tools TypeScript publishing with Azure remote build so runtime dependencies were installed;
- verified the host is running and `codeAlertIntakeSignal` is registered at the existing pointer-only route;
- preserved the existing Function app settings and did not change permissions or the Flex Consumption plan;
- the optional direct site/list ID settings remain unconfigured, so warm-instance caching is active while cold instances still perform initial ID discovery.

Live promotion test after enabling `CodeAlertPromotionMode=Graph`:

- Originator created a synthetic `Trauma Alert` intake row.
- Function promoted the request to the secured Code Alert path.
- Intake receipt fields updated:
  - `CaIntakeStatus`: `Promoted`
  - `CaSecureAlertId`: `CA-OR-MQWMELS4-SD4FDSTP`
  - `CaProcessedAt`: accurate local display with no 3-hour offset issue
- Follow-up cleanup package `0.1.4` restores explicit empty-string clearing for `CaSafeErrorCode` after live testing showed Microsoft Graph did not reliably clear the SharePoint text field when sent `null`.

Live switchboard receipt verification on switchboard package `0.1.23`:

- Switchboard polling detected the secured `CodeAlerts` row and opened the matching popup workflow.
- Operator acknowledgement updated `CaOriginatorRequests` to `Acknowledged` with populated `CaAcknowledgedAt` and `CaAcknowledgedByName`.
- Full workflow completion updated `CaOriginatorRequests` to `Closed` with the expected `CaProcessedAt` refresh and switchboard log entry.
- Earlier switchboard receipt failures were traced to a bad secured-list field write on `CodeAlerts`; package `0.1.23` removes that failing write path and preserves the verified Originator receipt updates.

## Step-by-Step Progress Log

### Azure Function App

- Created resource group `<resource-group>`.
- Created Function App `<function-app-name>`.
- Hosting plan is Flex Consumption in East US.
- Runtime is Node.js on Linux.
- Instance memory is 2048 MB.
- Application Insights is enabled.
- CORS allows `https://darkmatter.sharepoint.com`.
- Added Function app settings:
  - `CodeAlertHubSiteUrl`
  - `CodeAlertIntakeListTitle`
  - `CodeAlertSecuredListTitle`
- Disabled unnecessary extras for this slice:
  - Azure OpenAI connection
  - Durable Functions usage
  - continuous deployment
  - App Service Authentication

### Deployment and Function Key

- Installed Azure Functions Core Tools locally in `packages/code-alert-functions`.
- Installed `Az.Accounts` for Azure login/publishing.
- Published the Function with:
  - package `ed-code-alert-functions`
  - version `0.1.1`
  - route `POST /api/code-alerts/intake-signal`
- Retrieved the `default (Function key)` URL from the Function page.
- Configured the Originator web part with:
  - `FunctionSignalEndpointUrl`
  - `FunctionSignalKey`
- Do not use the `_master` host key in the web part.
- Do not store the Function key in repo docs.

### Live Signal Tests

- Direct pointer-only Function test succeeded.
- Negative test with forbidden `CaLocation` field returned `UnexpectedSignalField`.
- Offsite Originator page created a `CaOriginatorRequests` item and called the Function.
- Function invocation count showed success.
- Invocation details showed only:
  - `requestItemId`
  - `requestId`
  - `originatorId`
  - `switchboardId`
  - `correlationId`
- No alert location, alert type, evidence notes, patient identifiers, or descriptive alert text appeared in the Function signal log.
- Portal navigation for invocation review:
  - Function App Overview
  - select `codeAlertIntakeSignal` from the Functions list
  - open `Invocations`
  - open an invocation detail row

### Managed Identity

- Enabled system-assigned managed identity for `<function-app-name>`.
- Confirmed identity:
  - Principal ID: `<managed-identity-object-id>`
  - Tenant ID: `<tenant-id>`
- Granted Microsoft Graph application role `Sites.Selected` to the Function managed identity.
- `Sites.Selected` is the Graph permission gate. The Function also needs site-specific permission before it can read or write SharePoint content.
- Resolved SharePoint site and managed identity values for the site grant:
  - Site URL: `https://darkmatter.sharepoint.com/sites/EDSwitchboard`
  - Site ID: `<tenant>.sharepoint.com,<site-collection-id>,<web-id>`
  - Managed identity object ID: `<managed-identity-object-id>`
  - Managed identity application ID: `<managed-identity-application-id>`
  - Managed identity display name: `<function-app-name>`
- Attempted the site-specific grant with Microsoft Graph:
  - `POST /sites/{siteId}/permissions`
  - roles: `["write"]`
  - application ID: `<managed-identity-application-id>`
- The grant was blocked with `accessDenied`. This is expected when the caller lacks SharePoint Administrator or higher / sufficient delegated Graph authority for site-permission management.
- Completed the site-specific permission grant through Microsoft Graph Explorer as an administrator.
- Graph Explorer returned `201 Created`.
- Confirmed role:
  - `roles`: `["write"]`

Admin/manual site grant request body:

```json
{
  "roles": ["write"],
  "grantedToIdentities": [
    {
      "application": {
        "id": "<managed-identity-application-id>",
        "displayName": "<function-app-name>"
      }
    }
  ]
}
```

Admin/manual endpoint:

```text
POST https://graph.microsoft.com/v1.0/sites/<tenant>.sharepoint.com,<site-collection-id>,<web-id>/permissions
```

Current permission target:

- Managed identity has Graph `Sites.Selected`.
- Managed identity has site-specific `write` permission on the ED Switchboard demo site.
- Next code target is enabling `CodeAlertPromotionMode=Graph` after deploying Function package `0.1.2`.
### 2026-08-02 Deployment Packaging Note

Function package `0.1.6` fixes deployment discovery for the Node v4 code-first function on Flex Consumption:

- `.funcignore` must not exclude `dist/` because `package.json` points Azure Functions at `dist/src/functions/*.js`.
- Publish with remote build so Azure restores Node production dependencies during deployment:

```powershell
npx func azure functionapp publish <function-app-name> --javascript --build remote --verbose
```

After deployment, Azure should list `codeAlertIntakeSignal` at `/api/code-alerts/intake-signal`. The offsite SPFx web part stores the endpoint URL in properties; the Function key remains a configuration secret and must not be committed to source or docs.
