# Hướng Dẫn Test Hệ Thống Đặt Sân Thể Thao (SmashPlay)

Tài liệu này hướng dẫn chạy và kiểm thử **từng chức năng** sau khi frontend (`court-booking-frontend`) đã được nối với backend API (`Sports-Field-Booking-System-main/backend`).

---

## 1. Yêu cầu môi trường

| Thành phần | Phiên bản / Ghi chú |
|------------|---------------------|
| Node.js | 18+ |
| .NET SDK | 9.0 |
| SQL Server | LocalDB hoặc SQL Server Express |
| Redis | Chạy tại `localhost:6379` |

### Cài Redis trên Windows (nhanh)

```powershell
docker run -d --name redis -p 6379:6379 redis:alpine
```

---

## 2. Khởi động hệ thống

### Bước 1 — Chạy Backend API

```powershell
cd d:\Downloads\DoAnAWSFE\Sports-Field-Booking-System-main\backend\SportBooking.API
dotnet restore
dotnet run
```

API chạy tại: **http://localhost:5108**

- Swagger UI: http://localhost:5108/swagger
- Lần đầu chạy: tự migrate DB, seed dữ liệu mẫu, sinh khung giờ 30 ngày tới

### Bước 2 — Chạy Frontend

```powershell
cd d:\Downloads\DoAnAWSFE\court-booking-frontend
npm install
npm run dev
```

Frontend chạy tại: **http://localhost:5173**

File cấu hình API: `court-booking-frontend/.env`

```
VITE_API_BASE_URL=http://localhost:5108/api
```

---

## 3. Tài khoản test có sẵn

| Vai trò | Email | Mật khẩu | Ghi chú |
|---------|-------|----------|---------|
| Khách hàng | `customer1@sportbooking.com` | `customer123` | Đặt sân, xem lịch |
| Chủ sân | `owner1@sportbooking.com` | `owner123` | Quản lý cơ sở, sân, đơn |
| Admin | `admin@sportbooking.com` | `admin123` | Duyệt chủ sân, cơ sở |

**Cơ sở mẫu:** Khu Thể Thao Bách Khoa — 2 sân (bóng đá, tennis), khung giờ 08:00–20:00.

---

## 4. Test từng chức năng

### 4.1. Trang chủ & Tìm kiếm sân (Public)

**URL:** `/` và `/search`

| Bước | Thao tác | Kết quả mong đợi |
|------|----------|------------------|
| 1 | Mở http://localhost:5173 | Hiển thị danh sách cơ sở đã duyệt (Active) |
| 2 | Nhập quận / loại môn thể thao → Tìm kiếm | Chuyển sang `/search`, lọc theo địa chỉ & loại sân |
| 3 | Click vào một cơ sở | Mở `/venue/{id}` — chi tiết + danh sách sân |

**API gọi:**
- `GET /api/venues`
- `GET /api/venues/{id}/courts`

---

### 4.2. Chi tiết cơ sở & Đặt sân nhanh

**URL:** `/venue/{id}`

| Bước | Thao tác | Kết quả mong đợi |
|------|----------|------------------|
| 1 | Xem thông tin cơ sở, danh sách sân | Dữ liệu từ API |
| 2 | Click **Đặt sân ngay** hoặc **Đặt sân** trên từng court | Chuyển `/book?venueId=...&courtId=...` |

---

### 4.3. Đăng ký tài khoản

**URL:** `/register`

#### Test đăng ký Khách hàng

| Bước | Thao tác | Kết quả mong đợi |
|------|----------|------------------|
| 1 | Chọn vai trò **Khách hàng** | — |
| 2 | Điền Họ tên, Email mới, Mật khẩu → Đăng ký | Tự động đăng nhập, về trang chủ |

**API:** `POST /api/auth/register` (role: `Customer`)

#### Test đăng ký Chủ sân

| Bước | Thao tác | Kết quả mong đợi |
|------|----------|------------------|
| 1 | Chọn vai trò **Chủ sân** | — |
| 2 | Đăng ký email mới | Thông báo: *chờ Admin phê duyệt* |
| 3 | Thử đăng nhập ngay | Lỗi 403 — chưa được duyệt |

**API:** `POST /api/auth/register` (role: `Owner`)

---

### 4.4. Đăng nhập

**URL:** `/login`

| Bước | Thao tác | Kết quả mong đợi |
|------|----------|------------------|
| 1 | Nhập `customer1@sportbooking.com` / `customer123` | Về trang chủ |
| 2 | Đăng nhập `owner1@sportbooking.com` / `owner123` | Chuyển `/owner/dashboard` |
| 3 | Đăng nhập `admin@sportbooking.com` / `admin123` | Chuyển `/admin/dashboard` |
| 4 | Dùng nút **Đăng nhập nhanh** (3 vai trò) | Tương tự như trên |

**API:** `POST /api/auth/login` → lưu JWT vào `localStorage`

**Kiểm tra kỹ thuật:** DevTools → Application → Local Storage → có `accessToken`, `currentUser`.

---

### 4.5. Quy trình đặt sân (Khách hàng)

**URL:** `/book` — cần đăng nhập vai trò Khách hàng

| Bước | Thao tác | Kết quả mong đợi |
|------|----------|------------------|
| 1 | Chọn cơ sở, sân, ngày (hôm nay hoặc tương lai) | Danh sách khung giờ hiển thị |
| 2 | Chọn 1+ khung giờ trống | Khung giờ chuyển sang màu tím |
| 3 | Chọn phương thức thanh toán | MoMo / VNPay / Chuyển khoản |
| 4 | **Xác nhận đặt sân** | Tạo đơn, chuyển `/my-bookings` |

**API theo thứ tự:**
1. `GET /api/courts/{courtId}/availability?date=YYYY-MM-DD`
2. `POST /api/bookings` — body: `{ courtId, bookingDate, timeSlotIds[] }`
3. Thanh toán:
   - MoMo/VNPay: `POST /api/payments/create-url` → redirect URL
   - Chuyển khoản: `POST /api/payments` (provider: Cash)

---

### 4.6. Lịch đặt của tôi (Khách hàng)

**URL:** `/my-bookings`

| Bước | Thao tác | Kết quả mong đợi |
|------|----------|------------------|
| 1 | Xem danh sách đơn đã đặt | Hiển thị tên cơ sở, sân, ngày, giờ, giá |
| 2 | Click **Hủy lịch** | Trạng thái **Đã Hủy** |

**API:** `GET /api/bookings/my`, `PUT /api/bookings/{id}/cancel`

---

### 4.7. Hồ sơ cá nhân

**URL:** `/profile`

| Bước | Thao tác | Kết quả mong đợi |
|------|----------|------------------|
| 1 | Sửa Họ tên / Email → Lưu | Cập nhật localStorage (backend chưa có API profile) |

---

### 4.8. Dashboard Chủ sân

**URL:** `/owner/dashboard`

| Bước | Thao tác | Kết quả mong đợi |
|------|----------|------------------|
| 1 | Đăng nhập Owner → Dashboard | Thống kê số cơ sở, đơn, doanh thu |
| 2 | Xem biểu đồ doanh thu | Tính từ đơn Confirmed |

**API:** `GET /api/venues`, `GET /api/bookings/owner`

---

### 4.9. Quản lý cơ sở (Owner)

**URL:** `/owner/venues`

| Bước | Thao tác | Kết quả mong đợi |
|------|----------|------------------|
| 1 | **Đăng ký cơ sở mới** | Form thêm cơ sở |
| 2 | Lưu cơ sở mới | Trạng thái **Chờ duyệt** |
| 3 | Sửa / Xóa cơ sở | CRUD thành công |

**API:** `POST/PUT/DELETE /api/venues`

---

### 4.10. Quản lý sân đấu (Owner)

**URL:** `/owner/courts`

| Bước | Thao tác | Kết quả mong đợi |
|------|----------|------------------|
| 1 | Chọn cơ sở → Thêm sân | Sân mới xuất hiện |
| 2 | Sửa / Xóa sân | CRUD thành công |

**API:** `GET/POST /api/venues/{id}/courts`, `PUT/DELETE /api/courts/{id}`

---

### 4.11. Quản lý đơn đặt sân (Owner)

**URL:** `/owner/bookings`

| Bước | Thao tác | Kết quả mong đợi |
|------|----------|------------------|
| 1 | Xem đơn tại cơ sở | Danh sách từ API |
| 2 | **Duyệt** đơn Pending | → Confirmed |
| 3 | **Hủy** đơn | → Cancelled |

**API:** `GET /api/bookings/owner`, `PUT /api/bookings/{id}/status?status=2|3`

---

### 4.12. Dashboard Admin

**URL:** `/admin/dashboard`

| Bước | Thao tác | Kết quả mong đợi |
|------|----------|------------------|
| 1 | Đăng nhập Admin | Thống kê tổng cơ sở, đơn |
| 2 | Xem đơn toàn hệ thống | `GET /api/bookings` |

---

### 4.13. Duyệt chủ sân (Admin)

**URL:** `/admin/users`

| Bước | Thao tác | Kết quả mong đợi |
|------|----------|------------------|
| 1 | Đăng ký Owner mới | Xuất hiện trong danh sách chờ |
| 2 | Click Duyệt | Owner đăng nhập được |
| 3 | Click Từ chối | Owner bị từ chối |

**API:** `GET /api/admin/owners/pending`, `POST approve/reject`

---

### 4.14. Kiểm duyệt cơ sở (Admin)

**URL:** `/admin/venues`

| Bước | Thao tác | Kết quả mong đợi |
|------|----------|------------------|
| 1 | Tab **Chờ kiểm duyệt** | Cơ sở Owner tạo mới |
| 2 | **Duyệt** | → Active, hiện trang chủ |
| 3 | **Từ chối** | → Inactive |

**Mapping:** PENDING=Maintenance, APPROVED=Active, REJECTED=Inactive

---

## 5. Kịch bản E2E

### Kịch bản A — Đặt sân hoàn chỉnh

1. Đăng nhập Khách hàng
2. Chọn Khu Thể Thao Bách Khoa → Sân bóng đá 1
3. Chọn ngày mai, khung 16:00–17:00, thanh toán Chuyển khoản
4. Kiểm tra `/my-bookings`
5. Owner duyệt đơn → Admin xem dashboard

### Kịch bản B — Onboarding chủ sân

1. Đăng ký Chủ sân → Admin duyệt
2. Owner tạo cơ sở + sân → Admin duyệt cơ sở
3. Khách hàng tìm thấy cơ sở mới

---

## 6. Xử lý lỗi thường gặp

| Lỗi | Cách xử lý |
|-----|------------|
| Network Error | Chạy backend `dotnet run` |
| Không có khung giờ | Start Redis, restart backend |
| 401 Unauthorized | Đăng nhập lại |
| Owner không login | Admin duyệt chủ sân |
| Cơ sở không hiện | Admin duyệt cơ sở (Active) |

---

## 7. Cấu trúc tích hợp

```
src/services/api.js           → http://localhost:5108/api
src/services/auth.service.js  → /api/auth/*
src/services/venue.service.js → /api/venues/*, /api/courts/*
src/services/booking.service.js → /api/bookings/*, /api/payments/*
src/utils/mappers.js          → Chuyển đổi role, status, sport type
```

Docker backend (port 8080): đổi `.env` thành `VITE_API_BASE_URL=http://localhost:8080/api`
