// src/pages/public/ForgotPasswordPage.jsx

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../../services/auth.service";
import { Mail, Lock, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: Enter email, 2: Enter OTP, 3: Reset password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      await authService.forgotPassword(email);
      setSuccess("OTP đã được gửi đến email của bạn. Mã sẽ hết hạn sau 10 phút.");
      setStep(2);
    } catch (err) {
      setError(err.message || "Gửi OTP thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const isValid = await authService.verifyOtp(email, otp);
      if (isValid) {
        setSuccess("OTP hợp lệ. Vui lòng nhập mật khẩu mới.");
        setStep(3);
      } else {
        setError("OTP không đúng hoặc đã hết hạn.");
      }
    } catch (err) {
      setError(err.message || "Xác thực OTP thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    setIsLoading(true);

    try {
      await authService.resetPassword(email, otp, newPassword);
      setSuccess("Đặt lại mật khẩu thành công! Bạn sẽ được chuyển đến trang đăng nhập.");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.message || "Đặt lại mật khẩu thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto my-12 animate-fade-in">
      <div className="glass-card p-8 rounded-3xl border border-white/5 space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-extrabold text-white">Quên Mật Khẩu</h1>
          <p className="text-xs text-gray-400">
            {step === 1 && "Nhập email của bạn để nhận mã OTP"}
            {step === 2 && "Nhập mã OTP đã được gửi đến email của bạn"}
            {step === 3 && "Nhập mật khẩu mới của bạn"}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-start gap-2 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl flex items-start gap-2 text-xs">
            <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                Địa chỉ Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full bg-[#111827]/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-indigo-500/50"
                />
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white rounded-xl py-3 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-600/25"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Gửi OTP"
              )}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                Mã OTP
              </label>
              <input
                type="text"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Nhập mã 6 số"
                maxLength={6}
                className="w-full bg-[#111827]/50 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white outline-none focus:border-indigo-500/50 text-center tracking-widest"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white rounded-xl py-3 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-600/25"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Xác thực OTP"
              )}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full bg-transparent hover:bg-white/5 text-gray-400 hover:text-white rounded-xl py-2 text-xs font-semibold transition-all"
            >
              Quay lại
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                Mật khẩu mới
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#111827]/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-indigo-500/50"
                />
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#111827]/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-indigo-500/50"
                />
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white rounded-xl py-3 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-600/25"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Đặt lại mật khẩu"
              )}
            </button>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full bg-transparent hover:bg-white/5 text-gray-400 hover:text-white rounded-xl py-2 text-xs font-semibold transition-all"
            >
              Quay lại
            </button>
          </form>
        )}

        <div className="text-center pt-4">
          <Link to="/login" className="text-xs text-gray-400 hover:text-indigo-400 font-semibold flex items-center justify-center gap-1">
            <ArrowLeft className="w-3 h-3" />
            Quay lại trang đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};
