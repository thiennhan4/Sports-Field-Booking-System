// src/mocks/bookings.js

export const bookings = [
  {
    id: 1,
    userId: 1,
    courtId: 1,
    bookingDate: "2026-06-19",
    slots: ["18:00 - 19:00", "19:00 - 20:00"],
    totalPrice: 200000,
    status: "CONFIRMED",
    paymentStatus: "PAID",
    createdAt: "2026-06-18T10:00:00Z"
  },
  {
    id: 2,
    userId: 1,
    courtId: 4,
    bookingDate: "2026-06-20",
    slots: ["08:00 - 09:00", "09:00 - 10:00"],
    totalPrice: 500000,
    status: "PENDING",
    paymentStatus: "UNPAID",
    createdAt: "2026-06-18T11:30:00Z"
  },
  {
    id: 3,
    userId: 1,
    courtId: 2,
    bookingDate: "2026-06-15",
    slots: ["17:00 - 18:00"],
    totalPrice: 120000,
    status: "CANCELLED",
    paymentStatus: "UNPAID",
    createdAt: "2026-06-14T09:00:00Z"
  }
];
