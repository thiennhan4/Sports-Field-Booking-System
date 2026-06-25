// src/pages/owner/OwnerVenuesPage.jsx

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth";
import { venueService } from "../../services/venue.service";
import { Plus, Edit2, Trash2, MapPin, X } from "lucide-react";

export const OwnerVenuesPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Overlay forms controls
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null); // null means adding a new one

  // Fields
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [district, setDistrict] = useState("Quận 7");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  // Query: Fetch owner's venues
  const { data: ownerVenues, isLoading } = useQuery({
    queryKey: ["ownerVenues", user?.id],
    queryFn: () => venueService.getByOwnerId(user?.id),
    enabled: !!user?.id
  });

  // Mutation: Create Venue
  const createVenueMutation = useMutation({
    mutationFn: venueService.create,
    onSuccess: () => {
      queryClient.invalidateQueries(["ownerVenues", user?.id]);
      handleCloseModal();
    }
  });

  // Mutation: Update Venue
  const updateVenueMutation = useMutation({
    mutationFn: ({ id, data }) => venueService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["ownerVenues", user?.id]);
      handleCloseModal();
    }
  });

  // Mutation: Delete Venue
  const deleteVenueMutation = useMutation({
    mutationFn: venueService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(["ownerVenues", user?.id]);
    }
  });

  const handleOpenAddModal = () => {
    setEditingVenue(null);
    setName("");
    setAddress("");
    setDistrict("Quận 7");
    setDescription("");
    setImageUrl("");
    setModalOpen(true);
  };

  const handleOpenEditModal = (venue) => {
    setEditingVenue(venue);
    setName(venue.name);
    setAddress(venue.address);
    setDistrict(venue.district);
    setDescription(venue.description);
    setImageUrl(venue.imageUrl);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingVenue(null);
  };

  const handleDeleteClick = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sân thể thao này? Việc xóa sẽ ảnh hưởng tới các sân đấu trực thuộc.")) {
      deleteVenueMutation.mutate(id);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      name,
      address,
      district,
      description,
      imageUrl: imageUrl || undefined,
      ownerId: user.id
    };

    if (editingVenue) {
      updateVenueMutation.mutate({ id: editingVenue.id, data });
    } else {
      createVenueMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Quản Lý Cơ Sở</h1>
          <p className="text-gray-400 text-sm mt-1">Danh sách và công cụ quản trị các tổ hợp sân thể thao</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-purple-600/25"
        >
          <Plus className="w-4 h-4" />
          Đăng ký cơ sở mới
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 bg-white/5 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : ownerVenues?.length === 0 ? (
        <div className="glass-card text-center p-16 rounded-2xl border-white/5">
          <p className="text-gray-400 text-sm font-medium">Bạn chưa đăng ký cơ sở nào. Bấm nút phía trên để đăng ký.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ownerVenues?.map((venue) => (
            <div key={venue.id} className="glass-card rounded-2xl overflow-hidden border border-white/5 flex flex-col justify-between">
              <div className="relative aspect-video">
                <img src={venue.imageUrl} alt={venue.name} className="w-full h-full object-cover" />
                <div className="absolute top-3 right-3 flex items-center gap-1">
                  <span className={`inline-flex items-center gap-1 bg-black/70 backdrop-blur-md text-xs font-bold px-2.5 py-1 rounded-lg border ${
                    venue.status === "APPROVED" 
                      ? "text-emerald-400 border-emerald-500/10" 
                      : venue.status === "PENDING"
                      ? "text-amber-400 border-amber-500/10"
                      : "text-red-400 border-red-500/10"
                  }`}>
                    {venue.status === "APPROVED" ? "Đã Duyệt" : venue.status === "PENDING" ? "Chờ Duyệt" : "Từ Chối"}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/15">
                    {venue.district}
                  </span>
                  <h3 className="font-extrabold text-white text-lg leading-snug">{venue.name}</h3>
                  <p className="text-gray-400 text-xs flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    {venue.address}
                  </p>
                </div>

                <div className="border-t border-white/5 pt-4 flex gap-3">
                  <button
                    onClick={() => handleOpenEditModal(venue)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 font-bold py-2 rounded-xl text-xs border border-white/5 transition-all flex items-center justify-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Chỉnh sửa
                  </button>
                  <button
                    onClick={() => handleDeleteClick(venue.id)}
                    className="bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white font-bold py-2 px-3 rounded-xl text-xs border border-red-500/10 hover:border-transparent transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Venue Modal Dialog overlay */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card w-full max-w-lg rounded-3xl p-6 md:p-8 space-y-6 animate-fade-in relative border-white/10 shadow-2xl">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white border-b border-white/5 pb-2.5">
              {editingVenue ? "Cập Nhật Cơ Sở" : "Đăng Ký Cơ Sở Mới"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs md:text-sm">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Tên cơ sở thể thao</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Sân Cầu Lông ABC"
                  className="w-full bg-[#111827]/50 border border-white/10 rounded-xl py-2.5 px-4 text-white outline-none focus:border-purple-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Quận/Huyện</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full bg-[#111827]/50 border border-white/10 rounded-xl py-2.5 px-4 text-white outline-none focus:border-purple-500/50 cursor-pointer"
                  >
                    <option value="Quận 7">Quận 7</option>
                    <option value="Bình Thạnh">Bình Thạnh</option>
                    <option value="Quận 1">Quận 1</option>
                    <option value="Tân Bình">Tân Bình</option>
                  </select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Địa chỉ URL ảnh sân</label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-[#111827]/50 border border-white/10 rounded-xl py-2.5 px-4 text-white outline-none focus:border-purple-500/50"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Địa chỉ chi tiết</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Nguyễn Văn Linh, P. Tân Phong"
                  className="w-full bg-[#111827]/50 border border-white/10 rounded-xl py-2.5 px-4 text-white outline-none focus:border-purple-500/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Mô tả giới thiệu</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Giới thiệu về cơ sở, giờ mở cửa, trang thiết bị đi kèm..."
                  className="w-full bg-[#111827]/50 border border-white/10 rounded-xl py-2.5 px-4 text-white outline-none focus:border-purple-500/50 resize-none"
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
                  disabled={createVenueMutation.isPending || updateVenueMutation.isPending}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs transition-all shadow-md shadow-purple-600/20"
                >
                  {editingVenue ? "Cập nhật" : "Đăng ký"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
