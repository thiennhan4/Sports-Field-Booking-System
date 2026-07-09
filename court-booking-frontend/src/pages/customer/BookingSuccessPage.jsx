// src/pages/customer/BookingSuccessPage.jsx

import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle2, Calendar, Clock, MapPin, CreditCard, ArrowRight, Home } from "lucide-react";

export const BookingSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingData = location.state?.bookingData;

  if (!bookingData) {
    return (
      <div className="max-w-lg w-full mx-auto my-16 animate-fade-in">
        <div className="glass-card p-10 rounded-3xl border border-white/5 text-center space-y-6">
          <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" />
          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-white">Đặt sân thành công!</h1>
            <p className="text-gray-400 text-sm">
              Đơn đặt sân của bạn đã được xác nhận.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate("/my-bookings")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
            >
              Xem lịch đặt
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate("/")}
              className="bg-white/5 hover:bg-white/10 text-gray-300 font-bold py-3 px-6 rounded-xl text-xs border border-white/10 transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl w-full mx-auto my-16 animate-fade-in">
      <div className="glass-card p-10 rounded-3xl border border-white/5 space-y-8">
        {/* Success Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-white">Đặt sân thành công!</h1>
            <p className="text-gray-400 text-sm">
              Đơn đặt sân của bạn đã được xác nhận. Chúc bạn có buổi tập luyện vui vẻ!
            </p>
          </div>
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 text-indigo-400 text-xs px-4 py-2 rounded-full border border-indigo-500/20 font-semibold">
            Mã đơn: #{bookingData.id}
          </div>
        </div>

        {/* Booking Details */}
        <div className="bg-[#111827]/30 border border-white/5 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-white/5 pb-3">
            Chi tiết đặt sân
          </h3>
          
          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-gray-400">Cơ sở thể thao</p>
                <p className="font-semibold text-white">{bookingData.venueName}</p>
                <p className="text-gray-300">{bookingData.courtName}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-gray-400">Ngày đặt</p>
                <p className="font-semibold text-white">{bookingData.bookingDate}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-gray-400">Khung giờ</p>
                <p className="font-semibold text-white">{bookingData.slots.join(", ")}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CreditCard className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-gray-400">Phương thức thanh toán</p>
                <p className="font-semibold text-white">
                  {bookingData.paymentMethod === "MOMO" ? "Ví MoMo" : 
                   bookingData.paymentMethod === "VNPAY" ? "Cổng VNPay" : 
                   bookingData.paymentMethod === "BANK" ? "Chuyển khoản" : bookingData.paymentMethod}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-4 flex justify-between items-center">
            <span className="text-xs text-gray-400">Tổng thanh toán</span>
            <span className="text-2xl font-extrabold text-indigo-400">
              {bookingData.totalPrice.toLocaleString()}đ
            </span>
          </div>
        </div>

        {/* Important Notes */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 space-y-2">
          <p className="text-xs font-semibold text-amber-400">Lưu ý quan trọng:</p>
          <ul className="text-[10px] text-gray-300 space-y-1 list-disc pl-4">
            <li>Vui lòng đến trước 10 phút để nhận sân đấu</li>
            <li>Huỷ lịch đặt sân miễn phí trước 24 giờ</li>
            <li>Mang theo mã đơn #{bookingData.id} khi đến sân</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate("/my-bookings")}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
          >
            Xem lịch đặt
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 font-bold py-3 px-6 rounded-xl text-xs border border-white/10 transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
};
