# ED Code Alert Functions

Azure Functions package for the fast Code Alert signal path.

This package is intentionally pointer-only. Browser callers must not send patient data, location detail, evidence notes, alert descriptions, or clinical details through the API. The Function receives a small signal that identifies an already-created SharePoint intake item, then the server-side promotion layer reads the authoritative SharePoint list row.

Initial endpoint:

```http
POST /api/code-alerts/intake-signal
```

Allowed request body:

```json
{
  "requestItemId": 123,
  "requestId": "OR-MOCK1234-ABCDE",
  "originatorId": "ORIGINATORDEMO0000000000",
  "switchboardId": "SWITCHBOARDDEMO000000000"
}
```

The implementation validates the signal and supports two explicitly configured promotion modes. `Stub` is the safe default and performs no SharePoint writes. `Graph` re-reads the authoritative intake row and writes only to the internal demo SharePoint lists through the Function managed identity.

For lower Graph latency, the Function reuses its managed-identity token and resolved SharePoint IDs while an instance remains warm. Configure `CodeAlertHubSiteId`, `CodeAlertIntakeListId`, and `CodeAlertSecuredListId` with verified IDs to avoid discovery requests on a cold instance. Do not guess these values.

Safety rules:

- Do not transmit patient identifiers or alert details through this API.
- Do not grant remote originators direct write access to the secured `CodeAlerts` list.
- Treat function keys and endpoint IDs as routing controls, not complete security by themselves.
- Use mock/synthetic data only.
- Keep `CodeAlertPromotionMode=Stub` until the managed identity and site-specific demo permissions have been verified.
