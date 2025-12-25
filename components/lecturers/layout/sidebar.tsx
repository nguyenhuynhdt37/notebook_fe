"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  GraduationCap,
  ClipboardCheck,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  FolderPlus,
  BookOpenCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { title: "Tổng quan", href: "/lecturer", icon: LayoutDashboard },
  {
    title: "Môn phân công",
    href: "/lecturer/assignments",
    icon: GraduationCap,
  },
  { title: "Lớp học phần", href: "/lecturer/classes", icon: BookOpen },
  { title: "Quản lý lớp", href: "/lecturer/class-management", icon: FolderPlus },
  { title: "Bài kiểm tra", href: "/lecturer/exams", icon: BookOpenCheck },
  { title: "Sinh viên", href: "/lecturer/students", icon: Users },
  { title: "Điểm danh", href: "/lecturer/attendance", icon: ClipboardCheck },
  { title: "Thông báo", href: "/lecturer/announcements", icon: Bell },
];

const bottomItems: NavItem[] = [
  { title: "Cài đặt", href: "/lecturer/settings", icon: Settings },
];

export default function LecturerSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 bg-background border-r border-border/50 transition-all duration-300 hidden lg:flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border/50">
        {!collapsed ? (
          <Link href="/lecturer" className="flex items-center gap-3">
            <Image
              src="/logo/vinh-university-logo.png"
              alt="Đại học Vinh"
              width={36}
              height={36}
            />
            <div>
              <p className="font-bold text-sm leading-tight">EduGenius</p>
              <p className="text-[10px] text-muted-foreground leading-tight">
                Giảng viên
              </p>
            </div>
          </Link>
        ) : (
          <Link href="/lecturer" className="mx-auto">
            <Image
              src="/logo/vinh-university-logo.png"
              alt="Đại học Vinh"
              width={32}
              height={32}
            />
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "size-7",
            collapsed &&
              "absolute -right-3.5 bg-background border border-border/50"
          )}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="size-4" />
          ) : (
            <ChevronLeft className="size-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/lecturer" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                collapsed && "justify-center px-2"
              )}
            >
              <Icon className="size-4 shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-2 border-t border-border/50">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                collapsed && "justify-center px-2"
              )}
            >
              <Icon className="size-4 shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          );
        })}

        {!collapsed && (
          <>
            <Separator className="my-3" />
            <p className="text-[10px] text-muted-foreground text-center">
              © {new Date().getFullYear()} Đại học Vinh
            </p>
          </>
        )}
      </div>
    </aside>
  );
}
