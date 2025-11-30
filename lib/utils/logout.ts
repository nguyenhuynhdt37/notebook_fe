import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import api from "@/api/client/axios";
import { useUserStore } from "@/stores/user";
import { toast } from "sonner";

export async function handleLogout(router: AppRouterInstance) {
  try {
    // Gọi API logout
    await api.post("/auth/logout");
  } catch (error) {
    // Không cần xử lý lỗi, vẫn logout ở client
    console.warn("Logout API error:", error);
  } finally {
    // Clear user state
    const clearUser = useUserStore.getState().clearUser;
    clearUser();

    // Redirect về login
    router.push("/login");
    toast.success("Đã đăng xuất thành công");
  }
}
