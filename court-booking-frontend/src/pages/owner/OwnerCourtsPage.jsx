// src/pages/owner/OwnerCourtsPage.jsx

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth";
import { venueService } from "../../services/venue.service";
import { Plus, Edit2, Trash2, X, Layers } from "lucide-react";

export const OwnerCourtsPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [selectedVenueId, setSelectedVenueId] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourt, setEditingCourt] = useState(null);

  // Form Fields
  const [name, setName] = useState("");
  const [sportType, setSportType] = useState("BADMINTON");
  const [pricePerHour, setPricePerHour] = useState("");

  // Query: Get owner's venues list (needed for the selection dropdown)
  const { data: ownerVenues } = useQuery({
    queryKey: ["ownerVenues", user?.id],
    queryFn: () => venueService.getByOwnerId(user?.id),
    enabled: !!user?.id,
    onSuccess: (venues) => {
      // Auto select first venue if none selected yet
      if (venues && venues.length > 0 && !selectedVenueId) {
        setSelectedVenueId(venues[0].id.toString());
      }
    }
  });

  // Query: Get courts for selected venue
  const { data: courtsList, isLoading } = useQuery({
    queryKey: ["ownerCourts", selectedVenueId],
    queryFn: () => venueService.getCourtsByVenueId(selectedVenueId),
    enabled: !!selectedVenueId
  });

  // Mutations
  const createCourtMutation = useMutation({
    mutationFn: venueService.createCourt,
    onSuccess: () => {
      queryClient.invalidateQueries(["ownerCourts", selectedVenueId]);
      handleCloseModal();
    }
  });

  const updateCourtMutation = useMutation({
    mutationFn: ({ id, data }) => venueService.updateCourt(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["ownerCourts", selectedVenueId]);
      handleCloseModal();
    }
  });

  const deleteCourtMutation = useMutation({
    mutationFn: venueService.deleteCourt,
    onSuccess: () => {
      queryClient.invalidateQueries(["ownerCourts", selectedVenueId]);
    }
  });

  const handleOpenAddModal = () => {
    setEditingCourt(null);
    setName("");
    setSportType("BADMINTON");
    setPricePerHour("100000");
    setModalOpen(true);
  };

  const handleOpenEditModal = (court) => {
    setEditingCourt(court);
    setName(court.name);
    setSportType(court.sportType);
    setPricePerHour(court.pricePerHour.toString());
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingCourt(null);
  };

  const handleDeleteClick = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sân đấu này?")) {
      deleteCourtMutation.mutate(id);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      venueId: selectedVenueId,
      name,
      sportType,
      pricePerHour: Number(pricePerHour),
    };

    if (editingCourt) {
      updateCourtMutation.mutate({ id: editingCourt.id, data });
    } else {
      createCourtMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-white/5 pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Quản Lý Sân Đấu</h1>
          <p className="text-gray-400 text-sm mt-1">Quản lý danh sách các sân chơi cụ thể trong cơ sở của bạn</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          disabled={!selectedVenueId}
          className="bg-purple-600 hover:bg-purple-700 disabled:opacity-55 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-purple-600/20"
        >
          <Plus className="w-4 h-4" />
          Thêm sân đấu mới
        </button>
      </div>

      {/* Select Venue Filter */}
      <div className="glass-card p-5 rounded-2xl border-white/5 max-w-md">
        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2">
          Chọn Cơ sở cần quản lý:
        </label>
        <select
          value={selectedVenueId}
          onChange={(e) => setSelectedVenueId(e.target.value)}
          className="w-full bg-[#111827]/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-purple-500/50 cursor-pointer"
        >
          <option value="">-- Chọn cơ sở --</option>
          {ownerVenues?.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name} ({v.district})
            </option>
          ))}
        </select>
      </div>

      {/* Courts list */}
      {!selectedVenueId ? (
        <div className="glass-card text-center p-10 rounded-2xl border-white/5">
          <p className="text-gray-400 text-xs font-semibold">Vui lòng đăng ký/chọn một cơ sở để hiển thị danh sách sân đấu.</p>
        </div>
      ) : isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : courtsList?.length === 0 ? (
        <div className="glass-card text-center p-12 rounded-2xl border-white/5">
          <p className="text-gray-400 text-xs font-semibold">Cơ sở này hiện chưa có sân đấu nào. Hãy thêm mới ngay!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {courtsList?.map((court) => (
            <div
              key={court.id}
              className="glass-card p-5 rounded-2xl border border-white/5 flex justify-between items-center hover:border-purple-500/20"
            >
              <div className="space-y-1.5">
                <p className="font-extrabold text-white text-sm flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-purple-400" />
                  {court.name}
                </p>
                <span className="text-[9px] font-extrabold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/15 uppercase tracking-wide inline-block">
                  {court.sportType}
                </span>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-purple-400 font-extrabold text-sm">
                    {court.pricePerHour.toLocaleString()}đ
                  </p>
                  <span className="text-gray-500 text-[10px]">Đơn giá / Giờ</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenEditModal(court)}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 text-gray-400 hover:text-white transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(court.id)}
                    className="p-2 bg-red-500/5 hover:bg-red-500 rounded-lg border border-red-500/10 hover:border-transparent text-red-400 hover:text-white transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Court Modal Overlay */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card w-full max-w-md rounded-3xl p-6 md:p-8 space-y-6 animate-fade-in relative border-white/10 shadow-2xl">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white border-b border-white/5 pb-2.5">
              {editingCourt ? "Chỉnh Sửa Sân Đấu" : "Thêm Sân Đấu Mới"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs md:text-sm">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Tên sân đấu</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Sân 1 / Sân VIP"
                  className="w-full bg-[#111827]/50 border border-white/10 rounded-xl py-2.5 px-4 text-white outline-none focus:border-purple-500/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Môn Thể Thao</label>
                <select
                  value={sportType}
                  onChange={(e) => setSportType(e.target.value)}
                  className="w-full bg-[#111827]/50 border border-white/10 rounded-xl py-2.5 px-4 text-white outline-none focus:border-purple-500/50 cursor-pointer"
                >
                  <option value="BADMINTON">Cầu Lông (Badminton)</option>
                  <option value="TENNIS">Tennis (Quần Vợt)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Đơn giá thuê (VND/Giờ)</label>
                <input
                  type="number"
                  required
                  value={pricePerHour}
                  onChange={(e) => setPricePerHour(e.target.value)}
                  placeholder="100000"
                  className="w-full bg-[#111827]/50 border border-white/10 rounded-xl py-2.5 px-4 text-white outline-none focus:border-purple-500/50"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="bg-white/5 hover:bg-white/10 text-gray-300 font-bold py-2.5 px-5 rounded-xl text-xs transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={createCourtMutation.isPending || updateCourtMutation.isPending}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs transition-all shadow-md shadow-purple-600/20"
                >
                  {editingCourt ? "Cập nhật" : "Lưu sân"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
