import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import HydrationFix from "@/components/admin/shared/hydration-fix";
import UserDataLoader from "@/components/shared/user-loader";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
  display: "swap",
  preload: true,
});

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL || "https://edugenius.vinhuni.edu.vn";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1a365d" },
  ],
  colorScheme: "light dark",
};

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "EduGenius - Nền tảng học tập thông minh | Đại học Vinh",
    template: "%s | EduGenius - Đại học Vinh",
  },
  description:
    "EduGenius - Nền tảng AI hỗ trợ giảng dạy và học tập thông minh của Trường Đại học Vinh. Tổng hợp tài liệu, tạo bài giảng, quiz tự động và trợ lý AI cho giảng viên và sinh viên.",
  keywords: [
    "EduGenius",
    "Đại học Vinh",
    "Vinh University",
    "AI giáo dục",
    "học tập thông minh",
    "trợ lý AI giảng viên",
    "hỗ trợ sinh viên",
    "tạo bài giảng AI",
    "quiz tự động",
    "tóm tắt tài liệu",
    "flashcard AI",
    "LMS thông minh",
  ],
  authors: [{ name: "EduGenius - Đại học Vinh", url: baseUrl }],
  creator: "Trường Đại học Vinh",
  publisher: "Trường Đại học Vinh",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: baseUrl,
    languages: {
      "vi-VN": baseUrl,
    },
  },
  category: "education",
  classification: "AI Education Platform",
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: baseUrl,
    siteName: "EduGenius - Đại học Vinh",
    title: "EduGenius - Nền tảng học tập thông minh | Đại học Vinh",
    description:
      "Nền tảng AI hỗ trợ giảng dạy và học tập thông minh. Tổng hợp tài liệu, tạo bài giảng, quiz tự động và trợ lý AI cho giảng viên và sinh viên Đại học Vinh.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "EduGenius - Nền tảng học tập thông minh Đại học Vinh",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@notebooksai",
    creator: "@notebooksai",
    title: "EduGenius - Biến thông tin thành tri thức",
    description:
      "Công cụ AI thông minh giúp bạn tổ chức, phân tích và tóm tắt tài liệu một cách hiệu quả.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
    // other: {
    //   "msvalidate.01": "your-bing-verification-code",
    //   "facebook-domain-verification": "your-facebook-verification-code",
    // },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "EduGenius",
  },
  applicationName: "EduGenius",
  referrer: "origin-when-cross-origin",
  generator: "Next.js",
};

// JSON-LD Structured Data
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "EduGenius",
  description:
    "Công cụ AI thông minh giúp bạn tổ chức, phân tích và tóm tắt tài liệu một cách hiệu quả.",
  url: baseUrl,
  applicationCategory: "EducationalApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "VND",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "1000",
  },
  author: {
    "@type": "Organization",
    name: "EduGenius",
    url: baseUrl,
  },
  provider: {
    "@type": "Organization",
    name: "EduGenius",
    url: baseUrl,
  },
  inLanguage: "vi-VN",
  isAccessibleForFree: true,
  featureList: [
    "Tổ chức tài liệu với AI",
    "Phân tích và tóm tắt tự động",
    "Chia sẻ notebook cộng đồng",
    "Chat AI thông minh",
    "Tạo flashcards tự động",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link
          rel="icon"
          href="/logo/vinh-university-logo.png"
          type="image/svg+xml"
        />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <HydrationFix />
        <UserDataLoader>{children}</UserDataLoader>
        <Toaster />
      </body>
    </html>
  );
}
