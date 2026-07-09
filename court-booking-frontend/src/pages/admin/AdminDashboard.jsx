// src/pages/admin/AdminDashboard.jsx

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { venueService } from "../../services/venue.service";
import { bookingService } from "../../services/booking.service";
import { adminService } from "../../services/admin.service";
import { Users, MapPin, Calendar, DollarSign, ArrowRight, ShieldCheck, Activity } from "lucide-react";

export const AdminDashboard = () => {
  const { data: stats } = useQuery({
    queryKey: ["adminStats"],
    queryFn: adminService.getStats
  });

  const { data: allVenues } = useQuery({
    queryKey: ["adminAllVenues"],
    queryFn: venueService.getAll
  });

  const { data: allBookings } = useQuery({
    queryKey: ["adminAllBookings"],
    queryFn: bookingService.getAllBookings
  });

  const totalUsers = stats?.totalUsers ?? 0;
  const totalVenuesCount = stats?.totalVenues ?? 0;
  const totalBookingsCount = stats?.totalBookings ?? 0;
  const platformRevenue = stats?.totalRevenue ?? 0;
  const pendingApprovalCount = stats?.pendingVenues ?? 0;

  return (
    <div className="space-y-10 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold text-white">Báo Cáo Hệ Thống</h1>
        <p className="text-gray-400 text-sm mt-1">
          Báo cáo thống kê toàn diện SmashPlay Platform
        </p>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

        <div className="glass-card p-6 rounded-3xl border border-white/5 flex items-center gap-4">
          <div className="bg-pink-500/10 text-pink-400 p-3.5 rounded-2xl">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider font-medium">Lượt Đặt Sân</p>
            <p className="text-2xl font-extrabold text-white mt-1">{totalBookingsCount}</p>
            <span className="text-[10px] text-gray-400 font-medium">
              {stats?.confirmedBookings ?? 0} đơn đã xác nhận
            </span>
          </div>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-white/5 flex items-center gap-4 glow-accent">
          <div className="bg-emerald-500/10 text-emerald-400 p-3.5 rounded-2xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Doanh Thu</p>
            <p className="text-2xl font-extrabold text-white mt-1">
              {platformRevenue.toLocaleString()}đ
            </p>
            <span className="text-[10px] text-emerald-400 font-medium">Tổng doanh thu nền tảng</span>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-400" />
              Đơn đặt gần đây
            </h2>
            <span className="text-[10px] text-gray-400">{allBookings?.length ?? 0} đơn</span>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {allBookings?.slice(0, 5).map((booking) => (
              <div key={booking.id} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                <div>
                  <p className="text-xs font-bold text-white">{booking.venueName}</p>
                  <p className="text-[10px] text-gray-400">{booking.bookingDate} · {booking.status}</p>
                </div>
                <p className="text-xs font-bold text-indigo-400">{booking.totalPrice.toLocaleString()}đ</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-purple-400" />
              Cơ sở chờ duyệt
            </h2>
            <span className="text-[10px] text-amber-400 font-semibold">{pendingApprovalCount} chờ duyệt</span>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {allVenues?.filter((v) => v.status === "PENDING").slice(0, 5).map((venue) => (
              <div key={venue.id} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                <div>
                  <p className="text-xs font-bold text-white">{venue.name}</p>
                  <p className="text-[10px] text-gray-400">{venue.address}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-500" />
              </div>
            ))}
            {pendingApprovalCount === 0 && (
              <p className="text-gray-400 text-xs text-center py-4">Không có cơ sở chờ duyệt.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
