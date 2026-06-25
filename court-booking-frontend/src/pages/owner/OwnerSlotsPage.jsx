// src/pages/owner/OwnerSlotsPage.jsx

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth";
import { venueService } from "../../services/venue.service";
import { slotService } from "../../services/slot.service";
import { Plus, Trash2, X, Clock, Sparkles } from "lucide-react";

export const OwnerSlotsPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [selectedVenueId, setSelectedVenueId] = useState("");
  const [selectedCourtId, setSelectedCourtId] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("09:00");

  const { data: ownerVenues } = useQuery({
    queryKey: ["ownerVenues", user?.id],
    queryFn: () => venueService.getByOwnerId(user?.id),
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (ownerVenues?.length && !selectedVenueId) {
      setSelectedVenueId(ownerVenues[0].id.toString());
    }
  }, [ownerVenues, selectedVenueId]);

  const { data: courtsList } = useQuery({
    queryKey: ["ownerCourts", selectedVenueId],
    queryFn: () => venueService.getCourtsByVenueId(selectedVenueId),
    enabled: !!selectedVenueId,
  });

  useEffect(() => {
    if (courtsList?.length && !selectedCourtId) {
      setSelectedCourtId(courtsList[0].id.toString());
    }
  }, [courtsList, selectedCourtId]);

  const {
    data: slotTemplates,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["ownerSlotTemplates", selectedCourtId],
    queryFn: () => slotService.getByCourtId(selectedCourtId),
    enabled: !!selectedCourtId,
  });

  const invalidateSlots = () => {
    queryClient.invalidateQueries(["ownerSlotTemplates", selectedCourtId]);
    queryClient.invalidateQueries(["slotsAvailability"]);
  };

  const createMutation = useMutation({
    mutationFn: (data) => slotService.create(selectedCourtId, data),
    onSuccess: invalidateSlots,
    onError: (err) => alert(err.message || "Không thể thêm khung giờ."),
  });

  const deleteMutation = useMutation({
    mutationFn: slotService.delete,
    onSuccess: invalidateSlots,
    onError: (err) => alert(err.message || "Không thể xóa khung giờ."),
  });

  const defaultSetMutation = useMutation({
    mutationFn: () => slotService.createDefaultSet(selectedCourtId),
    onSuccess: (created) => {
      invalidateSlots();
      alert(
        created.length > 0
          ? `Đã thêm ${created.length} khung giờ mặc định. Khách có thể đặt ngay.`
          : "Tất cả khung giờ mặc định đã tồn tại."
      );
    },
    onError: (err) => alert(err.message || "Không thể thêm bộ khung giờ mặc định."),
  });

  const handleVenueChange = (e) => {
    setSelectedVenueId(e.target.value);
    setSelectedCourtId("");
  };

  const handleOpenModal = () => {
    setStartTime("08:00");
    setEndTime("09:00");
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (startTime >= endTime) {
      alert("Giờ bắt đầu phải nhỏ hơn giờ kết thúc.");
      return;
    }
    createMutation.mutate(
      { startTime, endTime },
      { onSuccess: () => setModalOpen(false) }
    );
  };

  const handleDelete = (id) => {
    if (window.confirm("Xóa mẫu khung giờ này? Khung giờ đã sinh theo ngày vẫn giữ nguyên.")) {
      deleteMutation.mutate(id);
    }
  };

  const selectedCourt = courtsList?.find((c) => String(c.id) === String(selectedCourtId));
  const isBusy =
    createMutation.isPending || deleteMutation.isPending || defaultSetMutation.isPending;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-white/5 pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Quản Lý Khung Giờ</h1>
          <p className="text-gray-400 text-sm mt-1">
            Thiết lập mẫu khung giờ cho từng sân — hệ thống tự sinh lịch 30 ngày tới
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => defaultSetMutation.mutate()}
            disabled={!selectedCourtId || isBusy}
            className="bg-white/5 hover:bg-white/10 disabled:opacity-40 text-gray-200 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center gap-1.5 transition-all border border-white/10"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            Thêm bộ mặc định
          </button>
          <button
            onClick={handleOpenModal}
            disabled={!selectedCourtId || isBusy}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-purple-600/20"
          >
            <Plus className="w-4 h-4" />
            Thêm khung giờ
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-5 rounded-2xl border-white/5">
          <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2">
            Cơ sở
          </label>
          <select
            value={selectedVenueId}
            onChange={handleVenueChange}
            className="w-full bg-[#111827]/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-purple-500/50 cursor-pointer"
          >
            <option value="">-- Chọn cơ sở --</option>
            {ownerVenues?.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>

        <div className="glass-card p-5 rounded-2xl border-white/5">
          <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2">
            Sân đấu
          </label>
          <select
            value={selectedCourtId}
            disabled={!selectedVenueId}
            onChange={(e) => setSelectedCourtId(e.target.value)}
            className="w-full bg-[#111827]/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-purple-500/50 disabled:opacity-50 cursor-pointer"
          >
            <option value="">-- Chọn sân --</option>
            {courtsList?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.sportType})
              </option>
            ))}
          </select>
        </div>
      </div>

      {!selectedCourtId ? (
        <div className="glass-card text-center p-10 rounded-2xl border-white/5">
          <p className="text-gray-400 text-xs font-semibold">
            Chọn cơ sở và sân để quản lý khung giờ.
          </p>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : isError ? (
        <div className="glass-card text-center p-10 rounded-2xl border border-red-500/20">
          <p className="text-red-400 text-sm font-semibold">
            {error?.message || "Không tải được danh sách khung giờ."}
          </p>
        </div>
      ) : slotTemplates?.length === 0 ? (
        <div className="glass-card text-center p-12 rounded-2xl border-white/5 space-y-4">
          <Clock className="w-10 h-10 text-purple-400 mx-auto opacity-60" />
          <p className="text-gray-400 text-sm">
            Sân <span className="text-white font-semibold">{selectedCourt?.name}</span> chưa có
            khung giờ nào.
          </p>
          <p className="text-gray-500 text-xs">
            Nhấn &quot;Thêm bộ mặc định&quot; để tạo nhanh 08:00–20:00, hoặc thêm từng khung giờ thủ công.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-gray-500">
            {slotTemplates.length} mẫu khung giờ · Khách đặt sân sẽ thấy các khung giờ này theo từng ngày
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {slotTemplates.map((slot) => (
              <div
                key={slot.id}
                className="glass-card p-4 rounded-xl border border-white/5 flex items-center justify-between gap-2 group hover:border-purple-500/30 transition-all"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Clock className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span className="text-xs font-bold text-white truncate">{slot.time}</span>
                </div>
                <button
                  onClick={() => handleDelete(slot.id)}
                  disabled={isBusy}
                  className="p-1.5 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                  title="Xóa mẫu khung giờ"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card w-full max-w-md rounded-3xl p-6 md:p-8 space-y-6 animate-fade-in relative border-white/10 shadow-2xl">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white border-b border-white/5 pb-2.5">
              Thêm Khung Giờ Mới
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                    Giờ bắt đầu
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-[#111827]/50 border border-white/10 rounded-xl py-2.5 px-4 text-white outline-none focus:border-purple-500/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                    Giờ kết thúc
                  </label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-[#111827]/50 border border-white/10 rounded-xl py-2.5 px-4 text-white outline-none focus:border-purple-500/50"
                  />
                </div>
              </div>

              <p className="text-[10px] text-gray-500 leading-relaxed">
                Sau khi lưu, hệ thống tự sinh khung giờ cho 30 ngày tới. Khách hàng có thể đặt ngay.
              </p>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="bg-white/5 hover:bg-white/10 text-gray-300 font-bold py-2.5 px-5 rounded-xl text-xs transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs transition-all shadow-md shadow-purple-600/20"
                >
                  {createMutation.isPending ? "Đang lưu..." : "Lưu khung giờ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
