import api, { unwrap } from "./api";
import { mapAuthUser, mapPendingOwner, mapRoleToBackend, mapUserProfile } from "../utils/mappers";

const persistSession = (authData) => {
  const user = mapAuthUser(authData);
  localStorage.setItem("accessToken", authData.token);
  localStorage.setItem("refreshToken", authData.refreshToken);
  localStorage.setItem("currentUser", JSON.stringify(user));
  window.dispatchEvent(new Event("auth-changed"));
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
    window.dispatchEvent(new Event("auth-changed"));
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
    return authService.updateProfileApi(profileData);
  },

  async getProfile() {
    const response = await api.get("/users/me");
    const profile = mapUserProfile(unwrap(response));
    const currentUser = {
      id: profile.id,
      fullName: profile.fullName,
      email: profile.email,
      phone: profile.phone,
      role: profile.role,
      isBlocked: false,
      createdAt: profile.createdAt,
    };
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
    return currentUser;
  },

  async updateProfileApi(profileData) {
    const response = await api.put("/users/me", {
      username: profileData.fullName,
      fullName: profileData.fullName,
      email: profileData.email,
      phone: profileData.phone || "",
    });
    const profile = mapUserProfile(unwrap(response));
    const updatedUser = {
      id: profile.id,
      fullName: profile.fullName,
      email: profile.email,
      phone: profile.phone,
      role: profile.role,
      isBlocked: false,
      createdAt: profile.createdAt,
    };
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    return updatedUser;
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
    const { adminService } = await import("./admin.service");
    return adminService.toggleUserBlock(id);
  },

  async forgotPassword(email) {
    const response = await api.post("/auth/forgot-password", { email });
    return unwrap(response);
  },

  async verifyOtp(email, otp) {
    const response = await api.post("/auth/verify-otp", { email, otp });
    return unwrap(response);
  },

  async resetPassword(email, otp, newPassword) {
    const response = await api.post("/auth/reset-password", { email, otp, newPassword });
    return unwrap(response);
  },

  async changePassword(currentPassword, newPassword) {
    const currentUser = authService.getCurrentUser();
    const email = currentUser?.email;
    if (!email) throw new Error("Không tìm thấy email người dùng");
    
    const response = await api.post("/auth/change-password", { email, currentPassword, newPassword });
    return unwrap(response);
  },
};
