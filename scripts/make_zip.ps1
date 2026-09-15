$src = "C:\Users\pandh\Downloads\dna-survey-fully-workable\finalproj"
$dest = "C:\Users\pandh\Downloads\dna-survey-project.zip"

if (Test-Path $dest) { Remove-Item $dest -Force }

$tempStage = "C:\Users\pandh\Downloads\dna-survey-stage"
if (Test-Path $tempStage) { Remove-Item $tempStage -Recurse -Force }
New-Item -ItemType Directory -Path $tempStage | Out-Null

$items = Get-ChildItem -Path $src -Recurse | Where-Object {
    $_.FullName -notmatch '[\\/]node_modules([\\/]|$)' -and
    $_.FullName -notmatch '[\\/]dist([\\/]|$)' -and
    $_.FullName -notmatch '[\\/]\.git([\\/]|$)'
}

foreach ($item in $items) {
    $rel = $item.FullName.Substring($src.Length + 1)
    $target = Join-Path $tempStage $rel
    if ($item.PSIsContainer) {
        if (-not (Test-Path $target)) { New-Item -ItemType Directory -Path $target -Force | Out-Null }
    } else {
        $parent = Split-Path $target
        if (-not (Test-Path $parent)) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }
        Copy-Item -Path $item.FullName -Destination $target -Force
    }
}

Compress-Archive -Path "$tempStage\*" -DestinationPath $dest -Force
Remove-Item $tempStage -Recurse -Force

$zip = Get-Item $dest
Write-Host "Created ZIP: $($zip.FullName) ($([math]::Round($zip.Length / 1MB, 2)) MB)"
