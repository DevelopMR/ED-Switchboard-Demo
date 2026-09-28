[CmdletBinding(SupportsShouldProcess = $true)]
param(
    [int]$Retries = 3,
    [int]$DelaySeconds = 2
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$PackageRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$GeneratedFolders = @(
    'dist',
    'jest-output',
    'lib',
    'lib-commonjs',
    'release',
    'temp'
)

function Test-IsInsidePackageRoot {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    $fullPath = [System.IO.Path]::GetFullPath($Path)
    $rootWithSeparator = $PackageRoot.TrimEnd([System.IO.Path]::DirectorySeparatorChar) + [System.IO.Path]::DirectorySeparatorChar
    return $fullPath.StartsWith($rootWithSeparator, [System.StringComparison]::OrdinalIgnoreCase)
}

Write-Host "Cleaning generated SPFx folders under: $PackageRoot"
$HadFailure = $false

foreach ($folder in $GeneratedFolders) {
    $target = Join-Path $PackageRoot $folder

    if (-not (Test-Path -LiteralPath $target)) {
        Write-Host "Skipping missing folder: $folder"
        continue
    }

    if (-not (Test-IsInsidePackageRoot -Path $target)) {
        throw "Refusing to clean path outside package root: $target"
    }

    $removed = $false

    for ($attempt = 1; $attempt -le $Retries; $attempt++) {
        try {
            if ($PSCmdlet.ShouldProcess($target, 'Remove generated folder')) {
                Remove-Item -LiteralPath $target -Recurse -Force
                Write-Host "Removed: $folder"
            }
            else {
                Write-Host "Would remove: $folder"
            }
            $removed = $true
            break
        }
        catch {
            if ($attempt -eq $Retries) {
                Write-Warning "Could not remove $folder after $Retries attempts. A local dev process may still be holding a file lock."
                Write-Warning $_.Exception.Message
                break
            }

            Write-Warning "Could not remove $folder on attempt $attempt. Waiting $DelaySeconds seconds before retry."
            Start-Sleep -Seconds $DelaySeconds
        }
    }

    if (-not $removed) {
        $HadFailure = $true
    }
}

if ($HadFailure) {
    Write-Host "Run npm run dev:processes to inspect local node/heft processes tied to this package."
    exit 1
}

exit 0
