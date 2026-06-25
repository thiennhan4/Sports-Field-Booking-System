// src/mocks/venues.js

export const venues = [
  {
    id: 1,
    ownerId: 2,
    name: "Sân Cầu Lông ABC Quận 7",
    address: "128 Nguyễn Thị Thập, Tân Hưng, Quận 7",
    district: "Quận 7",
    city: "Hồ Chí Minh",
    status: "APPROVED",
    description: "Sân cầu lông tiêu chuẩn thi đấu quốc tế, thảm PVC cao cấp chống trơn trượt. Không gian rộng rãi, thoáng mát, trần cao đạt chuẩn, hệ thống đèn chiếu sáng chuyên dụng chống lóa mắt. Có căn tin phục vụ nước uống, đồ ăn nhẹ, bãi đậu xe ô tô và xe máy rộng rãi, an toàn.",
    rating: 4.8,
    reviewCount: 24,
    imageUrl: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: 2,
    ownerId: 2,
    name: "Cung Văn Hóa Thể Thao Bình Thạnh",
    address: "35 Nguyễn Hữu Cảnh, Phường 22, Bình Thạnh",
    district: "Bình Thạnh",
    city: "Hồ Chí Minh",
    status: "APPROVED",
    description: "Tổ hợp sân thể thao đa năng gồm sân cầu lông, bóng rổ và tennis ngoài trời chất lượng cao. Địa điểm lý tưởng để luyện tập thể thao hàng ngày cùng gia đình và bạn bè. Đầy đủ trang thiết bị tập luyện cho thuê, huấn luyện viên nhiệt tình hướng dẫn.",
    rating: 4.5,
    reviewCount: 15,
    imageUrl: "https://images.unsplash.com/photo-1545809074-59472b3f5ecc?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: 3,
    ownerId: 2,
    name: "Vstar Badminton & Tennis Center",
    address: "Đường số 9, KDC Him Lam, Quận 7",
    district: "Quận 7",
    city: "Hồ Chí Minh",
    status: "PENDING", // Mocked as pending to showcase admin approval list
    description: "Trung tâm cầu lông & tennis Vstar mới thành lập. Hệ thống sân hiện đại bậc nhất thành phố, dịch vụ hoàn hảo đi kèm phòng tắm nước nóng, phòng thay đồ VIP.",
    rating: 0.0,
    reviewCount: 0,
    imageUrl: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: 4,
    ownerId: 2,
    name: "Sân Cầu Lông Sunrise City",
    address: "23 Nguyễn Hữu Thọ, Tân Hưng, Quận 7",
    district: "Quận 7",
    city: "Hồ Chí Minh",
    status: "REJECTED", // Mocked as rejected for demo
    description: "Khu tập thể thao nội bộ chung cư Sunrise. Mặt sân đã cũ, chất lượng chiếu sáng trung bình.",
    rating: 3.2,
    reviewCount: 3,
    imageUrl: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?q=80&w=600&auto=format&fit=crop"
  }
];
