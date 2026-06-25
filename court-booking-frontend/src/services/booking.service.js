import api, { unwrap } from "./api";
import {
  mapBooking,
  mapBookingStatusToBackend,
  mapPaymentProvider,
  mapTimeSlot,
} from "../utils/mappers";

export const bookingService = {
  async getAvailableSlots(courtId, date) {
    const response = await api.get(`/courts/${courtId}/availability`, {
      params: { date },
    });
    const slots = unwrap(response) || [];
    return slots.map(mapTimeSlot);
  },

  async createBooking({ courtId, bookingDate, slots, paymentMethod }) {
    const timeSlotIds = Array.isArray(slots) ? slots : [];
    if (!timeSlotIds.length) {
      throw new Error("Vui lòng chọn ít nhất một khung giờ.");
    }

    const bookingResponse = await api.post("/bookings", {
      courtId,
      bookingDate,
      timeSlotIds,
    });
    const booking = mapBooking(unwrap(bookingResponse));

    if (paymentMethod === "MOMO" || paymentMethod === "VNPAY") {
      const provider = mapPaymentProvider(paymentMethod);
      const urlResponse = await api.post("/payments/create-url", null, {
        params: { bookingId: booking.id, provider },
      });
      const paymentUrl = unwrap(urlResponse);
      if (paymentUrl) {
        window.location.href = paymentUrl;
        return booking;
      }
    }

    await api.post("/payments", {
      bookingId: booking.id,
      provider: mapPaymentProvider(paymentMethod || "BANK"),
    });

    return booking;
  },

  async getUserBookings() {
    const response = await api.get("/bookings/my");
    const bookings = unwrap(response) || [];
    return bookings.map(mapBooking).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async getOwnerBookings() {
    const response = await api.get("/bookings/owner");
    const bookings = unwrap(response) || [];
    return bookings.map(mapBooking).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async getAllBookings() {
    const response = await api.get("/bookings");
    const bookings = unwrap(response) || [];
    return bookings.map(mapBooking).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async updateBookingStatus(id, status) {
    if (status === "CANCELLED") {
      const response = await api.put(`/bookings/${id}/cancel`);
      unwrap(response);
      return { id, status: "CANCELLED" };
    }

    const response = await api.put(`/bookings/${id}/status`, null, {
      params: { status: mapBookingStatusToBackend(status) },
    });
    unwrap(response);
    return { id, status };
  },

  async getRevenueByMonth() {
    const ownerBookings = (await bookingService.getOwnerBookings()).filter(
      (b) => b.status === "CONFIRMED"
    );

    const monthNames = [
      "Tháng 1",
      "Tháng 2",
      "Tháng 3",
      "Tháng 4",
      "Tháng 5",
      "Tháng 6",
      "Tháng 7",
      "Tháng 8",
      "Tháng 9",
      "Tháng 10",
      "Tháng 11",
      "Tháng 12",
    ];

    return monthNames.map((month, index) => {
      const monthStr = String(index + 1).padStart(2, "0");
      const amount = ownerBookings
        .filter((b) => b.bookingDate.split("-")[1] === monthStr)
        .reduce((sum, b) => sum + b.totalPrice, 0);
      return { month, amount };
    });
  },
};
