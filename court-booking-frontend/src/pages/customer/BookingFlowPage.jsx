// src/pages/customer/BookingFlowPage.jsx

import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { venueService } from "../../services/venue.service";
import { bookingService } from "../../services/booking.service";
import { useAuth } from "../../hooks/useAuth";
import { Calendar, Clock, CreditCard, ChevronRight, CheckCircle2, ChevronLeft, ShieldAlert } from "lucide-react";

export const BookingFlowPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, switchRole } = useAuth();

  // Wizard state
  const [step, setStep] = useState(1);

  // Selections
  const [selectedVenueId, setSelectedVenueId] = useState(searchParams.get("venueId") || "");
  const [selectedCourtId, setSelectedCourtId] = useState(searchParams.get("courtId") || "");
  
  // Format today's date YYYY-MM-DD
  const getTodayString = () => new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("MOMO");

  // React Queries
  // 1. Fetch approved venues list
  const { data: venuesList } = useQuery({
    queryKey: ["venuesSelect"],
    queryFn: () => venueService.search()
  });

  // 2. Fetch courts for selected venue
  const { data: courtsList } = useQuery({
    queryKey: ["courtsSelect", selectedVenueId],
    queryFn: () => venueService.getCourtsByVenueId(selectedVenueId),
    enabled: !!selectedVenueId
  });

  // 3. Fetch slots availability for selected court and date
  const { data: slotsAvailability, isLoading: isSlotsLoading, isError: isSlotsError, error: slotsError, refetch: refetchSlots } = useQuery({
    queryKey: ["slotsAvailability", selectedCourtId, selectedDate],
    queryFn: () => bookingService.getAvailableSlots(selectedCourtId, selectedDate),
    enabled: !!selectedCourtId && !!selectedDate
  });

  // Refetch slots when date or court updates
  useEffect(() => {
    if (selectedCourtId && selectedDate) {
      refetchSlots();
      setSelectedSlots([]); // Reset selected slots when parameters change
    }
  }, [selectedCourtId, selectedDate, refetchSlots]);

  // Reset court selection if venue changes
  const handleVenueChange = (e) => {
    setSelectedVenueId(e.target.value);
    setSelectedCourtId("");
    setSelectedSlots([]);
  };

  // Toggle slot selection
  const handleSlotToggle = (slotId) => {
    if (selectedSlots.includes(slotId)) {
      setSelectedSlots(selectedSlots.filter((s) => s !== slotId));
    } else {
      setSelectedSlots([...selectedSlots, slotId]);
    }
  };

  const currentVenue = venuesList?.find((v) => String(v.id) === String(selectedVenueId));
  const currentCourt = courtsList?.find((c) => String(c.id) === String(selectedCourtId));

  // Pricing calculations
  const pricePerHour = currentCourt ? currentCourt.pricePerHour : 0;
  const subtotal = selectedSlots.length * pricePerHour;
  const serviceFee = subtotal > 0 ? 10000 : 0; // Flat 10k fee
  const totalAmount = subtotal + serviceFee;

  // React Mutation for booking submission
  const bookingMutation = useMutation({
    mutationFn: bookingService.createBooking,
    onSuccess: () => {
      navigate("/my-bookings");
    },
    onError: (error) => {
      alert(error.message || "Đặt sân thất bại.");
    }
  });

  const handleConfirmBooking = () => {
    if (!user) return;
    bookingMutation.mutate({
      courtId: selectedCourtId,
      bookingDate: selectedDate,
      slots: selectedSlots,
      paymentMethod,
    });
  };

  // Access check guard
  if (!user) {
    return (
      <div className="max-w-md w-full mx-auto my-12 animate-fade-in">
        <div className="glass-card p-8 rounded-3xl border border-white/5 text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Yêu cầu Đăng Nhập</h2>
          <p className="text-gray-400 text-xs leading-relaxed">
            Bạn cần đăng nhập bằng tài khoản Khách hàng để thực hiện quy trình đặt sân và thanh toán.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => switchRole("USER")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs transition-all"
            >
              Đăng nhập nhanh (Khách hàng)
            </button>
            <button
              onClick={() => navigate("/login")}
              className="bg-white/5 hover:bg-white/10 text-gray-300 font-bold py-2.5 rounded-xl text-xs border border-white/5 transition-all"
            >
              Đăng nhập thủ công
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl w-full mx-auto space-y-8 animate-fade-in">
      <div className="border-b border-white/5 pb-4">
        <h1 className="text-3xl font-extrabold text-white">Quy Trình Đặt Sân</h1>
        <p className="text-gray-400 text-sm mt-1">Đăng ký lịch tập nhanh chóng qua 3 bước</p>
      </div>

      {/* Stepper Progress Indicator */}
      <div className="grid grid-cols-3 gap-4 pb-4 border-b border-white/5 text-center">
        <div className={`flex flex-col items-center pb-2 ${step >= 1 ? "border-b-2 border-indigo-500 text-indigo-400" : "text-gray-500"}`}>
          <span className="text-[10px] font-bold uppercase tracking-wider">Bước 1</span>
          <span className="text-xs font-bold mt-1">Chọn Sân & Ngày</span>
        </div>
        <div className={`flex flex-col items-center pb-2 ${step >= 2 ? "border-b-2 border-indigo-500 text-indigo-400" : "text-gray-500"}`}>
          <span className="text-[10px] font-bold uppercase tracking-wider">Bước 2</span>
          <span className="text-xs font-bold mt-1">Chọn Khung Giờ</span>
        </div>
        <div className={`flex flex-col items-center pb-2 ${step >= 3 ? "border-b-2 border-indigo-500 text-indigo-400" : "text-gray-500"}`}>
          <span className="text-[10px] font-bold uppercase tracking-wider">Bước 3</span>
          <span className="text-xs font-bold mt-1">Xác Nhận & Thanh Toán</span>
        </div>
      </div>

      {/* Step 1 Content: Venue and Date Selection */}
      {step === 1 && (
        <div className="glass-card p-8 rounded-3xl border border-white/5 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400" />
            1. Chọn cơ sở, sân đấu và ngày chơi bóng
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Venue Dropdown */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Cơ sở thể thao</label>
              <select
                value={selectedVenueId}
                onChange={handleVenueChange}
                className="w-full bg-[#111827]/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50 appearance-none cursor-pointer"
              >
                <option value="">-- Chọn cơ sở --</option>
                {venuesList?.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.district})
                  </option>
                ))}
              </select>
            </div>

            {/* Court Dropdown */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Sân đấu cụ thể</label>
              <select
                value={selectedCourtId}
                disabled={!selectedVenueId}
                onChange={(e) => setSelectedCourtId(e.target.value)}
                className="w-full bg-[#111827]/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50 disabled:opacity-50 appearance-none cursor-pointer"
              >
                <option value="">-- Chọn sân đấu --</option>
                {courtsList?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} - {c.pricePerHour.toLocaleString()}đ/h ({c.sportType})
                  </option>
                ))}
              </select>
            </div>

            {/* Date Input */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Ngày sử dụng sân</label>
              <input
                type="date"
                min={getTodayString()}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-[#111827]/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => setStep(2)}
              disabled={!selectedVenueId || !selectedCourtId || !selectedDate}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white font-bold py-3 px-8 rounded-xl text-xs flex items-center gap-1.5 transition-all"
            >
              Tiếp tục
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2 Content: Slot Selection */}
      {step === 2 && (
        <div className="glass-card p-8 rounded-3xl border border-white/5 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            2. Chọn khung giờ tập ({selectedDate})
          </h2>

          <div className="bg-[#111827]/30 border border-white/5 rounded-2xl p-4 flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-gray-300">
              <div className="w-4 h-4 rounded bg-indigo-600"></div>
              <span>Đang chọn</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-300">
              <div className="w-4 h-4 rounded bg-[#111827] border border-white/10"></div>
              <span>Trống (Có thể đặt)</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-300">
              <div className="w-4 h-4 rounded bg-red-950/40 text-red-500 border border-red-500/10"></div>
              <span>Đã được đặt</span>
            </div>
          </div>

          {isSlotsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : isSlotsError ? (
            <div className="text-center p-8 rounded-2xl border border-red-500/20 bg-red-950/10">
              <p className="text-red-400 text-sm font-semibold">
                {slotsError?.message || "Không tải được khung giờ. Kiểm tra backend và Redis."}
              </p>
              <button
                onClick={() => refetchSlots()}
                className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 font-bold"
              >
                Thử lại
              </button>
            </div>
          ) : !slotsAvailability?.length ? (
            <div className="text-center p-8 rounded-2xl border border-white/5 bg-[#111827]/30">
              <p className="text-gray-400 text-sm">
                Chưa có khung giờ cho sân này vào ngày {selectedDate}.
              </p>
              <p className="text-gray-500 text-xs mt-2">
                Chủ sân cần thêm mẫu khung giờ tại Owner Portal → Quản lý Khung giờ.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {slotsAvailability?.map((slot) => {
                const isSelected = selectedSlots.includes(slot.id);
                return (
                  <button
                    key={slot.id}
                    disabled={slot.isBooked}
                    onClick={() => handleSlotToggle(slot.id)}
                    className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all text-center ${
                      slot.isBooked
                        ? "bg-red-950/20 text-red-400/50 border-red-500/10 cursor-not-allowed"
                        : isSelected
                        ? "bg-indigo-600 text-white border-indigo-400 glow-primary"
                        : "bg-[#111827]/40 text-gray-300 border-white/10 hover:border-indigo-500/30"
                    }`}
                  >
                    <span>{slot.time}</span>
                    {slot.isBooked && (
                      <span className="block text-[9px] font-normal text-red-400 mt-0.5">Đã đặt</span>
                    )}
                    {!slot.isBooked && slot.type === "PEAK" && (
                      <span className="block text-[8px] font-semibold text-pink-400 uppercase tracking-widest mt-0.5">Cao Điểm</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          <div className="border-t border-white/5 pt-6 flex justify-between items-center">
            <button
              onClick={() => setStep(1)}
              className="text-gray-400 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Quay lại
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={selectedSlots.length === 0}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white font-bold py-3 px-8 rounded-xl text-xs flex items-center gap-1.5 transition-all"
            >
              Tiếp tục
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3 Content: Confirmation and Payment */}
      {step === 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Details & checkout summary */}
          <div className="md:col-span-2 glass-card p-8 rounded-3xl border border-white/5 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-400" />
              3. Chọn phương thức thanh toán
            </h2>

            <div className="space-y-3">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                Phương Thức
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label
                  className={`flex flex-col items-center p-4 rounded-xl border text-center cursor-pointer transition-all ${
                    paymentMethod === "MOMO"
                      ? "bg-pink-500/10 border-pink-500 text-pink-400"
                      : "bg-[#111827]/30 border-white/10 text-gray-400 hover:bg-[#111827]/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="MOMO"
                    checked={paymentMethod === "MOMO"}
                    onChange={() => setPaymentMethod("MOMO")}
                    className="sr-only"
                  />
                  <span className="text-xs font-bold">Ví MoMo</span>
                  <span className="text-[9px] mt-0.5 text-gray-400">Thanh toán tự động</span>
                </label>

                <label
                  className={`flex flex-col items-center p-4 rounded-xl border text-center cursor-pointer transition-all ${
                    paymentMethod === "VNPAY"
                      ? "bg-blue-500/10 border-blue-500 text-blue-400"
                      : "bg-[#111827]/30 border-white/10 text-gray-400 hover:bg-[#111827]/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="VNPAY"
                    checked={paymentMethod === "VNPAY"}
                    onChange={() => setPaymentMethod("VNPAY")}
                    className="sr-only"
                  />
                  <span className="text-xs font-bold">Cổng VNPay</span>
                  <span className="text-[9px] mt-0.5 text-gray-400">Thẻ ngân hàng / QR</span>
                </label>

                <label
                  className={`flex flex-col items-center p-4 rounded-xl border text-center cursor-pointer transition-all ${
                    paymentMethod === "BANK"
                      ? "bg-indigo-500/10 border-indigo-500 text-indigo-400"
                      : "bg-[#111827]/30 border-white/10 text-gray-400 hover:bg-[#111827]/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="BANK"
                    checked={paymentMethod === "BANK"}
                    onChange={() => setPaymentMethod("BANK")}
                    className="sr-only"
                  />
                  <span className="text-xs font-bold">Chuyển Khoản</span>
                  <span className="text-[9px] mt-0.5 text-gray-400">Duyệt sau (24h)</span>
                </label>
              </div>
            </div>

            <div className="bg-[#111827]/30 border border-white/5 rounded-2xl p-5 text-xs text-gray-400 leading-relaxed">
              <p className="font-semibold text-white mb-1">Chính sách đặt sân:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Đặt sân thành công sẽ tự động tạo đơn ở trạng thái <span className="text-white">Confirmed</span> (đối với MoMo/VNPay).</li>
                <li>Huỷ lịch đặt sân miễn phí trước 24 giờ.</li>
                <li>Vui lòng đến trước 10 phút để nhận sân đấu.</li>
              </ul>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => setStep(2)}
                className="text-gray-400 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Quay lại
              </button>
            </div>
          </div>

          {/* Pricing Billing Summary Widget (Right 1 col) */}
          <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-6 flex flex-col justify-between h-fit">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white border-b border-white/5 pb-2.5">
                Chi tiết đặt sân
              </h3>

              <div className="space-y-3.5 text-xs">
                <div>
                  <p className="text-gray-400">Cơ sở</p>
                  <p className="font-semibold text-white">{currentVenue?.name}</p>
                </div>
                <div>
                  <p className="text-gray-400">Sân đấu</p>
                  <p className="font-semibold text-white">{currentCourt?.name}</p>
                </div>
                <div>
                  <p className="text-gray-400">Ngày</p>
                  <p className="font-semibold text-white">{selectedDate}</p>
                </div>
                <div>
                  <p className="text-gray-400">Khung giờ đặt</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedSlots.map((slotId) => {
                      const slot = slotsAvailability?.find((s) => s.id === slotId);
                      return (
                        <span
                          key={slotId}
                          className="bg-indigo-500/10 text-indigo-400 text-[10px] px-2 py-0.5 rounded border border-indigo-500/15 font-medium"
                        >
                          {slot?.time || slotId}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="border-t border-white/5 pt-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Tiền sân ({selectedSlots.length} giờ)</span>
                  <span className="text-white font-semibold">{subtotal.toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Phí tiện ích (app fee)</span>
                  <span className="text-white font-semibold">{serviceFee.toLocaleString()}đ</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 border-t border-white/5 pt-4">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-bold text-white">Tổng cộng</span>
                <span className="text-xl font-extrabold text-indigo-400">
                  {totalAmount.toLocaleString()}đ
                </span>
              </div>

              <button
                onClick={handleConfirmBooking}
                disabled={bookingMutation.isPending}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white font-bold py-3.5 rounded-xl text-xs transition-all shadow-md shadow-indigo-600/25 flex items-center justify-center gap-1.5"
              >
                {bookingMutation.isPending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Xác nhận đặt sân
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
