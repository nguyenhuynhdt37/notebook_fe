import type { Metadata } from "next";
import Register from "@/components/shared/register";

export const metadata: Metadata = {
  title: "Đăng ký - EduGenius",
  description:
    "Tạo tài khoản mới trên EduGenius để bắt đầu tổ chức, phân tích và tóm tắt tài liệu với AI.",
  keywords: ["đăng ký", "tạo tài khoản", "notebooks ai", "đăng ký miễn phí"],
  openGraph: {
    title: "Đăng ký - EduGenius",
    description: "Tạo tài khoản mới trên EduGenius để bắt đầu.",
    type: "website",
  },
};

export default function RegisterPage() {
  return <Register />;
}

