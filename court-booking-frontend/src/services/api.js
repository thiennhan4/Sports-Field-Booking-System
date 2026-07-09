import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5108/api",
  headers: { "Content-Type": "application/json" },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem("refreshToken");
      const accessToken = localStorage.getItem("accessToken");

      if (!refreshToken || !accessToken) {
        const message =
          error.response?.data?.message ||
          error.response?.data?.title ||
          error.message ||
          "Đã xảy ra lỗi khi gọi API.";
        return Promise.reject(new Error(message));
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5108/api"}/auth/refresh-token`,
          { token: accessToken, refreshToken }
        );
        const body = response.data?.data ?? response.data;
        const newToken = body.token;
        const newRefreshToken = body.refreshToken;

        localStorage.setItem("accessToken", newToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
        if (currentUser && body.username) {
          currentUser.fullName = body.username;
          currentUser.email = body.email;
          localStorage.setItem("currentUser", JSON.stringify(currentUser));
        }

        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("currentUser");
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const message =
      error.response?.data?.message ||
      error.response?.data?.title ||
      error.message ||
      "Đã xảy ra lỗi khi gọi API.";
    return Promise.reject(new Error(message));
  }
);

export const unwrap = (response) => {
  const body = response.data;
  if (body && body.success === false) {
    throw new Error(body.message || "Yêu cầu thất bại.");
  }
  return body?.data ?? body;
};

export default api;
