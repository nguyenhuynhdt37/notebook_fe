"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, FileText, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface StatItem {
  title: string;
  value: string;
  description: string;
  icon: React.ElementType;
}

const stats: StatItem[] = [
  {
    title: "Lớp đang dạy",
    value: "8",
    description: "Học kỳ 1 - 2024",
    icon: BookOpen,
  },
  {
    title: "Tổng sinh viên",
    value: "324",
    description: "Đang học",
    icon: Users,
  },
  {
    title: "Bài tập",
    value: "12/28",
    description: "Chờ chấm điểm",
    icon: FileText,
  },
  {
    title: "Điểm danh hôm nay",
    value: "95%",
    description: "3/8 lớp đã điểm danh",
    icon: CheckCircle,
  },
];

interface StatsCardsProps {
  isLoading?: boolean;
}

export default function StatsCards({ isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="size-5 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-16 mb-1" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <Icon className="size-5 text-muted-foreground" />
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
