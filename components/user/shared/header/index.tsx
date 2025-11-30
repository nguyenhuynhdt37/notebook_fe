"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Menu, LogOut } from "lucide-react";
import { useUserStore } from "@/stores/user";
import { handleLogout } from "@/lib/utils/logout";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function Header() {
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
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-sm border-b">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link
            href="/"
            className="flex items-center gap-3 group"
            aria-label="Notebooks AI - Trang chủ"
          >
            <div className="relative">
              <Image
                src="/logo/notebooks-logo.svg"
                alt="Notebooks AI - Logo công cụ AI tổ chức và phân tích tài liệu thông minh"
                title="Notebooks AI - Biến thông tin thành tri thức"
                width={36}
                height={36}
                className="w-9 h-9 group-hover:opacity-80 transition-opacity text-foreground"
                priority
              />
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight">
              Notebooks AI
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-10">
            <Link
              href="/features"
              className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium relative group"
            >
              Tính năng
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-foreground group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              href="/pricing"
              className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium relative group"
            >
              Giá
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-foreground group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              href="/about"
              className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium relative group"
            >
              Về chúng tôi
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-foreground group-hover:w-full transition-all duration-300"></span>
            </Link>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full"
                  >
                    <Avatar className="h-10 w-10">
                      {user.avatarUrl && (
                        <AvatarImage src={user.avatarUrl} alt={user.fullName} />
                      )}
                      <AvatarFallback className="bg-foreground text-background">
                        {getInitials(user.fullName)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.fullName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Hồ sơ</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>Đổi mật khẩu</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogoutClick}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild size="sm">
                <Link href="/login">Đăng nhập</Link>
              </Button>
            )}
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Toggle menu"
              >
                <Menu className="size-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="mt-8 space-y-4">
                <Link
                  href="/features"
                  className="block text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
                >
                  Tính năng
                </Link>
                <Link
                  href="/pricing"
                  className="block text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
                >
                  Giá
                </Link>
                <Link
                  href="/about"
                  className="block text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
                >
                  Về chúng tôi
                </Link>
                {user ? (
                  <>
                    <div className="pt-4 border-t">
                      <div className="flex items-center gap-3 mb-4">
                        <Avatar className="h-10 w-10">
                          {user.avatarUrl && (
                            <AvatarImage
                              src={user.avatarUrl}
                              alt={user.fullName}
                            />
                          )}
                          <AvatarFallback className="bg-foreground text-background">
                            {getInitials(user.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{user.fullName}</p>
                          <p className="text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <Link
                        href="/profile"
                        className="block text-muted-foreground hover:text-foreground transition-colors text-sm font-medium mb-2"
                      >
                        Hồ sơ
                      </Link>
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={handleLogoutClick}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Đăng xuất
                      </Button>
                    </div>
                  </>
                ) : (
                  <Button asChild className="w-full mt-4">
                    <Link href="/login">Đăng nhập</Link>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
