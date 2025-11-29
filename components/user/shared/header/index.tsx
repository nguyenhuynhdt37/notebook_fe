"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-sm border-b">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <Image
                src="/logo/notebooks-logo.svg"
                alt="Notebooks AI"
                width={36}
                height={36}
                className="w-9 h-9 group-hover:opacity-80 transition-opacity text-foreground"
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
            <Button asChild size="sm">
              <Link href="/login">Đăng nhập</Link>
            </Button>
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
                <Button asChild className="w-full mt-4">
                  <Link href="/login">Đăng nhập</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
