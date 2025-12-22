"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  LogOut,
  Menu,
  Building2,
  GraduationCap,
  Calendar,
  BookOpen,
  ClipboardList,
} from "lucide-react";
import { handleLogout } from "@/lib/utils/logout";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const menuItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Người dùng",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Giảng viên",
    href: "/admin/lecturers",
    icon: GraduationCap,
  },
  {
    title: "Đơn vị tổ chức",
    href: "/admin/org-units",
    icon: Building2,
  },
  {
    title: "Học kỳ",
    href: "/admin/terms",
    icon: Calendar,
  },
  {
    title: "Môn học",
    href: "/admin/subjects",
    icon: BookOpen,
  },
  {
    title: "Ngành học",
    href: "/admin/majors",
    icon: GraduationCap,
  },
  {
    title: "Phân công giảng dạy",
    href: "/admin/teaching-assignments",
    icon: ClipboardList,
  },
  {
    title: "Notebooks",
    href: "/admin/notebooks",
    icon: FileText,
  },
  {
    title: "Cài đặt",
    href: "/admin/settings",
    icon: Settings,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogoutClick = () => {
    handleLogout(router);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <h2 className="text-lg font-bold text-foreground">Admin Panel</h2>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="size-5" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={handleLogoutClick}
        >
          <LogOut className="mr-3 size-5" />
          Đăng xuất
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:border-r lg:bg-background lg:z-30">
        <SidebarContent />
      </aside>

      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden fixed top-4 left-4 z-50"
          >
            <Menu className="size-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  );
}
