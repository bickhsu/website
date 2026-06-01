$ErrorActionPreference = "Stop"

$apiPath = Join-Path $PSScriptRoot "apps\api"
$webPath = Join-Path $PSScriptRoot "apps\web"

if (-not (Test-Path $apiPath)) {
  throw "API folder not found: $apiPath"
}

if (-not (Test-Path $webPath)) {
  throw "Web folder not found: $webPath"
}

$apiCommand = "Set-Location -LiteralPath `"$apiPath`"; npm run start:dev"
$webCommand = "Set-Location -LiteralPath `"$webPath`"; npm run dev"

Start-Process powershell -ArgumentList "-NoExit", "-Command", $apiCommand -WindowStyle Normal
Start-Process powershell -ArgumentList "-NoExit", "-Command", $webCommand -WindowStyle Normal

Write-Host "Started API and Web dev servers in separate PowerShell windows."
