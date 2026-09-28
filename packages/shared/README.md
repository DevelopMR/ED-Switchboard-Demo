# Shared Package Workspace

This folder is the dependency-light boundary for contracts genuinely shared by the independently deployable remote Originator and switchboard hub packages. Operator workflows and remote UI remain package-local.

Planned contents:

- Shared TypeScript models derived from `docs/DATA_MODEL.md`
- Common enums and constants
- SharePoint list/service abstractions
- Shared alert IDs, categories, labels, and release-controlled display order
- Originator intake, promotion, acknowledgement receipt, and status contracts
- Idempotency/correlation types without authentication secrets
- Utility functions for IDs, dates, and operator-safe formatting

Keep this package dependency-light so individual web parts remain portable.
