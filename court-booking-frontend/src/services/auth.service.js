import api, { unwrap } from "./api";
import { mapAuthUser, mapPendingOwner, mapRoleToBackend } from "../utils/mappers";

const persistSession = (authData) => {
  const user = mapAuthUser(authData);
  localStorage.setItem("accessToken", authData.token);
  localStorage.setItem("refreshToken", authData.refreshToken);
  localStorage.setItem("currentUser", JSON.stringify(user));
  return user;
};

export const authService = {
  async login({ email, password }) {
    const response = await api.post("/auth/login", { email, password });
    return persistSession(unwrap(response));
  },

  async register({ fullName, email, password, role = "USER", phone = "" }) {
    const username =
      fullName?.trim().replace(/\s+/g, "").toLowerCase() ||
      email.split("@")[0];

    const response = await api.post("/auth/register", {
      username,
      email,
      password,
      phone: phone || "0900000000",
      role: mapRoleToBackend(role),
    });

    const authData = unwrap(response);

    if (mapRoleToBackend(role) === "Owner") {
      throw new Error(
        "Đăng ký chủ sân thành công. Vui lòng chờ Admin phê duyệt trước khi đăng nhập."
      );
    }

    return persistSession(authData);
  },

  logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("currentUser");
    return Promise.resolve(true);
  },

  getCurrentUser() {
    const userStr = localStorage.getItem("currentUser");
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  updateProfile(profileData) {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return Promise.reject(new Error("Chưa đăng nhập."));

    const updatedUser = {
      ...currentUser,
      fullName: profileData.fullName || currentUser.fullName,
      email: profileData.email || currentUser.email,
    };
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    return Promise.resolve(updatedUser);
  },

  async getAllUsers() {
    const response = await api.get("/admin/owners/pending");
    const owners = unwrap(response) || [];
    return owners.map(mapPendingOwner);
  },

  async approveOwner(id) {
    const response = await api.post(`/admin/owners/${id}/approve`);
    unwrap(response);
    return true;
  },

  async rejectOwner(id) {
    const response = await api.post(`/admin/owners/${id}/reject`);
    unwrap(response);
    return true;
  },

  async toggleUserBlock(id) {
    return authService.approveOwner(id);
  },
};
