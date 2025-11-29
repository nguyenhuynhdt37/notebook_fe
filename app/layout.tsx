import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import HydrationFix from "@/components/admin/shared/hydration-fix";
import UserDataLoader from "@/components/shared/user-loader";
const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam-pro",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Notebooks AI - Biến thông tin thành tri thức",
  description:
    "Công cụ AI thông minh giúp bạn tổ chức, phân tích và tóm tắt tài liệu một cách hiệu quả.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${beVietnamPro.variable} antialiased`}
        suppressHydrationWarning
      >
        <HydrationFix />
        <UserDataLoader>{children}</UserDataLoader>
        <Toaster />
      </body>
    </html>
  );
}
