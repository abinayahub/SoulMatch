# restart-dev.ps1
# Run this anytime you get "Port already in use" error

Write-Host "Stopping any processes on ports 5000 and 5173..." -ForegroundColor Yellow

Get-NetTCPConnection -LocalPort 5000,5173 -ErrorAction SilentlyContinue |
  Select-Object -ExpandProperty OwningProcess |
  Sort-Object -Unique |
  ForEach-Object { 
    Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue
    Write-Host "  Killed PID $_" -ForegroundColor Gray
  }

Start-Sleep -Seconds 2
Write-Host "Starting dev servers..." -ForegroundColor Green
pnpm run dev
