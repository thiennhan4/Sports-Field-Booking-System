# Cài AWS CLI v2 (current user — không cần Admin)
# Chạy từ repo root: .\scripts\aws-test-install-cli.ps1

$ErrorActionPreference = "Stop"

Write-Host "Installing AWS CLI v2 for current user (no admin required)..."
Write-Host "Source: https://awscli.amazonaws.com/AWSCLIV2-User.msi"

$proc = Start-Process msiexec.exe -ArgumentList "/i https://awscli.amazonaws.com/AWSCLIV2-User.msi /qn" -Wait -PassThru -NoNewWindow
if ($proc.ExitCode -ne 0) {
    throw "AWS CLI installer exited with code $($proc.ExitCode). Try manual install from AWS docs."
}

$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

$awsCandidates = @(
    "$env:LOCALAPPDATA\Programs\Amazon\AWSCLIV2\aws.exe",
    "$env:ProgramFiles\Amazon\AWSCLIV2\aws.exe"
)

$awsExe = $awsCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $awsExe) {
    $found = Get-ChildItem "$env:LOCALAPPDATA\Programs\Amazon" -Recurse -Filter aws.exe -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($found) { $awsExe = $found.FullName }
}

if (-not $awsExe) {
    throw "aws.exe not found after install. Open a new terminal and run: aws --version"
}

Write-Host "Installed: $awsExe"
& $awsExe --version
Write-Host ""
Write-Host "Next step:"
Write-Host "  aws configure --profile sportbooking"
