Dưới đây là danh sách tổng hợp toàn bộ các tính năng và module đã được xây dựng thành công trong project backend SportBook của bạn tính đến thời điểm hiện tại:

1. Kiến trúc & Cơ sở hạ tầng (Architecture & Infrastructure)
Clean Architecture: Chia dự án thành 4 layer chuẩn xác (Domain, Application, Infrastructure, API).
CQRS Pattern: Sử dụng MediatR để chia tách luồng Đọc/Ghi dữ liệu (Commands/Queries).
Entity Framework Core 9: Kết nối SQL Server, áp dụng Global Query Filters (cho Soft-Delete) và Optimistic Concurrency.
Redis (StackExchange.Redis): Ứng dụng để Caching, giữ chỗ tạm thời (Hold Slot) và Khóa phân tán (Distributed Locking).
Hangfire: Tích hợp để chạy các tác vụ nền (Background Jobs/Cron Jobs) tự động.
Bảo mật & Clean Code: Thiết lập xác thực dữ liệu qua FluentValidation, ánh xạ đối tượng qua AutoMapper, và ghi log hệ thống qua Serilog.
2. Module: Xác thực & Phân quyền (Auth & User)
Đăng ký tài khoản (dành cho người dùng thường) và đăng ký tài khoản Chủ sân (Owner - yêu cầu kiểm duyệt).
Đăng nhập sinh mã JWT (JSON Web Token) kèm cơ chế Refresh Token (giúp gia hạn đăng nhập bảo mật).
Phân quyền Role-based Authorization cho 3 cấp độ: Admin, Owner, và Customer.
3. Module: Quản lý Sân bãi (Venue & Court)
Các API CRUD quản lý cơ sở vật chất (Venue) và các sân nhỏ bên trong (Court) kèm theo thông tin chi tiết (địa chỉ, giá tiền).
Quản lý cấu hình Pricing Rules: Tự động tính giá sân theo giờ, theo ngày thường và ngày cuối tuần.
Quản lý Holiday Special Prices: Cho phép cấu hình giá đặc biệt áp dụng riêng cho các ngày Lễ/Tết.
Quản lý Slot Templates: Tạo các khung giờ mở cửa mẫu cho sân.
4. Module: Đặt sân & Xử lý đồng thời (Booking Engine)
Xử lý Race Condition (Chống đặt trùng sân) cực kỳ chặt chẽ qua 2 lớp bảo vệ:
Lớp 1 (Pessimistic): Dùng khóa Redis Distributed Lock để tuần tự hóa các yêu cầu vào cùng một khung giờ.
Lớp 2 (Optimistic): Dùng tính năng RowVersion của SQL Server để kiểm tra xung đột nếu khóa Redis bị bypass.
Cơ chế Giữ chỗ (Hold Slot): Khi người dùng chọn sân, khung giờ đó sẽ bị tạm khóa trong 15 phút bằng Redis TTL để chờ thanh toán, người khác không thể vào tranh.
Background Job UnpaidBookingCancelJob: Quét định kỳ mỗi 5 phút để hủy các đơn đặt chưa thanh toán/quá hạn và nhả lại sân cho khách khác.
5. Module: Khởi tạo Slot tự động (Slot Generation)
Background Job SlotGenerator: Tự động chạy ngầm mỗi đêm qua Hangfire. Nó sẽ tính toán các bảng giá (Ngày thường, Cuối tuần, Ngày lễ) và sinh sẵn trước các khung giờ (TimeSlot) cho 30 ngày tiếp theo.
6. Module: Tích hợp Thanh toán (Payment Integration)
Cung cấp API để khởi tạo URL thanh toán cho các cổng VNPay và Momo (kèm theo việc mã hóa bảo mật chữ ký HMAC).
Xây dựng API xử lý Webhook/Callback để nhận kết quả từ ví điện tử thanh toán.
Kiểm tra tính lũy đẳng (Idempotency): Chặn lỗi xử lý lại 2 lần từ Webhook bằng cách ghi nhớ lịch sử callback bằng Redis.
Tính năng Hoàn tiền (Refund): Xử lý logic hoàn tiền linh hoạt (Ví dụ: Hủy trước 24h hoàn 100%, trước 2h hoàn 50%, sát giờ hoàn 0%).
7. Module: Admin Dashboard
Cung cấp API lấy danh sách các Chủ sân (Owner) mới đăng ký đang ở trạng thái chờ.
API cấp quyền Phê duyệt (Approve) hoặc Từ chối (Reject) chủ sân (Yêu cầu tài khoản Admin).
8. Testing & Khác
Project Unit Test với xUnit và Moq đã được thiết lập để test toàn bộ các nghiệp vụ phức tạp trong Handler Đặt sân (chặn trùng, giữ chỗ) và đang pass 100%.
Module Notification: Đã tạo khung Interface và Inject sẵn sàng cho việc cắm plugin gửi Email/SMS sau này.