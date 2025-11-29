"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, Shield, Calendar } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/client/axios";
import { UserResponse } from "@/types/admin/user";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserDetailProps {
  userId: string;
}

export default function UserDetail({ userId }: UserDetailProps) {
  const router = useRouter();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, [userId]);

  const loadUser = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<UserResponse>(`/admin/user/${userId}`);
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching user:", error);
      toast.error("Không thể tải thông tin người dùng");
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">Đang tải...</div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Không tìm thấy người dùng
      </div>
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
            Chi tiết người dùng
          </h1>
          <p className="text-muted-foreground mt-1.5">
            Thông tin chi tiết của người dùng
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Thông tin cá nhân</CardTitle>
          <CardDescription className="mt-1">
            Chi tiết thông tin người dùng trong hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            <div className="flex items-center gap-6 pb-6 border-b">
              <Avatar className="h-20 w-20 border-2">
                {user.avatarUrl && (
                  <AvatarImage src={user.avatarUrl} alt={user.fullName} />
                )}
                <AvatarFallback className="bg-foreground text-background text-xl font-semibold">
                  {getInitials(user.fullName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  {user.fullName}
                </h2>
                <p className="text-muted-foreground mt-1">{user.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Mail className="size-4" />
                  Email
                </div>
                <p className="text-foreground text-sm">{user.email}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Shield className="size-4" />
                  Vai trò
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-foreground">
                  {user.role}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Calendar className="size-4" />
                  Ngày tạo
                </div>
                <p className="text-foreground text-sm">{formatDate(user.createdAt)}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  Trạng thái
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-foreground">
                  {user.active === null
                    ? "Chưa xác định"
                    : user.active
                    ? "Hoạt động"
                    : "Không hoạt động"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
