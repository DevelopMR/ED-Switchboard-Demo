# Code Alert Provisioning

There is no current Code Alert rule-list provisioning surface. The former `CaAlertRules` schema, inventory, seed data, runtime reader, and provisioning code were removed in package `0.1.20`. The 23 released operator workflows are app-owned TypeScript definitions.

Planned for the dedicated Originator/intake phase:

- `CodeAlerts` schema and persistence
- `CaActionLogs` schema and persistence decision
- `CodeAlertEndpoints` schema
- Originator and switchboard property configuration

Safety:

- Use only internal demo SharePoint lists.
- Replace real contact names and phone numbers with placeholders.
- Store static approved procedure guidance as rich HTML.
- Do not put scripts or event handlers in rich text.
- Code Alert task flow, controls, branching, and terminal states are owned by released SPFx workflow modules.

The current operator/test launcher and 23 released workflows live in `packages/switchboard-core-spfx`. See `docs/CODE_ALERT_FORM_PHASE_CLOSEOUT.md`.
