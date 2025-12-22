import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Save } from "lucide-react";

export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Cài đặt</h1>
        <p className="text-muted-foreground">
          Quản lý cài đặt hệ thống và tài khoản
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin hệ thống</CardTitle>
          <CardDescription>
            Cấu hình các thông tin cơ bản của hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="site-name">Tên hệ thống</Label>
            <Input
              id="site-name"
              defaultValue="EduGenius"
              placeholder="Nhập tên hệ thống"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="site-description">Mô tả</Label>
            <Input
              id="site-description"
              defaultValue="Công cụ AI thông minh giúp bạn tổ chức, phân tích và tóm tắt tài liệu"
              placeholder="Nhập mô tả"
            />
          </div>
          <Separator />
          <Button>
            <Save className="mr-2 size-4" />
            Lưu thay đổi
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tài khoản</CardTitle>
          <CardDescription>
            Cài đặt thông tin tài khoản của bạn
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              defaultValue="admin@notebooks.ai"
              placeholder="Nhập email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="current-password">Mật khẩu hiện tại</Label>
            <Input
              id="current-password"
              type="password"
              placeholder="Nhập mật khẩu hiện tại"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">Mật khẩu mới</Label>
            <Input
              id="new-password"
              type="password"
              placeholder="Nhập mật khẩu mới"
            />
          </div>
          <Separator />
          <Button>
            <Save className="mr-2 size-4" />
            Cập nhật mật khẩu
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

