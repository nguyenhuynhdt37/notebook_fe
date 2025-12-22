import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "EduGenius - Nền tảng học tập thông minh | Đại học Vinh",
    short_name: "EduGenius",
    description:
      "Nền tảng AI hỗ trợ giảng dạy và học tập thông minh của Trường Đại học Vinh.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1a365d",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/logo/vinh-university-logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo/vinh-university-logo.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    categories: ["education", "productivity", "utilities"],
    lang: "vi",
    dir: "ltr",
  };
}
