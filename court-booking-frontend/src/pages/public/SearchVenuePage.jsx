// src/pages/public/SearchVenuePage.jsx

import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { venueService } from "../../services/venue.service";
import { Search, MapPin, Trophy, DollarSign, Star, SlidersHorizontal, RefreshCw } from "lucide-react";

export const SearchVenuePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Local state for form controls
  const [district, setDistrict] = useState(searchParams.get("district") || "");
  const [sportType, setSportType] = useState(searchParams.get("sportType") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");

  // Update local inputs when search params change (e.g. from nav or other pages)
  useEffect(() => {
    setDistrict(searchParams.get("district") || "");
    setSportType(searchParams.get("sportType") || "");
    setMinPrice(searchParams.get("minPrice") || "");
    setMaxPrice(searchParams.get("maxPrice") || "");
  }, [searchParams]);

  // Fetch search results using React Query. Automatically refetches on searchParam changes!
  const { data: results, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["searchVenues", district, sportType, minPrice, maxPrice],
    queryFn: () =>
      venueService.search({
        district,
        sportType,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined
      })
  });

  const handleApplyFilters = (e) => {
    e.preventDefault();
    const newParams = {};
    if (district) newParams.district = district;
    if (sportType) newParams.sportType = sportType;
    if (minPrice) newParams.minPrice = minPrice;
    if (maxPrice) newParams.maxPrice = maxPrice;
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setDistrict("");
    setSportType("");
    setMinPrice("");
    setMaxPrice("");
    setSearchParams({});
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="border-b border-white/5 pb-4">
        <h1 className="text-3xl font-extrabold text-white">Tìm Sân Thể Thao</h1>
        <p className="text-gray-400 text-sm mt-1">
          Lọc theo vị trí, môn thể thao, và mức giá phù hợp với bạn
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Panel */}
        <aside className="lg:col-span-1">
          <form onSubmit={handleApplyFilters} className="glass-card p-6 rounded-2xl space-y-6 border-white/5 sticky top-28">
            <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
                Bộ lọc tìm kiếm
              </span>
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[11px] text-gray-400 hover:text-indigo-400 transition-colors flex items-center gap-1 font-semibold"
              >
                <RefreshCw className="w-3 h-3" />
                Thiết lập lại
              </button>
            </div>

            {/* District Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Khu Vực</label>
              <div className="relative">
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-[#111827]/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-indigo-500/50 appearance-none cursor-pointer"
                >
                  <option value="" className="bg-[#0b0f19] text-gray-400">Tất cả quận / huyện</option>
                  <option value="Quận 7" className="bg-[#0b0f19] text-white">Quận 7</option>
                  <option value="Bình Thạnh" className="bg-[#0b0f19] text-white">Bình Thạnh</option>
                  <option value="Quận 1" className="bg-[#0b0f19] text-white">Quận 1</option>
                  <option value="Tân Bình" className="bg-[#0b0f19] text-white">Tân Bình</option>
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Sport Type Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Môn Thể Thao</label>
              <div className="relative">
                <select
                  value={sportType}
                  onChange={(e) => setSportType(e.target.value)}
                  className="w-full bg-[#111827]/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-indigo-500/50 appearance-none cursor-pointer"
                >
                  <option value="" className="bg-[#0b0f19] text-gray-400">Tất cả môn đấu</option>
                  <option value="BADMINTON" className="bg-[#0b0f19] text-white">Cầu Lông (Badminton)</option>
                  <option value="TENNIS" className="bg-[#0b0f19] text-white">Tennis (Quần Vợt)</option>
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Trophy className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Giá 1 Giờ (VND)</label>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="Từ"
                    className="w-full bg-[#111827]/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500/50"
                  />
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="Đến"
                    className="w-full bg-[#111827]/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500/50"
                  />
                </div>
              </div>
            </div>

            {/* Apply Button */}
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2.5 text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
            >
              Áp dụng bộ lọc
            </button>
          </form>
        </aside>

        {/* Results Panel */}
        <section className="lg:col-span-3 space-y-6">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-400">
              Tìm thấy <span className="text-white font-bold">{results?.length || 0}</span> địa điểm phù hợp
            </span>
          </div>

          {isLoading || isFetching ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 4].map((n) => (
                <div key={n} className="glass-card h-64 rounded-2xl animate-pulse bg-white/5 border border-white/5"></div>
              ))}
            </div>
          ) : results?.length === 0 ? (
            <div className="glass-card text-center p-16 rounded-2xl border-white/5">
              <p className="text-gray-400 text-sm font-medium">
                Không tìm thấy sân thể thao nào phù hợp với bộ lọc đã chọn.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-4 inline-flex text-indigo-400 hover:text-indigo-300 font-bold text-xs"
              >
                Nhấn vào đây để đặt lại bộ lọc
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {results?.map((venue) => (
                <div key={venue.id} className="glass-card rounded-2xl overflow-hidden group flex flex-col justify-between border border-white/5">
                  <div className="relative aspect-video">
                    <img
                      src={venue.imageUrl}
                      alt={venue.name}
                      className="object-cover w-full h-full group-hover:scale-103 transition-transform duration-300"
                    />
                    <span className="absolute top-3 right-3 inline-flex items-center gap-1 bg-black/60 backdrop-blur-md text-[#fbbf24] text-xs font-bold px-2.5 py-1 rounded-lg">
                      <Star className="w-3.5 h-3.5 fill-[#fbbf24] stroke-none" />
                      {venue.rating.toFixed(1)}
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20">
                          {venue.district}
                        </span>
                        <span className="text-gray-400 text-[11px] flex items-center gap-1 font-medium">
                          <MapPin className="w-3 h-3 text-red-400" />
                          HCM
                        </span>
                      </div>
                      <h3 className="font-bold text-white text-base group-hover:text-indigo-400 transition-colors line-clamp-1 leading-snug">
                        {venue.name}
                      </h3>
                      <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed">
                        {venue.description}
                      </p>
                    </div>

                    <div className="border-t border-white/5 pt-4 flex items-center justify-between">
                      <button
                        onClick={() => navigate(`/venue/${venue.id}`)}
                        className="w-full bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/15 text-xs font-bold py-2 rounded-xl transition-all text-center"
                      >
                        Xem chi tiết & Đặt lịch
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
