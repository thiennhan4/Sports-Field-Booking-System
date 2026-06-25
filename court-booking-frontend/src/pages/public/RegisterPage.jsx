// src/pages/public/RegisterPage.jsx

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Mail, Lock, User, UserPlus, AlertCircle } from "lucide-react";

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("USER"); // USER or OWNER
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await register(fullName, email, password, role);
      // Redirect based on registered role
      if (role === "OWNER") {
        navigate("/owner/dashboard");
      } else {
        navigate("/");
      }
      window.location.reload();
    } catch (err) {
      setError(err.message || "Đăng ký không thành công. Vui lòng kiểm tra lại thông tin.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto my-12 animate-fade-in">
      <div className="glass-card p-8 rounded-3xl border border-white/5 space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-extrabold text-white">Đăng Ký Tài Khoản</h1>
          <p className="text-xs text-gray-400">
            Tạo tài khoản SmashPlay mới để bắt đầu sử dụng dịch vụ
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-start gap-2 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
              Họ và Tên
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyen Van A"
                className="w-full bg-[#111827]/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-indigo-500/50"
              />
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            </div>
          </div>

          {/* Email */}
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

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
              Mật khẩu
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#111827]/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-indigo-500/50"
              />
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            </div>
          </div>

          {/* Role Choice */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
              Bạn Đăng Ký Với Vai Trò:
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label
                className={`flex flex-col items-center p-3 rounded-xl border text-center cursor-pointer transition-all ${
                  role === "USER"
                    ? "bg-indigo-500/10 border-indigo-500 text-indigo-400"
                    : "bg-[#111827]/30 border-white/10 text-gray-400 hover:bg-[#111827]/50"
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="USER"
                  checked={role === "USER"}
                  onChange={() => setRole("USER")}
                  className="sr-only"
                />
                <span className="text-xs font-bold">Khách Hàng</span>
                <span className="text-[9px] mt-0.5 text-gray-400">Tìm & đặt sân</span>
              </label>

              <label
                className={`flex flex-col items-center p-3 rounded-xl border text-center cursor-pointer transition-all ${
                  role === "OWNER"
                    ? "bg-purple-500/10 border-purple-500 text-purple-400"
                    : "bg-[#111827]/30 border-white/10 text-gray-400 hover:bg-[#111827]/50"
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="OWNER"
                  checked={role === "OWNER"}
                  onChange={() => setRole("OWNER")}
                  className="sr-only"
                />
                <span className="text-xs font-bold">Chủ Sân Đấu</span>
                <span className="text-[9px] mt-0.5 text-gray-400">Cho thuê & Quản lý</span>
              </label>
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
              <>
                <UserPlus className="w-4 h-4" />
                Đăng Ký
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 pt-2 font-medium">
          Đã có tài khoản?{" "}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-bold">
            Đăng Nhập
          </Link>
        </p>
      </div>
    </div>
  );
};
