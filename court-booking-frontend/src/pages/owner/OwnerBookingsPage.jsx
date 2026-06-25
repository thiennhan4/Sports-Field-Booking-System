// src/pages/owner/OwnerBookingsPage.jsx

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth";
import { bookingService } from "../../services/booking.service";
import { Calendar, Clock, Landmark, Ban, CheckCircle, HelpCircle } from "lucide-react";

export const OwnerBookingsPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Query: Get owner bookings
  const { data: bookingsList, isLoading } = useQuery({
    queryKey: ["ownerBookings", user?.id],
    queryFn: () => bookingService.getOwnerBookings(),
    enabled: !!user?.id
  });

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => bookingService.updateBookingStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(["ownerBookings", user?.id]);
    },
    onError: (err) => {
      alert(err.message || "Không thể thay đổi trạng thái đơn hàng.");
    }
  });

  const handleApprove = (id) => {
    updateStatusMutation.mutate({ id, status: "CONFIRMED" });
  };

  const handleCancel = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn hủy lịch đặt này?")) {
      updateStatusMutation.mutate({ id, status: "CANCELLED" });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 text-[10px] px-2.5 py-1 rounded-full border border-emerald-500/20 font-semibold uppercase">
            <CheckCircle className="w-3.5 h-3.5" /> Đã Xác Nhận
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 text-[10px] px-2.5 py-1 rounded-full border border-amber-500/20 font-semibold uppercase">
            <HelpCircle className="w-3.5 h-3.5 animate-pulse" /> Đang Chờ Duyệt
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1 bg-red-500/10 text-red-400 text-[10px] px-2.5 py-1 rounded-full border border-red-500/20 font-semibold uppercase">
            <Ban className="w-3.5 h-3.5" /> Đã Hủy
          </span>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 text-xs mt-3">Đang tải danh sách đặt sân...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="border-b border-white/5 pb-4">
        <h1 className="text-3xl font-extrabold text-white">Quản Lý Lịch Đặt Sân</h1>
        <p className="text-gray-400 text-sm mt-1">
          Xem thông tin và duyệt các đơn đăng ký thuê sân đấu từ khách hàng
        </p>
      </div>

      {bookingsList?.length === 0 ? (
        <div className="glass-card text-center p-16 rounded-2xl border-white/5">
          <p className="text-gray-400 text-xs font-semibold">Chưa có lịch đặt sân nào từ khách hàng.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookingsList?.map((booking) => (
            <div
              key={booking.id}
              className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
            >
              {/* Info Column */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-gray-400 bg-white/5 px-2.5 py-0.5 rounded border border-white/10">
                    Mã: #{booking.id}
                  </span>
                  {getStatusBadge(booking.status)}
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-white leading-tight">
                    {booking.venueName}
                  </h3>
                  <p className="text-gray-400 text-xs mt-0.5">
                    Sân đấu: <span className="text-gray-200 font-semibold">{booking.courtName}</span>
                  </p>
                </div>

                <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-purple-400" />
                    {booking.bookingDate}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-purple-400" />
                    Giờ đặt: {booking.slots.join(", ")}
                  </span>
                </div>
              </div>

              {/* Pricing & Approve Actions */}
              <div className="flex flex-col items-start md:items-end justify-between self-stretch md:self-auto min-h-[90px]">
                <div className="text-left md:text-right">
                  <p className="text-xs text-gray-400">Giá trị thanh toán</p>
                  <p className="text-lg font-extrabold text-purple-400 mt-0.5">
                    {booking.totalPrice.toLocaleString()}đ
                  </p>
                  <span className="text-[10px] text-gray-500 font-medium block mt-0.5">
                    Phương thức: {booking.paymentStatus === "PAID" ? "Tự động (MoMo/VNPay)" : "Chuyển khoản / Đang chờ duyệt"}
                  </span>
                </div>

                {/* Operations Actions */}
                <div className="flex items-center gap-2 mt-4 md:mt-0">
                  {booking.status === "PENDING" && (
                    <button
                      onClick={() => handleApprove(booking.id)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition-all shadow-md shadow-emerald-600/25 flex items-center gap-1"
                    >
                      Duyệt thanh toán
                    </button>
                  )}
                  
                  {booking.status !== "CANCELLED" && (
                    <button
                      onClick={() => handleCancel(booking.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/5 border border-red-500/10 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                    >
                      Hủy lịch đặt
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
