// src/pages/customer/PaymentCallbackPage.jsx

import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";

export const PaymentCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const status = searchParams.get("status");
  const provider = searchParams.get("provider");
  const bookingId = searchParams.get("bookingId");
  const isSuccess = status === "success";

  return (
    <div className="max-w-lg w-full mx-auto my-16 animate-fade-in">
      <div className="glass-card p-10 rounded-3xl border border-white/5 text-center space-y-6">
        {isSuccess ? (
          <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" />
        ) : (
          <XCircle className="w-16 h-16 text-red-400 mx-auto" />
        )}

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-white">
            {isSuccess ? "Thanh toán thành công!" : "Thanh toán thất bại"}
          </h1>
          <p className="text-gray-400 text-sm">
            {isSuccess
              ? "Đơn đặt sân của bạn đã được xác nhận. Chúc bạn có buổi tập luyện vui vẻ!"
              : "Giao dịch không thành công hoặc đã bị hủy. Vui lòng thử lại."}
          </p>
          {bookingId && (
            <p className="text-xs text-gray-500">
              Mã đơn: <span className="text-indigo-400 font-semibold">#{bookingId}</span>
              {provider && (
                <span className="ml-2">({provider.toUpperCase()})</span>
              )}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate("/my-bookings")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
          >
            Xem lịch đặt
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate("/")}
            className="bg-white/5 hover:bg-white/10 text-gray-300 font-bold py-3 px-6 rounded-xl text-xs border border-white/10 transition-all"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
};
