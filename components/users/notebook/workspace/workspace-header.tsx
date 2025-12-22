"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Menu, LogOut, Home, User } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";

interface WorkspaceHeaderProps {
  children?: React.ReactNode;
  leftContent?: React.ReactNode;
}

export default function WorkspaceHeader({
  children,
  leftContent,
}: WorkspaceHeaderProps) {
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
    <div className="border-b border-border/50 px-4 h-14 flex items-center gap-3 shrink-0 bg-background">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => router.back()}
        className="size-8"
      >
        <ArrowLeft className="size-4" />
      </Button>

      <Separator orientation="vertical" className="h-5" />

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 group">
        <Image
          src="/logo/vinh-university-logo.png"
          alt="Đại học Vinh"
          width={32}
          height={32}
          className="group-hover:opacity-80 transition-opacity"
          priority
        />
        <div className="hidden sm:block">
          <p className="text-sm font-bold text-foreground leading-tight">
            EduGenius
          </p>
          <p className="text-[9px] text-muted-foreground leading-tight">
            Đại học Vinh
          </p>
        </div>
      </Link>

      {leftContent}

      <div className="flex-1" />

      {/* Desktop Actions */}
      <div className="hidden md:flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/" className="gap-2">
            <Home className="size-4" />
            <span className="hidden lg:inline">Trang chủ</span>
          </Link>
        </Button>

        <Separator orientation="vertical" className="h-5" />

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  {user.avatarUrl && (
                    <AvatarImage src={user.avatarUrl} alt={user.fullName} />
                  )}
                  <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
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
          <Button size="sm" asChild>
            <Link href="/login">Đăng nhập</Link>
          </Button>
        )}
      </div>

      {children}

      {/* Mobile Menu */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden size-8"
            aria-label="Menu"
          >
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-72">
          <SheetHeader>
            <SheetTitle className="text-left">Menu</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-1">
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/" className="gap-3">
                <Home className="size-4" />
                Trang chủ
              </Link>
            </Button>

            <Separator className="my-4" />

            {user ? (
              <>
                <div className="flex items-center gap-3 px-3 py-2">
                  <Avatar className="h-10 w-10">
                    {user.avatarUrl && (
                      <AvatarImage src={user.avatarUrl} alt={user.fullName} />
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
              <Button className="w-full" asChild>
                <Link href="/login">Đăng nhập</Link>
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
