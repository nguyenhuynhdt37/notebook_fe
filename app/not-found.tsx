"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home, FileText, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <h1 className="text-8xl md:text-9xl font-black text-foreground mb-4">
            404
          </h1>

          <div className="max-w-2xl mb-8 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Trang không tồn tại
            </h2>
            <p className="text-lg text-muted-foreground">
              Có vẻ như bạn đã lạc đường rồi. Trang bạn đang tìm kiếm không tồn
              tại hoặc đã được chuyển đi nơi khác.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 justify-center mb-12">
            <Button asChild size="lg">
              <Link href="/">
                <Home className="mr-2 size-5" />
                Về Trang Chủ
              </Link>
            </Button>

            <Button size="lg" variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 size-5" />
              Quay Lại
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <Link href="/" className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-foreground rounded-lg flex items-center justify-center text-background">
                    <Home className="size-6" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-foreground">Trang Chủ</h3>
                    <p className="text-sm text-muted-foreground">
                      Khám phá tính năng
                    </p>
                  </div>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <Link href="/docs" className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-foreground rounded-lg flex items-center justify-center text-background">
                    <FileText className="size-6" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-foreground">Tài liệu</h3>
                    <p className="text-sm text-muted-foreground">
                      Hướng dẫn sử dụng
                    </p>
                  </div>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <Link href="/" className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-foreground rounded-lg flex items-center justify-center text-background">
                    <Search className="size-6" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-foreground">Tìm Kiếm</h3>
                    <p className="text-sm text-muted-foreground">
                      Tìm nội dung
                    </p>
                  </div>
                </Link>
              </CardContent>
            </Card>
          </div>

          <p className="mt-12 text-muted-foreground text-sm">
            Nếu bạn cho rằng đây là lỗi, vui lòng{" "}
            <Link
              href="/"
              className="text-foreground hover:underline font-medium"
            >
              liên hệ với chúng tôi
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
