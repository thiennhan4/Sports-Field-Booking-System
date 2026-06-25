// src/pages/public/LoginPage.jsx

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Mail, Lock, LogIn, AlertCircle } from "lucide-react";

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const user = await login(email, password);
      // Redirect based on role
      if (user.role === "ADMIN") {
        navigate("/admin/dashboard");
      } else if (user.role === "OWNER") {
        navigate("/owner/dashboard");
      } else {
        navigate("/");
      }
      // Force reload to update navigation header and user state
      window.location.reload();
    } catch (err) {
      setError(err.message || "Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (quickEmail, quickPassword) => {
    setError(null);
    setIsLoading(true);
    try {
      const user = await login(quickEmail, quickPassword);
      if (user.role === "ADMIN") {
        navigate("/admin/dashboard");
      } else if (user.role === "OWNER") {
        navigate("/owner/dashboard");
      } else {
        navigate("/");
      }
      window.location.reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto my-12 animate-fade-in">
      <div className="glass-card p-8 rounded-3xl border border-white/5 space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-extrabold text-white">Đăng Nhập SmashPlay</h1>
          <p className="text-xs text-gray-400">
            Chào mừng quay trở lại! Điền thông tin bên dưới để tiếp tục
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-start gap-2 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white rounded-xl py-3 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-600/25"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Đăng Nhập
              </>
            )}
          </button>
        </form>

        <div className="relative border-b border-white/5 my-6">
          <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0c101a] px-3 text-[10px] uppercase font-bold text-gray-500">
            Hoặc đăng nhập nhanh
          </span>
        </div>

        {/* Quick login helper buttons */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleQuickLogin("customer1@sportbooking.com", "customer123")}
            className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-[10px] py-2 px-1.5 rounded-lg border border-indigo-500/15 font-semibold transition-all"
          >
            Khách hàng
          </button>
          <button
            onClick={() => handleQuickLogin("owner1@sportbooking.com", "owner123")}
            className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-[10px] py-2 px-1.5 rounded-lg border border-purple-500/15 font-semibold transition-all"
          >
            Chủ Sân
          </button>
          <button
            onClick={() => handleQuickLogin("admin@sportbooking.com", "admin123")}
            className="bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 text-[10px] py-2 px-1.5 rounded-lg border border-pink-500/15 font-semibold transition-all"
          >
            Quản trị
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 pt-2">
          Chưa có tài khoản?{" "}
          <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-bold">
            Đăng Ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
};
