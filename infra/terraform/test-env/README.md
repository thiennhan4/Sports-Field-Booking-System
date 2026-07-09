# SportBooking AWS Test Environment

This Terraform stack creates a temporary AWS environment for API testing only.

It intentionally skips CloudFront, Route 53, WAF, and frontend hosting. The API is tested directly through the ALB URL.

## Cost Notes

- ECS task runs in public subnets with `assign_public_ip = true` to avoid NAT Gateway cost.
- RDS and Redis stay in private subnets.
- ECS desired count defaults to `0`; set it to `1` only after pushing the API image to ECR.
- All resources use the `sportbooking-test` prefix for easier cleanup.

## Prerequisites (Phase 0)

Install on your machine:

1. [AWS CLI v2](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
2. [Terraform >= 1.5](https://developer.hashicorp.com/terraform/install)
3. Docker Desktop (running)
4. .NET SDK 9

Configure AWS profile:

```powershell
aws configure --profile sportbooking
aws sts get-caller-identity --profile sportbooking
```

Optional: portable Terraform is supported at `scripts/tools/terraform.exe` (not committed).

## Phase 3 — Create infrastructure

From repository root:

```powershell
$env:AWS_PROFILE = "sportbooking"
.\scripts\aws-test-init.ps1
```

Review the plan, then apply:

```powershell
cd infra/terraform/test-env
terraform apply tfplan
.\..\..\..\scripts\aws-test-save-outputs.ps1
```

RDS SQL Server takes **20–40 minutes** on first apply.

## Phase 4 — Deploy backend

Start Docker Desktop, then from repository root:

```powershell
$env:AWS_PROFILE = "sportbooking"
.\scripts\aws-test-deploy-api.ps1
```

This builds the image, pushes to ECR, scales ECS to 1, and waits for `/health`.

## Teardown

```powershell
$env:AWS_PROFILE = "sportbooking"
cd infra/terraform/test-env
terraform destroy
cd ..\..\..
.\scripts\aws-test-teardown-check.ps1
```

Then run the cleanup checklist from `plan.md`.
