"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/client/axios";
import {
  UserResponse,
  UpdateUserRequest,
  ValidationErrorResponse,
} from "@/types/admin/user";
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

interface UserEditProps {
  userId: string;
}

export default function UserEdit({ userId }: UserEditProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadUser();
  }, [userId]);

  const loadUser = async () => {
    setIsLoadingUser(true);
    try {
      const response = await api.get<UserResponse>(`/admin/user/${userId}`);
      setFullName(response.data.fullName);
      setEmail(response.data.email);
    } catch (error) {
      console.error("Error fetching user:", error);
      toast.error("Không thể tải thông tin người dùng");
      router.push("/admin/users");
    } finally {
      setIsLoadingUser(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      const payload: UpdateUserRequest = {};
      if (fullName) payload.fullName = fullName;
      if (email) payload.email = email;

      const response = await api.put<UserResponse>(
        `/admin/user/${userId}`,
        payload
      );

      if (response.data) {
        toast.success("Cập nhật người dùng thành công");
        router.push("/admin/users");
      }
    } catch (error: any) {
      if (error.response?.data) {
        const errorData = error.response.data as ValidationErrorResponse;
        if (errorData.errors) {
          setErrors(errorData.errors);
          Object.values(errorData.errors).forEach((msg) => {
            toast.error(msg);
          });
        } else {
          toast.error(errorData.message || "Không thể cập nhật người dùng");
        }
      } else {
        toast.error("Đã xảy ra lỗi, vui lòng thử lại");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingUser) {
    return (
      <div className="text-center py-8 text-muted-foreground">Đang tải...</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Chỉnh sửa người dùng
          </h1>
          <p className="text-muted-foreground mt-1.5">
            Cập nhật thông tin người dùng
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Thông tin người dùng</CardTitle>
          <CardDescription className="mt-1">
            Cập nhật thông tin người dùng trong hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium">
                Họ tên
              </Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nhập họ tên"
                disabled={isLoading}
                className={errors.fullName ? "border-destructive" : ""}
              />
              {errors.fullName && (
                <p className="text-sm text-destructive">{errors.fullName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                disabled={isLoading}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="flex items-center gap-3 pt-6 border-t">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Đang cập nhật..." : "Cập nhật"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Hủy
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
