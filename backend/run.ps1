# Uruchamia backend z zmiennymi z .env.local (jeśli istnieje)
Set-Location $PSScriptRoot

if (Test-Path .env.local) {
    Get-Content .env.local | ForEach-Object {
        if ($_ -match '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$' -and $_.Trim() -notmatch '^\s*#') {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2].Trim('"'''), 'Process')
        }
    }
    Write-Host "Zmienne zaladowane z .env.local" -ForegroundColor Green
} else {
    Write-Host "Brak .env.local - skopiuj .env.local.example i uzupelnij SENDGRID_API_KEY, MAIL_FROM" -ForegroundColor Yellow
}

go run .
