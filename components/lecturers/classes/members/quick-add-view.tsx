"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
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
import api from "@/api/client/axios";
import { QuickAddStudentResult } from "@/types/lecturer";

interface QuickAddStudentViewProps {
  classId: string;
}

export default function QuickAddStudentView({
  classId,
}: QuickAddStudentViewProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [studentCode, setStudentCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  const previewEmail = studentCode ? `${studentCode}@vinhuni.edu.vn` : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentCode.trim() || !fullName.trim()) {
      toast.error("Vui lòng nhập đầy đủ MSSV và họ tên");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post<QuickAddStudentResult>(
        "/lecturer/manual-class-management/quick-add-student",
        {
          classId,
          studentCode: studentCode.trim(),
          fullName: fullName.trim(),
          dateOfBirth: dateOfBirth || undefined,
        }
      );

      const result = response.data;

      if (result.success) {
        toast.success(result.message, {
          description: (
            <div className="text-sm space-y-1 mt-2">
              <p>📧 Email: {result.email}</p>
              {result.userCreated && <p>✓ Đã tạo tài khoản mới</p>}
              {result.emailSent && <p>✓ Đã gửi email thông báo</p>}
              {result.addedToNotebook && <p>✓ Đã thêm vào Notebook</p>}
            </div>
          ),
        });

        // Redirect back to member list
        router.push(`/lecturer/classes/${classId}/members`);
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Không thể thêm sinh viên";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-6 px-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          disabled={loading}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Thêm sinh viên nhanh
          </h1>
          <p className="text-sm text-muted-foreground">
            Tạo tài khoản và thêm vào lớp tự động
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin sinh viên</CardTitle>
          <CardDescription>
            Email và mật khẩu sẽ được tạo tự động từ mã sinh viên
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-8 md:grid-cols-3">
              {/* Left Column: Inputs */}
              <div className="md:col-span-2 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="studentCode">
                    Mã sinh viên <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="studentCode"
                    placeholder="VD: 2150001"
                    value={studentCode}
                    onChange={(e) => setStudentCode(e.target.value)}
                    autoFocus
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">
                    Họ và tên <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    placeholder="VD: Nguyễn Văn A"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Ngày sinh</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={loading}
                    className="flex-1"
                  >
                    Hủy
                  </Button>
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading && (
                      <Loader2 className="size-4 mr-2 animate-spin" />
                    )}
                    {loading ? "Đang thêm..." : "Thêm sinh viên"}
                  </Button>
                </div>
              </div>

              {/* Right Column: Preview */}
              <div className="md:col-span-1">
                <div className="sticky top-6 rounded-xl bg-muted/50 border p-6 space-y-4">
                  <div>
                    <h3 className="font-medium">Thông tin tự động</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Hệ thống sẽ tự động tạo tài khoản với thông tin sau:
                    </p>
                  </div>

                  {previewEmail ? (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          Email đăng nhập
                        </Label>
                        <div className="font-mono text-sm font-medium bg-background border rounded px-3 py-2 text-primary break-all">
                          {previewEmail}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          Mật khẩu mặc định
                        </Label>
                        <div className="font-mono text-sm font-medium bg-background border rounded px-3 py-2 text-primary break-all">
                          {previewEmail}
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground italic border-t pt-3 mt-3">
                        <p>✓ Tự động tạo user</p>
                        <p>✓ Tự động gửi email</p>
                        <p>✓ Tự động thêm vào Notebook</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground py-8 text-center italic">
                      Nhập mã sinh viên để xem trước thông tin tài khoản
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
