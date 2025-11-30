"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Mail, Lock, User } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import api from "@/api/client/axios";
import { AuthResponse, ErrorResponse } from "@/types/shared/auth";
import { useUserStore } from "@/stores/user";
import { User as UserType } from "@/types/user/user";
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

export default function Register() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useUserStore((state) => state.setUser);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const validateForm = () => {
    if (!email.trim()) {
      setError("Email là bắt buộc");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Email không hợp lệ");
      return false;
    }

    if (!password || password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return false;
    }

    if (!fullName.trim() || fullName.trim().length < 2) {
      setError("Họ tên phải có ít nhất 2 ký tự");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post<AuthResponse>("/auth/register", {
        email: email.trim(),
        password,
        fullName: fullName.trim(),
      });

      if (response.data) {
        const authData = response.data;

        const user: UserType = {
          id: authData.id as unknown as number,
          fullName: authData.fullName,
          email: authData.email,
          role: authData.role,
          avatarUrl: authData.avatarUrl,
        };

        setUser(user);

        toast.success("Đăng ký thành công");

        const returnUrl = searchParams.get("returnUrl");
        if (returnUrl) {
          router.push(decodeURIComponent(returnUrl));
        } else {
          const role = authData.role?.toLowerCase();
          const getRedirectPath = (userRole: string | undefined): string => {
            if (!userRole) return "/";
            switch (userRole) {
              case "admin":
              case "administrator":
                return "/admin";
              case "user":
              default:
                return "/";
            }
          };
          router.push(getRedirectPath(role));
        }
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const errorData = err.response.data as ErrorResponse;
        const errorMessage =
          errorData.message || errorData.error || "Đăng ký thất bại";
        setError(errorMessage);
        toast.error(errorMessage);
      } else {
        const errorMessage = "Đã xảy ra lỗi, vui lòng thử lại";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="space-y-6 pb-8">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-foreground flex items-center justify-center">
            <Image
              src="/logo/notebooks-logo-white-64.svg"
              alt="Notebooks AI"
              width={40}
              height={40}
            />
          </div>
          <div className="text-center space-y-2">
            <CardTitle className="text-3xl font-bold">Đăng ký</CardTitle>
            <CardDescription className="text-base">
              Tạo tài khoản mới để bắt đầu
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm font-medium">
              Họ và tên
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 size-5 text-muted-foreground" />
              <Input
                id="fullName"
                type="text"
                placeholder="Nguyễn Văn A"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (error) setError("");
                }}
                required
                disabled={isLoading}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 size-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="nhap@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                required
                disabled={isLoading}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Mật khẩu
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 size-5 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError("");
                }}
                required
                disabled={isLoading}
                className="pl-10"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive text-center">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              "Đăng ký"
            )}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Đã có tài khoản?{" "}
            <Link
              href="/login"
              className="text-foreground font-medium hover:underline"
            >
              Đăng nhập
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

