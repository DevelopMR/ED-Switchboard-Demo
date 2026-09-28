[CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = 'High')]
param(
    [switch]$Stop,
    [switch]$Force
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$PackageRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$Candidates = Get-CimInstance Win32_Process |
    Where-Object {
        $_.CommandLine -and
        $_.ProcessId -ne $PID -and
        $_.CommandLine.IndexOf($PackageRoot, [System.StringComparison]::OrdinalIgnoreCase) -ge 0 -and
        ($_.Name -in @('node.exe', 'npm.exe', 'npx.exe', 'gulp.exe', 'powershell.exe', 'pwsh.exe'))
    } |
    Sort-Object ProcessId

if (-not $Candidates) {
    Write-Host "No local dev processes were found for: $PackageRoot"
    exit 0
}

Write-Host "Local dev processes tied to: $PackageRoot"
$Candidates |
    Select-Object ProcessId, Name, CommandLine |
    Format-Table -AutoSize -Wrap

if (-not $Stop) {
    Write-Host ""
    Write-Host "Listing only. To stop these processes, run:"
    Write-Host ".\scripts\StopDevProcesses.ps1 -Stop"
    exit 0
}

foreach ($candidate in $Candidates) {
    $target = "$($candidate.Name) PID $($candidate.ProcessId)"

    if ($PSCmdlet.ShouldProcess($target, 'Stop local dev process')) {
        Stop-Process -Id $candidate.ProcessId -Force:$Force
        Write-Host "Stopped $target"
    }
}

exit 0
