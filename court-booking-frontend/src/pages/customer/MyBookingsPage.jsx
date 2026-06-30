// src/pages/customer/MyBookingsPage.jsx

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bookingService } from "../../services/booking.service";
import { reviewService } from "../../services/review.service";
import { useAuth } from "../../hooks/useAuth";
import { Calendar, Clock, Landmark, Ban, CheckCircle, HelpCircle, Star, MessageSquare, X } from "lucide-react";

export const MyBookingsPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewError, setReviewError] = useState(null);

  const { data: userBookings, isLoading } = useQuery({
    queryKey: ["userBookings", user?.id],
    queryFn: () => bookingService.getUserBookings(),
    enabled: !!user?.id
  });

  const cancelBookingMutation = useMutation({
    mutationFn: ({ id }) => bookingService.updateBookingStatus(id, "CANCELLED"),
    onSuccess: () => {
      queryClient.invalidateQueries(["userBookings", user?.id]);
    },
    onError: (err) => {
      alert(err.message || "Không thể hủy lịch đặt.");
    }
  });

  const reviewMutation = useMutation({
    mutationFn: () =>
      reviewService.create({
        venueId: reviewTarget.venueId,
        bookingId: reviewTarget.id,
        rating: reviewRating,
        comment: reviewComment
      }),
    onSuccess: () => {
      setReviewTarget(null);
      setReviewComment("");
      setReviewRating(5);
      setReviewError(null);
      queryClient.invalidateQueries(["userBookings", user?.id]);
    },
    onError: (err) => setReviewError(err.message)
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
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 bg-blue-500/10 text-blue-400 text-[10px] px-2.5 py-1 rounded-full border border-blue-500/20 font-semibold uppercase">
            <CheckCircle className="w-3 h-3" /> Hoàn Thành
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

      {reviewTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6 rounded-2xl border border-white/10 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-400" />
                Đánh giá sân
              </h3>
              <button onClick={() => setReviewTarget(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-400">{reviewTarget.venueName}</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setReviewRating(star)}>
                  <Star
                    className={`w-6 h-6 ${
                      star <= reviewRating
                        ? "fill-[#fbbf24] stroke-none text-[#fbbf24]"
                        : "stroke-[#fbbf24] fill-none text-[#fbbf24]"
                    }`}
                  />
                </button>
              ))}
            </div>
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm..."
              rows={3}
              className="w-full bg-[#111827]/50 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white outline-none resize-none"
            />
            {reviewError && <p className="text-[10px] text-red-400">{reviewError}</p>}
            <button
              onClick={() => reviewMutation.mutate()}
              disabled={reviewMutation.isPending}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs"
            >
              {reviewMutation.isPending ? "Đang gửi..." : "Gửi đánh giá"}
            </button>
          </div>
        </div>
      )}

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

              <div className="flex flex-col items-start md:items-end justify-between self-stretch md:self-auto min-h-[90px] gap-2">
                <div className="text-left md:text-right">
                  <p className="text-xs text-gray-400">Tổng tiền thanh toán</p>
                  <p className="text-lg font-extrabold text-indigo-400 mt-0.5">
                    {booking.totalPrice.toLocaleString()}đ
                  </p>
                  <span className="text-[10px] text-gray-500 font-medium">
                    Hình thức: {booking.paymentStatus === "PAID" ? "Đã thanh toán" : "Chưa thanh toán"}
                  </span>
                </div>

                <div className="flex gap-2">
                  {(booking.status === "CONFIRMED" || booking.status === "COMPLETED") && (
                    <button
                      onClick={() => setReviewTarget(booking)}
                      className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/5 border border-indigo-500/10 px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                    >
                      <Star className="w-3.5 h-3.5" />
                      Đánh giá
                    </button>
                  )}
                  {booking.status !== "CANCELLED" && booking.status !== "COMPLETED" && (
                    <button
                      onClick={() => handleCancelClick(booking.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/5 border border-red-500/10 px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                    >
                      <Landmark className="w-3.5 h-3.5" />
                      Hủy lịch
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
