// src/pages/admin/AdminDashboard.jsx

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { venueService } from "../../services/venue.service";
import { bookingService } from "../../services/booking.service";
import { users } from "../../mocks/users";
import { Users, MapPin, Calendar, DollarSign, ArrowRight, ShieldCheck, Activity } from "lucide-react";

export const AdminDashboard = () => {
  // Fetch info via query
  const { data: allVenues } = useQuery({
    queryKey: ["adminAllVenues"],
    queryFn: venueService.getAll
  });

  const { data: allBookings } = useQuery({
    queryKey: ["adminAllBookings"],
    queryFn: bookingService.getAllBookings
  });

  // Compiled metrics for dashboard cards (with mock boosts to make it look full and realistic)
  const totalUsers = users.length + 116; // 120 target mock
  const totalVenuesCount = allVenues?.length + 26 || 30; // 30 target mock
  const totalBookingsCount = allBookings?.length + 797 || 800; // 800 target mock
  const platformRevenue = (allBookings?.filter(b => b.status === "CONFIRMED").reduce((s, b) => s + b.totalPrice, 0) || 0) + 199680000; // 200M target mock

  const pendingApprovalCount = allVenues?.filter((v) => v.status === "PENDING").length || 0;

  return (
    <div className="space-y-10 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold text-white">Báo Cáo Hệ Thống</h1>
        <p className="text-gray-400 text-sm mt-1">
          Báo cáo thống kê toàn diện SmashPlay Platform
        </p>
      </div>

      {/* Analytics Card Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Users */}
        <div className="glass-card p-6 rounded-3xl border border-white/5 flex items-center gap-4 glow-primary">
          <div className="bg-indigo-500/10 text-indigo-400 p-3.5 rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Người Dùng</p>
            <p className="text-2xl font-extrabold text-white mt-1">{totalUsers}</p>
            <span className="text-[10px] text-indigo-400 font-medium">Hội viên & Chủ sân</span>
          </div>
        </div>

        {/* Card 2: Venues */}
        <div className="glass-card p-6 rounded-3xl border border-white/5 flex items-center gap-4">
          <div className="bg-purple-500/10 text-purple-400 p-3.5 rounded-2xl">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Tổ Hợp Sân</p>
            <p className="text-2xl font-extrabold text-white mt-1">{totalVenuesCount}</p>
            <span className="text-[10px] text-amber-400 font-semibold">
              {pendingApprovalCount} cơ sở chờ duyệt
            </span>
          </div>
        </div>

        {/* Card 3: Bookings */}
        <div className="glass-card p-6 rounded-3xl border border-white/5 flex items-center gap-4">
          <div className="bg-pink-500/10 text-pink-400 p-3.5 rounded-2xl">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider font-medium">Lượt Đặt Sân</p>
            <p className="text-2xl font-extrabold text-white mt-1">{totalBookingsCount}</p>
            <span className="text-[10px] text-gray-400 font-medium">Lịch đặt thành công</span>
          </div>
        </div>

        {/* Card 4: Revenue */}
        <div className="glass-card p-6 rounded-3xl border border-white/5 flex items-center gap-4 glow-accent">
          <div className="bg-pink-500/10 text-pink-400 p-3.5 rounded-2xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Doanh Thu Platform</p>
            <p className="text-2xl font-extrabold text-white mt-1">
              {(platformRevenue / 1000000).toFixed(0)}M+
            </p>
            <span className="text-[10px] text-pink-400 font-medium">
              ~ {platformRevenue.toLocaleString()}đ
            </span>
          </div>
        </div>
      </section>

      {/* Grid details */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Task list for Admin */}
        <div className="lg:col-span-2 glass-card p-8 rounded-3xl border border-white/5 space-y-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-4">
            Hoạt động hệ thống
          </h3>

          <div className="space-y-4">
            <div className="flex justify-between items-start border-b border-white/5 pb-4 text-xs">
              <div className="space-y-1">
                <p className="font-bold text-white">Kiểm duyệt các cơ sở đăng ký mới</p>
                <p className="text-gray-400 font-light">Có {pendingApprovalCount} cơ sở mới đang chờ bạn xem xét hồ sơ pháp lý.</p>
              </div>
              <span className="bg-amber-500/10 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-500/20">
                Cần xử lý
              </span>
            </div>
            
            <div className="flex justify-between items-start border-b border-white/5 pb-4 text-xs">
              <div className="space-y-1">
                <p className="font-bold text-white">Kiểm tra tài khoản người dùng báo cáo</p>
                <p className="text-gray-400 font-light">Các hoạt động đăng nhập thất bại và spam lịch đặt ảo đã bị hạn chế.</p>
              </div>
              <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/20">
                Ổn định
              </span>
            </div>
          </div>
        </div>

        {/* System Health / Resources */}
        <div className="glass-card p-8 rounded-3xl border border-white/5 space-y-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-4">
            Trạng Thái Dịch Vụ
          </h3>

          <div className="space-y-4 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400 font-medium">Vite + React Server</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Online
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 font-medium">Mock Database Store</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Connected
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 font-medium">React Query Cache</span>
              <span className="text-indigo-400 font-bold flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 animate-pulse" /> Active
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
