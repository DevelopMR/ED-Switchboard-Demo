# Build Notes

## Current State

This package now has SPFx 1.22.2 build infrastructure merged around the hand-scaffolded switchboard shell source.

Current package baseline is `0.1.22` / SPFx solution `1.0.0.22`. The production package includes the shell, Daily Notes, 23 switchboard Code Alert workflows, simulated Riskmaster surface, internal demo logging services, and SharePoint polling that opens promoted secured Code Alerts on the configured switchboard shell.

The active local baseline is:

- Node `v22.17.0`
- npm `10.9.2`
- Yeoman `7.0.1`
- `@microsoft/generator-sharepoint` `1.22.2`
- package-local `@rushstack/heft` `1.1.2`

## Commands

From `packages/switchboard-core-spfx`:

```powershell
npm install
npm run build
npm run build:retry
npm run start
```

`npm run start` runs:

```powershell
heft start --clean --nobrowser
```

Use `--nobrowser` because SharePoint debug loading is more reliable when the browser is opened manually to the real modern page.

## Windows Generated-File Locks

If Windows holds a generated file open under `temp`, `lib`, or another build output folder, use the scoped helper commands:

```powershell
npm run build:retry
npm run clean:generated
npm run dev:processes
```

`build:retry` runs the same production Heft build, then cleans generated folders and retries once only if the first build fails. `clean:generated` removes only local generated output folders inside this package. `dev:processes` lists local `node`, `npm`, `npx`, `gulp`, and PowerShell processes whose command line references this package path.

To stop listed local dev processes, run this from `packages/switchboard-core-spfx`:

```powershell
./scripts/StopDevProcesses.ps1 -Stop
```

The stop helper prompts for confirmation and is intentionally not wired as an npm command.

## New Machine Setup Note

On this PC, `npm install` was required inside `packages/switchboard-core-spfx` before the local Heft build would run. The package also expects Node `22`; Node `24` can install dependencies and complete the build here, but it emits engine warnings and should not be treated as the preferred baseline.

## Current Build Result

`npm run build:retry` succeeds and creates:

```text
sharepoint/solution/ed-switchboard-core.sppkg
```

The current build has ten known lint warnings only. They are earlier proof-of-concept style warnings around `void` expressions, `null` returns, and one unescaped apostrophe. No automated test suites currently exist.

## Local Debug Page

The configured debug page is:

```text
https://darkmatter.sharepoint.com/sites/EDSwitchboard/SitePages/Home.aspx?loadSPFX=true&debugManifestsFile=https://localhost:4321/temp/build/manifests.js
```

If that manifest path does not load in a browser session, also try:

```text
https://localhost:4321/temp/manifests.js
```

Then use the matching URL in the `debugManifestsFile` query parameter.

## Browser Localhost Loading Note

Current Chromium-based browser behavior can block SharePoint pages from loading local debug assets from `https://localhost:4321`.

If the debug manifest is blocked:

1. Keep `heft start --clean --nobrowser` running.
2. Open the real SharePoint page manually with `loadSPFX=true`.
3. Approve the SharePoint prompt to load debug scripts.
4. In browser site permissions, allow local network/device access if prompted:
   - Chrome: `Local network access`
   - Edge: `Apps on device`

Reference:

```text
https://learn.microsoft.com/en-gb/answers/questions/5805498/what-is-the-workaround-for-sharepoint-developers-b
```
