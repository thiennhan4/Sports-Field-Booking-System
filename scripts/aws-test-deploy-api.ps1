param(
    [string]$Region = "ap-southeast-1",
    [string]$Profile = "sportbooking",
    [string]$TerraformDir = "infra/terraform/test-env",
    [string]$BackendDir = "Sports-Field-Booking-System-main/backend",
    [switch]$SkipWait
)

$ErrorActionPreference = "Stop"

function Get-TerraformExe {
    $cmd = Get-Command terraform -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }
    $portable = Join-Path $PSScriptRoot "tools/terraform.exe"
    if (Test-Path $portable) { return $portable }
    throw "Terraform not found."
}

function Get-AwsExe {
    $cmd = Get-Command aws -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }
    $portable = Join-Path $PSScriptRoot "tools/aws-cli/aws.exe"
    if (Test-Path $portable) { return $portable }
    throw "AWS CLI not found."
}

$tfExe = Get-TerraformExe
$awsExe = Get-AwsExe
$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$tfPath = Join-Path $repoRoot $TerraformDir
$backendPath = Join-Path $repoRoot $BackendDir

Push-Location $tfPath
$ecrUri = & $tfExe output -raw ecr_repository_url
$cluster = & $tfExe output -raw ecs_cluster_name
$service = & $tfExe output -raw ecs_service_name
$albUrl = & $tfExe output -raw alb_url
Pop-Location

$accountId = & $awsExe sts get-caller-identity --profile $Profile --query Account --output text
$registry = "$accountId.dkr.ecr.$Region.amazonaws.com"

& $awsExe ecr get-login-password --region $Region --profile $Profile | docker login --username AWS --password-stdin $registry

Push-Location $backendPath
docker build -t sportbooking-test-api:latest .
docker tag sportbooking-test-api:latest "${ecrUri}:latest"
docker push "${ecrUri}:latest"
Pop-Location

& $awsExe ecs update-service `
    --cluster $cluster `
    --service $service `
    --desired-count 1 `
    --force-new-deployment `
    --region $Region `
    --profile $Profile | Out-Null

Write-Host "Deployment requested."
Write-Host "ALB URL: $albUrl"
Write-Host "Health check: $albUrl/health"

& (Join-Path $PSScriptRoot "aws-test-save-outputs.ps1") -Profile $Profile -Region $Region

if (-not $SkipWait) {
    & (Join-Path $PSScriptRoot "aws-test-wait-healthy.ps1") -Profile $Profile -Region $Region
}
