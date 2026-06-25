// src/layouts/AdminLayout.jsx

import React from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  Shield,
  Users,
  CheckSquare,
  ArrowLeft,
  ShieldAlert,
  Menu,
  X,
  PieChart
} from "lucide-react";

export const AdminLayout = () => {
  const { user, isAdmin, switchRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Guard clause for unauthorized access
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-4">
        <div className="glass-card max-w-md w-full p-8 text-center rounded-3xl animate-fade-in">
          <div className="mx-auto w-16 h-16 bg-pink-500/10 text-pink-400 rounded-2xl flex items-center justify-center mb-6">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold mb-2 text-white">Yêu cầu quyền Quản Trị</h2>
          <p className="text-gray-400 text-sm mb-6">
            Khu vực này chỉ dành riêng cho Quản trị viên (Admin) hệ thống để kiểm duyệt sân thể thao và quản lý tài khoản.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => switchRole("ADMIN")}
              className="w-full bg-pink-600 hover:bg-pink-700 text-white font-medium py-2 px-4 rounded-xl transition-all"
            >
              Chuyển sang vai Quản Trị
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full bg-white/5 hover:bg-white/10 text-gray-300 font-medium py-2 px-4 rounded-xl transition-all border border-white/5"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    {
      label: "Báo cáo phân tích",
      path: "/admin/dashboard",
      icon: <PieChart className="w-4 h-4" />
    },
    {
      label: "Quản lý Người Dùng",
      path: "/admin/users",
      icon: <Users className="w-4 h-4" />
    },
    {
      label: "Kiểm Duyệt Cơ Sở",
      path: "/admin/venues",
      icon: <CheckSquare className="w-4 h-4" />
    }
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full py-6 px-4">
      <div className="flex items-center gap-2 px-2 mb-8">
        <div className="bg-pink-600 p-2 rounded-xl text-white">
          <Shield className="w-5 h-5" />
        </div>
        <span className="font-extrabold text-lg text-white tracking-tight">
          Admin Control
        </span>
      </div>

      <nav className="flex-1 space-y-1.5">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                active
                  ? "bg-pink-600 text-white shadow-lg shadow-pink-600/20"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/5 pt-4 mt-auto">
        <div className="bg-white/5 p-3 rounded-xl mb-4 text-xs">
          <p className="font-semibold text-white truncate">{user.fullName}</p>
          <p className="text-gray-400 text-[10px] truncate">{user.email}</p>
        </div>
        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Về Trang Khách Hàng
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#080b12] text-[#f3f4f6] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 shrink-0 bg-[#0c101a] border-r border-white/5">
        {sidebarContent}
      </aside>

      {/* Main Content Side */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header Bar */}
        <header className="md:hidden flex items-center justify-between px-6 py-4 bg-[#0c101a] border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">Admin Control</span>
          </div>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-gray-400 hover:text-white"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </header>

        {/* Mobile Drawer Navigation */}
        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
            <div className="absolute top-0 left-0 bottom-0 w-64 bg-[#0c101a] border-r border-white/5 shadow-2xl">
              {sidebarContent}
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Route Container */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-7xl w-full mx-auto animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
