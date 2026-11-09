# Phone Type Remote - One-Click Host & Tunnel Launcher
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $rootDir

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   Starting Phone Type Remote (Server + Public Tunnel)   " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Start Node Server if not already running on port 8765
$portInUse = Get-NetTCPConnection -LocalPort 8765 -ErrorAction SilentlyContinue
if (-not $portInUse) {
    Write-Host "[1/3] Starting Node server on port 8765..." -ForegroundColor Yellow
    $serverProcess = Start-Process node -ArgumentList "server/server.js" -WorkingDirectory $rootDir -PassThru -NoNewWindow
    Start-Sleep -Seconds 2
} else {
    Write-Host "[1/3] Server is already running on port 8765." -ForegroundColor Green
}

# 2. Start Cloudflare Tunnel if not already running
$cloudflaredProcess = Get-Process cloudflared -ErrorAction SilentlyContinue
$tunnelLog = Join-Path $rootDir "server\cloudflared.log"

if (-not $cloudflaredProcess) {
    Write-Host "[2/3] Starting public internet tunnel..." -ForegroundColor Yellow
    if (Test-Path $tunnelLog) { Remove-Item $tunnelLog -Force }
    Start-Process powershell -ArgumentList "-NoProfile -Command npx -y cloudflared tunnel --url http://localhost:8765 2>&1 | Tee-Object -FilePath '$tunnelLog'" -WorkingDirectory $rootDir -WindowStyle Hidden
    
    # Wait for tunnel URL
    $foundUrl = $null
    for ($i = 0; $i -lt 30; $i++) {
        Start-Sleep -Seconds 1
        if (Test-Path $tunnelLog) {
            $content = Get-Content $tunnelLog -Raw
            if ($content -match 'https://[a-zA-Z0-9-]+\.trycloudflare\.com') {
                $foundUrl = $matches[0]
                break
            }
        }
    }

    if ($foundUrl) {
        Set-Content -Path (Join-Path $rootDir "server\tunnel-url.txt") -Value $foundUrl -Force
        Write-Host "[2/3] Public tunnel created: $foundUrl" -ForegroundColor Green
    } else {
        Write-Host "[!] Could not detect tunnel URL automatically within 30s. Checking saved URL..." -ForegroundColor DarkYellow
    }
} else {
    Write-Host "[2/3] Cloudflare tunnel process is already running." -ForegroundColor Green
}

# 3. Read pairing code and active URLs
$codeFile = Join-Path $rootDir "server\code.txt"
$pairingCode = if (Test-Path $codeFile) { (Get-Content $codeFile -Raw).Trim() } else { "Check terminal" }

$tunnelFile = Join-Path $rootDir "server\tunnel-url.txt"
$publicUrl = if (Test-Path $tunnelFile) { (Get-Content $tunnelFile -Raw).Trim() } else { "https://impact-jelsoft-directions-kitty.trycloudflare.com" }

Write-Host "`n[3/3] Ready! Host Information:" -ForegroundColor Cyan
Write-Host "----------------------------------------------------------"
Write-Host "  PAIRING CODE:  $pairingCode" -ForegroundColor Yellow
Write-Host "  PUBLIC URL:    $publicUrl/?code=$pairingCode" -ForegroundColor Green
Write-Host "  LOCAL PC:      http://localhost:8765/connect" -ForegroundColor Gray
Write-Host "----------------------------------------------------------"
Write-Host "`nOpening http://localhost:8765/connect in your browser..." -ForegroundColor Yellow
Start-Process "http://localhost:8765/connect"

Write-Host "`nKeep this script open to keep your hosting active. Press Ctrl+C when done." -ForegroundColor Cyan
while ($true) { Start-Sleep -Seconds 30 }
