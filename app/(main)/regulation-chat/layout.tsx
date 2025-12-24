import Header from "@/components/users/shared/header";
import NotificationToast from "@/components/shared/notification-toast";
import { cookies } from "next/headers";
import { getServerCookie } from "@/api/server/cookieStore";
import { NotificationsPagedResponse } from "@/types/user/notification";
import { fetcher } from "@/api/server/fetcher";
import { InitRealtimeNoti } from "@/hooks/websocket/NotificationHydrator";
import { NotificationWS } from "@/hooks/websocket/notification-ws";

export default async function RegulationChatLayout({
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
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <InitRealtimeNoti role="STUDENT" notifications={notifications} />
      <NotificationWS role_name="STUDENT" accessToken={accessToken || null} />
      <NotificationToast />
      <Header />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
