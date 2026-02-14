#Requires -Version 5.1
<#
.SYNOPSIS
  Uruchamia backend (Go) i frontend (React) Secure App oraz wyswietla status i adresy IP.
#>

$ErrorActionPreference = "Stop"
$ProjectRoot = $PSScriptRoot
$BackendPort  = 8080
$FrontendPort = 5173

# --- Kolory i pomocnicze ---
function Write-Banner {
    Write-Host ""
    Write-Host "  +==========================================================+" -ForegroundColor Cyan
    Write-Host "  |           S E C U R E   A P P   -   S T A R T             |" -ForegroundColor Cyan
    Write-Host "  +==========================================================+" -ForegroundColor Cyan
    Write-Host ""
}

function Get-LocalIPv4 {
    try {
        $addrs = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
            Where-Object { $_.InterfaceAlias -notlike "*Loopback*" -and $_.IPAddress -notlike "169.*" } |
            Select-Object -ExpandProperty IPAddress -Unique
        if ($addrs) { return @($addrs) }
    } catch { }
    try {
        $hostname = [System.Net.Dns]::GetHostName()
        $entry = [System.Net.Dns]::GetHostEntry($hostname)
        $addrs = $entry.AddressList | Where-Object { $_.AddressFamily -eq "InterNetwork" } | Select-Object -ExpandProperty ToString
        if ($addrs) { return @($addrs) }
    } catch { }
    return @("(sprawdz ipconfig)")
}

function Test-PortOpen {
    param([string]$TargetHost = "127.0.0.1", [int]$Port, [int]$TimeoutMs = 800)
    try {
        $tcp = New-Object System.Net.Sockets.TcpClient
        $async = $tcp.BeginConnect($TargetHost, $Port, $null, $null)
        $wait = $async.AsyncWaitHandle.WaitOne($TimeoutMs, $false)
        if ($wait) {
            try { $tcp.EndConnect($async) } catch { }
            $tcp.Close()
            return [bool]$tcp.Connected
        }
        $tcp.Close()
    } catch { }
    return $false
}

function Get-StatusText {
    param([bool]$Ok)
    if ($Ok) { return "  OK  " }
    return " CZEKA"
}

function Show-StatusTable {
    param([string[]]$IPs)
    $backendOk  = Test-PortOpen -Port $BackendPort
    $frontendOk = Test-PortOpen -Port $FrontendPort

    Write-Host "  +---------------------+------------------------------+---------+" -ForegroundColor DarkGray
    Write-Host "  | Serwis              | URL                          | Status  |" -ForegroundColor DarkGray
    Write-Host "  +---------------------+------------------------------+---------+" -ForegroundColor DarkGray
    $bUrl = "http://localhost:$BackendPort"
    $fUrl = "http://localhost:$FrontendPort"
    $bSt = Get-StatusText ($backendOk -eq $true)
    $fSt = Get-StatusText ($frontendOk -eq $true)
    $bc = if ($backendOk)  { "Green" } else { "Yellow" }
    $fc = if ($frontendOk) { "Green" } else { "Yellow" }
    Write-Host ("  | Backend (Go)        | {0,-28} | " -f $bUrl) -NoNewline
    Write-Host $bSt -ForegroundColor $bc
    Write-Host ("  | Frontend (React)    | {0,-28} | " -f $fUrl) -NoNewline
    Write-Host $fSt -ForegroundColor $fc
    Write-Host "  +---------------------+------------------------------+---------+" -ForegroundColor DarkGray
    Write-Host ""
    Write-Host "  Twoje adresy IP (dostep z sieci):" -ForegroundColor White
    foreach ($ip in $IPs) {
        Write-Host "    - Frontend:  http://${ip}:$FrontendPort" -ForegroundColor Cyan
        Write-Host "    - Backend:   http://${ip}:$BackendPort"  -ForegroundColor Cyan
    }
    Write-Host ""
    return ($backendOk -and $frontendOk)
}

# --- Glowna logika ---
Write-Banner

# Adresy IP
$IPs = Get-LocalIPv4
Write-Host "  Adresy IPv4 (ten komputer): " -NoNewline
Write-Host ($IPs -join ", ") -ForegroundColor Cyan
Write-Host ""

# Uruchom backend w nowym oknie
$backendPath = Join-Path $ProjectRoot "backend"
$backendCmd  = "Set-Location '$backendPath'; `$host.UI.RawUI.WindowTitle='Secure App - Backend (Go :$BackendPort)'; go run main.go"
Write-Host "  Uruchamiam Backend (Go) na porcie $BackendPort..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd
Start-Sleep -Seconds 2

# Uruchom frontend w nowym oknie
$frontendPath = Join-Path $ProjectRoot "frontend"
if (-not (Test-Path (Join-Path $frontendPath "node_modules"))) {
    Write-Host "  Pierwsze uruchomienie: instalacja zaleznosci frontendu (npm install)..." -ForegroundColor Yellow
    Push-Location $frontendPath
    npm install 2>&1 | Out-Null
    Pop-Location
}
$frontendCmd = "Set-Location '$frontendPath'; `$host.UI.RawUI.WindowTitle='Secure App - Frontend (React :$FrontendPort)'; npm run dev"
Write-Host "  Uruchamiam Frontend (React) na porcie $FrontendPort..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd
Write-Host ""

# Poczekaj na start serwisow i pokaz status
Write-Host "  Oczekiwanie na start serwisow (max ~15 s)..." -ForegroundColor Gray
$maxWait = 30
$step = 3
$allOk = $false
for ($i = 0; $i -le $maxWait; $i += $step) {
    Start-Sleep -Seconds $step
    Clear-Host
    Write-Banner
    Write-Host "  Status (odswiezanie co ${step}s)" -ForegroundColor DarkGray
    Write-Host ""
    $allOk = Show-StatusTable -IPs $IPs
    if ($allOk) {
        Write-Host "  Wszystko gotowe. Otworz w przegladarce: " -NoNewline
        Write-Host "http://localhost:$FrontendPort" -ForegroundColor Green
        Write-Host "  Aby zatrzymac: zamknij okna Backend i Frontend." -ForegroundColor DarkGray
        break
    }
}
if (-not $allOk) {
    Write-Host "  Czesc serwisow sie nie uruchomila. Sprawdz okna Backend/Frontend." -ForegroundColor Yellow
}

Write-Host ""
