"use client";

import Link from "next/link";
import { FileText, Lightbulb, MessageSquare, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-extrabold text-foreground mb-8 leading-[1.1] tracking-tight">
            Biến thông tin
            <br />
            <span className="text-muted-foreground">thành tri thức</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed font-light">
            Tổ chức, phân tích và tóm tắt tài liệu với AI. Tạo notebook từ bất
            kỳ nguồn nào và để trí tuệ nhân tạo làm việc cho bạn.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="group">
              <Link href="/login">
                Bắt đầu miễn phí
                <ArrowRight className="ml-2 size-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/demo">Xem demo</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="group hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center mb-4 group-hover:bg-accent transition-colors">
                <FileText className="size-7 text-foreground" />
              </div>
              <CardTitle className="text-2xl">Tải lên & Tổ chức</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="leading-relaxed">
                Tải lên tài liệu từ nhiều nguồn. AI tự động phân loại và tổ chức
                thông tin một cách thông minh.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center mb-4 group-hover:bg-accent transition-colors">
                <Lightbulb className="size-7 text-foreground" />
              </div>
              <CardTitle className="text-2xl">Phân tích thông minh</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="leading-relaxed">
                AI phân tích nội dung sâu, tạo tóm tắt chính xác và đề xuất
                những insights quan trọng nhất.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center mb-4 group-hover:bg-accent transition-colors">
                <MessageSquare className="size-7 text-foreground" />
              </div>
              <CardTitle className="text-2xl">Tương tác tự nhiên</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="leading-relaxed">
                Đặt câu hỏi và nhận câu trả lời chính xác. Tương tác như đang
                làm việc với một chuyên gia thực sự.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <Card className="text-center">
          <CardHeader className="pb-6">
            <CardTitle className="text-4xl sm:text-5xl">
              Sẵn sàng bắt đầu?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pb-12">
            <CardDescription className="text-lg max-w-xl mx-auto">
              Tạo notebook đầu tiên ngay hôm nay và khám phá cách AI có thể biến
              đổi cách bạn làm việc với thông tin.
            </CardDescription>
            <Button asChild size="lg">
              <Link href="/login">
                Tạo notebook miễn phí
                <ArrowRight className="ml-2 size-5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
