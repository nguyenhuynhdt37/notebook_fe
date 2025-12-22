"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Menu, Bell, Search, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import LecturerMobileSidebar from "./mobile-sidebar";
import { useUserStore } from "@/stores/user";
import { handleLogout } from "@/lib/utils/logout";
import { Separator } from "@/components/ui/separator";

export default function LecturerHeader() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const notificationCount = 3;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogoutClick = () => {
    handleLogout(router);
  };

  return (
    <header className="sticky top-0 z-40 h-14 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/50">
      <div className="h-full px-4 lg:px-6 flex items-center justify-between gap-4">
        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden size-8">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <LecturerMobileSidebar />
          </SheetContent>
        </Sheet>

        {/* Mobile Logo */}
        <Link href="/lecturer" className="lg:hidden flex items-center gap-2">
          <Image
            src="/logo/vinh-university-logo.png"
            alt="Đại học Vinh"
            width={28}
            height={28}
          />
          <span className="font-bold text-sm">EduGenius</span>
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm lớp, sinh viên..."
              className="pl-10 h-9"
            />
          </div>
        </div>

        <div className="flex-1 lg:hidden" />

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative size-8">
            <Bell className="size-4" />
            {notificationCount > 0 && (
              <Badge className="absolute -top-1 -right-1 size-4 p-0 flex items-center justify-center text-[10px]">
                {notificationCount}
              </Badge>
            )}
          </Button>

          <Separator orientation="vertical" className="h-5 hidden md:block" />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2 h-8">
                <Avatar className="size-7">
                  {user?.avatarUrl && (
                    <AvatarImage src={user.avatarUrl} alt={user.fullName} />
                  )}
                  <AvatarFallback className="text-xs">
                    {user ? getInitials(user.fullName) : "GV"}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:block text-sm font-medium max-w-[120px] truncate">
                  {user?.fullName || "Giảng viên"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.fullName || "Giảng viên"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email || "email@vinhuni.edu.vn"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/lecturer/profile" className="gap-2">
                  <User className="size-4" />
                  Hồ sơ cá nhân
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogoutClick}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="size-4 mr-2" />
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
