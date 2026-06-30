// src/pages/public/SearchVenuePage.jsx

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { venueService } from "../../services/venue.service";
import {
  Search, MapPin, Trophy, DollarSign, Star, SlidersHorizontal,
  RefreshCw, Map, LayoutGrid, Clock, ChevronDown, X, Filter
} from "lucide-react";

// ─── Leaflet Map Component (lazy loaded) ────────────────────────────────────
let LeafletLoaded = false;
const VenueMap = ({ venues, onVenueClick }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Dynamically import leaflet CSS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    import("leaflet").then((L) => {
      if (mapInstanceRef.current) return; // already initialized

      const map = L.map(mapRef.current, {
        center: [10.8231, 106.6297], // Ho Chi Minh City
        zoom: 12,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
      LeafletLoaded = true;

      // Add markers
      updateMarkers(L, map);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const updateMarkers = (L, map) => {
    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const venuesWithCoords = venues.filter((v) => v.latitude && v.longitude);

    if (venuesWithCoords.length === 0) {
      // Show demo markers for Ho Chi Minh City districts
      const demoCoords = [
        [10.8231, 106.6297], [10.7769, 106.7009], [10.7407, 106.6857],
        [10.8006, 106.6498], [10.8397, 106.6625], [10.7545, 106.6677],
      ];
      venues.forEach((venue, idx) => {
        if (!demoCoords[idx]) return;
        const [lat, lng] = demoCoords[idx];
        const marker = L.marker([lat, lng])
          .addTo(map)
          .bindPopup(`
            <div style="min-width:180px">
              <img src="${venue.imageUrl}" style="width:100%;height:80px;object-fit:cover;border-radius:6px;margin-bottom:6px" />
              <strong style="font-size:13px">${venue.name}</strong>
              <p style="margin:4px 0;font-size:11px;color:#666">${venue.address}</p>
              <div style="display:flex;align-items:center;gap:4px;font-size:11px;color:#f59e0b">
                ⭐ ${venue.rating?.toFixed(1) || "0.0"} · ${venue.reviewCount || 0} đánh giá
              </div>
            </div>
          `);
        marker.on("click", () => onVenueClick(venue));
        markersRef.current.push(marker);
      });
    } else {
      venuesWithCoords.forEach((venue) => {
        const marker = L.marker([venue.latitude, venue.longitude])
          .addTo(map)
          .bindPopup(`
            <div style="min-width:180px">
              <img src="${venue.imageUrl}" style="width:100%;height:80px;object-fit:cover;border-radius:6px;margin-bottom:6px" />
              <strong style="font-size:13px">${venue.name}</strong>
              <p style="margin:4px 0;font-size:11px;color:#666">${venue.address}</p>
              <div style="display:flex;align-items:center;gap:4px;font-size:11px;color:#f59e0b">
                ⭐ ${venue.rating?.toFixed(1) || "0.0"} · ${venue.reviewCount || 0} đánh giá
              </div>
            </div>
          `);
        marker.on("click", () => onVenueClick(venue));
        markersRef.current.push(marker);
      });
    }
  };

  // Update markers whenever venues change
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    import("leaflet").then((L) => {
      updateMarkers(L, mapInstanceRef.current);
    });
  }, [venues]);

  return (
    <div
      ref={mapRef}
      style={{ height: "520px", width: "100%", borderRadius: "16px", zIndex: 0 }}
      className="border border-white/10 overflow-hidden"
    />
  );
};

// ─── Star Rating Display ─────────────────────────────────────────────────────
const StarRating = ({ rating, count }) => (
  <div className="flex items-center gap-1.5">
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-3 h-3 ${
            star <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "text-gray-600 fill-gray-700"
          }`}
        />
      ))}
    </div>
    <span className="text-xs text-amber-400 font-bold">{rating?.toFixed(1) || "0.0"}</span>
    <span className="text-xs text-gray-500">({count || 0})</span>
  </div>
);

// ─── Sport Badge ─────────────────────────────────────────────────────────────
const SportBadge = ({ type }) => {
  const colors = {
    BADMINTON: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    TENNIS: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    FOOTBALL: "text-orange-400 bg-orange-500/10 border-orange-500/20",
    BASKETBALL: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    VOLLEYBALL: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  };
  const labels = {
    BADMINTON: "🏸 Cầu lông",
    TENNIS: "🎾 Tennis",
    FOOTBALL: "⚽ Bóng đá",
    BASKETBALL: "🏀 Bóng rổ",
    VOLLEYBALL: "🏐 Bóng chuyền",
  };
  const cls = colors[type] || "text-gray-400 bg-gray-500/10 border-gray-500/20";
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${cls}`}>
      {labels[type] || type}
    </span>
  );
};

// ─── Venue Card ──────────────────────────────────────────────────────────────
const VenueCard = ({ venue, onNavigate }) => (
  <div
    className="glass-card rounded-2xl overflow-hidden group flex flex-col border border-white/5 hover:border-indigo-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10"
  >
    <div className="relative aspect-video overflow-hidden">
      <img
        src={venue.imageUrl}
        alt={venue.name}
        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
      />
      {/* Rating badge */}
      <span className="absolute top-3 right-3 inline-flex items-center gap-1 bg-black/70 backdrop-blur-md text-amber-400 text-xs font-bold px-2.5 py-1 rounded-lg border border-amber-400/20">
        <Star className="w-3.5 h-3.5 fill-amber-400 stroke-none" />
        {venue.rating?.toFixed(1) || "0.0"}
      </span>
      {/* Sport type badges */}
      {venue.sportTypes && venue.sportTypes.length > 0 && (
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1">
          {venue.sportTypes.slice(0, 2).map((s) => (
            <SportBadge key={s} type={s.toUpperCase()} />
          ))}
        </div>
      )}
    </div>

    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20">
            {venue.district || "TP.HCM"}
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
          {venue.description || venue.address}
        </p>
      </div>

      {/* Rating + Price */}
      <div className="space-y-2">
        <StarRating rating={venue.rating} count={venue.reviewCount} />
        {venue.minPricePerHour && (
          <p className="text-xs text-gray-400">
            Từ{" "}
            <span className="text-indigo-400 font-bold">
              {Number(venue.minPricePerHour).toLocaleString("vi-VN")}đ
            </span>
            /giờ
          </p>
        )}
      </div>

      <div className="border-t border-white/5 pt-3">
        <button
          onClick={() => onNavigate(`/venue/${venue.id}`)}
          className="w-full bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/20 text-xs font-bold py-2.5 rounded-xl transition-all text-center"
        >
          Xem chi tiết &amp; Đặt lịch →
        </button>
      </div>
    </div>
  </div>
);

// ─── Main Page ───────────────────────────────────────────────────────────────
export const SearchVenuePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Filter state
  const [name, setName] = useState(searchParams.get("name") || "");
  const [district, setDistrict] = useState(searchParams.get("district") || "");
  const [sportType, setSportType] = useState(searchParams.get("sportType") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [startTime, setStartTime] = useState(searchParams.get("startTime") || "");
  const [endTime, setEndTime] = useState(searchParams.get("endTime") || "");
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "map"
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync from URL params
  useEffect(() => {
    setName(searchParams.get("name") || "");
    setDistrict(searchParams.get("district") || "");
    setSportType(searchParams.get("sportType") || "");
    setMinPrice(searchParams.get("minPrice") || "");
    setMaxPrice(searchParams.get("maxPrice") || "");
    setStartTime(searchParams.get("startTime") || "");
    setEndTime(searchParams.get("endTime") || "");
  }, [searchParams]);

  // Active filter count badge
  const activeFilterCount = [name, district, sportType, minPrice, maxPrice, startTime, endTime]
    .filter(Boolean).length;

  // Fetch search results
  const { data: results, isLoading, isFetching } = useQuery({
    queryKey: ["searchVenues", name, district, sportType, minPrice, maxPrice, startTime, endTime],
    queryFn: () =>
      venueService.searchAdvanced({
        name,
        district,
        sportType: sportType || undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
      }),
  });

  // District list
  const { data: allVenues } = useQuery({
    queryKey: ["allVenuesForFilter"],
    queryFn: () => venueService.getAll(),
    staleTime: 5 * 60 * 1000,
  });

  const uniqueDistricts = useMemo(() => {
    if (!allVenues) return [];
    const ds = allVenues.map((v) => v.district).filter(Boolean);
    return Array.from(new Set(ds));
  }, [allVenues]);

  const displayDistricts = uniqueDistricts.length > 0
    ? uniqueDistricts
    : ["Quận 1", "Quận 3", "Quận 7", "Bình Thạnh", "Tân Bình", "Phú Nhuận", "Thủ Đức"];

  const handleApply = (e) => {
    e?.preventDefault();
    const p = {};
    if (name) p.name = name;
    if (district) p.district = district;
    if (sportType) p.sportType = sportType;
    if (minPrice) p.minPrice = minPrice;
    if (maxPrice) p.maxPrice = maxPrice;
    if (startTime) p.startTime = startTime;
    if (endTime) p.endTime = endTime;
    setSearchParams(p);
    setMobileFilterOpen(false);
  };

  const handleReset = () => {
    setName(""); setDistrict(""); setSportType("");
    setMinPrice(""); setMaxPrice(""); setStartTime(""); setEndTime("");
    setSearchParams({});
  };

  const inputCls = "w-full bg-[#111827]/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-indigo-500/60 transition-colors placeholder:text-gray-500";
  const selectCls = `${inputCls} appearance-none cursor-pointer`;

  // Filter panel shared JSX
  const FilterPanel = () => (
    <form onSubmit={handleApply} className="space-y-5">
      <div className="flex justify-between items-center pb-4 border-b border-white/5">
        <span className="text-sm font-bold text-white flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
          Bộ lọc tìm kiếm
          {activeFilterCount > 0 && (
            <span className="text-[10px] bg-indigo-500 text-white rounded-full w-4 h-4 flex items-center justify-center font-bold">
              {activeFilterCount}
            </span>
          )}
        </span>
        <button
          type="button"
          onClick={handleReset}
          className="text-[11px] text-gray-400 hover:text-indigo-400 transition-colors flex items-center gap-1 font-semibold"
        >
          <RefreshCw className="w-3 h-3" />
          Xóa bộ lọc
        </button>
      </div>

      {/* Name Search */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Tên sân</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nhập tên sân..."
            className={`${inputCls} pl-9`}
          />
          {name && (
            <button type="button" onClick={() => setName("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-3 h-3 text-gray-500 hover:text-white" />
            </button>
          )}
        </div>
      </div>

      {/* District */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Khu vực</label>
        <div className="relative">
          <select value={district} onChange={(e) => setDistrict(e.target.value)} className={selectCls}>
            <option value="" className="bg-[#0b0f19] text-gray-400">Tất cả quận / huyện</option>
            {displayDistricts.map((d) => (
              <option key={d} value={d} className="bg-[#0b0f19] text-white">{d}</option>
            ))}
          </select>
          <MapPin className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
        </div>
      </div>

      {/* Sport Type */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Môn thể thao</label>
        <div className="relative">
          <select value={sportType} onChange={(e) => setSportType(e.target.value)} className={selectCls}>
            <option value="" className="bg-[#0b0f19] text-gray-400">Tất cả môn đấu</option>
            <option value="BADMINTON" className="bg-[#0b0f19] text-white">🏸 Cầu lông (Badminton)</option>
            <option value="TENNIS" className="bg-[#0b0f19] text-white">🎾 Tennis (Quần vợt)</option>
            <option value="FOOTBALL" className="bg-[#0b0f19] text-white">⚽ Bóng đá (Football)</option>
            <option value="BASKETBALL" className="bg-[#0b0f19] text-white">🏀 Bóng rổ (Basketball)</option>
            <option value="VOLLEYBALL" className="bg-[#0b0f19] text-white">🏐 Bóng chuyền (Volleyball)</option>
          </select>
          <Trophy className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
          <DollarSign className="w-3 h-3" />
          Giá / giờ (VNĐ)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Từ"
            min={0}
            className={inputCls}
          />
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Đến"
            min={0}
            className={inputCls}
          />
        </div>
        {/* Quick price presets */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {[
            { label: "< 100k", max: 100000 },
            { label: "100–300k", min: 100000, max: 300000 },
            { label: "> 300k", min: 300000 },
          ].map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => { setMinPrice(preset.min || ""); setMaxPrice(preset.max || ""); }}
              className="text-[10px] px-2 py-1 rounded-lg border border-white/10 text-gray-400 hover:border-indigo-500/50 hover:text-indigo-400 transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Time Slot */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
          <Clock className="w-3 h-3" />
          Khung giờ
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-500">Từ giờ</span>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className={inputCls}
            />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-gray-500">Đến giờ</span>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>
        {/* Quick time presets */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {[
            { label: "Sáng sớm", start: "06:00", end: "09:00" },
            { label: "Ban ngày", start: "09:00", end: "17:00" },
            { label: "Chiều tối", start: "17:00", end: "21:00" },
          ].map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => { setStartTime(p.start); setEndTime(p.end); }}
              className="text-[10px] px-2 py-1 rounded-lg border border-white/10 text-gray-400 hover:border-indigo-500/50 hover:text-indigo-400 transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl py-2.5 text-xs font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2"
      >
        <Filter className="w-3.5 h-3.5" />
        Áp dụng bộ lọc
      </button>
    </form>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="border-b border-white/5 pb-5">
        <h1 className="text-3xl font-extrabold text-white">Tìm Sân Thể Thao</h1>
        <p className="text-gray-400 text-sm mt-1">
          Lọc theo vị trí, môn thể thao, mức giá và khung giờ phù hợp với bạn
        </p>
      </div>

      {/* Mobile Filter Toggle */}
      <div className="lg:hidden flex gap-3">
        <button
          onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
          className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-semibold hover:border-indigo-500/30 transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
          Bộ lọc
          {activeFilterCount > 0 && (
            <span className="bg-indigo-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* View mode toggle - mobile */}
        <div className="flex rounded-xl border border-white/10 overflow-hidden">
          <button
            onClick={() => setViewMode("grid")}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-colors ${viewMode === "grid" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"}`}
          >
            <LayoutGrid className="w-3.5 h-3.5" /> Danh sách
          </button>
          <button
            onClick={() => setViewMode("map")}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-colors ${viewMode === "map" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"}`}
          >
            <Map className="w-3.5 h-3.5" /> Bản đồ
          </button>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className="lg:hidden glass-card p-5 rounded-2xl border border-white/5">
          <FilterPanel />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* ─── Sidebar Filters (Desktop) ─── */}
        <aside className="hidden lg:block lg:col-span-1">
          <div className="glass-card p-6 rounded-2xl border border-white/5 sticky top-28">
            <FilterPanel />
          </div>
        </aside>

        {/* ─── Results Panel ─── */}
        <section className="lg:col-span-3 space-y-5">
          {/* Results header + view mode toggle */}
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-400">
              {isLoading || isFetching ? (
                <span className="text-gray-500">Đang tìm kiếm...</span>
              ) : (
                <>
                  Tìm thấy{" "}
                  <span className="text-white font-bold">{results?.length || 0}</span>{" "}
                  địa điểm phù hợp
                </>
              )}
            </span>

            {/* Desktop view mode */}
            <div className="hidden lg:flex rounded-xl border border-white/10 overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-colors ${viewMode === "grid" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Danh sách
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-colors ${viewMode === "map" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
              >
                <Map className="w-3.5 h-3.5" />
                Bản đồ
              </button>
            </div>
          </div>

          {/* Active filter chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2">
              {name && (
                <span className="flex items-center gap-1 text-[11px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-full">
                  <Search className="w-3 h-3" /> {name}
                  <button onClick={() => setName("")}><X className="w-3 h-3 ml-1 hover:text-white" /></button>
                </span>
              )}
              {district && (
                <span className="flex items-center gap-1 text-[11px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-full">
                  <MapPin className="w-3 h-3" /> {district}
                  <button onClick={() => setDistrict("")}><X className="w-3 h-3 ml-1 hover:text-white" /></button>
                </span>
              )}
              {sportType && (
                <span className="flex items-center gap-1 text-[11px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full">
                  <Trophy className="w-3 h-3" /> {sportType}
                  <button onClick={() => setSportType("")}><X className="w-3 h-3 ml-1 hover:text-white" /></button>
                </span>
              )}
              {(minPrice || maxPrice) && (
                <span className="flex items-center gap-1 text-[11px] bg-purple-500/10 border border-purple-500/20 text-purple-300 px-2.5 py-1 rounded-full">
                  <DollarSign className="w-3 h-3" />
                  {minPrice ? `${Number(minPrice).toLocaleString()}đ` : "0"} –{" "}
                  {maxPrice ? `${Number(maxPrice).toLocaleString()}đ` : "∞"}
                  <button onClick={() => { setMinPrice(""); setMaxPrice(""); }}><X className="w-3 h-3 ml-1 hover:text-white" /></button>
                </span>
              )}
              {(startTime || endTime) && (
                <span className="flex items-center gap-1 text-[11px] bg-amber-500/10 border border-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full">
                  <Clock className="w-3 h-3" /> {startTime || "..."} – {endTime || "..."}
                  <button onClick={() => { setStartTime(""); setEndTime(""); }}><X className="w-3 h-3 ml-1 hover:text-white" /></button>
                </span>
              )}
            </div>
          )}

          {/* ─── Content ─── */}
          {isLoading || isFetching ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="glass-card h-72 rounded-2xl animate-pulse bg-white/5 border border-white/5" />
              ))}
            </div>
          ) : results?.length === 0 ? (
            <div className="glass-card text-center p-16 rounded-2xl border border-white/5">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-7 h-7 text-gray-500" />
              </div>
              <p className="text-white font-bold text-base mb-2">Không tìm thấy sân phù hợp</p>
              <p className="text-gray-400 text-sm mb-5">
                Thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác.
              </p>
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 px-6 rounded-xl transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Xóa bộ lọc
              </button>
            </div>
          ) : viewMode === "map" ? (
            <div className="space-y-4">
              <VenueMap venues={results || []} onVenueClick={(v) => navigate(`/venue/${v.id}`)} />
              {/* Mini card list below map */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {results?.slice(0, 6).map((venue) => (
                  <button
                    key={venue.id}
                    onClick={() => navigate(`/venue/${venue.id}`)}
                    className="glass-card rounded-xl p-3 text-left border border-white/5 hover:border-indigo-500/30 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={venue.imageUrl}
                        alt={venue.name}
                        className="w-12 h-12 rounded-lg object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-white text-xs font-bold truncate group-hover:text-indigo-400 transition-colors">
                          {venue.name}
                        </p>
                        <p className="text-gray-500 text-[10px] truncate">{venue.district}</p>
                        <StarRating rating={venue.rating} count={venue.reviewCount} />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {results?.map((venue) => (
                <VenueCard key={venue.id} venue={venue} onNavigate={navigate} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
