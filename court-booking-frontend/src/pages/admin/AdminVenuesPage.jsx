// src/pages/admin/AdminVenuesPage.jsx

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { venueService } from "../../services/venue.service";
import { Check, X, MapPin, Eye, Star } from "lucide-react";

export const AdminVenuesPage = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("PENDING"); // PENDING, APPROVED, REJECTED

  // Query: Get all venues
  const { data: venuesList, isLoading } = useQuery({
    queryKey: ["adminAllVenues"],
    queryFn: venueService.getAll
  });

  // Mutation: Approve/Reject Venue
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => venueService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(["adminAllVenues"]);
    },
    onError: (err) => {
      alert(err.message || "Kiểm duyệt thất bại.");
    }
  });

  const handleApprove = (id) => {
    updateStatusMutation.mutate({ id, status: "APPROVED" });
  };

  const handleReject = (id) => {
    if (window.confirm("Bạn có chắc muốn từ chối cơ sở thể thao này?")) {
      updateStatusMutation.mutate({ id, status: "REJECTED" });
    }
  };

  // Filter based on selected tab
  const filteredVenues = venuesList?.filter((v) => v.status === activeTab) || [];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-3 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 text-xs mt-3">Đang tải danh sách cơ sở thể thao...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="border-b border-white/5 pb-4">
        <h1 className="text-3xl font-extrabold text-white">Kiểm Duyệt Cơ Sở</h1>
        <p className="text-gray-400 text-sm mt-1">
          Duyệt hoặc từ chối các cơ sở thể thao do Chủ sân (Owners) đăng ký mới trên hệ thống
        </p>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-white/5 gap-2 text-xs font-bold uppercase tracking-wider">
        <button
          onClick={() => setActiveTab("PENDING")}
          className={`pb-3.5 px-4 relative ${
            activeTab === "PENDING"
              ? "text-amber-400 border-b-2 border-amber-400"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Chờ kiểm duyệt (
          {venuesList?.filter((v) => v.status === "PENDING").length || 0}
          )
        </button>
        <button
          onClick={() => setActiveTab("APPROVED")}
          className={`pb-3.5 px-4 relative ${
            activeTab === "APPROVED"
              ? "text-emerald-400 border-b-2 border-emerald-400"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Đang Hoạt Động (
          {venuesList?.filter((v) => v.status === "APPROVED").length || 0}
          )
        </button>
        <button
          onClick={() => setActiveTab("REJECTED")}
          className={`pb-3.5 px-4 relative ${
            activeTab === "REJECTED"
              ? "text-red-400 border-b-2 border-red-400"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Đã Từ Chối (
          {venuesList?.filter((v) => v.status === "REJECTED").length || 0}
          )
        </button>
      </div>

      {/* Venues Grid */}
      {filteredVenues.length === 0 ? (
        <div className="glass-card text-center p-16 rounded-2xl border-white/5">
          <p className="text-gray-400 text-xs font-semibold">Không có cơ sở nào ở trạng thái này.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredVenues.map((venue) => (
            <div
              key={venue.id}
              className="glass-card rounded-2xl overflow-hidden border border-white/5 flex flex-col justify-between"
            >
              <div className="relative aspect-video">
                <img src={venue.imageUrl} alt={venue.name} className="w-full h-full object-cover" />
                <span className="absolute top-3 right-3 inline-flex items-center gap-1 bg-black/60 backdrop-blur-md text-[#fbbf24] text-xs font-bold px-2.5 py-1 rounded-lg">
                  <Star className="w-3.5 h-3.5 fill-[#fbbf24] stroke-none" />
                  {venue.rating.toFixed(1)}
                </span>
              </div>

              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="font-extrabold text-white text-base leading-snug">{venue.name}</h3>
                  <p className="text-gray-400 text-xs flex items-center gap-1.5 leading-snug">
                    <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    {venue.address}
                  </p>
                  <p className="text-gray-400 text-xs leading-relaxed line-clamp-3">
                    {venue.description}
                  </p>
                </div>

                {/* Operations */}
                <div className="border-t border-white/5 pt-4 flex items-center justify-between gap-3 text-xs font-bold">
                  <span className="text-[10px] text-gray-400">ID Sân: #{venue.id}</span>
                  
                  <div className="flex gap-2">
                    {activeTab === "PENDING" && (
                      <>
                        <button
                          onClick={() => handleReject(venue.id)}
                          className="bg-red-500/10 hover:bg-red-600 border border-red-500/15 text-red-400 hover:text-white px-3.5 py-2 rounded-xl transition-all flex items-center gap-1"
                        >
                          <X className="w-4 h-4" /> Từ chối
                        </button>
                        <button
                          onClick={() => handleApprove(venue.id)}
                          className="bg-emerald-500/10 hover:bg-emerald-600 border border-emerald-500/15 text-emerald-400 hover:text-white px-3.5 py-2 rounded-xl transition-all flex items-center gap-1 shadow-md shadow-emerald-600/10"
                        >
                          <Check className="w-4 h-4" /> Duyệt
                        </button>
                      </>
                    )}

                    {activeTab !== "PENDING" && (
                      <span className={`inline-flex items-center gap-1 text-[10px] uppercase font-bold py-1 px-3.5 rounded-full border ${
                        activeTab === "APPROVED" 
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                          : "bg-red-500/10 text-red-400 border-red-500/25"
                      }`}>
                        {activeTab === "APPROVED" ? "Hoạt động" : "Bị từ chối"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
