$ErrorActionPreference = 'Stop'
$Root = [System.IO.Path]::GetFullPath($PSScriptRoot)
$Url = 'http://127.0.0.1:8000/'
function Test-TerravexServer {
  try {
    $r = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 2
    return ($r.StatusCode -ge 200 -and $r.StatusCode -lt 400 -and $r.Content -match 'TERRAVEX APEX')
  } catch { return $false }
}
if (-not (Test-TerravexServer)) {
  $server = Join-Path $Root 'serve_terravex.ps1'
  if (-not (Test-Path -LiteralPath $server)) { Write-Host 'serve_terravex.ps1 is missing. Extract the complete ZIP first.' -ForegroundColor Red; Read-Host 'Press Enter to close'; exit 2 }
  $argsLine = '-NoLogo -NoProfile -ExecutionPolicy Bypass -File "' + $server + '" -NoBrowser'
  Start-Process -FilePath 'powershell.exe' -ArgumentList $argsLine -WindowStyle Minimized
  $ready = $false
  for ($i = 0; $i -lt 50; $i++) { Start-Sleep -Milliseconds 400; if (Test-TerravexServer) { $ready = $true; break } }
  if (-not $ready) { Write-Host 'The local app server did not respond on 127.0.0.1:8000. Close another process using that port and retry.' -ForegroundColor Red; Read-Host 'Press Enter to close'; exit 1 }
}
$programFilesX86 = [Environment]::GetEnvironmentVariable('ProgramFiles(x86)')
$chromePaths = @()
if ($env:ProgramFiles) { $chromePaths += (Join-Path $env:ProgramFiles 'Google\Chrome\Application\chrome.exe') }
if ($programFilesX86) { $chromePaths += (Join-Path $programFilesX86 'Google\Chrome\Application\chrome.exe') }
if ($env:LOCALAPPDATA) { $chromePaths += (Join-Path $env:LOCALAPPDATA 'Google\Chrome\Application\chrome.exe') }
$chromePaths = @($chromePaths | Where-Object { Test-Path -LiteralPath $_ })
$edgePaths = @()
if ($env:ProgramFiles) { $edgePaths += (Join-Path $env:ProgramFiles 'Microsoft\Edge\Application\msedge.exe') }
if ($programFilesX86) { $edgePaths += (Join-Path $programFilesX86 'Microsoft\Edge\Application\msedge.exe') }
if ($env:LOCALAPPDATA) { $edgePaths += (Join-Path $env:LOCALAPPDATA 'Microsoft\Edge\Application\msedge.exe') }
$edgePaths = @($edgePaths | Where-Object { Test-Path -LiteralPath $_ })
$browser = if ($chromePaths.Count -gt 0) { $chromePaths[0] } elseif ($edgePaths.Count -gt 0) { $edgePaths[0] } else { $null }
if ($browser) {
  Start-Process -FilePath $browser -ArgumentList @('--app=' + $Url)
} else {
  Start-Process $Url
  Write-Host 'Chrome/Edge executable was not found in the common install locations. The URL has been opened in the default browser.' -ForegroundColor Yellow
  Write-Host 'For a desktop app-style window, install Chrome or Edge and retry.'
  Read-Host 'Press Enter to close'
}
