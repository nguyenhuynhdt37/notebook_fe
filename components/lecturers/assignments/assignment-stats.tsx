"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Clock, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface AssignmentStatsProps {
  total: number;
  approved: number;
  pending: number;
  totalStudents: number;
  isLoading?: boolean;
}

export default function AssignmentStats({
  total,
  approved,
  pending,
  totalStudents,
  isLoading,
}: AssignmentStatsProps) {
  const stats = [
    {
      title: "Tổng môn học",
      value: total.toString(),
      description: "Được phân công",
      icon: BookOpen,
    },
    {
      title: "Đã duyệt",
      value: approved.toString(),
      description: "Sẵn sàng giảng dạy",
      icon: CheckCircle,
    },
    {
      title: "Chờ duyệt",
      value: pending.toString(),
      description: "Đang xử lý",
      icon: Clock,
    },
    {
      title: "Tổng sinh viên",
      value: totalStudents.toString(),
      description: "Đã đăng ký",
      icon: Users,
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="size-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-12 mb-1" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.title}
            className="transition-all duration-200 hover:border-foreground/20"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <Icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
