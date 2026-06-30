import api, { unwrap } from "./api";

export const settingsService = {
  async getSettings() {
    const response = await api.get("/users/me/settings");
    return unwrap(response);
  },

  async updateSettings({ darkMode, emailNotifications, language }) {
    const response = await api.put("/users/me/settings", {
      darkMode,
      emailNotifications,
      language,
    });
    return unwrap(response);
  },
};
