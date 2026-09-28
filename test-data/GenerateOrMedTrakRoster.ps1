param(
    [string]$OutputDirectory = "test-data",
    [datetime]$RosterStart = [datetime]"2026-07-06T07:00:00"
)

$ErrorActionPreference = "Stop"

function New-PhoneNumber {
    param(
        [string]$Prefix,
        [int]$Suffix
    )

    return "{0}-{1}" -f $Prefix, $Suffix.ToString("0000")
}

$roles = @(
    @{ Role = "Anesthesiologist"; SortOrder = 1; RequiredByDefault = $true; DefaultNotes = "AOD usually contacts this role." },
    @{ Role = "AnesthesiaNurse"; SortOrder = 2; RequiredByDefault = $true; DefaultNotes = "" },
    @{ Role = "OrNurse"; SortOrder = 3; RequiredByDefault = $true; DefaultNotes = "" },
    @{ Role = "ScrubOrTech"; SortOrder = 4; RequiredByDefault = $true; DefaultNotes = "" },
    @{ Role = "SurgicalTechFirstAssist"; SortOrder = 5; RequiredByDefault = $false; DefaultNotes = "Optional call-in role." },
    @{ Role = "RecoveryNurse"; SortOrder = 6; RequiredByDefault = $true; DefaultNotes = "" },
    @{ Role = "Radiology"; SortOrder = 7; RequiredByDefault = $false; DefaultNotes = "Use only when C-Arm is required." }
)

$dayAssignments = @(
    @(
        @{ Name = "Avery Moss"; PhoneOne = (New-PhoneNumber "841-555" 167); PhoneTwo = (New-PhoneNumber "841-555" 179) },
        @{ Name = "Lena Quill"; PhoneOne = (New-PhoneNumber "841-555" 168); PhoneTwo = (New-PhoneNumber "841-555" 124) },
        @{ Name = "Nora Haines"; PhoneOne = (New-PhoneNumber "841-555" 169); PhoneTwo = (New-PhoneNumber "841-555" 191) },
        @{ Name = "Derek Sloan"; PhoneOne = (New-PhoneNumber "841-555" 170); PhoneTwo = (New-PhoneNumber "841-555" 195) },
        @{ Name = "Mila Voss"; PhoneOne = (New-PhoneNumber "841-555" 128); PhoneTwo = (New-PhoneNumber "842-555" 100) },
        @{ Name = "Tessa Pike"; PhoneOne = (New-PhoneNumber "841-555" 171); PhoneTwo = (New-PhoneNumber "842-555" 104) },
        @{ Name = "Owen Marsh"; PhoneOne = (New-PhoneNumber "841-555" 126); PhoneTwo = (New-PhoneNumber "842-555" 108) }
    ),
    @(
        @{ Name = "Callie Frost"; PhoneOne = (New-PhoneNumber "841-555" 172); PhoneTwo = (New-PhoneNumber "841-555" 182) },
        @{ Name = "Micah Reed"; PhoneOne = (New-PhoneNumber "841-555" 173); PhoneTwo = (New-PhoneNumber "841-555" 164) },
        @{ Name = "Paige Holloway"; PhoneOne = (New-PhoneNumber "841-555" 174); PhoneTwo = (New-PhoneNumber "841-555" 192) },
        @{ Name = "Jonah Vale"; PhoneOne = (New-PhoneNumber "841-555" 175); PhoneTwo = (New-PhoneNumber "841-555" 196) },
        @{ Name = "Rina Cortez"; PhoneOne = (New-PhoneNumber "841-555" 106); PhoneTwo = (New-PhoneNumber "842-555" 101) },
        @{ Name = "Brenna Shaw"; PhoneOne = (New-PhoneNumber "841-555" 176); PhoneTwo = (New-PhoneNumber "842-555" 105) },
        @{ Name = "Eli Mercer"; PhoneOne = (New-PhoneNumber "842-555" 112); PhoneTwo = (New-PhoneNumber "842-555" 110) }
    ),
    @(
        @{ Name = "Sadie Rowan"; PhoneOne = (New-PhoneNumber "841-555" 177); PhoneTwo = (New-PhoneNumber "841-555" 186) },
        @{ Name = "Noah Cline"; PhoneOne = (New-PhoneNumber "841-555" 178); PhoneTwo = (New-PhoneNumber "841-555" 127) },
        @{ Name = "Elise Barrett"; PhoneOne = (New-PhoneNumber "841-555" 180); PhoneTwo = (New-PhoneNumber "841-555" 193) },
        @{ Name = "Grant Mercer"; PhoneOne = (New-PhoneNumber "841-555" 181); PhoneTwo = (New-PhoneNumber "841-555" 197) },
        @{ Name = "Talia Wynn"; PhoneOne = (New-PhoneNumber "841-555" 125); PhoneTwo = (New-PhoneNumber "841-555" 198) },
        @{ Name = "Mason Pike"; PhoneOne = (New-PhoneNumber "841-555" 183); PhoneTwo = (New-PhoneNumber "842-555" 102) },
        @{ Name = "Ivy Calder"; PhoneOne = (New-PhoneNumber "841-555" 129); PhoneTwo = (New-PhoneNumber "842-555" 107) }
    ),
    @(
        @{ Name = "Harper Sloan"; PhoneOne = (New-PhoneNumber "841-555" 184); PhoneTwo = (New-PhoneNumber "841-555" 188) },
        @{ Name = "Luca Bennett"; PhoneOne = (New-PhoneNumber "841-555" 185); PhoneTwo = (New-PhoneNumber "841-555" 165) },
        @{ Name = "Mara Keaton"; PhoneOne = (New-PhoneNumber "841-555" 187); PhoneTwo = (New-PhoneNumber "841-555" 194) },
        @{ Name = "Theo Ramsey"; PhoneOne = (New-PhoneNumber "841-555" 189); PhoneTwo = (New-PhoneNumber "841-555" 199) },
        @{ Name = "Nina Vale"; PhoneOne = (New-PhoneNumber "841-555" 123); PhoneTwo = (New-PhoneNumber "842-555" 103) },
        @{ Name = "Cole Whitman"; PhoneOne = (New-PhoneNumber "841-555" 190); PhoneTwo = (New-PhoneNumber "842-555" 109) },
        @{ Name = "Ruby Hart"; PhoneOne = (New-PhoneNumber "842-555" 113); PhoneTwo = (New-PhoneNumber "842-555" 111) }
    )
)

$rows = New-Object System.Collections.Generic.List[object]

for ($dayIndex = 0; $dayIndex -lt $dayAssignments.Count; $dayIndex++) {
    $onCallStart = $RosterStart.AddDays($dayIndex)
    $onCallEnd = $onCallStart.AddDays(1)
    $assignments = $dayAssignments[$dayIndex]

    for ($roleIndex = 0; $roleIndex -lt $roles.Count; $roleIndex++) {
        $role = $roles[$roleIndex]
        $assignment = $assignments[$roleIndex]
        $titleDate = $onCallStart.ToString("yyyy-MM-dd")

        $rows.Add([pscustomobject]@{
            Title               = ("{0} - {1} - {2}" -f $role.Role, $assignment.Name, $titleDate)
            OrRole              = $role.Role
            OrStaffName         = $assignment.Name
            OrPhoneOne          = $assignment.PhoneOne
            OrPhoneTwo          = $assignment.PhoneTwo
            OrOnCallStart       = $onCallStart
            OrOnCallEnd         = $onCallEnd
            OrIsActive          = $true
            OrDefaultNotes      = $role.DefaultNotes
            OrSortOrder         = $role.SortOrder
            OrRequiredByDefault = $role.RequiredByDefault
        })
    }
}

$resolvedOutputDirectory = Join-Path -Path (Get-Location) -ChildPath $OutputDirectory
if (-not (Test-Path -LiteralPath $resolvedOutputDirectory)) {
    New-Item -ItemType Directory -Path $resolvedOutputDirectory | Out-Null
}

$baseName = "OrMedTrakRoster_{0}_to_{1}" -f $RosterStart.ToString("yyyy-MM-dd"), $RosterStart.AddDays($dayAssignments.Count).ToString("yyyy-MM-dd")
$csvPath = Join-Path -Path $resolvedOutputDirectory -ChildPath ($baseName + ".csv")
$xlsxPath = Join-Path -Path $resolvedOutputDirectory -ChildPath ($baseName + ".xlsx")

$rows |
    Select-Object Title, OrRole, OrStaffName, OrPhoneOne, OrPhoneTwo, OrOnCallStart, OrOnCallEnd, OrIsActive, OrDefaultNotes, OrSortOrder, OrRequiredByDefault |
    Export-Csv -Path $csvPath -NoTypeInformation

$excel = $null
$workbook = $null
$worksheet = $null

try {
    $excel = New-Object -ComObject Excel.Application
    $excel.Visible = $false
    $excel.DisplayAlerts = $false

    $workbook = $excel.Workbooks.Add()
    $worksheet = $workbook.Worksheets.Item(1)
    $worksheet.Name = "OrMedTrakRoster"

    $headers = @(
        "Title",
        "OrRole",
        "OrStaffName",
        "OrPhoneOne",
        "OrPhoneTwo",
        "OrOnCallStart",
        "OrOnCallEnd",
        "OrIsActive",
        "OrDefaultNotes",
        "OrSortOrder",
        "OrRequiredByDefault"
    )

    for ($columnIndex = 0; $columnIndex -lt $headers.Count; $columnIndex++) {
        $worksheet.Cells.Item(1, $columnIndex + 1) = $headers[$columnIndex]
    }

    for ($rowIndex = 0; $rowIndex -lt $rows.Count; $rowIndex++) {
        $rowNumber = $rowIndex + 2
        $row = $rows[$rowIndex]

        $worksheet.Cells.Item($rowNumber, 1) = $row.Title
        $worksheet.Cells.Item($rowNumber, 2) = $row.OrRole
        $worksheet.Cells.Item($rowNumber, 3) = $row.OrStaffName
        $worksheet.Cells.Item($rowNumber, 4).NumberFormat = "@"
        $worksheet.Cells.Item($rowNumber, 4) = $row.OrPhoneOne
        $worksheet.Cells.Item($rowNumber, 5).NumberFormat = "@"
        $worksheet.Cells.Item($rowNumber, 5) = $row.OrPhoneTwo
        $worksheet.Cells.Item($rowNumber, 6) = $row.OrOnCallStart
        $worksheet.Cells.Item($rowNumber, 7) = $row.OrOnCallEnd
        $worksheet.Cells.Item($rowNumber, 8) = if ($row.OrIsActive) { "TRUE" } else { "FALSE" }
        $worksheet.Cells.Item($rowNumber, 9) = $row.OrDefaultNotes
        $worksheet.Cells.Item($rowNumber, 10) = $row.OrSortOrder
        $worksheet.Cells.Item($rowNumber, 11) = if ($row.OrRequiredByDefault) { "TRUE" } else { "FALSE" }
    }

    $dateColumns = $worksheet.Range("F2:G{0}" -f ($rows.Count + 1))
    $dateColumns.NumberFormat = "m/d/yyyy h:mm AM/PM"

    $headerRange = $worksheet.Range("A1:K1")
    $headerRange.Font.Bold = $true
    $headerRange.Interior.ColorIndex = 15
    $worksheet.Range("A:K").EntireColumn.AutoFit() | Out-Null

    $worksheet.Application.ActiveWindow.SplitRow = 1
    $worksheet.Application.ActiveWindow.FreezePanes = $true

    $workbook.SaveAs($xlsxPath, 51)
}
finally {
    if ($workbook -ne $null) {
        $workbook.Close($true)
        [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($workbook)
    }

    if ($worksheet -ne $null) {
        [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($worksheet)
    }

    if ($excel -ne $null) {
        $excel.Quit()
        [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel)
    }

    [System.GC]::Collect()
    [System.GC]::WaitForPendingFinalizers()
}

Write-Host ("Created roster files:`n- {0}`n- {1}" -f $xlsxPath, $csvPath)

