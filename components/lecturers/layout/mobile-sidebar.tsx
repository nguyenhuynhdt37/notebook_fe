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
} from "lucide-react";
import { cn } from "@/lib/utils";
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
  { title: "Sinh viên", href: "/lecturer/students", icon: Users },
  { title: "Điểm danh", href: "/lecturer/attendance", icon: ClipboardCheck },
  { title: "Thông báo", href: "/lecturer/announcements", icon: Bell },
];

const bottomItems: NavItem[] = [
  { title: "Cài đặt", href: "/lecturer/settings", icon: Settings },
];

export default function LecturerMobileSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-4 border-b border-border/50">
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
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="size-4" />
              <span>{item.title}</span>
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
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="size-4" />
              <span>{item.title}</span>
            </Link>
          );
        })}

        <Separator className="my-3" />
        <p className="text-[10px] text-muted-foreground text-center">
          © {new Date().getFullYear()} Đại học Vinh
        </p>
      </div>
    </div>
  );
}
