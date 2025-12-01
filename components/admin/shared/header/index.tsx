"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Search, LogOut } from "lucide-react";
import { useUserStore } from "@/stores/user";
import { handleLogout } from "@/lib/utils/logout";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function AdminHeader() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);

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
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6 w-full">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="flex items-center gap-3">
            <Image
              src="/logo/notebooks-logo.svg"
              alt="Notebooks AI"
              width={32}
              height={32}
              className="text-foreground"
            />
            <span className="text-lg font-bold text-foreground hidden sm:inline">
              Admin
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Search className="size-5" />
          </Button>

          <Button variant="ghost" size="icon">
            <Bell className="size-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full"
              >
                <Avatar className="h-10 w-10">
                  {user?.avatarUrl && (
                    <AvatarImage src={user.avatarUrl} alt={user.fullName} />
                  )}
                  <AvatarFallback className="bg-foreground text-background">
                    {user ? getInitials(user.fullName) : "A"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.fullName || "Tài khoản"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email || ""}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/admin/profile">Hồ sơ</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/settings">Cài đặt</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>Đổi mật khẩu</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogoutClick}>
                <LogOut className="mr-2 h-4 w-4" />
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
