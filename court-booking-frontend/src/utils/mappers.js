const SPORT_TO_BACKEND = {
  FOOTBALL: 1,
  TENNIS: 2,
  BADMINTON: 3,
  BASKETBALL: 4,
  VOLLEYBALL: 5,
};

const SPORT_FROM_BACKEND = {
  Football: "FOOTBALL",
  Tennis: "TENNIS",
  Badminton: "BADMINTON",
  Basketball: "BASKETBALL",
  Volleyball: "VOLLEYBALL",
  1: "FOOTBALL",
  2: "TENNIS",
  3: "BADMINTON",
  4: "BASKETBALL",
  5: "VOLLEYBALL",
};

const ROLE_TO_FRONTEND = {
  Customer: "USER",
  Owner: "OWNER",
  Admin: "ADMIN",
};

const ROLE_TO_BACKEND = {
  USER: "Customer",
  OWNER: "Owner",
  ADMIN: "Admin",
};

const VENUE_STATUS_TO_FRONTEND = {
  Active: "APPROVED",
  Inactive: "REJECTED",
  Maintenance: "PENDING",
};

const VENUE_STATUS_TO_BACKEND = {
  APPROVED: 1,
  REJECTED: 2,
  PENDING: 3,
};

const BOOKING_STATUS_TO_FRONTEND = {
  Pending: "PENDING",
  Confirmed: "CONFIRMED",
  Cancelled: "CANCELLED",
  Completed: "COMPLETED",
};

const BOOKING_STATUS_TO_BACKEND = {
  PENDING: 1,
  CONFIRMED: 2,
  CANCELLED: 3,
  COMPLETED: 4,
};

const PAYMENT_PROVIDER = {
  MOMO: 3,
  VNPAY: 4,
  BANK: 1,
};

export const formatTimeSpan = (value) => {
  if (!value) return "";
  const str = String(value);
  const [hour, minute] = str.split(":");
  return `${hour}:${minute}`;
};

export const formatSlotLabel = (startTime, endTime) =>
  `${formatTimeSpan(startTime)} - ${formatTimeSpan(endTime)}`;

/** Chuyển "08:00" hoặc "08:00:00" sang định dạng API TimeSpan */
export const toApiTimeSpan = (value) => {
  if (!value) return "";
  const str = String(value);
  const parts = str.split(":");
  if (parts.length === 2) return `${parts[0]}:${parts[1]}:00`;
  return str;
};

export const mapSlotTemplate = (slot) => ({
  id: slot.id,
  courtId: slot.courtId,
  startTime: slot.startTime,
  endTime: slot.endTime,
  time: formatSlotLabel(slot.startTime, slot.endTime),
  isActive: slot.isActive,
});

export const mapRoleToFrontend = (role) => ROLE_TO_FRONTEND[role] || role?.toUpperCase() || "USER";

export const mapRoleToBackend = (role) => ROLE_TO_BACKEND[role] || "Customer";

export const mapSportToBackend = (sportType) => SPORT_TO_BACKEND[sportType] || 3;

export const mapSportToFrontend = (sportType) =>
  SPORT_FROM_BACKEND[sportType] || String(sportType || "BADMINTON").toUpperCase();

export const mapVenueStatusToFrontend = (status) =>
  VENUE_STATUS_TO_FRONTEND[status] || "APPROVED";

export const mapVenueStatusToBackend = (status) =>
  VENUE_STATUS_TO_BACKEND[status] || 1;

export const mapBookingStatusToFrontend = (status) =>
  BOOKING_STATUS_TO_FRONTEND[status] || status?.toUpperCase() || "PENDING";

export const mapBookingStatusToBackend = (status) =>
  BOOKING_STATUS_TO_BACKEND[status] || 1;

export const mapPaymentProvider = (method) => PAYMENT_PROVIDER[method] || 1;

export const mapAuthUser = (authData) => ({
  id: authData.userId,
  fullName: authData.username,
  email: authData.email,
  role: mapRoleToFrontend(authData.role),
  isBlocked: false,
  createdAt: new Date().toISOString().split("T")[0],
});

export const mapVenue = (venue) => ({
  id: venue.id,
  ownerId: venue.ownerId,
  name: venue.name,
  address: venue.address,
  district: extractDistrict(venue.address),
  city: "Hồ Chí Minh",
  status: mapVenueStatusToFrontend(venue.status),
  description: venue.description || "",
  phone: venue.phone || "",
  rating: venue.averageRating || 0,
  reviewCount: venue.reviewCount || 0,
  imageUrl: venue.imageUrl ||
    "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=600&auto=format&fit=crop",
  ownerName: venue.ownerName,
  createdAt: venue.createdAt,
  latitude: venue.latitude ?? null,
  longitude: venue.longitude ?? null,
  minPricePerHour: venue.minPricePerHour ?? null,
  sportTypes: venue.sportTypes ?? [],
});


export const mapCourt = (court) => ({
  id: court.id,
  venueId: court.venueId,
  name: court.name,
  sportType: mapSportToFrontend(court.sportType),
  pricePerHour: Number(court.pricePerHour),
});

export const mapTimeSlot = (slot) => ({
  id: slot.id,
  time: formatSlotLabel(slot.startTime, slot.endTime),
  startTime: slot.startTime,
  endTime: slot.endTime,
  price: Number(slot.price),
  isBooked: !slot.isAvailable,
  type: "NORMAL",
});

export const mapBooking = (booking) => ({
  id: booking.id,
  userId: booking.userId,
  courtId: booking.courtId,
  venueId: booking.venueId,
  bookingDate: normalizeDate(booking.bookingDate),
  slots: [formatSlotLabel(booking.startTime, booking.endTime)],
  totalPrice: Number(booking.totalPrice),
  status: mapBookingStatusToFrontend(booking.status),
  paymentStatus:
    booking.status === "Confirmed" || booking.status === "Completed" ? "PAID" : "PENDING",
  createdAt: booking.createdAt,
  courtName: booking.courtName || "N/A",
  sportType: "N/A",
  venueName: booking.venueName || "N/A",
  venueAddress: "",
});

export const mapPendingOwner = (owner) => ({
  id: owner.id,
  fullName: owner.username,
  email: owner.email,
  phone: owner.phone,
  role: "OWNER",
  isBlocked: false,
  isPending: true,
  createdAt: normalizeDate(owner.createdAt),
});

export const mapAdminUser = (user) => ({
  id: user.id,
  fullName: user.username,
  email: user.email,
  phone: user.phone,
  role: mapRoleToFrontend(user.role),
  isBlocked: user.isBlocked,
  isPending: user.role === "Owner" && !user.isApproved,
  createdAt: normalizeDate(user.createdAt),
});

export const mapReview = (review) => ({
  id: review.id,
  rating: review.rating,
  comment: review.comment || "",
  userName: review.userName,
  venueId: review.venueId,
  venueName: review.venueName,
  bookingId: review.bookingId,
  createdAt: normalizeDate(review.createdAt),
});

export const mapUserProfile = (profile) => ({
  id: profile.id,
  fullName: profile.fullName || profile.username,
  email: profile.email,
  phone: profile.phone,
  role: mapRoleToFrontend(profile.role),
  isApproved: profile.isApproved,
  createdAt: normalizeDate(profile.createdAt),
});

const extractDistrict = (address = "") => {
  if (!address) return "";
  const parts = address.split(",");
  if (parts.length > 1) {
    return parts[parts.length - 1].trim();
  }
  const match = address.match(/Quận\s*\d+|Q\.\s*\d+|District\s*\d+/i);
  return match ? match[0] : "";
};

const normalizeDate = (value) => {
  if (!value) return "";
  return String(value).split("T")[0];
};
