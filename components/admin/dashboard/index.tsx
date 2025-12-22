import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, FileText, TrendingUp, Activity } from "lucide-react";

const stats = [
  {
    title: "Tổng người dùng",
    value: "1,234",
    description: "+12% so với tháng trước",
    icon: Users,
  },
  {
    title: "Notebooks",
    value: "5,678",
    description: "+8% so với tháng trước",
    icon: FileText,
  },
  {
    title: "Tăng trưởng",
    value: "+24%",
    description: "Tăng so với tháng trước",
    icon: TrendingUp,
  },
  {
    title: "Hoạt động",
    value: "89%",
    description: "Người dùng hoạt động",
    icon: Activity,
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Tổng quan về hệ thống EduGenius
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
            <CardDescription>
              Các hoạt động mới nhất trên hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    Người dùng mới đăng ký
                  </p>
                  <p className="text-xs text-muted-foreground">2 phút trước</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    Notebook mới được tạo
                  </p>
                  <p className="text-xs text-muted-foreground">15 phút trước</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    Cập nhật hệ thống
                  </p>
                  <p className="text-xs text-muted-foreground">1 giờ trước</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thống kê nhanh</CardTitle>
            <CardDescription>Tổng quan về hiệu suất hệ thống</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Tỷ lệ sử dụng
                </span>
                <span className="text-sm font-medium text-foreground">75%</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-foreground w-3/4" />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Băng thông
                </span>
                <span className="text-sm font-medium text-foreground">
                  2.4 GB
                </span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-foreground w-2/3" />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Lưu trữ</span>
                <span className="text-sm font-medium text-foreground">
                  45 GB
                </span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-foreground w-1/2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

