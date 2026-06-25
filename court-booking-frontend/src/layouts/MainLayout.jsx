// src/layouts/MainLayout.jsx

import React from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Activity, User, BookOpen, LogOut, LayoutDashboard, Shield } from "lucide-react";

export const MainLayout = () => {
  const { user, switchRole, logout, isUser, isOwner, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0b0f19] text-[#f3f4f6]">
      {/* Sticky Glassmorphic Navbar */}
      <header className="sticky top-0 z-50 glass border-b border-white/5 py-4 px-6 md:px-12 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 hover:opacity-95 transition-opacity">
          <div className="bg-gradient-to-tr from-indigo-500 to-pink-500 p-2 rounded-xl text-white glow-primary">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            SmashPlay
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link
            to="/"
            className={`hover:text-indigo-400 transition-colors ${
              location.pathname === "/" ? "text-indigo-400" : "text-gray-300"
            }`}
          >
            Trang Chủ
          </Link>
          <Link
            to="/search"
            className={`hover:text-indigo-400 transition-colors ${
              location.pathname === "/search" ? "text-indigo-400" : "text-gray-300"
            }`}
          >
            Tìm Sân
          </Link>
          {isUser && (
            <Link
              to="/my-bookings"
              className={`hover:text-indigo-400 transition-colors ${
                location.pathname === "/my-bookings" ? "text-indigo-400" : "text-gray-300"
              }`}
            >
              Lịch Đặt Của Tôi
            </Link>
          )}
        </nav>

        {/* User Session Info / Action Buttons */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              {/* Dashboard Link for Owner & Admin */}
              {isOwner && (
                <Link
                  to="/owner/dashboard"
                  className="hidden sm:flex items-center gap-1 bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-lg transition-colors font-medium border border-indigo-400/20"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Kênh Chủ Sân
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/admin/dashboard"
                  className="hidden sm:flex items-center gap-1 bg-pink-600/80 hover:bg-pink-600 text-white text-xs px-3 py-1.5 rounded-lg transition-colors font-medium border border-pink-400/20"
                >
                  <Shield className="w-3.5 h-3.5" />
                  Kênh Quản Trị
                </Link>
              )}

              {/* User profile avatar dropdown look */}
              <div className="flex items-center gap-2 border-l border-white/10 pl-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold shadow-inner">
                  {user.fullName.charAt(0)}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-semibold text-white leading-tight">
                    {user.fullName}
                  </span>
                  <span className="text-[10px] text-gray-400">{user.role}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-red-400 transition-all ml-1"
                  title="Đăng xuất"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-medium text-gray-300 hover:text-white px-3 py-1.5 transition-colors"
              >
                Đăng Nhập
              </Link>
              <Link
                to="/register"
                className="text-sm font-medium bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-4 py-2 rounded-xl transition-all shadow-md shadow-indigo-500/10"
              >
                Đăng Ký
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 animate-fade-in">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-gray-950/40 py-8 px-6 text-center text-gray-400 text-xs mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">SmashPlay</span>
            <span>- Nền tảng đặt sân thể thao chuyên nghiệp</span>
          </div>
          <div>© {new Date().getFullYear()} SmashPlay. Mọi quyền được bảo lưu.</div>
        </div>
      </footer>

      {/* Global Debug Helper: Role Switcher */}
      <div className="fixed bottom-4 left-4 z-50 glass-card p-3 rounded-2xl max-w-xs shadow-2xl">
        <p className="text-[10px] uppercase tracking-wider text-indigo-400 font-bold mb-1.5">
          🛠️ Debug Switcher (Giả Lập)
        </p>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => switchRole("GUEST")}
            className={`text-[10px] px-2 py-1 rounded-md font-medium transition-all ${
              !user ? "bg-white/20 text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"
            }`}
          >
            Khách
          </button>
          <button
            onClick={() => switchRole("USER")}
            className={`text-[10px] px-2 py-1 rounded-md font-medium transition-all ${
              isUser ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/35" : "bg-white/5 text-gray-400 hover:bg-white/10"
            }`}
          >
            Khách Hàng (User)
          </button>
          <button
            onClick={() => switchRole("OWNER")}
            className={`text-[10px] px-2 py-1 rounded-md font-medium transition-all ${
              isOwner ? "bg-purple-500/20 text-purple-400 border border-purple-500/35" : "bg-white/5 text-gray-400 hover:bg-white/10"
            }`}
          >
            Chủ Sân (Owner)
          </button>
          <button
            onClick={() => switchRole("ADMIN")}
            className={`text-[10px] px-2 py-1 rounded-md font-medium transition-all ${
              isAdmin ? "bg-pink-500/20 text-pink-400 border border-pink-500/35" : "bg-white/5 text-gray-400 hover:bg-white/10"
            }`}
          >
            Quản Trị Viên (Admin)
          </button>
        </div>
        {user && (
          <div className="mt-1 text-[9px] text-gray-400 italic">
            Đang đóng vai: <span className="text-white font-bold">{user.fullName}</span>
          </div>
        )}
      </div>
    </div>
  );
};
