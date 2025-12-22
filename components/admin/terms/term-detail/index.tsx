"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, Users, BookOpen, Pencil } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/client/axios";
import { TermDetailResponse } from "@/types/admin/term";
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

interface TermDetailProps {
  termId: string;
}

export default function TermDetail({ termId }: TermDetailProps) {
  const [term, setTerm] = useState<TermDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTerm = async () => {
      try {
        const response = await api.get<TermDetailResponse>(
          `/admin/term/${termId}`
        );
        setTerm(response.data);
      } catch {
        toast.error("Không thể tải thông tin học kỳ");
      } finally {
        setIsLoading(false);
      }
    };
    loadTerm();
  }, [termId]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Chưa xác định";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

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
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
        <div className="h-96 rounded-lg bg-muted animate-pulse" />
      </div>
    );
  }

  if (!term) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-3 mb-4">
          <Calendar className="size-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground mb-1">
          Không tìm thấy học kỳ
        </p>
        <Button variant="outline" asChild className="mt-4">
          <Link href="/admin/terms">Quay lại danh sách</Link>
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
            <Link href="/admin/terms">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{term.name}</h1>
            <p className="text-muted-foreground mt-1">
              Mã: <span className="font-mono font-medium">{term.code}</span>
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/admin/terms/${termId}/edit`}>
            <Pencil className="mr-2 size-4" />
            Chỉnh sửa
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Trạng thái</CardTitle>
            <Calendar className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                term.isActive
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {term.isActive ? "Hoạt động" : "Không hoạt động"}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Thời gian</CardTitle>
            <Calendar className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {formatDate(term.startDate)} — {formatDate(term.endDate)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Phân công</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{term.totalAssignments}</p>
            <p className="text-xs text-muted-foreground">phân công giảng dạy</p>
          </CardContent>
        </Card>
      </div>

      {/* Subjects Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="size-5" />
            <CardTitle>Môn học trong kỳ</CardTitle>
          </div>
          <CardDescription>
            Danh sách các môn học được mở trong học kỳ này
          </CardDescription>
        </CardHeader>
        <CardContent>
          {term.subjects && term.subjects.length > 0 ? (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã môn</TableHead>
                    <TableHead>Tên môn học</TableHead>
                    <TableHead className="text-center">Số tín chỉ</TableHead>
                    <TableHead className="text-center">Số giảng viên</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {term.subjects.map((subject) => (
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
                        <span className="inline-flex items-center gap-1">
                          <Users className="size-3.5" />
                          {subject.teacherCount}
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
                Chưa có môn học nào
              </p>
              <p className="text-sm text-muted-foreground">
                Học kỳ này chưa có môn học được phân công
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
