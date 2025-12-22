"use client";

import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ClassSectionCard from "./class-section-card";

// Mock data - sẽ thay bằng API sau
const mockClassSections = [
  {
    id: "1",
    subjectName: "Lập trình Web",
    classCode: "IT3130-01",
    schedule: "Thứ 2, 7:00 - 9:30",
    room: "D3-201",
    studentCount: 42,
  },
  {
    id: "2",
    subjectName: "Cơ sở dữ liệu",
    classCode: "IT2020-02",
    schedule: "Thứ 3, 13:00 - 15:30",
    room: "D5-301",
    studentCount: 38,
  },
  {
    id: "3",
    subjectName: "Trí tuệ nhân tạo",
    classCode: "IT4040-01",
    schedule: "Thứ 5, 9:30 - 12:00",
    room: "D3-405",
    studentCount: 35,
  },
  {
    id: "4",
    subjectName: "An toàn thông tin",
    classCode: "IT4020-03",
    schedule: "Thứ 6, 7:00 - 9:30",
    room: "D6-102",
    studentCount: 40,
  },
];

interface ClassSectionListProps {
  isLoading?: boolean;
}

export default function ClassSectionList({ isLoading }: ClassSectionListProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48 mt-1" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 rounded-lg border"
            >
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-64" />
              </div>
              <Skeleton className="size-8 rounded" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Lớp học phần</CardTitle>
            <CardDescription className="mt-1">
              Các lớp bạn đang giảng dạy học kỳ này
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/lecturer/classes" className="text-muted-foreground">
              Xem tất cả
              <ArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {mockClassSections.length > 0 ? (
          <div className="space-y-3">
            {mockClassSections.map((section) => (
              <ClassSectionCard key={section.id} data={section} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-3 mb-4">
              <BookOpen className="size-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">
              Chưa có lớp học phần
            </p>
            <p className="text-sm text-muted-foreground">
              Bạn chưa được phân công lớp nào trong học kỳ này
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
