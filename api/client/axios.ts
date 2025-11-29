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
});

// Response interceptor: trả luôn data
api.interceptors.response.use(
  (response) => {
    console.log("Response:", response);
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.warn("❌ Phiên đăng nhập hết hạn hoặc cookie không hợp lệ");
      // 👉 có thể redirect /login hoặc refresh token ở đây
    }
    return Promise.reject(error);
  }
);

export default api;
