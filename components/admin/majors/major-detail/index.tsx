"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  GraduationCap,
  Users,
  BookOpen,
  Building2,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/api/client/axios";
import { MajorDetailResponse } from "@/types/admin/major";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface MajorDetailProps {
  majorId: string;
}

export default function MajorDetail({ majorId }: MajorDetailProps) {
  const [major, setMajor] = useState<MajorDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMajor = async () => {
      try {
        const response = await api.get<MajorDetailResponse>(
          `/admin/major/${majorId}`
        );
        setMajor(response.data);
      } catch {
        toast.error("Không thể tải thông tin ngành học");
      } finally {
        setIsLoading(false);
      }
    };
    loadMajor();
  }, [majorId]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded bg-muted animate-pulse" />
          <div className="space-y-2">
            <div className="h-8 w-64 rounded bg-muted animate-pulse" />
            <div className="h-4 w-48 rounded bg-muted animate-pulse" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
        <div className="h-80 rounded-lg bg-muted animate-pulse" />
      </div>
    );
  }

  if (!major) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-3 mb-4">
          <GraduationCap className="size-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground mb-1">
          Không tìm thấy ngành học
        </p>
        <Button variant="outline" asChild className="mt-4">
          <Link href="/admin/majors">Quay lại danh sách</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/majors">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{major.name}</h1>
            <p className="text-muted-foreground mt-1">
              Mã: <span className="font-mono font-medium">{major.code}</span>
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/admin/majors/${majorId}/edit`}>
            <Pencil className="mr-2 size-4" />
            Chỉnh sửa
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Đơn vị</CardTitle>
            <Building2 className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">
              {major.orgUnit?.name || "Chưa xác định"}
            </p>
            {major.orgUnit && (
              <p className="text-xs text-muted-foreground">
                {major.orgUnit.code}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Trạng thái</CardTitle>
            <GraduationCap className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                major.isActive
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {major.isActive ? "Hoạt động" : "Không hoạt động"}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Môn học</CardTitle>
            <BookOpen className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{major.subjectCount}</p>
            <p className="text-xs text-muted-foreground">trong chương trình</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Sinh viên</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{major.studentCount}</p>
            <p className="text-xs text-muted-foreground">đang theo học</p>
          </CardContent>
        </Card>
      </div>

      {/* Subjects Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="size-5" />
            <CardTitle>Chương trình đào tạo</CardTitle>
          </div>
          <CardDescription>
            Danh sách các môn học trong chương trình đào tạo
          </CardDescription>
        </CardHeader>
        <CardContent>
          {major.subjects && major.subjects.length > 0 ? (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã môn</TableHead>
                    <TableHead>Tên môn học</TableHead>
                    <TableHead className="text-center">Tín chỉ</TableHead>
                    <TableHead className="text-center">Học kỳ</TableHead>
                    <TableHead className="text-center">Loại</TableHead>
                    <TableHead>Khối kiến thức</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {major.subjects.map((subject) => (
                    <TableRow key={subject.id}>
                      <TableCell>
                        <span className="font-mono text-sm font-medium">
                          {subject.code}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{subject.name}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        {subject.credit ?? "—"}
                      </TableCell>
                      <TableCell className="text-center">
                        {subject.termNo ?? "—"}
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            subject.isRequired
                              ? "bg-foreground text-background"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {subject.isRequired ? "Bắt buộc" : "Tự chọn"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {subject.knowledgeBlock ?? "—"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-3 mb-4">
                <BookOpen className="size-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">
                Chưa có môn học
              </p>
              <p className="text-sm text-muted-foreground">
                Chương trình đào tạo chưa có môn học nào
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
