# Sports Field Booking System 🚀

**System quản lý đặt sân thể thao trực tuyến** - Nền tảng toàn diện giúp người dùng đặt sân thể thao nhanh chóng và quản lý lịch đặt hiệu quả. Hệ thống tích hợp thanh toán MoMo, quản lý đa sân, đánh giá và quản lý đặt lịch từ Admin.

## 📋 Giới thiệu

Dự án được xây dựng với kiến trúc **CQRS (Command Query Responsibility Segregation)** kết hợp với **Clean Architecture**, sử dụng **ASP.NET Core** và **Entity Framework Core**.

### 🎯 Tính năng chính

#### 👥 Người dùng (User)

- 🔐 **Quản lý tài khoản**: Đăng ký, đăng nhập, đổi mật khẩu, quản lý profile.
- 📅 **Đặt sân**: Tìm kiếm sân, xem lịch trống, đặt sân theo khung giờ.
- 💳 **Thanh toán**: Tích hợp **MoMo Payment Gateway** cho thanh toán trực tuyến.
- 🎫 **Quản lý đơn**: Xem lịch sử đặt sân, hủy sân (trước 24h), nhận thông báo.
- ⭐ **Đánh giá**: Bình chọn và đánh giá sân thể thao.

#### 🏢 Quản trị viên (Admin)

- 📊 **Dashboard**: Thống kê doanh thu, lượt đặt, sân phổ biến.
- 🎛️ **Quản lý sân**: Thêm, sửa, xóa, cập nhật trạng thái sân thể thao.
- ⏰ **Quản lý lịch**: Xem tất cả lịch đặt, duyệt/hủy yêu cầu, quản lý khung giờ.
- 💵 **Quản lý thanh toán**: Theo dõi giao dịch, xử lý hoàn tiền.
- 👥 **Quản lý người dùng**: Xem và quản lý tài khoản người dùng.

### 🛠️ Công nghệ sử dụng

- **Backend Framework**: .NET 8 (ASP.NET Core)
- **Database**: SQL Server (EF Core)
- **CQRS & MediatR**: Xử lý nghiệp vụ tách biệt
- **Validators**: FluentValidation
- **Authentication**: JWT (JSON Web Tokens)
- **Payment Gateway**: MoMo
- **Background Jobs**: Hangfire (Cron jobs, xử lý tác vụ nền)
- **Distributed Cache**: Redis (Quản lý khóa, phiên, cache)

### 🏗️ Kiến trúc hệ thống

```
📦 SportBooking
├── 📁 API/                    # Layer API / Presentation
├── 📁 Application/            # Business Logic (CQRS, Services)
│   └── Features/             # Commands, Queries, Handlers
├── 📁 Domain/                 # Core Entities, Enums, Interfaces
├── 📁 Infrastructure/         # Persistence, External Services (Mail, MoMo)
└── 📁 Shared/                 # Utils, Configs
```

## 🚀 Hướng dẫn cài đặt và chạy

### Bước 1: Cấu hình Backend

1. **Clone repository** (Nếu chưa có):
   ```bash
   git clone <repository-url>
   cd SportBooking
   ```

2. **Khôi phục NuGet Packages**:
   ```bash
   dotnet restore
   ```

3. **Cập nhật Connection String**:
   - Mở file `backend/SportBooking.API/appsettings.Development.json`
   - Cập nhật `DefaultConnection` cho SQL Server

4. **Cấu hình MoMo (Nếu cần)**:
   - Cập nhật `MomoSettings` trong `appsettings.Development.json` (PartnerCode, AccessKey, SecretKey)

5. **Thiết lập Redis (Nếu sử dụng local cache)**:
   - Đảm bảo Redis Server đang chạy (`localhost:6379`)
   - Hoặc cấu hình Redis URI trong `appsettings.Development.json`

6. **Cập nhật Database**:
   ```bash
   # Áp dụng migrations
   dotnet ef migrations add InitialCreate --project backend/SportBooking.API --startup-project backend/SportBooking.API
   dotnet ef database update --project backend/SportBooking.API --startup-project backend/SportBooking.API
   ```

### Bước 2: Chạy Server

```bash
# Chạy API
cd backend/SportBooking.API
dotnet run

# Hoặc sử dụng VS Code
# F5
```

Server sẽ chạy tại `http://localhost:5000` (hoặc port cấu hình).

## 🔑 API Endpoints

###  authentication
- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `PUT /api/auth/change-password` - Đổi mật khẩu

###  courts
- `GET /api/courts` - Lấy danh sách sân
- `GET /api/courts/{id}` - Lấy chi tiết sân
- `POST /api/courts` - Admin: Tạo sân mới
- `PUT /api/courts/{id}` - Admin: Cập nhật sân
- `DELETE /api/courts/{id}` - Admin: Xóa sân

### bookings
- `GET /api/bookings` - Lấy danh sách lịch đặt (Filter: user/admin)
- `GET /api/bookings/{id}` - Lấy chi tiết đặt sân
- `POST /api/bookings` - Tạo đặt sân
- `PUT /api/bookings/{id}/cancel` - Hủy đặt sân
- `GET /api/courts/{courtId}/slots` - Lấy khung giờ trống

### payments
- `POST /api/payments/create` - Tạo yêu cầu thanh toán MoMo
- `POST /api/payments/callback` - Xử lý callback MoMo
- `GET /api/payments/history` - Xem lịch sử thanh toán

### ratings
- `POST /api/ratings` - Gửi đánh giá
- `GET /api/ratings/court/{courtId}` - Lấy đánh giá sân

### admin
- `GET /api/admin/dashboard` - Dashboard tổng quan
- `PUT /api/admin/bookings/{id}/approve` - Duyệt đặt sân
- `PUT /api/admin/bookings/{id}/reject` - Từ chối đặt sân
- `GET /api/admin/payments` - Lịch sử giao dịch

## 👥Vai trò

- **Public**: Xem danh sách sân
- **User**: Đăng ký, đặt sân, thanh toán, đánh giá
- **Admin**: Quản lý toàn hệ thống

## 📄 License

Mã nguồn được phát triển cho mục đích học tập và dự án môn học.