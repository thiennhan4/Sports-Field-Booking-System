import api, { unwrap } from "./api";
import { mapReview } from "../utils/mappers";

export const reviewService = {
  async getByVenueId(venueId) {
    const response = await api.get(`/reviews/venue/${venueId}`);
    const reviews = unwrap(response) || [];
    return reviews.map(mapReview);
  },

  async getRecent(count = 6) {
    const response = await api.get(`/reviews/recent?count=${count}`);
    const reviews = unwrap(response) || [];
    return reviews.map(mapReview);
  },

  async create({ venueId, bookingId, rating, comment }) {
    const response = await api.post("/reviews", {
      venueId,
      bookingId,
      rating,
      comment,
    });
    return mapReview(unwrap(response));
  },
};
