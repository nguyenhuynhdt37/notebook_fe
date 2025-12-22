import axios from "axios";

const backendUrl =
  process.env.NEXT_PUBLIC_URL_BACKEND || "http://localhost:8386";

const api = axios.create({
  baseURL: backendUrl,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json, text/plain, */*",
  },
  withCredentials: true,
  timeout: 30000, // 30s timeout
});

// Response interceptor: xử lý lỗi auth và mạng
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Xử lý token hết hạn hoặc không có quyền
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.warn("❌ Phiên đăng nhập hết hạn hoặc không có quyền truy cập");

      // Chỉ redirect nếu đang ở client-side và KHÔNG phải trang login
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname;

        // Nếu đang ở trang login thì không redirect nữa (để component Login tự xử lý hiển thị lỗi)
        if (currentPath !== "/login") {
          // Xóa cookie AUTH-TOKEN
          document.cookie =
            "AUTH-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

          // Redirect về login với current path
          window.location.href = `/login?redirect=${encodeURIComponent(
            currentPath
          )}`;
        }
      }
    }

    // Xử lý lỗi mạng
    if (error.code === "ERR_NETWORK" || error.code === "ECONNABORTED") {
      console.error("❌ Lỗi kết nối mạng:", error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
