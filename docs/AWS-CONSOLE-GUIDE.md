# Hướng dẫn chạy dịch vụ AWS trên Console — Sports Field Booking System

> **Mục đích tài liệu:** Hướng dẫn từng bước thao tác trên **AWS Management Console** để bạn chụp màn hình làm báo cáo.  
> **Dự án:** Sports Field Booking System  
> **Region bắt buộc:** `ap-southeast-1` (Asia Pacific — Singapore)  
> **Prefix tài nguyên:** `sportbooking-test`

---

## Mục lục

1. [Kiến trúc hệ thống trên AWS](#1-kiến-trúc-hệ-thống-trên-aws)
2. [Chuẩn bị trước khi vào Console](#2-chuẩn-bị-trước-khi-vào-console)
3. [Phần A — Thiết lập tài khoản (trước deploy)](#phần-a--thiết-lập-tài-khoản-trước-deploy)
4. [Phần B — Kiểm tra hạ tầng sau Terraform Apply](#phần-b--kiểm tra-hạ-tầng-sau-terraform-apply)
5. [Phần C — Kiểm tra sau khi Deploy API](#phần-c--kiểm tra-sau-khi-deploy-api)
6. [Phần D — Test API trên Cloud](#phần-d--test-api-trên-cloud)
7. [Phần E — Giám sát vận hành](#phần-e--giám-sát-vận-hành)
8. [Phần F — Xác nhận đã xóa tài nguyên (sau Teardown)](#phần-f--xác-nhận-đã-xóa-tài-nguyên-sau-teardown)
9. [Checklist chụp ảnh báo cáo](#checklist-chụp-ảnh-báo-cáo)
10. [Bảng tra cứu tên resource](#bảng-tra-cứu-tên-resource)

---

## 1. Kiến trúc hệ thống trên AWS

```
Browser / Postman
       │
       ▼
┌──────────────────┐
│  ALB (port 80)   │  ← URL công khai: sportbooking-test-xxxxx.ap-southeast-1.elb.amazonaws.com
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ ECS Fargate      │  ← Container SportBooking.API (.NET 9)
│ 0.5 vCPU / 1 GB  │
└────────┬─────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌──────────┐
│  RDS   │ │ElastiCache│
│SQL Srv │ │  Redis    │
└────────┘ └──────────┘
```

| Dịch vụ AWS | Vai trò trong project |
|-------------|----------------------|
| **VPC + Subnet** | Mạng riêng, chia public/private subnet |
| **Security Group** | Firewall: ALB ↔ ECS ↔ RDS ↔ Redis |
| **ALB** | Load balancer, truy cập API từ internet |
| **ECS Fargate** | Chạy container API |
| **ECR** | Lưu Docker image backend |
| **RDS SQL Server** | Database (EF Core + Hangfire) |
| **ElastiCache Redis** | Cache + distributed lock booking slot |
| **Secrets Manager** | Lưu connection string DB + JWT secret |
| **CloudWatch Logs** | Log container API |
| **IAM** | User + role cho deploy |
| **Budget** | Cảnh báo chi phí |

> **Lưu ý:** Hạ tầng được tạo bằng **Terraform** (AI chạy). Bạn **không** cần tạo thủ công từng service trên Console — chỉ cần **vào Console kiểm tra, chụp ảnh, test**.

---

## 2. Chuẩn bị trước khi vào Console

### 2.1 Chọn đúng Region

Mỗi lần đăng nhập Console:

1. Mở https://console.aws.amazon.com
2. Góc phải trên → chọn **Asia Pacific (Singapore) `ap-southeast-1`**

📸 **Chụp:** Thanh region hiển thị `ap-southeast-1`.

### 2.2 Tìm nhanh dịch vụ

Dùng ô **Search** trên thanh điều hướng, gõ tên dịch vụ:

| Gõ tìm | Dịch vụ |
|--------|---------|
| `VPC` | Virtual Private Cloud |
| `ECS` | Elastic Container Service |
| `ECR` | Elastic Container Registry |
| `RDS` | Relational Database Service |
| `ElastiCache` | Redis cluster |
| `EC2 Load Balancers` | Application Load Balancer |
| `Secrets Manager` | Secrets |
| `CloudWatch` | Logs & Metrics |
| `IAM` | Users & Roles |
| `Budgets` | Cost budget |

---

## Phần A — Thiết lập tài khoản (trước deploy)

> Làm **trước** khi AI chạy `terraform apply`. Sau khi xong, báo AI: *"Phase 1 xong"*.

---

### A.1 — Đăng nhập AWS Account

1. Truy cập https://aws.amazon.com → **Sign In to the Console**
2. Đăng nhập bằng email/password tài khoản AWS
3. Chọn region **ap-southeast-1**

📸 **Chụp:** Trang AWS Management Console Home sau khi đăng nhập.

---

### A.2 — Tạo IAM User `sportbooking-admin`

**Đường dẫn:** IAM → Users → Create user

| Bước | Thao tác |
|------|----------|
| 1 | **Create user** |
| 2 | User name: `sportbooking-admin` |
| 3 | **Next** |
| 4 | Attach policies directly → chọn **`AdministratorAccess`** |
| 5 | **Next** → **Create user** |

📸 **Chụp:**
- Danh sách Users có `sportbooking-admin`
- Tab **Permissions** của user → policy `AdministratorAccess`

---

### A.3 — Tạo Access Key cho CLI

**Đường dẫn:** IAM → Users → `sportbooking-admin` → **Security credentials**

| Bước | Thao tác |
|------|----------|
| 1 | Kéo xuống **Access keys** → **Create access key** |
| 2 | Use case: **Command Line Interface (CLI)** |
| 3 | Tick xác nhận → **Next** → **Create access key** |
| 4 | **Lưu ngay** Access Key ID + Secret Access Key |

📸 **Chụp:** Màn hình Access key vừa tạo (có thể che bớt secret).

> ⚠️ Secret key chỉ hiện **1 lần**. Không commit lên Git, không gửi vào chat.

---

### A.4 — Cấu hình AWS CLI trên máy (không phải Console, nhưng cần cho deploy)

Mở **PowerShell** tại thư mục project:

```powershell
cd "C:\Users\ADMIN\OneDrive\Máy tính\New folder (2)\Sports-Field-Booking-System"

# Cài AWS CLI nếu chưa có
.\scripts\aws-test-install-cli.ps1

# Cấu hình profile
aws configure --profile sportbooking
# Access Key ID:     <dán key>
# Secret Access Key: <dán secret>
# Region:            ap-southeast-1
# Output:            json

# Kiểm tra
aws sts get-caller-identity --profile sportbooking
```

📸 **Chụp:** Terminal hiện JSON có `"Arn": "...sportbooking-admin"`.

**Sau bước này → báo AI: "Phase 1 xong"** để AI chạy Terraform + Deploy.

---

### A.5 — Tạo AWS Budget (cảnh báo chi phí)

**Đường dẫn:** Billing and Cost Management → **Budgets** → Create budget

| Trường | Giá trị |
|--------|---------|
| Budget type | **Cost budget** → Customize |
| Name | `sportbooking-test-budget` |
| Period | Monthly |
| Budget amount | **80** USD |
| Alert 1 | 50% of budgeted amount → Actual → Email bạn |
| Alert 2 | 80% → Actual → Email bạn |
| Alert 3 | 100% → Actual → Email bạn |

📸 **Chụp:**
- Danh sách Budgets có `sportbooking-test-budget`
- Chi tiết budget + phần Alerts

---

### A.6 — Bật Cost Explorer

**Đường dẫn:** Billing and Cost Management → **Cost Explorer**

1. Nếu thấy **Enable Cost Explorer** → bấm Enable
2. Chờ vài giờ để có dữ liệu chi phí

📸 **Chụp:** Màn hình Cost Explorer (có thể chưa có data ngay).

---

## Phần B — Kiểm tra hạ tầng sau Terraform Apply

> AI chạy `terraform apply` xong (~20–40 phút) sẽ báo bạn. Lúc này vào Console kiểm tra từng dịch vụ.

---

### B.1 — VPC (Mạng ảo)

**Đường dẫn:** VPC → **Your VPCs**

| Tìm | Giá trị |
|-----|---------|
| Name tag | `sportbooking-test-vpc` |
| CIDR | `10.0.0.0/16` |

📸 **Chụp:**
- Danh sách VPC
- Chi tiết VPC → tab **Resource map** (hiện subnets, IGW)

**Subnets** (VPC → Subnets):

| Name | Loại |
|------|------|
| `sportbooking-test-public-1` | Public |
| `sportbooking-test-public-2` | Public |
| `sportbooking-test-private-data-1` | Private |
| `sportbooking-test-private-data-2` | Private |

📸 **Chụp:** Danh sách 4 subnets.

---

### B.2 — Security Groups (Firewall)

**Đường dẫn:** VPC → **Security Groups** → lọc VPC `sportbooking-test-vpc`

| Name | Mục đích |
|------|----------|
| `sportbooking-test-alb-sg` | Cho phép HTTP:80 từ internet |
| `sportbooking-test-ecs-sg` | Cho phép traffic từ ALB → port 8080 |
| `sportbooking-test-rds-sg` | Cho phép SQL Server:1433 từ ECS |
| `sportbooking-test-redis-sg` | Cho phép Redis:6379 từ ECS |

📸 **Chụp:**
- Danh sách 4 Security Groups
- Chi tiết `sportbooking-test-rds-sg` → tab **Inbound rules** (port 1433 từ ECS SG)

---

### B.3 — RDS SQL Server (Database)

**Đường dẫn:** RDS → **Databases**

| Tìm | Giá trị |
|-----|---------|
| DB identifier | `sportbooking-test-sqlserver` |
| Engine | Microsoft SQL Server Express |
| Instance class | `db.t3.small` |
| Status | **Available** (chờ 15–30 phút lúc mới tạo) |

📸 **Chụp:**
- Danh sách databases
- Tab **Connectivity & security** → Endpoint (dạng `sportbooking-test-sqlserver.xxxxx.ap-southeast-1.rds.amazonaws.com`)
- Tab **Configuration** → Storage 20 GiB

> Endpoint **không** public — chỉ ECS truy cập được qua private subnet.

---

### B.4 — ElastiCache Redis

**Đường dẫn:** ElastiCache → **Redis OSS caches** (hoặc **Clusters**)

| Tìm | Giá trị |
|-----|---------|
| Cluster name | `sportbooking-test-redis` |
| Node type | `cache.t3.micro` |
| Status | **Available** |

📸 **Chụp:**
- Danh sách cluster Redis
- Chi tiết cluster → Primary endpoint (dạng `sportbooking-test-redis.xxxxx.cache.amazonaws.com:6379`)

---

### B.5 — ECR (Docker Image Repository)

**Đường dẫn:** ECR → **Repositories**

| Tìm | Giá trị |
|-----|---------|
| Repository name | `sportbooking-test-api` |
| URI | `<account-id>.dkr.ecr.ap-southeast-1.amazonaws.com/sportbooking-test-api` |

📸 **Chụp:**
- Repository `sportbooking-test-api` (lúc mới tạo có thể chưa có image)

> Sau khi AI deploy, quay lại đây — sẽ thấy image tag `latest`.

---

### B.6 — ECS Cluster & Service

**Đường dẫn:** ECS → **Clusters**

| Tìm | Giá trị |
|-----|---------|
| Cluster | `sportbooking-test-cluster` |

Vào cluster → tab **Services**:

| Tìm | Giá trị |
|-----|---------|
| Service | `sportbooking-test-api` |
| Launch type | FARGATE |
| Desired count | `0` (trước deploy) hoặc `1` (sau deploy) |

📸 **Chụp:**
- Cluster overview
- Service `sportbooking-test-api` → tab **Tasks** (sau deploy: 1 task RUNNING)

**Task Definition** (ECS → Task definitions):

| Tìm | Giá trị |
|-----|---------|
| Family | `sportbooking-test-api` |
| CPU / Memory | 0.5 vCPU / 1 GB |

📸 **Chụp:** Task definition → tab **Containers** → environment variables (`ASPNETCORE_ENVIRONMENT=Staging`, `Redis__ConnectionString`, ...)

---

### B.7 — ALB (Application Load Balancer)

**Đường dẫn:** EC2 → **Load Balancers** (sidebar: Load Balancing)

| Tìm | Giá trị |
|-----|---------|
| Name | `sportbooking-test-alb` |
| Type | Application |
| State | **Active** |
| DNS name | `sportbooking-test-xxxxx.ap-southeast-1.elb.amazonaws.com` |

📸 **Chụp:**
- Load balancer list
- Tab **Listeners** → port 80 HTTP
- Copy **DNS name** — đây là URL API công khai

**Target Group** (EC2 → Target Groups):

| Tìm | Giá trị |
|-----|---------|
| Name | `sportbooking-test-api-tg` |
| Health check path | `/health` |

📸 **Chụp:** Target group → tab **Targets** → Status **healthy** (sau deploy)

---

### B.8 — Secrets Manager

**Đường dẫn:** Secrets Manager → **Secrets**

| Secret name | Nội dung |
|-------------|----------|
| `sportbooking-test/connection-string` | Connection string RDS |
| `sportbooking-test/jwt-secret` | JWT signing key |

📸 **Chụp:** Danh sách 2 secrets (không cần mở giá trị secret).

---

### B.9 — CloudWatch Log Group

**Đường dẫn:** CloudWatch → **Log groups**

| Tìm | Giá trị |
|-----|---------|
| Log group | `/ecs/sportbooking-test-api` |
| Retention | 7 days |

📸 **Chụp:** Log group list (sau deploy sẽ có log streams).

---

## Phần C — Kiểm tra sau khi Deploy API

> AI chạy `aws-test-deploy-api.ps1` xong. Kiểm tra các mục sau.

---

### C.1 — ECR có Docker image

**ECR** → `sportbooking-test-api` → tab **Images**

📸 **Chụp:** Image tag `latest` với thời gian push mới nhất.

---

### C.2 — ECS Task đang RUNNING

**ECS** → Clusters → `sportbooking-test-cluster` → Services → `sportbooking-test-api`

| Kiểm tra | Kỳ vọng |
|----------|---------|
| Desired count | 1 |
| Running count | 1 |
| Last deployment | COMPLETED |
| Task status | **RUNNING** |

📸 **Chụp:**
- Service overview (running 1/1)
- Click vào Task ID → tab **Logs** (link CloudWatch)

---

### C.3 — ALB Target Healthy

**EC2** → Target Groups → `sportbooking-test-api-tg` → **Targets**

| Kiểm tra | Kỳ vọng |
|----------|---------|
| Registered targets | 1 |
| Health status | **healthy** |

📸 **Chụp:** Target healthy (màu xanh).

---

### C.4 — Xem log API trên CloudWatch

**CloudWatch** → Log groups → `/ecs/sportbooking-test-api` → chọn log stream mới nhất

Tìm dòng log:
- `Now listening on: http://[::]:8080`
- `Database migrated` / seed data
- Không có lỗi connection Redis/RDS

📸 **Chụp:** Log stream có startup thành công.

---

## Phần D — Test API trên Cloud

> Dùng URL ALB từ Console: `http://sportbooking-test-xxxxx.ap-southeast-1.elb.amazonaws.com`

---

### D.1 — Health Check (Browser)

Mở trình duyệt:

```
http://<ALB-DNS>/health
```

**Kỳ vọng:** Hiện text `ok`

📸 **Chụp:** Browser hiện `ok`.

---

### D.2 — Swagger UI

```
http://<ALB-DNS>/swagger
```

📸 **Chụp:** Trang Swagger SportBooking API v1.

---

### D.3 — Test bằng Postman

1. Mở Postman → Import file:
   - `Sports-Field-Booking-System-main/backend/postman_environment.json`
2. Sửa biến `baseUrl`:
   ```
   http://sportbooking-test-xxxxx.ap-southeast-1.elb.amazonaws.com
   ```
   (không có `/` cuối, không có `/api`)

3. Chạy test theo thứ tự:

| # | Test | Method + Endpoint | Kỳ vọng |
|---|------|-------------------|---------|
| 1 | Health | `GET /health` | 200, body `ok` |
| 2 | Register | `POST /api/auth/register` | 201 |
| 3 | Login | `POST /api/auth/login` | 200 + JWT token |
| 4 | List venues | `GET /api/venues` | 200, có data |
| 5 | Available slots | `GET /api/slots/...` | 200 |
| 6 | Create booking | `POST /api/bookings` | 201 |
| 7 | Payment | `POST /api/payments` | 200/201 |

📸 **Chụp:** Mỗi request Postman với Status 200/201 và response body.

---

### D.4 — Test Hangfire (booking tự hủy sau 5 phút)

1. Tạo booking nhưng **không** thanh toán
2. Đợi **5–10 phút**
3. Kiểm tra booking status → đã bị cancel

📸 **Chụp:** Response booking ban đầu (Pending) + sau 5 phút (Cancelled).

---

### D.5 — Test Redis Lock (2 request cùng slot)

Gửi **2 request tạo booking** cùng slot_id gần như đồng thời:

- 1 request → **201 Created**
- 1 request → **409 Conflict**

📸 **Chụp:** 2 tab Postman — 1 thành công, 1 conflict.

---

## Phần E — Giám sát vận hành

> Chạy trong 24–48 giờ test. Vào Console kiểm tra định kỳ.

---

### E.1 — ECS Service ổn định

**ECS** → `sportbooking-test-api` service

📸 **Chụp:** Events tab — không có error liên tục, task không restart.

---

### E.2 — CloudWatch Metrics — ECS

**CloudWatch** → **Container Insights** hoặc **Metrics** → ECS

Theo dõi:
- CPU utilization < 80%
- Memory utilization ổn định, không tăng liên tục

📸 **Chụp:** Biểu đồ CPU/Memory ổn định.

---

### E.3 — RDS Monitoring

**RDS** → `sportbooking-test-sqlserver` → tab **Monitoring**

📸 **Chụp:** CPU, Database connections, Free storage.

---

### E.4 — Chi phí thực tế

**Billing** → **Cost Explorer** → Filter:
- Service: RDS, ECS, ElastiCache, EC2 (ALB), VPC
- Region: ap-southeast-1

📸 **Chụp:** Biểu đồ chi phí theo ngày (~$4–7/ngày).

---

## Phần F — Xác nhận đã xóa tài nguyên (sau Teardown)

> Sau khi AI chạy `terraform destroy`, bạn vào Console xác nhận **không còn** resource.

Kiểm tra từng dịch vụ — kỳ vọng: **trống** hoặc **0 kết quả**:

| Dịch vụ | Tìm | Kỳ vọng |
|---------|-----|---------|
| ECS | Clusters `sportbooking-test` | Không có |
| RDS | `sportbooking-test-sqlserver` | Không có |
| ElastiCache | `sportbooking-test-redis` | Không có |
| EC2 LB | `sportbooking-test-alb` | Không có |
| ECR | `sportbooking-test-api` | Không có |
| Secrets Manager | `sportbooking-test/*` | Không có |
| CloudWatch | `/ecs/sportbooking-test-api` | Không có |
| VPC | `sportbooking-test-vpc` | Không có |

📸 **Chụp:** Mỗi dịch vụ hiện "No resources" / danh sách trống.

**RDS Snapshots** (quan trọng — tốn tiền nếu sót):

**RDS** → **Snapshots** → tìm `sportbooking-test` → phải **0 snapshot**.

📸 **Chụp:** Snapshots trống.

**Elastic IPs** (tốn $3.6/tháng nếu idle):

**EC2** → **Elastic IPs** → không có EIP unassociated.

📸 **Chụp:** 0 Elastic IP.

---

## Checklist chụp ảnh báo cáo

Dùng checklist này khi làm báo cáo. Đánh dấu ✅ khi đã chụp.

### Giai đoạn 1 — Thiết lập (Phần A)

- [ ] A.1 — Console Home + region ap-southeast-1
- [ ] A.2 — IAM user `sportbooking-admin` + policy
- [ ] A.3 — Access key đã tạo
- [ ] A.4 — Terminal `aws sts get-caller-identity` thành công
- [ ] A.5 — Budget $80 + alerts
- [ ] A.6 — Cost Explorer enabled

### Giai đoạn 2 — Hạ tầng (Phần B)

- [ ] B.1 — VPC + 4 subnets
- [ ] B.2 — 4 Security Groups + inbound rules
- [ ] B.3 — RDS SQL Server Available
- [ ] B.4 — ElastiCache Redis Available
- [ ] B.5 — ECR repository
- [ ] B.6 — ECS cluster + service
- [ ] B.7 — ALB Active + DNS name
- [ ] B.8 — Secrets Manager (2 secrets)
- [ ] B.9 — CloudWatch log group

### Giai đoạn 3 — Deploy (Phần C)

- [ ] C.1 — ECR image `latest`
- [ ] C.2 — ECS task RUNNING 1/1
- [ ] C.3 — ALB target healthy
- [ ] C.4 — CloudWatch logs startup OK

### Giai đoạn 4 — Test (Phần D)

- [ ] D.1 — `/health` → `ok`
- [ ] D.2 — Swagger UI
- [ ] D.3 — Postman: Register, Login, Venues, Booking
- [ ] D.4 — Hangfire auto-cancel
- [ ] D.5 — Redis lock conflict 409

### Giai đoạn 5 — Giám sát (Phần E)

- [ ] E.1 — ECS events ổn định
- [ ] E.2 — CloudWatch CPU/Memory
- [ ] E.3 — RDS monitoring
- [ ] E.4 — Cost Explorer chi phí

### Giai đoạn 6 — Teardown (Phần F)

- [ ] F — Tất cả dịch vụ trống sau destroy
- [ ] F — 0 RDS snapshots
- [ ] F — 0 Elastic IPs idle

---

## Bảng tra cứu tên resource

| Dịch vụ AWS | Tên resource | Console path |
|-------------|-------------|--------------|
| VPC | `sportbooking-test-vpc` | VPC → Your VPCs |
| Subnet (public) | `sportbooking-test-public-1/2` | VPC → Subnets |
| Subnet (private) | `sportbooking-test-private-data-1/2` | VPC → Subnets |
| Security Group ALB | `sportbooking-test-alb-sg` | VPC → Security Groups |
| Security Group ECS | `sportbooking-test-ecs-sg` | VPC → Security Groups |
| Security Group RDS | `sportbooking-test-rds-sg` | VPC → Security Groups |
| Security Group Redis | `sportbooking-test-redis-sg` | VPC → Security Groups |
| ALB | `sportbooking-test-alb` | EC2 → Load Balancers |
| Target Group | `sportbooking-test-api-tg` | EC2 → Target Groups |
| ECS Cluster | `sportbooking-test-cluster` | ECS → Clusters |
| ECS Service | `sportbooking-test-api` | ECS → Cluster → Services |
| Task Definition | `sportbooking-test-api` | ECS → Task definitions |
| ECR | `sportbooking-test-api` | ECR → Repositories |
| RDS | `sportbooking-test-sqlserver` | RDS → Databases |
| Redis | `sportbooking-test-redis` | ElastiCache → Redis caches |
| Secret DB | `sportbooking-test/connection-string` | Secrets Manager |
| Secret JWT | `sportbooking-test/jwt-secret` | Secrets Manager |
| Log Group | `/ecs/sportbooking-test-api` | CloudWatch → Log groups |
| IAM User | `sportbooking-admin` | IAM → Users |
| Budget | `sportbooking-test-budget` | Billing → Budgets |

---

## Workflow tổng hợp

```
BẠN (Console)          AI (CLI/Script)           BẠN (Console + Test)
     │                        │                         │
     ├─ Phần A: IAM, Budget ──┤                         │
     │   "Phase 1 xong" ──────►│                         │
     │                        ├─ terraform apply        │
     │◄── "Apply xong" ────────┤                         │
     ├─ Phần B: Kiểm tra hạ tầng (chụp ảnh)             │
     │                        ├─ deploy API             │
     │◄── "Deploy xong" + ALB URL                        │
     ├─ Phần C: Kiểm tra deploy (chụp ảnh)              │
     ├─ Phần D: Test API Postman/Swagger (chụp ảnh)     │
     ├─ Phần E: Giám sát 24-48h (chụp ảnh)              │
     │   "Test pass, teardown" ─►│                       │
     │                        ├─ terraform destroy       │
     ├─ Phần F: Xác nhận đã xóa (chụp ảnh)              │
```

---

## Liên hệ với AI Agent

| Bạn báo | AI sẽ làm |
|---------|-----------|
| `"Phase 1 xong"` | `terraform plan` → chờ bạn approve → `terraform apply` |
| `"Approve plan"` | `terraform apply` + lưu outputs |
| `"Deploy xong chưa?"` | Kiểm tra trạng thái deploy |
| `"Test pass, teardown"` | `terraform destroy` + cleanup script |

---

*Tài liệu này dành cho mục đích test tạm trên AWS và làm báo cáo. Nhớ destroy tài nguyên sau khi test xong để tránh phát sinh chi phí.*
