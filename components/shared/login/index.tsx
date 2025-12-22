"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Mail, Lock, ArrowRight, Sparkles } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import api from "@/api/client/axios";
import { AuthResponse, ErrorResponse } from "@/types/shared/auth";
import { useUserStore } from "@/stores/user";
import { User } from "@/types/user/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");
  const setUser = useUserStore((state) => state.setUser);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await api.post<AuthResponse>("/auth/login", {
        email,
        password,
      });

      if (response.data) {
        // Sau khi login thành công (có cookie), gọi /auth/me để lấy thông tin user đầy đủ (bao gồm avatar chuẩn)
        const meResponse = await api.get<User>("/auth/me");
        const user = meResponse.data;

        setUser(user);

        const authData = response.data; // Vẫn dùng đề lấy role cho redirect logic ban đầu nếu cần
        const role = authData.role?.toLowerCase();

        const getRedirectPath = (userRole: string | undefined): string => {
          // Ưu tiên redirect URL từ query param, trừ khi nó là trang login/register
          if (
            redirectUrl &&
            !redirectUrl.startsWith("/login") &&
            !redirectUrl.startsWith("/register") &&
            !redirectUrl.startsWith("/forgot-password")
          ) {
            return redirectUrl;
          }

          // Fallback: redirect theo role
          if (!userRole) return "/";
          switch (userRole) {
            case "admin":
            case "administrator":
              return "/admin";
            case "teacher":
            case "lecturer":
              return "/lecturer";
            case "user":
            default:
              return "/";
          }
        };

        toast.success("Đăng nhập thành công");

        // Cập nhật lại server state (UserLoader) để đảm bảo đồng bộ
        router.refresh();

        router.push(getRedirectPath(role));
      }
    } catch (err: unknown) {
      // console.error("Login error:", err); // Comment out to avoid Next.js error overlay

      let errorMessage = "Đã xảy ra lỗi, vui lòng thử lại";

      if (axios.isAxiosError(err)) {
        if (err.response) {
          const status = err.response.status;
          const data = err.response.data as ErrorResponse;

          if (status === 401) {
            errorMessage = "Email hoặc mật khẩu không chính xác";
          } else if (status === 403) {
            errorMessage = "Tài khoản không có quyền truy cập";
          } else if (status === 404) {
            errorMessage = "Tài khoản không tồn tại";
          } else if (data?.error) {
            errorMessage = data.error;
          }
        } else if (err.code === "ERR_NETWORK") {
          errorMessage =
            "Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng.";
        }
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="relative w-full max-w-md">
        {/* Logo & Branding */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Image
                src="/logo/vinh-university-logo.png"
                alt="Đại học Vinh"
                width={56}
                height={56}
                className="rounded-xl"
              />
            </div>
            <h1 className="text-2xl font-bold text-foreground">EduGenius</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Trường Đại học Vinh
            </p>
          </Link>
        </div>

        {/* Login Card */}
        <Card className="border-border/50">
          <CardHeader className="text-center pb-4">
            <div className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-muted text-xs font-medium mb-3 mx-auto">
              <Sparkles className="size-3" />
              Nền tảng AI cho giáo dục
            </div>
            <CardTitle className="text-2xl">Đăng nhập</CardTitle>
            <CardDescription>Chào mừng bạn trở lại EduGenius</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@vinhuni.edu.vn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pl-10"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive text-center">
                    {error}
                  </p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full group"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    Đăng nhập
                    <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Chưa có tài khoản?{" "}
                <Link
                  href="/register"
                  className="text-foreground font-medium hover:underline"
                >
                  Đăng ký ngay
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-8">
          © {new Date().getFullYear()} Trường Đại học Vinh
        </p>
      </div>
    </div>
  );
}
