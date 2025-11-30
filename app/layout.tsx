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
  title: {
    default: "Notebooks AI - Biến thông tin thành tri thức",
    template: "%s | Notebooks AI",
  },
  description:
    "Notebooks AI - Công cụ AI thông minh giúp bạn tổ chức, phân tích và tóm tắt tài liệu một cách hiệu quả. Tạo notebook từ bất kỳ nguồn nào, tham gia nhóm cộng đồng và khám phá tri thức với trí tuệ nhân tạo.",
  keywords: [
    "Notebooks AI",
    "AI tổ chức tài liệu",
    "phân tích tài liệu AI",
    "tóm tắt tài liệu",
    "notebook cộng đồng",
    "công cụ AI",
    "trí tuệ nhân tạo",
    "quản lý tài liệu",
  ],
  authors: [{ name: "Notebooks AI" }],
  creator: "Notebooks AI",
  publisher: "Notebooks AI",
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "https://notebooks.ai",
    siteName: "Notebooks AI",
    title: "Notebooks AI - Biến thông tin thành tri thức",
    description:
      "Công cụ AI thông minh giúp bạn tổ chức, phân tích và tóm tắt tài liệu một cách hiệu quả. Tạo notebook từ bất kỳ nguồn nào và để trí tuệ nhân tạo làm việc cho bạn.",
    images: [
      {
        url: "/logo/notebooks-logo.svg",
        width: 1200,
        height: 630,
        alt: "Notebooks AI - Logo công cụ AI tổ chức và phân tích tài liệu",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
  title: "Notebooks AI - Biến thông tin thành tri thức",
  description:
    "Công cụ AI thông minh giúp bạn tổ chức, phân tích và tóm tắt tài liệu một cách hiệu quả.",
    images: ["/logo/notebooks-logo.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
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
