import api, { unwrap } from "./api";
import { formatSlotLabel, mapSlotTemplate, toApiTimeSpan } from "../utils/mappers";

export const slotService = {
  async getByCourtId(courtId) {
    const response = await api.get(`/courts/${courtId}/slots`);
    const slots = unwrap(response) || [];
    return slots.map(mapSlotTemplate).sort((a, b) => a.startTime.localeCompare(b.startTime));
  },

  async create(courtId, { startTime, endTime }) {
    const response = await api.post(`/courts/${courtId}/slots`, {
      startTime: toApiTimeSpan(startTime),
      endTime: toApiTimeSpan(endTime),
    });
    return mapSlotTemplate(unwrap(response));
  },

  async delete(id) {
    const response = await api.delete(`/slots/${id}`);
    unwrap(response);
    return true;
  },

  /** Thêm nhiều khung giờ mặc định (08:00–20:00) */
  async createDefaultSet(courtId) {
    const presets = [
      ["08:00", "09:00"],
      ["09:00", "10:00"],
      ["10:00", "11:00"],
      ["14:00", "15:00"],
      ["15:00", "16:00"],
      ["16:00", "17:00"],
      ["17:00", "18:00"],
      ["18:00", "19:00"],
      ["19:00", "20:00"],
    ];

    const existing = await slotService.getByCourtId(courtId);
    const existingKeys = new Set(existing.map((s) => s.time));

    const created = [];
    for (const [start, end] of presets) {
      const label = `${start} - ${end}`;
      if (existingKeys.has(label)) continue;
      const slot = await slotService.create(courtId, { startTime: start, endTime: end });
      created.push(slot);
    }
    return created;
  },
};
