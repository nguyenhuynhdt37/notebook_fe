import Notifications from "@/components/user/notifications";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thông báo - Notebooks",
  description: "Xem tất cả thông báo của bạn",
};

export default function NotificationsPage() {
  return <Notifications />;
}
