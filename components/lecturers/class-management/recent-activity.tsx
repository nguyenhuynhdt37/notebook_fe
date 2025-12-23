"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, FileSpreadsheet, Users, Clock, Plus } from "lucide-react";
import api from "@/api/client/axios";
import { LecturerClassPagedResponse } from "@/types/lecturer/reference";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface Activity {
  id: string;
  type: "class_created" | "students_imported";
  title: string;
  description: string;
  timestamp: string;
  classCode?: string;
  studentCount?: number;
}

export default function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        // Fetch recent classes (last 7 days)
        const response = await api.get<LecturerClassPagedResponse>('/lecturer/classes?size=10&sortBy=createdAt&sortDir=desc');
        
        if (response.data?.items) {
          const recentClasses = response.data.items.filter(cls => {
            const createdDate = new Date(cls.createdAt);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return createdDate > weekAgo;
          });

          const activities: Activity[] = recentClasses.map(cls => ({
            id: cls.id,
            type: "class_created",
            title: `Tạo lớp ${cls.classCode}`,
            description: `${cls.subjectName} • ${cls.studentCount} sinh viên`,
            timestamp: cls.createdAt,
            classCode: cls.classCode,
            studentCount: cls.studentCount,
          }));

          setActivities(activities);
        }
      } catch (error) {
        console.error('Error fetching recent activity:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentActivity();
  }, []);

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case "class_created":
        return <Plus className="h-4 w-4" />;
      case "students_imported":
        return <Users className="h-4 w-4" />;
      default:
        return <FileSpreadsheet className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case "class_created":
        return "default";
      case "students_imported":
        return "secondary";
      default:
        return "outline";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Hoạt động gần đây
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="w-8 h-8 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
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
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          Hoạt động gần đây
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Chưa có hoạt động nào</p>
            <p className="text-sm">Tạo lớp đầu tiên để bắt đầu</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="p-2 bg-primary/10 rounded-full text-primary">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{activity.title}</p>
                    <Badge variant={getActivityColor(activity.type) as any} className="text-xs">
                      {activity.type === "class_created" ? "Tạo lớp" : "Import SV"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {activity.description}
                  </p>
                  <div className="flex items-center text-xs text-muted-foreground mt-2">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDistanceToNow(new Date(activity.timestamp), { 
                      addSuffix: true, 
                      locale: vi 
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}