// src/components/QRCodePayment.jsx

import React from "react";
import { QrCode, Copy, CheckCircle2, Clock, CreditCard } from "lucide-react";

export const QRCodePayment = ({ amount, paymentMethod, onConfirm, onCancel, onDirectPayment }) => {
  const [copied, setCopied] = React.useState(false);
  const [countdown, setCountdown] = React.useState(300); // 5 minutes countdown

  // Mock QR code URLs based on payment method
  const getQRCodeUrl = () => {
    if (paymentMethod === "MOMO") {
      return "https://img.vietqr.io/image/970422-0123456789-compact2.png?amount=" + amount + "&addInfo=DATSAN";
    } else if (paymentMethod === "VNPAY") {
      return "https://img.vietqr.io/image/970415-0123456789-compact2.png?amount=" + amount + "&addInfo=DATSAN";
    }
    return "https://img.vietqr.io/image/970422-0123456789-compact2.png?amount=" + amount + "&addInfo=DATSAN";
  };

  // Countdown timer
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCopyContent = () => {
    const content = paymentMethod === "MOMO" 
      ? `970422 0123456789 SMASHPLAY ${amount}đ`
      : `970415 0123456789 SMASHPLAY ${amount}đ`;
    
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card p-8 rounded-3xl border border-white/5 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-white flex items-center justify-center gap-2">
          <QrCode className="w-5 h-5 text-indigo-400" />
          Quét mã QR để thanh toán
        </h2>
        <p className="text-gray-400 text-xs">
          Sử dụng ứng dụng ngân hàng hoặc ví điện tử để quét mã
        </p>
      </div>

      {/* Countdown Timer */}
      <div className="flex items-center justify-center gap-2 bg-[#111827]/50 border border-white/10 rounded-xl py-3 px-4">
        <Clock className="w-4 h-4 text-yellow-400" />
        <span className="text-xs font-semibold text-white">
          Mã QR hết hạn sau: <span className="text-yellow-400">{formatTime(countdown)}</span>
        </span>
      </div>

      {/* QR Code Image */}
      <div className="flex justify-center">
        <div className="bg-white p-4 rounded-2xl shadow-lg">
          <img 
            src={getQRCodeUrl()} 
            alt="QR Code Payment" 
            className="w-64 h-64 object-contain"
          />
        </div>
      </div>

      {/* Payment Info */}
      <div className="bg-[#111827]/30 border border-white/5 rounded-2xl p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-xs">Số tiền cần thanh toán</span>
          <span className="text-xl font-extrabold text-indigo-400">{amount.toLocaleString()}đ</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-xs">Phương thức</span>
          <span className="text-sm font-bold text-white">
            {paymentMethod === "MOMO" ? "Ví MoMo" : paymentMethod === "VNPAY" ? "Cổng VNPay" : "Chuyển Khoản"}
          </span>
        </div>
      </div>

      {/* Copy Content */}
      <div className="bg-[#111827]/30 border border-white/5 rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-gray-400 text-xs">Nội dung chuyển khoản</p>
            <p className="text-sm font-semibold text-white">SMASHPLAY {amount.toLocaleString()}đ</p>
          </div>
          <button
            onClick={handleCopyContent}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-4 rounded-xl transition-all"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Đã copy
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={onConfirm}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs transition-all flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          Đã thanh toán qua QR
        </button>
        
        {onDirectPayment && (
          <button
            onClick={onDirectPayment}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-xs transition-all flex items-center justify-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            Thanh toán trực tiếp qua app
          </button>
        )}
        
        <button
          onClick={onCancel}
          className="w-full bg-white/5 hover:bg-white/10 text-gray-300 font-bold py-3 rounded-xl text-xs border border-white/10 transition-all"
        >
          Hủy bỏ
        </button>
      </div>

      {/* Note */}
      <div className="text-center text-[10px] text-gray-500 leading-relaxed">
        <p>• Sau khi thanh toán thành công, hệ thống sẽ tự động xác nhận đơn đặt sân của bạn.</p>
        <p>• Nếu gặp vấn đề, vui lòng liên hệ hỗ trợ qua hotline 1900-xxxx.</p>
      </div>
    </div>
  );
};
