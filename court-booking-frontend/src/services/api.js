import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5108/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
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
