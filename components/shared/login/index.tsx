"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, Mail, Lock } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";

export default function Login() {
  const router = useRouter();
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
        const authData = response.data;

        const user: User = {
          id: authData.id,
          fullName: authData.fullName,
          email: authData.email,
          role: authData.role,
          avatarUrl: authData.avatarUrl,
        };
        console.log("user", user);
        setUser(user);

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

        toast.success("Đăng nhập thành công");
        router.push(getRedirectPath(role));
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const errorData = err.response.data as ErrorResponse;
        const errorMessage = errorData.error || "Đăng nhập thất bại";
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
            <CardTitle className="text-3xl font-bold">Đăng nhập</CardTitle>
            <CardDescription className="text-base">
              Chào mừng bạn trở lại
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
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
                onChange={(e) => setEmail(e.target.value)}
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
                placeholder="Nhập mật khẩu của bạn"
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
              "Đăng nhập"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
