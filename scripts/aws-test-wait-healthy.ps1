param(
    [string]$Profile = "sportbooking",
    [string]$Region = "ap-southeast-1",
    [string]$TerraformDir = "infra/terraform/test-env",
    [int]$TimeoutMinutes = 15
)

$ErrorActionPreference = "Stop"

function Get-AwsExe {
    $cmd = Get-Command aws -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }
    $portable = Join-Path $PSScriptRoot "tools/aws-cli/aws.exe"
    if (Test-Path $portable) { return $portable }
    throw "AWS CLI not found."
}

function Get-TerraformExe {
    $cmd = Get-Command terraform -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }
    $portable = Join-Path $PSScriptRoot "tools/terraform.exe"
    if (Test-Path $portable) { return $portable }
    throw "Terraform not found."
}

$awsExe = Get-AwsExe
$tfExe = Get-TerraformExe
$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$tfPath = Join-Path $repoRoot $TerraformDir

Push-Location $tfPath
$cluster = & $tfExe output -raw ecs_cluster_name
$service = & $tfExe output -raw ecs_service_name
$tgArn = & $tfExe output -raw target_group_arn
$albUrl = & $tfExe output -raw alb_url
Pop-Location

$deadline = (Get-Date).AddMinutes($TimeoutMinutes)
Write-Host "Waiting for ECS service $service to become stable (timeout ${TimeoutMinutes}m)..."

while ((Get-Date) -lt $deadline) {
    $svc = & $awsExe ecs describe-services `
        --cluster $cluster `
        --services $service `
        --region $Region `
        --profile $Profile `
        --query "services[0].{running:runningCount,desired:desiredCount,status:status,event:events[0].message}" `
        --output json | ConvertFrom-Json

    $health = & $awsExe elbv2 describe-target-health `
        --target-group-arn $tgArn `
        --region $Region `
        --profile $Profile `
        --query "TargetHealthDescriptions[].TargetHealth.State" `
        --output json | ConvertFrom-Json

    $healthyCount = @($health | Where-Object { $_ -eq "healthy" }).Count
    Write-Host ("  ECS running={0}/{1} status={2} ALB healthy={3}" -f $svc.running, $svc.desired, $svc.status, $healthyCount)

    if ($svc.running -ge $svc.desired -and $svc.desired -gt 0 -and $healthyCount -ge 1) {
        try {
            $response = Invoke-RestMethod -Uri "$albUrl/health" -TimeoutSec 10
            if ($response -eq "ok") {
                Write-Host "Health check passed: $albUrl/health"
                exit 0
            }
        }
        catch {
            Write-Host "  ALB reachable but /health not ready yet: $($_.Exception.Message)"
        }
    }

    Start-Sleep -Seconds 20
}

throw "Timed out waiting for healthy deployment. Check logs: aws logs tail /ecs/sportbooking-test-api --follow --profile $Profile"
