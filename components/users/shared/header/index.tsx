"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Menu, LogOut, BookOpen, Home, User } from "lucide-react";
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
import NotificationDropdown from "./notification-dropdown";
import { Separator } from "@/components/ui/separator";

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
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-sm border-b border-border/50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 group"
            aria-label="EduGenius - Trang chủ"
          >
            <div className="relative">
              <Image
                src="/logo/vinh-university-logo.png"
                alt="Đại học Vinh"
                width={40}
                height={40}
                className="group-hover:opacity-80 transition-opacity"
                priority
              />
            </div>
            <div className="hidden sm:block">
              <p className="text-base font-bold text-foreground leading-tight">
                EduGenius
              </p>
              <p className="text-[10px] text-muted-foreground leading-tight">
                Đại học Vinh
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center">
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/" className="gap-2">
                  <Home className="size-4" />
                  Trang chủ
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/notebook" className="gap-2">
                  <BookOpen className="size-4" />
                  Notebooks
                </Link>
              </Button>
            </div>

            <Separator orientation="vertical" className="h-6 mx-4" />

            <div className="flex items-center gap-2">
              {user && <NotificationDropdown />}

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-9 w-9 rounded-full"
                    >
                      <Avatar className="h-9 w-9">
                        {user.avatarUrl && (
                          <AvatarImage
                            src={user.avatarUrl}
                            alt={user.fullName}
                          />
                        )}
                        <AvatarFallback>
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
                      <Link href="/profile" className="gap-2">
                        <User className="size-4" />
                        Hồ sơ cá nhân
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogoutClick}
                      className="text-destructive focus:text-destructive"
                    >
                      <LogOut className="mr-2 size-4" />
                      Đăng xuất
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/login">Đăng nhập</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href="/register">Đăng ký</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu */}
          <div className="flex items-center gap-2 md:hidden">
            {user && <NotificationDropdown />}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Menu">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetHeader>
                  <SheetTitle className="text-left">Menu</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-1">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    asChild
                  >
                    <Link href="/" className="gap-3">
                      <Home className="size-4" />
                      Trang chủ
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    asChild
                  >
                    <Link href="/notebook" className="gap-3">
                      <BookOpen className="size-4" />
                      Notebooks
                    </Link>
                  </Button>

                  <Separator className="my-4" />

                  {user ? (
                    <>
                      <div className="flex items-center gap-3 px-3 py-2">
                        <Avatar className="h-10 w-10">
                          {user.avatarUrl && (
                            <AvatarImage
                              src={user.avatarUrl}
                              alt={user.fullName}
                            />
                          )}
                          <AvatarFallback>
                            {getInitials(user.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {user.fullName}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>

                      <Separator className="my-4" />

                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        asChild
                      >
                        <Link href="/profile" className="gap-3">
                          <User className="size-4" />
                          Hồ sơ cá nhân
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-destructive hover:text-destructive"
                        onClick={handleLogoutClick}
                      >
                        <LogOut className="size-4 mr-3" />
                        Đăng xuất
                      </Button>
                    </>
                  ) : (
                    <div className="space-y-2 px-1">
                      <Button className="w-full" asChild>
                        <Link href="/login">Đăng nhập</Link>
                      </Button>
                      <Button variant="outline" className="w-full" asChild>
                        <Link href="/register">Đăng ký</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  );
}
