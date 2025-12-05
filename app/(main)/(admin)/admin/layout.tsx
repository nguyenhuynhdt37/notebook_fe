import { getServerCookie } from "@/api/server/cookieStore";
import { fetcher } from "@/api/server/fetcher";
import AdminHeader from "@/components/admin/shared/header";
import AdminSidebar from "@/components/admin/shared/sidebar";
import NotificationToast from "@/components/shared/notification-toast";
import { NotificationWS } from "@/hooks/websocket/notification-ws";
import { InitRealtimeNoti } from "@/hooks/websocket/NotificationHydrator";
import { NotificationsPagedResponse } from "@/types/user/notification";
import { cookies } from "next/headers";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const stores = await cookies();
  const accessToken = getServerCookie(stores, "AUTH-TOKEN");
  let notifications: NotificationsPagedResponse | null = null;

  if (accessToken) {
    const res_getNotifications = await fetcher(
      "/notifications?page=0&size=20",
      stores
    );

    if (res_getNotifications.ok) {
      notifications = await res_getNotifications.json();
    }
    console.log("notifications", notifications);
  }
  return (
    <div className="min-h-screen">
      <InitRealtimeNoti role="ADMIN" notifications={notifications} />
      <NotificationWS role_name="ADMIN" accessToken={accessToken || null} />
      <NotificationToast />
      <AdminSidebar />
      <div className="lg:ml-64 flex flex-col min-h-screen">
        <AdminHeader />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
