// src/pages/owner/OwnerDashboard.jsx

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth";
import { venueService } from "../../services/venue.service";
import { bookingService } from "../../services/booking.service";
import { Calendar, DollarSign, MapPin, Activity, Star } from "lucide-react";

export const OwnerDashboard = () => {
  const { user } = useAuth();

  // Queries
  // 1. Fetch Owner's Venues
  const { data: ownerVenues } = useQuery({
    queryKey: ["ownerVenues", user?.id],
    queryFn: () => venueService.getByOwnerId(user?.id),
    enabled: !!user?.id
  });

  // 2. Fetch Owner's Bookings
  const { data: ownerBookings } = useQuery({
    queryKey: ["ownerBookings", user?.id],
    queryFn: () => bookingService.getOwnerBookings(),
    enabled: !!user?.id
  });

  // 3. Fetch Owner's Revenue
  const { data: revenueData } = useQuery({
    queryKey: ["ownerRevenue", user?.id],
    queryFn: () => bookingService.getRevenueByMonth(),
    enabled: !!user?.id
  });

  // Compute stats
  const venuesCount = ownerVenues?.length || 0;
  const bookingsCount = ownerBookings?.length || 0;
  const totalRevenue = ownerBookings
    ?.filter((b) => b.status === "CONFIRMED")
    .reduce((sum, b) => sum + b.totalPrice, 0) || 0;

  const pendingBookingsCount = ownerBookings?.filter((b) => b.status === "PENDING").length || 0;

  // Max revenue amount for chart sizing
  const maxRevenueAmount = Math.max(...(revenueData?.map((r) => r.amount) || [1]));

  return (
    <div className="space-y-10 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold text-white">Tổng quan Chủ Sân</h1>
        <p className="text-gray-400 text-sm mt-1">
          Theo dõi doanh thu, lịch đặt sân và hoạt động cơ sở vật chất
        </p>
      </div>

      {/* Stats Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Revenue */}
        <div className="glass-card p-6 rounded-3xl border border-white/5 flex items-center gap-4">
          <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-2xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Tổng doanh thu</p>
            <p className="text-xl font-extrabold text-white mt-1">
              {totalRevenue.toLocaleString()}đ
            </p>
          </div>
        </div>

        {/* Card 2: Venues count */}
        <div className="glass-card p-6 rounded-3xl border border-white/5 flex items-center gap-4">
          <div className="bg-indigo-500/10 text-indigo-400 p-3 rounded-2xl">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Số cơ sở quản lý</p>
            <p className="text-xl font-extrabold text-white mt-1">{venuesCount}</p>
          </div>
        </div>

        {/* Card 3: Booking count */}
        <div className="glass-card p-6 rounded-3xl border border-white/5 flex items-center gap-4">
          <div className="bg-purple-500/10 text-purple-400 p-3 rounded-2xl">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Lịch đã đặt</p>
            <p className="text-xl font-extrabold text-white mt-1">{bookingsCount}</p>
          </div>
        </div>

        {/* Card 4: Pending Bookings */}
        <div className="glass-card p-6 rounded-3xl border border-white/5 flex items-center gap-4">
          <div className="bg-amber-500/10 text-amber-400 p-3 rounded-2xl">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium font-semibold">Chờ duyệt thanh toán</p>
            <p className="text-xl font-extrabold text-white mt-1">{pendingBookingsCount}</p>
          </div>
        </div>
      </section>

      {/* Grid: Charts & Top Venues */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CSS Chart: Left 2 columns */}
        <div className="lg:col-span-2 glass-card p-8 rounded-3xl border border-white/5 space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-white/5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Biểu Đồ Doanh Thu 6 Tháng Gần Nhất
            </h3>
            <span className="text-[10px] text-gray-400 font-bold bg-white/5 px-2.5 py-1 rounded-lg">
              Đơn vị: VNĐ
            </span>
          </div>

          <div className="h-64 flex items-end justify-between gap-4 pt-10 px-2">
            {revenueData?.map((item, index) => {
              const heightPercentage = Math.round((item.amount / maxRevenueAmount) * 100) || 5;
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-3 group h-full justify-end">
                  <div className="w-full relative flex flex-col items-center justify-end h-full">
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black border border-white/10 text-indigo-400 text-[10px] font-bold px-2 py-1 rounded shadow-xl whitespace-nowrap z-10 pointer-events-none">
                      {item.amount.toLocaleString()}đ
                    </div>
                    {/* Bar */}
                    <div
                      style={{ height: `${heightPercentage}%` }}
                      className="w-full max-w-[40px] rounded-t-lg bg-gradient-to-t from-indigo-600 to-indigo-400 group-hover:from-indigo-500 group-hover:to-pink-500 transition-all cursor-pointer glow-primary duration-300"
                    ></div>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 tracking-wider">
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Venues Stats Widget (Right 1 column) */}
        <div className="glass-card p-8 rounded-3xl border border-white/5 space-y-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-4">
            Cơ sở của tôi
          </h3>

          {ownerVenues?.length === 0 ? (
            <p className="text-gray-400 text-xs">Bạn chưa đăng ký sân nào.</p>
          ) : (
            <div className="space-y-4">
              {ownerVenues?.slice(0, 3).map((v) => (
                <div key={v.id} className="flex gap-3 items-center">
                  <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                    <img src={v.imageUrl} alt={v.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">{v.name}</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5 truncate">{v.address}</p>
                    <div className="flex items-center gap-1 mt-1 text-[9px] font-semibold text-emerald-400 uppercase">
                      <span className={`w-1.5 h-1.5 rounded-full ${v.status === "APPROVED" ? "bg-emerald-400" : "bg-amber-400"}`}></span>
                      {v.status === "APPROVED" ? "Đã kiểm duyệt" : "Đang chờ duyệt"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
