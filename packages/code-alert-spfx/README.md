# Code Alert Originator SPFx

This package contains the independently deployable remote Code Alert Originator web part. The implemented switchboard/operator workflow suite remains in `packages/switchboard-core-spfx` and is not bundled into remote deployments.

Current implementation baseline: `0.1.5`.

Planned scope:

- Originator-focused alert selection, validation, defaults, and sent-state UX
- Internal demo submission through central append-only `CaOriginatorRequests`
- Configurable Azure Function pointer-only signal endpoint and key for the fast Code Alert signal path
- After creating the intake row, a configured Originator sends only `requestItemId`, `requestId`, `originatorId`, and `switchboardId` to the signal endpoint
- No direct remote-user permission to the hub `CodeAlerts` list
- Fast switchboard acknowledgement receipts and status recovery through the originator's own intake items
- Endpoint registration, authoritative SharePoint identity/time, promotion validation, and idempotency
- Optional evidence/details for approved alert types only
- Confirmed `Request All Clear` path after acknowledgement

Active alert behavior must remain app-owned and release-controlled. The former SharePoint rule-list experiment was removed in switchboard package `0.1.20` and must not be reintroduced as an admin-editable workflow engine.

Keep transport and SharePoint access behind interfaces so polling can later be replaced without rewriting UI flows.

See `docs/CODE_ALERT_FORM_PHASE_CLOSEOUT.md` before starting this package.
See `docs/CODE_ALERT_ORIGINATOR_PHASE_PLAN.md` for the approved planning baseline and remaining decisions.

## Development

```powershell
npm install
npm run build
```

The default demo intake site is `https://darkmatter.sharepoint.com/sites/EDSwitchboard`; the list title is `CaOriginatorRequests`. Use mock mode until the list permissions and field internal names are verified.
