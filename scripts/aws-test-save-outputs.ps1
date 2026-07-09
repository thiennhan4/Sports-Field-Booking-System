param(
    [string]$Profile = "sportbooking",
    [string]$Region = "ap-southeast-1",
    [string]$TerraformDir = "infra/terraform/test-env",
    [string]$OutputFile = "test-env-outputs.txt"
)

$ErrorActionPreference = "Stop"

function Get-TerraformExe {
    $cmd = Get-Command terraform -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }
    $portable = Join-Path $PSScriptRoot "tools/terraform.exe"
    if (Test-Path $portable) { return $portable }
    throw "Terraform not found."
}

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$tfPath = Join-Path $repoRoot $TerraformDir
$tfExe = Get-TerraformExe
$outPath = Join-Path $repoRoot $OutputFile

Push-Location $tfPath
try {
    $alb = & $tfExe output -raw alb_url
    $ecr = & $tfExe output -raw ecr_repository_url
    $cluster = & $tfExe output -raw ecs_cluster_name
    $service = & $tfExe output -raw ecs_service_name
    $tgArn = & $tfExe output -raw target_group_arn
    $rds = & $tfExe output -raw rds_endpoint
    $redis = & $tfExe output -raw redis_endpoint
    $logs = & $tfExe output -raw cloudwatch_log_group
}
finally {
    Pop-Location
}

$content = @"
# SportBooking AWS test outputs — DO NOT COMMIT
Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Region: $Region

ALB_URL          = $alb
ECR_REPO_URI     = $ecr
ECS_CLUSTER      = $cluster
ECS_SERVICE      = $service
TARGET_GROUP_ARN = $tgArn
RDS_ENDPOINT     = $rds
REDIS_ENDPOINT   = $redis
LOG_GROUP        = $logs
"@

Set-Content -Path $outPath -Value $content -Encoding UTF8
Write-Host "Saved outputs to $outPath"
