# Hướng dẫn Phase 1 — Làm trên AWS Console (chụp báo cáo)

> **Tài liệu đầy đủ:** Xem [`AWS-CONSOLE-GUIDE.md`](./AWS-CONSOLE-GUIDE.md) — hướng dẫn tất cả dịch vụ AWS + checklist chụp ảnh báo cáo.

> **Workflow:** Bạn làm các bước dưới đây trên Console → chụp màn hình → báo *"Phase 1 xong"* → AI chạy tiếp Terraform + Deploy.

**Region dùng xuyên suốt:** `ap-southeast-1` (Singapore)

---

## Bước 1.1 — Đăng nhập AWS Account

**Chụp:** Trang AWS Management Console sau khi đăng nhập.

1. Mở https://console.aws.amazon.com
2. Đăng nhập tài khoản AWS của bạn
3. Góc phải trên → chọn region **Asia Pacific (Singapore) ap-southeast-1**

**Khuyến nghị (không bắt buộc cho test ngắn):** Bật MFA cho root account  
→ IAM Identity Center / Security credentials → Assign MFA device

---

## Bước 1.2 — Tạo IAM User admin

**Chụp:** Màn hình user vừa tạo + màn hình Access key.

1. Console → tìm **IAM** → **Users** → **Create user**
2. User name: `sportbooking-admin`
3. **Next** → Attach policies directly → chọn **`AdministratorAccess`**
4. **Create user**
5. Vào user `sportbooking-admin` → tab **Security credentials**
6. **Create access key** → chọn **Command Line Interface (CLI)** → Next → Create
7. **Lưu ngay** (chỉ hiện 1 lần):
   - Access key ID
   - Secret access key

> ⚠️ Không gửi secret key vào chat. Giữ trên máy bạn.

---

## Bước 1.3 — Cấu hình AWS CLI (trên máy local)

**Chụp:** Terminal chạy `aws sts get-caller-identity` thành công.

Chạy trong PowerShell (repo root):

```powershell
# Nếu chưa có AWS CLI global, cài portable trước:
.\scripts\aws-test-install-cli.ps1

# Config profile (nhập Access Key + Secret Key vừa tạo)
aws configure --profile sportbooking
# AWS Access Key ID: <dán key>
# AWS Secret Access Key: <dán secret>
# Default region name: ap-southeast-1
# Default output format: json

# Kiểm tra
aws sts get-caller-identity --profile sportbooking
```

Kết quả mong đợi: JSON có `Account`, `Arn` chứa `sportbooking-admin`.

---

## Bước 1.5 — Tạo AWS Budget

**Chụp:** Màn hình Budget đã tạo + email alert.

1. Console → **Billing and Cost Management** → **Budgets**
2. **Create budget**
3. **Customize (advanced)** → **Cost budget** → Next
4. Budget name: `sportbooking-test-budget`
5. Period: **Monthly**, Amount: **80** USD
6. **Configure alerts:**
   - 50% actual → email của bạn
   - 80% actual → email của bạn
   - 100% actual → email của bạn
7. **Create budget**

---

## Bước 1.6 — Bật Cost Explorer

**Chụp:** Màn hình Cost Explorer enabled.

1. **Billing and Cost Management** → **Cost Explorer**
2. Nếu có nút **Enable Cost Explorer** → bấm Enable (miễn phí, mất vài giờ mới có data)

---

## Bỏ qua (không cần cho báo cáo test)

- **Bước 1.4** — IAM user `sportbooking-deploy-agent`: dùng `sportbooking-admin` cho session test này là đủ.

---

## Khi xong Phase 1

Gửi tin: **"Phase 1 xong"** (không cần gửi secret key).

AI sẽ chạy tiếp:
- `terraform plan` → gửi bạn review
- Sau khi bạn approve → `terraform apply`
- Build Docker → push ECR → deploy ECS
- Gửi ALB URL để bạn test Phase 5 (bạn test + chụp báo cáo)
