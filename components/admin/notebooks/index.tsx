import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, MoreVertical, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const notebooks = [
  {
    id: 1,
    title: "Tài liệu Machine Learning",
    owner: "Nguyễn Văn A",
    status: "published",
    createdAt: "2024-01-15",
    views: 1250,
  },
  {
    id: 2,
    title: "Hướng dẫn Next.js",
    owner: "Trần Thị B",
    status: "draft",
    createdAt: "2024-01-20",
    views: 450,
  },
  {
    id: 3,
    title: "Kiến thức về AI",
    owner: "Lê Văn C",
    status: "published",
    createdAt: "2024-01-25",
    views: 890,
  },
];

export default function Notebooks() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notebooks</h1>
          <p className="text-muted-foreground">
            Quản lý notebooks trong hệ thống
          </p>
        </div>
        <Button>
          <Plus className="mr-2 size-4" />
          Tạo notebook
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Danh sách notebooks</CardTitle>
              <CardDescription>
                Tất cả notebooks đã được tạo trên hệ thống
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
              <Input placeholder="Tìm kiếm..." className="w-64 pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notebooks.map((notebook) => (
              <Card
                key={notebook.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <FileText className="size-8 text-muted-foreground" />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Xem chi tiết</DropdownMenuItem>
                        <DropdownMenuItem>Chỉnh sửa</DropdownMenuItem>
                        <DropdownMenuItem>Xóa</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardTitle className="text-lg">{notebook.title}</CardTitle>
                  <CardDescription>
                    Tác giả: {notebook.owner}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        notebook.status === "published"
                          ? "bg-muted text-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {notebook.status === "published"
                        ? "Đã xuất bản"
                        : "Bản nháp"}
                    </span>
                    <span className="text-muted-foreground">
                      {notebook.views} lượt xem
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

