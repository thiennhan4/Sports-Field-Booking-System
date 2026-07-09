# ============================================================
# aws-test-deploy-full.ps1
# Script deploy hoàn chỉnh: Build Docker → Push ECR → Deploy ECS
# Chạy từ thư mục gốc: Sports-Field-Booking-System\
# ============================================================
param(
    [string]$Profile  = "sportbooking",
    [string]$Region   = "ap-southeast-1",
    [string]$Account  = "833910240654",
    [string]$EcrUri   = "833910240654.dkr.ecr.ap-southeast-1.amazonaws.com/sportbooking-test-api",
    [string]$Cluster  = "sportbooking-test-cluster",
    [string]$Service  = "sportbooking-test-api",
    [string]$AlbUrl   = "http://sportbooking-test-alb-197710135.ap-southeast-1.elb.amazonaws.com"
)

$ErrorActionPreference = "Stop"
$BackendDir = Join-Path $PSScriptRoot "Sports-Field-Booking-System-main\backend"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host " SportBooking AWS Deploy Script" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

# Step 1: Check Docker
Write-Host "`n[1/4] Checking Docker daemon..." -ForegroundColor Yellow
docker info | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Docker daemon is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}
Write-Host "  Docker OK" -ForegroundColor Green

# Step 2: ECR Login
Write-Host "`n[2/4] Logging in to ECR..." -ForegroundColor Yellow
aws ecr get-login-password --region $Region --profile $Profile | `
    docker login --username AWS --password-stdin "$Account.dkr.ecr.$Region.amazonaws.com"
if ($LASTEXITCODE -ne 0) { Write-Host "ECR login failed!" -ForegroundColor Red; exit 1 }
Write-Host "  ECR Login OK" -ForegroundColor Green

# Step 3: Build & Push Docker Image
Write-Host "`n[3/4] Building Docker image..." -ForegroundColor Yellow
Push-Location $BackendDir
    docker build -t sportbooking-test-api:latest .
    if ($LASTEXITCODE -ne 0) { Write-Host "Docker build failed!" -ForegroundColor Red; Pop-Location; exit 1 }

    Write-Host "  Tagging image..." -ForegroundColor Yellow
    docker tag sportbooking-test-api:latest "${EcrUri}:latest"

    Write-Host "  Pushing to ECR (may take a few minutes)..." -ForegroundColor Yellow
    docker push "${EcrUri}:latest"
    if ($LASTEXITCODE -ne 0) { Write-Host "Docker push failed!" -ForegroundColor Red; Pop-Location; exit 1 }
Pop-Location
Write-Host "  Image pushed to ECR OK" -ForegroundColor Green

# Step 4: Deploy to ECS
Write-Host "`n[4/4] Deploying to ECS..." -ForegroundColor Yellow
aws ecs update-service `
    --cluster $Cluster `
    --service $Service `
    --desired-count 1 `
    --force-new-deployment `
    --region $Region `
    --profile $Profile | Out-Null
if ($LASTEXITCODE -ne 0) { Write-Host "ECS update failed!" -ForegroundColor Red; exit 1 }
Write-Host "  ECS deployment triggered OK" -ForegroundColor Green

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host " DEPLOY COMPLETE!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host " ALB URL   : $AlbUrl" -ForegroundColor White
Write-Host " Health    : $AlbUrl/health" -ForegroundColor White
Write-Host " Swagger   : $AlbUrl/swagger" -ForegroundColor White
Write-Host ""
Write-Host " ECS task sẽ healthy trong ~2–5 phút." -ForegroundColor Yellow
Write-Host " Theo dõi logs: aws logs tail /ecs/sportbooking-test-api --follow --profile $Profile" -ForegroundColor Gray
Write-Host ""
Write-Host " Kiểm tra health:" -ForegroundColor Yellow
Write-Host "   Invoke-RestMethod -Uri '$AlbUrl/health'" -ForegroundColor Gray
