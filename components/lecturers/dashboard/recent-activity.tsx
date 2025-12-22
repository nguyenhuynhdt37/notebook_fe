"use client";

import { Activity } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ActivityItem {
  id: string;
  content: string;
  timestamp: string;
  type: "submission" | "attendance" | "question" | "grade";
}

// Mock data - sẽ thay bằng API sau
const mockActivities: ActivityItem[] = [
  {
    id: "1",
    content: "Nguyễn Văn A nộp bài tập Lập trình Web",
    timestamp: "5 phút trước",
    type: "submission",
  },
  {
    id: "2",
    content: "Đã điểm danh lớp IT3130-01 (40/42 sinh viên)",
    timestamp: "1 giờ trước",
    type: "attendance",
  },
  {
    id: "3",
    content: "Trần Thị B đặt câu hỏi về bài tập CSDL",
    timestamp: "2 giờ trước",
    type: "question",
  },
  {
    id: "4",
    content: "Hoàn thành chấm điểm bài kiểm tra AI (35/35)",
    timestamp: "3 giờ trước",
    type: "grade",
  },
  {
    id: "5",
    content: "Lê Văn C nộp bài tập An toàn thông tin",
    timestamp: "4 giờ trước",
    type: "submission",
  },
];

interface RecentActivityProps {
  isLoading?: boolean;
}

export default function RecentActivity({ isLoading }: RecentActivityProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-48 mt-1" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start gap-4">
                <Skeleton className="size-2 rounded-full mt-2" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-full max-w-[280px]" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">Hoạt động gần đây</CardTitle>
        <CardDescription className="mt-1">
          Cập nhật mới nhất từ các lớp của bạn
        </CardDescription>
      </CardHeader>
      <CardContent>
        {mockActivities.length > 0 ? (
          <div className="space-y-4">
            {mockActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 group">
                <div className="w-2 h-2 rounded-full bg-foreground/60 mt-2 group-hover:bg-foreground transition-colors" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground leading-snug">
                    {activity.content}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {activity.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-muted p-3 mb-3">
              <Activity className="size-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Chưa có hoạt động nào
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
