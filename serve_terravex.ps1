$ErrorActionPreference = 'Stop'
$Root = [System.IO.Path]::GetFullPath($PSScriptRoot)
$HostAddress = '127.0.0.1'
$Port = 8000
$BlockedExtensions = @('.py', '.bat', '.ps1', '.json', '.zip', '.pdf', '.key', '.pem', '.env')
$BlockedNames = @('.gitignore', 'vpn-bridge-config.json')
$Mime = @{
  '.html'='text/html; charset=utf-8'; '.htm'='text/html; charset=utf-8'; '.css'='text/css; charset=utf-8';
  '.js'='text/javascript; charset=utf-8'; '.mjs'='text/javascript; charset=utf-8';
  '.webmanifest'='application/manifest+json; charset=utf-8'; '.svg'='image/svg+xml';
  '.png'='image/png'; '.webp'='image/webp'; '.jpg'='image/jpeg'; '.jpeg'='image/jpeg'; '.ico'='image/x-icon';
  '.md'='text/markdown; charset=utf-8'; '.txt'='text/plain; charset=utf-8'; '.woff2'='font/woff2'
}

function Send-Response($Client, [int]$Status, [string]$Reason, [string]$ContentType, [byte[]]$Body, [string]$Method, [string]$CacheControl='no-store') {
  $stream = $Client.GetStream()
  $header = "HTTP/1.1 $Status $Reason`r`nContent-Type: $ContentType`r`nContent-Length: $($Body.Length)`r`nConnection: close`r`nX-Content-Type-Options: nosniff`r`nReferrer-Policy: strict-origin-when-cross-origin`r`nCache-Control: $CacheControl`r`n`r`n"
  $headBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
  $stream.Write($headBytes, 0, $headBytes.Length)
  if ($Method -ne 'HEAD' -and $Body.Length -gt 0) { $stream.Write($Body, 0, $Body.Length) }
  $stream.Flush()
}
function Send-TextError($Client, [int]$Status, [string]$Reason, [string]$Message, [string]$Method) {
  $bytes = [System.Text.Encoding]::UTF8.GetBytes("<!doctype html><meta charset=`"utf-8`"><title>$Status $Reason</title><h1>$Status $Reason</h1><p>$Message</p>")
  Send-Response $Client $Status $Reason 'text/html; charset=utf-8' $bytes $Method 'no-store'
}
function Handle-Client($Client) {
  try {
    $stream = $Client.GetStream()
    $reader = [System.IO.StreamReader]::new($stream, [System.Text.Encoding]::ASCII, $false, 1024, $true)
    $requestLine = $reader.ReadLine()
    if ([string]::IsNullOrWhiteSpace($requestLine)) { return }
    $parts = $requestLine.Split(' ')
    if ($parts.Length -lt 2) { Send-TextError $Client 400 'Bad Request' 'Malformed HTTP request.' 'GET'; return }
    $method = $parts[0].ToUpperInvariant()
    $target = $parts[1]
    while ($true) { $line = $reader.ReadLine(); if ($null -eq $line -or $line -eq '') { break } }
    if ($method -notin @('GET','HEAD')) { Send-TextError $Client 405 'Method Not Allowed' 'Only GET and HEAD are supported.' $method; return }
    $uri = [System.Uri]::new("http://$HostAddress`:$Port$target")
    $urlPath = [System.Uri]::UnescapeDataString($uri.AbsolutePath)
    if ([string]::IsNullOrWhiteSpace($urlPath) -or $urlPath -eq '/') { $urlPath = '/index.html' }
    if ($urlPath.Contains('..') -or $urlPath.Contains([char]0)) { Send-TextError $Client 403 'Forbidden' 'Invalid path.' $method; return }
    $relative = $urlPath.TrimStart('/') -replace '/', [System.IO.Path]::DirectorySeparatorChar
    $segments = $relative.Split([System.IO.Path]::DirectorySeparatorChar, [System.StringSplitOptions]::RemoveEmptyEntries)
    if ($segments | Where-Object { $_.StartsWith('.') }) { Send-TextError $Client 403 'Forbidden' 'Hidden paths are not served.' $method; return }
    $name = [System.IO.Path]::GetFileName($relative).ToLowerInvariant()
    $extension = [System.IO.Path]::GetExtension($relative).ToLowerInvariant()
    if ($BlockedNames -contains $name -or $BlockedExtensions -contains $extension) { Send-TextError $Client 404 'Not Found' 'This file is not exposed by the local app server.' $method; return }
    $fullPath = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($Root, $relative))
    $rootPrefix = $Root.TrimEnd([System.IO.Path]::DirectorySeparatorChar) + [System.IO.Path]::DirectorySeparatorChar
    if (-not $fullPath.StartsWith($rootPrefix, [System.StringComparison]::OrdinalIgnoreCase)) { Send-TextError $Client 403 'Forbidden' 'Path outside app root.' $method; return }
    if (-not (Test-Path -LiteralPath $fullPath -PathType Leaf)) { Send-TextError $Client 404 'Not Found' 'Requested app resource was not found.' $method; return }
    $content = [System.IO.File]::ReadAllBytes($fullPath)
    $type = $Mime[$extension]; if (-not $type) { $type = 'application/octet-stream' }
    $cache = if ($name -in @('index.html','manifest.webmanifest','sw.js','pwa-install.js')) { 'no-cache' } else { 'public, max-age=3600' }
    Send-Response $Client 200 'OK' $type $content $method $cache
  } catch {
    try { Send-TextError $Client 500 'Internal Server Error' 'Local file server encountered an error. See the launcher console.' 'GET' } catch { }
    Write-Host ('Request error: ' + $_.Exception.Message) -ForegroundColor Yellow
  } finally { $Client.Close() }
}

if (-not (Test-Path -LiteralPath (Join-Path $Root 'index.html')) -or -not (Test-Path -LiteralPath (Join-Path $Root 'manifest.webmanifest'))) {
  Write-Host 'index.html or manifest.webmanifest is missing. Extract the full upgrade ZIP first.' -ForegroundColor Red
  Read-Host 'Press Enter to close'
  exit 2
}
$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Parse($HostAddress), $Port)
try { $listener.Start() } catch {
  Write-Host "Could not start local server at http://$HostAddress`:$Port/" -ForegroundColor Red
  Write-Host 'Port 8000 may already be in use. Close the other app/server and try again.'
  Read-Host 'Press Enter to close'
  exit 1
}
$url = "http://$HostAddress`:$Port/"
Write-Host ''
Write-Host 'TERRAVEX APEX local install server is running.' -ForegroundColor Cyan
Write-Host "Open: $url" -ForegroundColor Green
Write-Host 'Bound to 127.0.0.1 only. It is NOT exposed to your local network.'
Write-Host 'Directory listing is disabled; private config, scripts and archives are not web-served.'
Write-Host 'Keep this window open. Press Ctrl+C to stop.' -ForegroundColor Yellow
try { Start-Process $url } catch { Write-Host 'Open the URL above manually in Chrome or Edge.' }
try {
  while ($true) {
    $client = $listener.AcceptTcpClient()
    Handle-Client $client
  }
} catch [System.Management.Automation.PipelineStoppedException] {
  Write-Host 'Stopping TERRAVEX local server.'
} catch [System.Net.Sockets.SocketException] {
  Write-Host 'Local server stopped.'
} finally {
  $listener.Stop()
}
