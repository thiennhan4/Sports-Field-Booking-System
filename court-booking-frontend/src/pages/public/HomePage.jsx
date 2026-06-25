// src/pages/public/HomePage.jsx

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { venueService } from "../../services/venue.service";
import { reviews } from "../../mocks/reviews";
import { Search, MapPin, Trophy, Star, ArrowRight, ShieldCheck } from "lucide-react";

export const HomePage = () => {
  const navigate = useNavigate();
  const [searchDistrict, setSearchDistrict] = useState("");
  const [searchSport, setSearchSport] = useState("");

  // React Query to fetch approved venues for homepage listing
  const { data: featuredVenues, isLoading } = useQuery({
    queryKey: ["featuredVenues"],
    queryFn: () => venueService.search()
  });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchDistrict) params.set("district", searchDistrict);
    if (searchSport) params.set("sportType", searchSport);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="space-y-16 animate-fade-in">
      {/* Hero Banner Section */}
      <section className="relative rounded-3xl overflow-hidden min-h-[500px] flex items-center justify-center p-8 md:p-16">
        {/* Decorative Glowing Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] -z-10"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-[100px] -z-10"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(15,23,42,0.1),#0b0f19)] -z-10"></div>

        <div className="max-w-4xl text-center space-y-8">
          <span className="inline-flex items-center gap-1.5 bg-indigo-500/10 text-indigo-400 text-xs px-3.5 py-1.5 rounded-full border border-indigo-500/20 font-semibold uppercase tracking-wider glow-primary">
            <Trophy className="w-3.5 h-3.5" /> Nền tảng Đặt Sân Thể Thao Hàng Đầu
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Tìm Sân Cực Nhanh <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Chốt Lịch Dễ Dàng
            </span>
          </h1>
          <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto font-light">
            Đặt sân cầu lông, tennis, bóng rổ... trực tuyến nhanh chóng với hệ thống định giá minh bạch và quản lý lịch trình linh hoạt.
          </p>

          {/* Search Form Widget */}
          <form
            onSubmit={handleSearchSubmit}
            className="glass-card max-w-3xl mx-auto p-3 rounded-2xl md:rounded-full flex flex-col md:flex-row gap-2 shadow-2xl border-white/5"
          >
            <div className="flex-1 flex items-center gap-2.5 px-4 py-2 border-b md:border-b-0 md:border-r border-white/10">
              <MapPin className="text-indigo-400 w-5 h-5 shrink-0" />
              <select
                value={searchDistrict}
                onChange={(e) => setSearchDistrict(e.target.value)}
                className="w-full bg-transparent border-0 outline-none text-white text-sm cursor-pointer"
              >
                <option value="" className="bg-[#0b0f19] text-gray-400">Chọn Khu vực (Quận / Huyện)</option>
                <option value="Quận 7" className="bg-[#0b0f19] text-white">Quận 7</option>
                <option value="Bình Thạnh" className="bg-[#0b0f19] text-white">Bình Thạnh</option>
                <option value="Quận 1" className="bg-[#0b0f19] text-white">Quận 1</option>
                <option value="Tân Bình" className="bg-[#0b0f19] text-white">Tân Bình</option>
              </select>
            </div>

            <div className="flex-1 flex items-center gap-2.5 px-4 py-2">
              <Trophy className="text-indigo-400 w-5 h-5 shrink-0" />
              <select
                value={searchSport}
                onChange={(e) => setSearchSport(e.target.value)}
                className="w-full bg-transparent border-0 outline-none text-white text-sm cursor-pointer"
              >
                <option value="" className="bg-[#0b0f19] text-gray-400">Chọn Loại thể thao</option>
                <option value="BADMINTON" className="bg-[#0b0f19] text-white">Cầu Lông (Badminton)</option>
                <option value="TENNIS" className="bg-[#0b0f19] text-white">Tennis (Quần Vợt)</option>
              </select>
            </div>

            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl md:rounded-full py-3 px-8 text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/30 shrink-0"
            >
              <Search className="w-4 h-4" />
              Tìm sân ngay
            </button>
          </form>
        </div>
      </section>

      {/* Featured Venues Section */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold text-white">Sân Thể Thao Nổi Bật</h2>
            <p className="text-gray-400 text-sm">Các địa điểm được cộng đồng đánh giá tốt nhất</p>
          </div>
          <Link
            to="/search"
            className="flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300 font-semibold group transition-all"
          >
            Xem tất cả
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="glass-card h-80 rounded-2xl animate-pulse bg-white/5 border border-white/5"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredVenues?.slice(0, 3).map((venue) => (
              <div key={venue.id} className="glass-card rounded-2xl overflow-hidden group flex flex-col h-full border border-white/5">
                {/* Image Aspect ratio box */}
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={venue.imageUrl}
                    alt={venue.name}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 right-3 inline-flex items-center gap-1 bg-black/60 backdrop-blur-md text-[#fbbf24] text-xs font-bold px-2.5 py-1 rounded-lg">
                    <Star className="w-3.5 h-3.5 fill-[#fbbf24] stroke-none" />
                    {venue.rating.toFixed(1)}
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 uppercase tracking-wide">
                        {venue.district}
                      </span>
                    </div>
                    <h3 className="font-bold text-white text-lg leading-snug group-hover:text-indigo-400 transition-colors line-clamp-1">
                      {venue.name}
                    </h3>
                    <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed">
                      {venue.description}
                    </p>
                  </div>

                  <button
                    onClick={() => navigate(`/venue/${venue.id}`)}
                    className="w-full bg-white/5 hover:bg-white/10 text-gray-200 text-xs font-bold py-2.5 rounded-xl border border-white/5 transition-all text-center"
                  >
                    Xem chi tiết & Đặt sân
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Reviews Section */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Khách hàng nói về SmashPlay</h2>
          <p className="text-gray-400 text-sm">Ý kiến đánh giá khách quan từ những người đam mê thể thao</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.slice(0, 3).map((review) => (
            <div key={review.id} className="glass-card p-6 rounded-2xl flex flex-col justify-between h-full border border-white/5">
              <p className="text-gray-300 text-sm italic leading-relaxed mb-6 font-light">
                "{review.comment}"
              </p>
              <div className="flex items-center gap-3 border-t border-white/5 pt-4">
                <div className="w-9 h-9 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-extrabold text-sm">
                  {review.userName.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{review.userName}</h4>
                  <div className="flex items-center gap-0.5 text-xs text-[#fbbf24] mt-0.5">
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
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
