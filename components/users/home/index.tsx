"use client";

import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  Brain,
  FileQuestion,
  GraduationCap,
  Users,
  Video,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { useUserStore } from "@/stores/user";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const features = [
  {
    icon: Brain,
    title: "Trợ lý AI Thông minh",
    description:
      "Chat với AI để giải đáp thắc mắc, tóm tắt bài giảng và hỗ trợ học tập 24/7.",
  },
  {
    icon: FileQuestion,
    title: "Tạo Quiz Tự động",
    description:
      "AI tự động tạo câu hỏi trắc nghiệm, tự luận từ tài liệu bài giảng.",
  },
  {
    icon: Video,
    title: "Video Bài giảng AI",
    description:
      "Tự động tạo video bài giảng từ slide và tài liệu với giọng đọc AI.",
  },
  {
    icon: BookOpen,
    title: "Flashcard Thông minh",
    description:
      "AI tạo flashcard từ nội dung bài học, hỗ trợ ghi nhớ hiệu quả.",
  },
];

const stats = [
  { value: "1959", label: "Năm thành lập" },
  { value: "20K+", label: "Sinh viên" },
  { value: "1K+", label: "Giảng viên" },
  { value: "AI", label: "Công nghệ" },
];

export default function Home() {
  const user = useUserStore((state) => state.user);
  const isLoggedIn = !!user;
  const isLecturer = user?.role === "LECTURER";

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <Badge variant="secondary" className="mb-6">
                Nền tảng AI cho giáo dục
              </Badge>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight tracking-tight">
                Công nghệ AI
                <br />
                <span className="text-muted-foreground">hỗ trợ giảng dạy</span>
                <br />
                và học tập
              </h1>

              <p className="text-lg text-muted-foreground mb-8 max-w-xl leading-relaxed">
                EduGenius - Nền tảng AI giúp giảng viên tạo bài giảng, quiz,
                flashcard tự động và sinh viên học tập hiệu quả hơn.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button asChild size="lg" className="group">
                  <Link href={isLoggedIn ? "/notebook" : "/login"}>
                    {isLoggedIn
                      ? isLecturer
                        ? "Vào không gian giảng dạy"
                        : "Vào không gian học tập"
                      : "Bắt đầu ngay"}
                    <ArrowRight className="ml-2 size-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                {!isLoggedIn && (
                  <Button asChild size="lg" variant="outline">
                    <Link href="/register">Đăng ký tài khoản</Link>
                  </Button>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 mt-12 pt-8 border-t border-border/50">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center lg:text-left">
                    <div className="text-2xl font-bold text-foreground">
                      {stat.value}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Logo with Blue Glow */}
            <div className="relative hidden lg:flex justify-center">
              <div className="relative w-72 h-72">
                {/* Blue Glow Effect */}
                <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute inset-4 bg-blue-400/10 rounded-full blur-2xl" />
                <Image
                  src="/logo/vinh-university-logo.png"
                  alt="Đại học Vinh"
                  fill
                  className="object-contain p-4 relative z-10"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* For Who Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Dành cho ai?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              EduGenius được thiết kế để hỗ trợ cả giảng viên và sinh viên.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* For Lecturers */}
            <Card className="group hover:border-border transition-colors">
              <CardHeader>
                <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center mb-4">
                  <GraduationCap className="size-7 text-foreground" />
                </div>
                <CardTitle className="text-2xl">Giảng viên</CardTitle>
                <CardDescription>
                  Tiết kiệm thời gian soạn bài, tập trung vào giảng dạy
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
                    "Tạo quiz từ slide bài giảng trong 1 phút",
                    "Tự động tạo video bài giảng với AI",
                    "Phân tích kết quả học tập sinh viên",
                    "Tạo flashcard và tài liệu ôn tập",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="size-5 text-muted-foreground mt-0.5 shrink-0" />
                      <span className="text-muted-foreground text-sm">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* For Students */}
            <Card className="group hover:border-border transition-colors">
              <CardHeader>
                <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center mb-4">
                  <Users className="size-7 text-foreground" />
                </div>
                <CardTitle className="text-2xl">Sinh viên</CardTitle>
                <CardDescription>
                  Học tập thông minh, hiệu quả với sự hỗ trợ của AI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
                    "Chat với AI để giải đáp thắc mắc 24/7",
                    "Ôn tập với quiz và flashcard tự động",
                    "Xem video bài giảng mọi lúc mọi nơi",
                    "Tóm tắt tài liệu dài trong vài giây",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="size-5 text-muted-foreground mt-0.5 shrink-0" />
                      <span className="text-muted-foreground text-sm">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Separator />

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              Tính năng nổi bật
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Công nghệ AI tiên tiến
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Ứng dụng các mô hình AI mới nhất để hỗ trợ giảng dạy và học tập.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="group hover:border-border transition-colors"
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-4 group-hover:bg-accent transition-colors">
                    <feature.icon className="size-6 text-foreground" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="text-center">
            <CardHeader className="pb-4">
              <CardTitle className="text-3xl sm:text-4xl">
                Sẵn sàng trải nghiệm?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pb-8">
              <CardDescription className="text-base max-w-xl mx-auto">
                Đăng nhập với tài khoản Đại học Vinh để bắt đầu sử dụng
                EduGenius ngay hôm nay.
              </CardDescription>
              <Button asChild size="lg" className="group">
                <Link href={isLoggedIn ? "/notebook" : "/login"}>
                  {isLoggedIn ? "Vào workspace" : "Đăng nhập ngay"}
                  <ArrowRight className="ml-2 size-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Image
                src="/logo/vinh-university-logo.png"
                alt="Đại học Vinh"
                width={40}
                height={40}
                className="rounded"
              />
              <div>
                <p className="font-semibold text-sm">EduGenius</p>
                <p className="text-xs text-muted-foreground">
                  Trường Đại học Vinh
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Trường Đại học Vinh
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
