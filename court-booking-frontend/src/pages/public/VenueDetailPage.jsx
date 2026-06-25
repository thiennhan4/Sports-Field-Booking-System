// src/pages/public/VenueDetailPage.jsx

import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { venueService } from "../../services/venue.service";
import { reviews } from "../../mocks/reviews";
import { MapPin, Trophy, Star, ShieldCheck, ArrowLeft, Calendar } from "lucide-react";

export const VenueDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Query 1: Fetch Venue Details
  const { data: venue, isLoading: isVenueLoading, error: venueError } = useQuery({
    queryKey: ["venue", id],
    queryFn: () => venueService.getById(id)
  });

  // Query 2: Fetch Courts in Venue
  const { data: venueCourts, isLoading: isCourtsLoading } = useQuery({
    queryKey: ["venueCourts", id],
    queryFn: () => venueService.getCourtsByVenueId(id),
    enabled: !!venue
  });

  // Filter local mock reviews
  const venueReviews = reviews.filter((r) => r.venueId === Number(id));

  if (isVenueLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 text-xs mt-3">Đang tải thông tin sân thể thao...</p>
      </div>
    );
  }

  if (venueError || !venue) {
    return (
      <div className="glass-card max-w-md mx-auto p-8 text-center rounded-2xl border-white/5 mt-10">
        <h2 className="text-xl font-bold text-white mb-2">Không tìm thấy sân thể thao</h2>
        <p className="text-gray-400 text-xs mb-6">Đường dẫn không hợp lệ hoặc sân đấu đã bị xóa.</p>
        <button
          onClick={() => navigate("/search")}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs transition-all"
        >
          Quay lại tìm kiếm
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách
        </button>
      </div>

      {/* Main Grid: Details & Image */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Photo */}
        <div className="lg:col-span-5 rounded-2xl overflow-hidden aspect-video lg:aspect-auto lg:h-[350px] border border-white/5 relative">
          <img
            src={venue.imageUrl}
            alt={venue.name}
            className="w-full h-full object-cover"
          />
          <span className="absolute top-4 right-4 inline-flex items-center gap-1 bg-black/60 backdrop-blur-md text-[#fbbf24] text-sm font-bold px-3 py-1.5 rounded-xl">
            <Star className="w-4 h-4 fill-[#fbbf24] stroke-none" />
            {venue.rating > 0 ? venue.rating.toFixed(1) : "Chưa có"}
          </span>
        </div>

        {/* Right Side: Text & Actions */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex gap-2">
              <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20">
                {venue.district}
              </span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20 uppercase">
                {venue.status === "APPROVED" ? "Hoạt động" : "Đang duyệt"}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white leading-tight">
              {venue.name}
            </h1>
            <p className="text-gray-300 text-xs flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-red-500 shrink-0" />
              {venue.address}
            </p>
            <p className="text-gray-400 text-sm leading-relaxed font-light">
              {venue.description}
            </p>
          </div>

          <div className="bg-white/5 p-4 rounded-2xl flex items-center justify-between border border-white/5">
            <div>
              <p className="text-xs text-gray-400">Giá đặt sân trung bình</p>
              <p className="text-lg font-bold text-white mt-0.5">100.000đ - 250.000đ / giờ</p>
            </div>
            <button
              onClick={() => navigate(`/book?venueId=${venue.id}`)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl text-xs flex items-center gap-2 transition-all shadow-md shadow-indigo-600/30"
            >
              <Calendar className="w-4 h-4" />
              Đặt lịch giữ sân
            </button>
          </div>
        </div>
      </section>

      {/* Grid: Courts List & Reviews */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Courts List (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-white border-b border-white/5 pb-3">
            Danh Sách Sân Đấu
          </h2>

          {isCourtsLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : venueCourts?.length === 0 ? (
            <p className="text-gray-400 text-sm">Hiện chưa có sân đấu nào được tạo cho cơ sở này.</p>
          ) : (
            <div className="space-y-3">
              {venueCourts?.map((court) => (
                <div
                  key={court.id}
                  className="glass-card p-5 rounded-2xl flex justify-between items-center border border-white/5 hover:border-indigo-500/20"
                >
                  <div className="space-y-1">
                    <p className="font-bold text-white text-sm">{court.name}</p>
                    <p className="text-[11px] text-indigo-400 font-semibold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 inline-block uppercase">
                      {court.sportType}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-indigo-400 font-extrabold text-sm">
                      {court.pricePerHour.toLocaleString()}đ <span className="text-gray-400 font-normal text-xs">/ giờ</span>
                    </p>
                    <button
                      onClick={() => navigate(`/book?venueId=${venue.id}&courtId=${court.id}`)}
                      className="text-[11px] text-white hover:text-indigo-300 font-semibold mt-1 inline-flex items-center gap-1.5 transition-colors"
                    >
                      Đặt sân này <Calendar className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reviews Panel (Right 1 col) */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white border-b border-white/5 pb-3">
            Đánh Giá ({venueReviews.length})
          </h2>

          {venueReviews.length === 0 ? (
            <p className="text-gray-400 text-sm">Sân này chưa có đánh giá nào từ khách hàng.</p>
          ) : (
            <div className="space-y-4">
              {venueReviews.map((review) => (
                <div key={review.id} className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white">{review.userName}</span>
                    <div className="flex items-center gap-0.5 text-xs text-[#fbbf24]">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < Math.floor(review.rating)
                              ? "fill-[#fbbf24] stroke-none"
                              : "stroke-[#fbbf24] fill-none"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs leading-relaxed italic">
                    "{review.comment}"
                  </p>
                  <p className="text-[10px] text-gray-500 text-right">{review.createdAt}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
