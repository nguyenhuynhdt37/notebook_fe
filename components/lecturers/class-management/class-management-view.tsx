"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Users, Plus, TrendingUp, BookOpen, UserCheck } from "lucide-react";
import CreateClassFlow from "./create-class-flow";
import ImportStudentsFlow from "./import-students-flow";
import StatsCard from "./stats-card";

export default function ClassManagementView() {
  const [activeFlow, setActiveFlow] = useState<"create" | "import" | null>(null);

  if (activeFlow === "create") {
    return <CreateClassFlow onBack={() => setActiveFlow(null)} />;
  }

  if (activeFlow === "import") {
    return <ImportStudentsFlow onBack={() => setActiveFlow(null)} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Quản lý Lớp học phần</h1>
        <p className="text-muted-foreground">
          Tạo lớp mới từ Excel hoặc import sinh viên vào lớp có sẵn
        </p>
      </div>

      {/* Main Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Create New Class Card */}
        <Card className="cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/20">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Tạo lớp mới từ Excel</CardTitle>
                <CardDescription>
                  Tạo lớp học phần mới và import danh sách sinh viên từ file Excel
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setActiveFlow("create")}
              className="w-full"
              size="lg"
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Bắt đầu tạo lớp
            </Button>
          </CardContent>
        </Card>

        {/* Import Students Card */}
        <Card className="cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/20">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Import sinh viên vào lớp có sẵn</CardTitle>
                <CardDescription>
                  Thêm sinh viên mới vào lớp học phần đã tồn tại từ file Excel
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setActiveFlow("import")}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Import sinh viên
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Lớp đã tạo hôm nay"
          value={0}
          description="Tăng 0% so với hôm qua"
          icon={Plus}
          color="default"
        />
        <StatsCard
          title="Sinh viên đã import"
          value={0}
          description="Tổng số sinh viên trong tất cả lớp"
          icon={UserCheck}
          color="blue"
        />
        <StatsCard
          title="Lớp đang hoạt động"
          value={0}
          description="Lớp có sinh viên đang học"
          icon={BookOpen}
          color="green"
        />
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Hoạt động gần đây
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Chưa có hoạt động nào</p>
            <p className="text-sm">Tạo lớp đầu tiên để bắt đầu</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}