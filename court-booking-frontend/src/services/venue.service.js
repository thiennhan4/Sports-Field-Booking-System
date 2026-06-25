import api, { unwrap } from "./api";
import {
  mapCourt,
  mapSportToBackend,
  mapVenue,
  mapVenueStatusToBackend,
} from "../utils/mappers";

const fetchAllVenues = async () => {
  const response = await api.get("/venues");
  const venues = unwrap(response) || [];
  return venues.map(mapVenue);
};

const fetchCourtsForVenue = async (venueId) => {
  const response = await api.get(`/venues/${venueId}/courts`);
  const courts = unwrap(response) || [];
  return courts.map(mapCourt);
};

export const venueService = {
  async search({ district, sportType, minPrice, maxPrice } = {}) {
    let results = (await fetchAllVenues()).filter((v) => v.status === "APPROVED");

    if (district) {
      const keyword = district.toLowerCase();
      results = results.filter(
        (v) =>
          v.district.toLowerCase().includes(keyword) ||
          v.address.toLowerCase().includes(keyword)
      );
    }

    if (sportType || minPrice || maxPrice) {
      const filtered = [];
      for (const venue of results) {
        const courts = await fetchCourtsForVenue(venue.id);
        const matched = courts.some((court) => {
          let ok = true;
          if (sportType && court.sportType !== sportType) ok = false;
          if (minPrice && court.pricePerHour < Number(minPrice)) ok = false;
          if (maxPrice && court.pricePerHour > Number(maxPrice)) ok = false;
          return ok;
        });
        if (matched) filtered.push(venue);
      }
      results = filtered;
    }

    return results;
  },

  async getAll() {
    return fetchAllVenues();
  },

  async getById(id) {
    const response = await api.get(`/venues/${id}`);
    return mapVenue(unwrap(response));
  },

  async getByOwnerId(ownerId) {
    const venues = await fetchAllVenues();
    return venues.filter((v) => v.ownerId === ownerId);
  },

  async create(venueData) {
    const response = await api.post("/venues", {
      name: venueData.name,
      description: venueData.description || "",
      address: venueData.district
        ? `${venueData.address}, ${venueData.district}`
        : venueData.address,
      phone: venueData.phone || "0900000000",
    });
    return mapVenue(unwrap(response));
  },

  async update(id, updatedData) {
    const current = await venueService.getById(id);
    const response = await api.put(`/venues/${id}`, {
      name: updatedData.name ?? current.name,
      description: updatedData.description ?? current.description,
      address: updatedData.address ?? current.address,
      phone: updatedData.phone ?? current.phone,
      status: mapVenueStatusToBackend(updatedData.status ?? current.status),
    });
    return mapVenue(unwrap(response));
  },

  async delete(id) {
    const response = await api.delete(`/venues/${id}`);
    unwrap(response);
    return true;
  },

  async updateStatus(id, status) {
    const current = await venueService.getById(id);
    const response = await api.put(`/venues/${id}`, {
      name: current.name,
      description: current.description,
      address: current.address,
      phone: current.phone,
      status: mapVenueStatusToBackend(status),
    });
    return mapVenue(unwrap(response));
  },

  async getCourtsByVenueId(venueId) {
    return fetchCourtsForVenue(venueId);
  },

  async createCourt(courtData) {
    const response = await api.post(`/venues/${courtData.venueId}/courts`, {
      name: courtData.name,
      sportType: mapSportToBackend(courtData.sportType),
      pricePerHour: Number(courtData.pricePerHour),
    });
    return mapCourt(unwrap(response));
  },

  async updateCourt(id, courtData) {
    const response = await api.put(`/courts/${id}`, {
      name: courtData.name,
      sportType: mapSportToBackend(courtData.sportType),
      pricePerHour: Number(courtData.pricePerHour),
    });
    return mapCourt(unwrap(response));
  },

  async deleteCourt(id) {
    const response = await api.delete(`/courts/${id}`);
    unwrap(response);
    return true;
  },
};
