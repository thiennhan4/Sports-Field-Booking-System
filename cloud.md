# AWS Deployment Plan for Sport Booking Project

Project status: application code is mostly ready. The remaining work is packaging, provisioning AWS infrastructure, deploying, verifying, and monitoring.

Monthly budget target: **maximum 200 USD**.

Main rule: deploy in small phases. Do not create all production-grade services at once. Start with the minimum stable cloud environment, verify, then add domain, WAF, alerting, and scale-up settings.

---

## Target Architecture

Recommended first production-like architecture:

- Frontend: React/Vite build -> S3 static website bucket -> CloudFront -> Route 53 domain later.
- Backend: ASP.NET Core Docker image -> ECR -> ECS Fargate service -> Application Load Balancer.
- Database: Amazon RDS for SQL Server in private subnet.
- Cache: ElastiCache Redis in private subnet, or skip in the first smoke test if cost must be minimized.
- Secrets: AWS Secrets Manager for DB connection string, JWT secret, and production URLs.
- Logs/Monitoring: CloudWatch Logs, CloudWatch Alarms, SNS email alerts.
- Security: Security Groups, IAM least privilege, ACM TLS certificate, optional WAF after app is stable.

Cost-saving first version:

- 1 ECS backend task.
- RDS Single-AZ first, not Multi-AZ.
- 1 small Redis node only after backend and DB are stable.
- Avoid NAT Gateway in the first version if possible because it has hourly cost.
- Add WAF only near go-live.

---

## Phase 0 - Local Readiness

Owner: AI prepares, you review.

Goal: make sure the app can run locally in production-like mode before AWS resources are created.

Tasks:

- Validate backend Dockerfile.
- Validate frontend Dockerfile or decide to deploy frontend to S3 instead of ECS.
- Validate `docker-compose.yml`.
- Confirm backend exposes `/health`.
- Confirm backend can connect to SQL Server and Redis using environment variables.
- Confirm frontend uses `VITE_API_BASE_URL`.
- Create `.env.aws.example` with placeholder values only.
- Build backend locally with `dotnet build`.
- Build frontend locally after `npm ci`.

Exit checklist:

- `docker compose config` passes.
- Backend build passes.
- API health endpoint exists.
- No plaintext production secret is committed.

---

## Phase 1 - AWS Account, Budget, and Human-Owned Setup

Owner: you.

AI should not do these steps unless you explicitly allow commands after review.

Tasks:

1. Create or log into AWS account.
2. Enable MFA on root account.
3. Do not use root for deployment.
4. Create an admin IAM user only for yourself.
5. Configure AWS CLI on your machine.
6. Choose one AWS region.
   - Recommended: `ap-southeast-1` if users are mainly in Vietnam/Southeast Asia.
   - Lower-cost alternative for testing: `us-east-1`, but latency from Vietnam is higher.
7. Create AWS Budget:
   - Monthly budget: `200 USD`.
   - Alerts: `50`, `100`, `150`, `180`, `195`, `200`.
   - Send alerts to your email.
8. Enable Cost Explorer.
9. Create a deployment IAM user or role for AI with limited permissions.
10. Add a permission boundary so AI cannot create unrelated expensive services.

Exit checklist:

- MFA enabled.
- Budget alerts active.
- AWS CLI configured.
- AI has no `AdministratorAccess`.

---

## Phase 2 - IAM Boundary for AI Deployment

Owner: you create, AI can draft policy.

Allowed service areas for AI:

- ECR
- ECS
- CloudWatch Logs
- S3 deployment bucket
- CloudFront invalidation
- IAM PassRole only for specific ECS task execution role
- Secrets Manager read for specific app secrets
- Limited EC2 read/list permissions for VPC, subnets, security groups

Avoid giving AI broad permission to:

- Create arbitrary IAM users/policies.
- Delete billing resources.
- Create large EC2/RDS instances.
- Create NAT Gateways freely.
- Disable budgets or alarms.
- Delete production RDS snapshots.

Recommended guardrails:

- Use resource name prefix: `sportbooking-*`.
- Use tags:
  - `Project=SportBooking`
  - `Environment=dev` or `prod`
  - `ManagedBy=Terraform`
- Require manual approval before `terraform apply`.
- Require manual approval before deleting RDS, ElastiCache, ALB, CloudFront, or S3 buckets.

---

## Phase 3 - Infrastructure as Code

Owner: AI prepares Terraform/CDK, you review and approve.

Recommended: Terraform for clarity and reviewability.

State management:

- First version: local Terraform state is acceptable for learning.
- Safer version: S3 backend + DynamoDB lock table.

Modules or stacks to create:

1. Network
   - VPC `10.0.0.0/16`.
   - 2 public subnets.
   - 2 private app subnets.
   - 2 private data subnets.
   - Internet Gateway.
   - Route tables.
   - Optional NAT Gateway only if ECS tasks in private subnet need outbound internet.

2. Security Groups
   - ALB SG: allow `80/443` from internet.
   - ECS SG: allow backend port from ALB SG only.
   - RDS SG: allow SQL Server port `1433` from ECS SG only.
   - Redis SG: allow Redis port `6379` from ECS SG only.

3. ECR
   - `sportbooking-backend`.
   - Optional `sportbooking-frontend` only if running frontend in ECS.

4. RDS SQL Server
   - Start with Single-AZ.
   - Private data subnet group.
   - Smallest acceptable instance for SQL Server testing.
   - Storage autoscaling limited.
   - Deletion protection on after stable deployment.
   - Final snapshot required before delete.

5. ElastiCache Redis
   - Start with 1 small node.
   - Private subnet group.
   - No public access.
   - Add only after backend/RDS are confirmed.

6. ECS
   - ECS cluster.
   - Fargate task definition for backend.
   - 1 service.
   - Desired count: 1 for dev/staging.
   - Health check path: `/health`.
   - CloudWatch log group with retention, for example 7 or 14 days.

7. ALB
   - Public ALB.
   - HTTP listener first for smoke test.
   - HTTPS listener after ACM certificate is ready.
   - Target group points to ECS backend task.

8. Frontend Hosting
   - S3 bucket for static frontend assets.
   - CloudFront distribution.
   - Origin Access Control.
   - SPA fallback to `index.html`.

9. Secrets Manager
   - DB connection string.
   - JWT secret.
   - API URL.
   - Frontend URL.

10. Monitoring
   - CloudWatch alarms:
     - ECS task stopped.
     - ALB 5xx errors.
     - ALB target unhealthy.
     - RDS CPU high.
     - RDS free storage low.
   - SNS topic to your email.

Exit checklist:

- `terraform fmt` passes.
- `terraform validate` passes.
- `terraform plan` reviewed by you.
- Estimated monthly cost is under 200 USD before apply.

---

## Phase 4 - Container Build and ECR Push

Owner: AI runs commands, you approve AWS-changing commands.

Backend flow:

1. Build .NET solution.
2. Build Docker image from backend Dockerfile.
3. Tag image with:
   - Git commit SHA.
   - `latest-dev` or `latest-prod`.
4. Push to ECR.

Frontend flow:

1. Set `VITE_API_BASE_URL` to ALB or API domain.
2. Run `npm ci`.
3. Run `npm run build`.
4. Upload `dist` to S3.
5. Invalidate CloudFront cache.

Exit checklist:

- Backend image exists in ECR.
- ECS task definition points to the expected image tag.
- Frontend assets exist in S3.

---

## Phase 5 - First Cloud Deployment

Owner: AI deploys, you approve and test.

Recommended deployment order:

1. Apply network and security groups.
2. Create ECR.
3. Build and push backend image.
4. Create RDS.
5. Create backend secrets.
6. Create ECS cluster/task/service.
7. Create ALB.
8. Test `/health`.
9. Test login/API endpoints.
10. Add Redis.
11. Test booking flow.
12. Deploy frontend to S3/CloudFront.

Important:

- Do not attach domain until ALB/API works.
- Do not enable WAF until frontend and backend work.
- Do not turn on Multi-AZ until you know monthly cost is acceptable.

Exit checklist:

- ALB target is healthy.
- Backend logs show successful startup.
- RDS migration/seeding finished or was run manually.
- API returns expected responses.
- Frontend can call backend API.

---

## Phase 6 - Verification

Owner: AI checks technical health, you test business flows.

AI checks:

- ECS service desired/running count.
- ECS task stopped reason if any.
- CloudWatch logs for exceptions.
- ALB target health.
- ALB 4xx/5xx metrics.
- RDS connection errors.
- Redis connection errors.
- Secrets loaded correctly.

You test:

- Register/login.
- Browse venues/courts.
- Create booking.
- Payment-related flow if available.
- Owner/admin pages.
- Uploads if the app uses S3 uploads.
- Language/settings UI.

Exit checklist:

- All critical user flows pass.
- No repeated backend exception in logs.
- No unhealthy ECS target.

---

## Phase 7 - Go-Live Hardening

Owner: AI prepares, you approve.

Tasks:

- Request ACM certificate.
- Add Route 53 records.
- Add HTTPS listener to ALB.
- Set CloudFront custom domain.
- Configure frontend environment for final API domain.
- Add WAF Web ACL after traffic path is stable.
- Add tighter CORS settings.
- Enable RDS deletion protection.
- Set backup retention.
- Set log retention to control cost.
- Add CloudWatch alarms and SNS email.

Exit checklist:

- Website works through HTTPS domain.
- API works through HTTPS domain.
- WAF does not block normal app traffic.
- Budget alert is still active.

---

## Phase 8 - Rollback and Operations

Owner: AI prepares scripts, you approve production rollback.

Rollback options:

- ECS rollback: update service back to previous task definition/image tag.
- Frontend rollback: sync previous S3 build or use previous artifact.
- Database rollback: restore from RDS snapshot only for severe cases.

Operational rules:

- Tag every release.
- Keep the last 3 backend image tags.
- Keep frontend build artifacts.
- Do not run destructive Terraform changes without review.
- Review AWS Cost Explorer every day during the first week.

---

## Cost Control Plan for 200 USD/month

Primary cost risks:

- RDS SQL Server.
- NAT Gateway hourly charge and data processing.
- ALB hourly charge.
- Public IPv4 hourly charge.
- WAF if many rules are enabled.
- CloudWatch logs if log volume is high.

Recommended first-month cost posture:

- RDS: Single-AZ, smallest acceptable SQL Server edition/instance.
- ECS: 1 Fargate task.
- ALB: 1 ALB.
- Redis: add after backend DB is stable.
- NAT Gateway: avoid at first if possible, or create only 1 NAT Gateway for dev.
- WAF: delay until go-live.
- CloudWatch log retention: 7 or 14 days.
- S3/CloudFront: usually small for a low-traffic frontend.

Budget stop rules:

- At 100 USD: review Cost Explorer and pause new services.
- At 150 USD: disable non-essential resources such as WAF test rules, extra Redis, extra ECS tasks.
- At 180 USD: stop dev/staging ECS services when not testing.
- At 195 USD: snapshot and shut down expensive non-production resources.

Important note: AWS Budgets alerts you, but it does not automatically stop all spending. You still need manual or scripted cleanup.

---

## Responsibility Matrix

You:

- AWS account and MFA.
- Budget and billing alarms.
- IAM approval.
- Domain ownership.
- Reviewing Terraform plan/CDK diff.
- Final approval before infrastructure changes.
- Functional acceptance testing.

AI:

- Prepare Docker and deployment files.
- Generate Terraform/CDK.
- Generate IAM policy drafts.
- Generate AWS CLI commands.
- Build images.
- Push to ECR after approval.
- Deploy ECS after approval.
- Upload frontend to S3 after approval.
- Check logs and health.
- Prepare rollback commands.
- Produce deployment report.

---

## Practical Next Steps

Step 1:

- Confirm AWS region.
- Confirm whether frontend will be S3/CloudFront or ECS/Nginx.
- Confirm whether first version should include Redis immediately.

Step 2:

- Create AWS account setup checklist.
- Create AI limited IAM policy draft.
- Create Terraform folder structure:
  - `infra/envs/dev`
  - `infra/modules/network`
  - `infra/modules/ecr`
  - `infra/modules/rds`
  - `infra/modules/ecs`
  - `infra/modules/frontend`
  - `infra/modules/monitoring`

Step 3:

- Run Terraform plan only.
- Review estimated resources.
- Apply only after budget and IAM guardrails are active.

Step 4:

- Deploy backend first.
- Verify `/health`.
- Deploy frontend second.
- Verify full booking flow.

---

## Useful Official Pricing References

- AWS Fargate pricing: https://aws.amazon.com/fargate/pricing/
- Amazon RDS for SQL Server pricing: https://aws.amazon.com/rds/sqlserver/pricing/
- Amazon VPC pricing, including NAT Gateway and public IPv4: https://aws.amazon.com/vpc/pricing/
- Elastic Load Balancing pricing: https://aws.amazon.com/elasticloadbalancing/pricing/
- AWS WAF pricing: https://aws.amazon.com/waf/pricing/
- Amazon S3 pricing: https://aws.amazon.com/s3/pricing/
- Amazon CloudFront pricing: https://aws.amazon.com/cloudfront/pricing/
