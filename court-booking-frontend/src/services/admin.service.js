import api, { unwrap } from "./api";
import { mapAdminUser } from "../utils/mappers";

export const adminService = {
  async getStats() {
    const response = await api.get("/admin/stats");
    return unwrap(response);
  },

  async getAllUsers() {
    const response = await api.get("/admin/users");
    const users = unwrap(response) || [];
    return users.map(mapAdminUser);
  },

  async toggleUserBlock(id) {
    const response = await api.post(`/admin/users/${id}/toggle-block`);
    unwrap(response);
    return true;
  },
};
