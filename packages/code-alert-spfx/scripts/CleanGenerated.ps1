[CmdletBinding(SupportsShouldProcess = $true)]
param([int]$Retries = 3, [int]$DelaySeconds = 2)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$PackageRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$GeneratedFolders = @('dist', 'jest-output', 'lib', 'lib-commonjs', 'release', 'temp')
$HadFailure = $false

foreach ($folder in $GeneratedFolders) {
    $target = Join-Path $PackageRoot $folder
    if (-not (Test-Path -LiteralPath $target)) { continue }
    $fullPath = [System.IO.Path]::GetFullPath($target)
    $rootPrefix = $PackageRoot.TrimEnd([System.IO.Path]::DirectorySeparatorChar) + [System.IO.Path]::DirectorySeparatorChar
    if (-not $fullPath.StartsWith($rootPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "Refusing to clean path outside package root: $fullPath"
    }

    $removed = $false
    for ($attempt = 1; $attempt -le $Retries; $attempt++) {
        try {
            if ($PSCmdlet.ShouldProcess($fullPath, 'Remove generated folder')) {
                Remove-Item -LiteralPath $fullPath -Recurse -Force
            }
            $removed = $true
            break
        }
        catch {
            if ($attempt -lt $Retries) { Start-Sleep -Seconds $DelaySeconds }
        }
    }
    if (-not $removed) { $HadFailure = $true }
}

if ($HadFailure) { exit 1 }
exit 0
