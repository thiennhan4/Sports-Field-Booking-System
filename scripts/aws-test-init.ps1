param(
    [string]$Profile = "sportbooking",
    [string]$Region = "ap-southeast-1",
    [string]$TerraformDir = "infra/terraform/test-env"
)

$ErrorActionPreference = "Stop"

function Get-TerraformExe {
    $cmd = Get-Command terraform -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }

    $portable = Join-Path $PSScriptRoot "tools/terraform.exe"
    if (Test-Path $portable) { return $portable }

    throw "Terraform not found. Install from https://developer.hashicorp.com/terraform/install or run scripts/tools download in README."
}

function Get-AwsExe {
    $cmd = Get-Command aws -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }

    $portable = Join-Path $PSScriptRoot "tools/aws-cli/aws.exe"
    if (Test-Path $portable) { return $portable }

    throw "AWS CLI not found. Install AWS CLI v2 and run: aws configure --profile $Profile"
}

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$tfPath = Join-Path $repoRoot $TerraformDir
$tfExe = Get-TerraformExe
$awsExe = Get-AwsExe

Write-Host "Checking AWS credentials..."
& $awsExe sts get-caller-identity --profile $Profile --region $Region | Out-Null

$tfVars = Join-Path $tfPath "terraform.tfvars"
$tfVarsExample = Join-Path $tfPath "terraform.tfvars.example"
if (-not (Test-Path $tfVars)) {
    Copy-Item $tfVarsExample $tfVars
    Write-Host "Created terraform.tfvars from example."
}

Push-Location $tfPath
try {
    & $tfExe init -input=false
    & $tfExe plan -out=tfplan
    Write-Host ""
    Write-Host "Review tfplan above. Apply with:"
    Write-Host "  `$env:AWS_PROFILE = '$Profile'"
    Write-Host "  cd $TerraformDir"
    Write-Host "  terraform apply tfplan"
}
finally {
    Pop-Location
}
