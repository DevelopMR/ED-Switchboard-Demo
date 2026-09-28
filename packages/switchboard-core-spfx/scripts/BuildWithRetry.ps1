[CmdletBinding()]
param(
    [int]$Retries = 1,
    [int]$DelaySeconds = 2
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$PackageRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$CleanScript = Join-Path $PSScriptRoot 'CleanGenerated.ps1'

function Invoke-Step {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Name,

        [Parameter(Mandatory = $true)]
        [string]$Command,

        [Parameter(Mandatory = $true)]
        [string[]]$Arguments
    )

    Write-Host ""
    Write-Host "==> $Name"
    $process = Start-Process `
        -FilePath $Command `
        -ArgumentList $Arguments `
        -Wait `
        -PassThru `
        -NoNewWindow

    if ($null -eq $process.ExitCode) {
        return 1
    }

    return [int]$process.ExitCode
}

function Invoke-Build {
    Push-Location $PackageRoot
    try {
        $testExitCode = Invoke-Step `
            -Name 'heft test --clean --production' `
            -Command 'npx.cmd' `
            -Arguments @('heft', 'test', '--clean', '--production')

        if ($testExitCode -ne 0) {
            return $testExitCode
        }

        return Invoke-Step `
            -Name 'heft package-solution --production' `
            -Command 'npx.cmd' `
            -Arguments @('heft', 'package-solution', '--production')
    }
    finally {
        Pop-Location
    }
}

Write-Host "Running SPFx production build from: $PackageRoot"
$exitCode = Invoke-Build

if ($exitCode -eq 0) {
    Write-Host ""
    Write-Host "Build completed successfully."
    exit 0
}

for ($attempt = 1; $attempt -le $Retries; $attempt++) {
    Write-Warning "Build failed with exit code $exitCode. Cleaning generated folders before retry $attempt of $Retries."

    & powershell -NoProfile -ExecutionPolicy Bypass -File $CleanScript
    $cleanExitCode = if ($null -eq $LASTEXITCODE) { 1 } else { [int]$LASTEXITCODE }

    if ($cleanExitCode -ne 0) {
        Write-Warning "Generated-folder cleanup failed with exit code $cleanExitCode."
        exit $exitCode
    }

    Start-Sleep -Seconds $DelaySeconds
    $exitCode = Invoke-Build

    if ($exitCode -eq 0) {
        Write-Host ""
        Write-Host "Build completed successfully after retry."
        exit 0
    }
}

Write-Warning "Build still failed after $Retries retry attempt(s)."
exit $exitCode
