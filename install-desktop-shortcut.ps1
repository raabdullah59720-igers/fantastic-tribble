$ErrorActionPreference = 'Stop'
$Root = [System.IO.Path]::GetFullPath($PSScriptRoot)
$Launcher = Join-Path $Root 'START-TERRAVEX-DESKTOP-APP.bat'
if (-not (Test-Path -LiteralPath $Launcher)) { throw 'START-TERRAVEX-DESKTOP-APP.bat is missing. Extract the complete upgrade ZIP first.' }
$wsh = New-Object -ComObject WScript.Shell
$desktop = [Environment]::GetFolderPath('Desktop')
$shortcutPath = Join-Path $desktop 'TERRAVEX APEX.lnk'
$link = $wsh.CreateShortcut($shortcutPath)
$link.TargetPath = $env:ComSpec
$link.Arguments = '/c ""' + $Launcher + '""'
$link.WorkingDirectory = $Root
$link.Description = 'Launch TERRAVEX APEX in a dedicated desktop app-style window'
$ico = Join-Path $Root 'icon.ico'
if (Test-Path -LiteralPath $ico) { $link.IconLocation = $ico + ',0' }
$link.WindowStyle = 7
$link.Save()
Write-Host ''
Write-Host 'TERRAVEX APEX desktop shortcut created:' -ForegroundColor Green
Write-Host $shortcutPath -ForegroundColor Cyan
Write-Host 'Double-click it to start the local app server and open the app-style browser window.'
Write-Host 'This is a local desktop shortcut. For a registered PWA, use the browser Install page as app menu.'
Read-Host 'Press Enter to close'
