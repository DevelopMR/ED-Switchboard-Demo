[CmdletBinding()]
param([int]$Retries = 1, [int]$DelaySeconds = 2)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$PackageRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$CleanScript = Join-Path $PSScriptRoot 'CleanGenerated.ps1'

function Invoke-Build {
    Push-Location $PackageRoot
    try {
        & npx.cmd heft build --clean --production
        if ($LASTEXITCODE -ne 0) { return [int]$LASTEXITCODE }
        & npx.cmd heft package-solution --production
        return [int]$LASTEXITCODE
    }
    finally { Pop-Location }
}

$exitCode = Invoke-Build
if ($exitCode -eq 0) { exit 0 }

for ($attempt = 1; $attempt -le $Retries; $attempt++) {
    & powershell -NoProfile -ExecutionPolicy Bypass -File $CleanScript
    if ($LASTEXITCODE -ne 0) { exit $exitCode }
    Start-Sleep -Seconds $DelaySeconds
    $exitCode = Invoke-Build
    if ($exitCode -eq 0) { exit 0 }
}

exit $exitCode
