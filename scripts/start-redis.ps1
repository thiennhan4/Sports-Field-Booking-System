# Start Redis for SportBooking (requires Docker Desktop)
Set-Location $PSScriptRoot
docker compose up -d redis
if ($LASTEXITCODE -eq 0) {
    Write-Host "Redis running at localhost:6379" -ForegroundColor Green
} else {
    Write-Host "Could not start Redis. Install Docker Desktop or run: choco install redis-64 -y (as Admin)" -ForegroundColor Yellow
}
