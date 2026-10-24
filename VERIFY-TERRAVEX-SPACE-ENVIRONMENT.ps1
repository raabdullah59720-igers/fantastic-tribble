$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Write-Host 'TERRAVEX APEX - Space Environment & Communications Upgrade verifier' -ForegroundColor Cyan
$Required = @('index.html','manifest.webmanifest','sw.js','space-environment.css','space-environment.js','ozone-watch-research.md','run-space-env-tests.py','tests/test-space-environment.cjs')
$Missing = @($Required | Where-Object { -not (Test-Path (Join-Path $Root $_)) })
if ($Missing.Count -gt 0) { Write-Host ('Missing files: ' + ($Missing -join ', ')) -ForegroundColor Red; exit 2 }
$Manifest = Get-Content (Join-Path $Root 'manifest.webmanifest') -Raw | ConvertFrom-Json
$Pages = @('ozone','spaceweather','spaceobjects')
foreach ($Page in $Pages) { if (-not ($Manifest.shortcuts | Where-Object { $_.url -match ('page=' + $Page) })) { Write-Host "Missing PWA shortcut for $Page" -ForegroundColor Yellow } }
$Sw = Get-Content (Join-Path $Root 'sw.js') -Raw
if ($Sw -notmatch 'terravex-apex-shell-v17') { Write-Host 'Service-worker cache version mismatch' -ForegroundColor Red; exit 3 }
Write-Host ('Manifest valid: ' + $Manifest.short_name) -ForegroundColor Green
Write-Host ('Page shortcuts reviewed: ' + ($Pages -join ', ')) -ForegroundColor Green
$Python = Get-Command python -ErrorAction SilentlyContinue
if ($Python) { & $Python.Source (Join-Path $Root 'run-space-env-tests.py'); if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE } }
else { Write-Host 'Python was not found; static PowerShell checks passed, Python QA was skipped.' -ForegroundColor Yellow }
Write-Host 'Verification complete.' -ForegroundColor Green
