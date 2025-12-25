"use client";

import { FileText, Users, Clock, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ExamStatsProps {
  totalExams: number;
  draftExams: number;
  publishedExams: number;
  activeExams: number;
}

export function ExamStats({ 
  totalExams, 
  draftExams, 
  publishedExams, 
  activeExams 
}: ExamStatsProps) {
  const stats = [
    {
      title: "Tổng đề thi",
      value: totalExams,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Đang soạn thảo",
      value: draftExams,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Đã xuất bản",
      value: publishedExams,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Đang diễn ra",
      value: activeExams,
      icon: Users,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.value === 1 ? "đề thi" : "đề thi"}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}