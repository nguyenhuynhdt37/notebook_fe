"use client";

import { useState, useRef } from "react";
import { useUserStore } from "@/stores/user";
import api from "@/api/client/axios";
import { toast } from "sonner";
import { Save, Upload } from "lucide-react";
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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export default function Profile() {
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user?.avatarUrl || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Vui lòng chọn file ảnh");
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const params: Record<string, string> = {};
      if (fullName.trim()) {
        params.fullName = fullName.trim();
      }

      const response = await api.put("/auth/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        params: Object.keys(params).length > 0 ? params : undefined,
      });

      const updatedUser = response.data;
      setUser(updatedUser);
      setAvatarFile(null);
      if (avatarPreview && avatarPreview.startsWith("data:")) {
        setAvatarPreview(updatedUser.avatarUrl || null);
      }
      toast.success("Cập nhật profile thành công");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(
        error.response?.data?.message || "Không thể cập nhật profile"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Đang tải thông tin...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Hồ sơ</h1>
        <p className="text-muted-foreground">
          Quản lý thông tin cá nhân và ảnh đại diện
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin cá nhân</CardTitle>
          <CardDescription>
            Cập nhật tên và ảnh đại diện của bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center gap-6 sm:flex-row">
              <div className="flex flex-col items-center gap-4">
                <Avatar className="size-24">
                  {avatarPreview && (
                    <AvatarImage
                      src={avatarPreview}
                      alt={fullName || "Avatar"}
                    />
                  )}
                  <AvatarFallback className="bg-foreground text-background text-2xl">
                    {getInitials(fullName || user.fullName)}
                  </AvatarFallback>
                </Avatar>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-2 size-4" />
                  Chọn ảnh
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              <div className="flex-1 space-y-4 w-full">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user.email}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Họ và tên</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nhập họ và tên"
                    maxLength={255}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Vai trò</Label>
                  <Input
                    id="role"
                    type="text"
                    value={user.role}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                <Save className="mr-2 size-4" />
                {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
