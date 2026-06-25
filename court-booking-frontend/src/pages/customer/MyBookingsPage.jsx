// src/pages/customer/MyBookingsPage.jsx

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bookingService } from "../../services/booking.service";
import { useAuth } from "../../hooks/useAuth";
import { Calendar, Clock, Landmark, Ban, CheckCircle, HelpCircle } from "lucide-react";

export const MyBookingsPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Query: Fetch bookings of current user
  const { data: userBookings, isLoading } = useQuery({
    queryKey: ["userBookings", user?.id],
    queryFn: () => bookingService.getUserBookings(),
    enabled: !!user?.id
  });

  // Mutation: Cancel Booking
  const cancelBookingMutation = useMutation({
    mutationFn: ({ id }) => bookingService.updateBookingStatus(id, "CANCELLED"),
    onSuccess: () => {
      // Invalidate queries to reload bookings
      queryClient.invalidateQueries(["userBookings", user?.id]);
    },
    onError: (err) => {
      alert(err.message || "Không thể hủy lịch đặt.");
    }
  });

  const handleCancelClick = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn hủy lịch đặt sân này không?")) {
      cancelBookingMutation.mutate({ id });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 text-[10px] px-2.5 py-1 rounded-full border border-emerald-500/20 font-semibold uppercase">
            <CheckCircle className="w-3 h-3" /> Đã Xác Nhận
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 text-[10px] px-2.5 py-1 rounded-full border border-amber-500/20 font-semibold uppercase">
            <HelpCircle className="w-3 h-3 animate-pulse" /> Đang Chờ Duyệt
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1 bg-red-500/10 text-red-400 text-[10px] px-2.5 py-1 rounded-full border border-red-500/20 font-semibold uppercase">
            <Ban className="w-3 h-3" /> Đã Hủy
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
        <p className="text-gray-400 text-xs mt-3">Đang tải lịch đặt sân...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl w-full mx-auto space-y-8 animate-fade-in">
      <div className="border-b border-white/5 pb-4">
        <h1 className="text-3xl font-extrabold text-white">Lịch Đặt Của Tôi</h1>
        <p className="text-gray-400 text-sm mt-1">
          Danh sách sân bạn đã đặt và các hóa đơn dịch vụ
        </p>
      </div>

      {userBookings?.length === 0 ? (
        <div className="glass-card text-center p-16 rounded-2xl border-white/5">
          <p className="text-gray-400 text-sm font-medium">Bạn chưa đặt lịch sân thể thao nào.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {userBookings?.map((booking) => (
            <div
              key={booking.id}
              className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
            >
              {/* Left Column: Venue and Court */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-gray-400 bg-white/5 px-2.5 py-0.5 rounded border border-white/10">
                    Mã đơn: #{booking.id}
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

                {/* Details grid */}
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    {booking.bookingDate}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    Giờ: {booking.slots.join(", ")}
                  </span>
                </div>
              </div>

              {/* Right Column: Pricing & Cancel Option */}
              <div className="flex flex-col items-start md:items-end justify-between self-stretch md:self-auto min-h-[90px]">
                <div className="text-left md:text-right">
                  <p className="text-xs text-gray-400">Tổng tiền thanh toán</p>
                  <p className="text-lg font-extrabold text-indigo-400 mt-0.5">
                    {booking.totalPrice.toLocaleString()}đ
                  </p>
                  <span className="text-[10px] text-gray-500 font-medium">
                    Hình thức: {booking.paymentStatus === "PAID" ? "Đã thanh toán" : "Chưa thanh toán"} (
                    {booking.paymentStatus === "PAID" ? "MOMO/VNPAY" : "Chuyển khoản"})
                  </span>
                </div>

                {/* Cancellation trigger */}
                {booking.status !== "CANCELLED" && (
                  <button
                    onClick={() => handleCancelClick(booking.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/5 border border-red-500/10 px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 mt-3 md:mt-0"
                  >
                    <Landmark className="w-3.5 h-3.5" />
                    Hủy lịch
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
