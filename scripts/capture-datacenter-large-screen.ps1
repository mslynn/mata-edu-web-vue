param(
  [string]$Url = "http://127.0.0.1:3001/datacenter",
  [int]$Width = 3840,
  [int]$Height = 2160,
  [string]$Output = ""
)

$browserCandidates = @(
  "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
  "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
  "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe",
  "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
) | Where-Object { $_ -and (Test-Path $_) }

if (-not $browserCandidates) {
  throw "Chrome or Edge was not found."
}

$browserPath = $browserCandidates[0]
$projectRoot = Split-Path -Path $PSScriptRoot -Parent
$outputDir = Join-Path -Path $projectRoot -ChildPath "artifacts\\datacenter"

if (-not $Output) {
  $Output = Join-Path $outputDir ("datacenter-{0}x{1}.png" -f $Width, $Height)
}

$resolvedOutput = [System.IO.Path]::GetFullPath($Output)
$resolvedOutputDir = Split-Path -Path $resolvedOutput -Parent

if (-not (Test-Path $resolvedOutputDir)) {
  New-Item -ItemType Directory -Path $resolvedOutputDir -Force | Out-Null
}

$arguments = @(
  "--headless",
  "--disable-gpu",
  "--hide-scrollbars",
  "--run-all-compositor-stages-before-draw",
  "--virtual-time-budget=12000",
  "--window-size=$Width,$Height",
  "--force-device-scale-factor=1",
  "--screenshot=$resolvedOutput",
  $Url
)

Write-Host "Browser: $browserPath"
Write-Host "URL: $Url"
Write-Host "Viewport: ${Width}x${Height}"

& $browserPath @arguments

if ((-not (Test-Path $resolvedOutput)) -or ((Get-Item $resolvedOutput).Length -le 0)) {
  throw "Capture failed. Make sure the dev server is running."
}

Write-Host "Saved to: $resolvedOutput"
