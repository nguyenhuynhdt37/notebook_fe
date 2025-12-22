"use client";

import { useState, useEffect } from "react";
import { useUserStore } from "@/stores/user";
import StatsCards from "./stats-cards";
import ClassSectionList from "./class-section-list";
import QuickActions from "./quick-actions";
import RecentActivity from "./recent-activity";
import { Badge } from "@/components/ui/badge";

export default function LecturerDashboard() {
  const user = useUserStore((state) => state.user);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading - sẽ thay bằng API call sau
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  const firstName = user?.fullName?.split(" ").pop() || "Giảng viên";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold tracking-tight">
              {getGreeting()}, {firstName}
            </h1>
            <Badge variant="secondary" className="text-xs">
              Giảng viên
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Tổng quan về các lớp học phần của bạn tại Đại học Vinh
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards isLoading={isLoading} />

      {/* Quick Actions */}
      <QuickActions />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ClassSectionList isLoading={isLoading} />
        </div>
        <div className="lg:col-span-1">
          <RecentActivity isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
