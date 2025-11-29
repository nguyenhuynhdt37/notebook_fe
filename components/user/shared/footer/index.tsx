import Link from "next/link";
import { Mail, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold text-foreground mb-4">
              Notebooks AI
            </h3>
            <p className="text-muted-foreground text-sm max-w-md leading-relaxed">
              Công cụ AI thông minh giúp bạn tổ chức, phân tích và tóm tắt tài
              liệu một cách hiệu quả. Biến thông tin thành tri thức.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold text-foreground mb-5">Sản phẩm</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/features"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors inline-block"
                >
                  Tính năng
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors inline-block"
                >
                  Giá
                </Link>
              </li>
              <li>
                <Link
                  href="/docs"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors inline-block"
                >
                  Tài liệu
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-foreground mb-5">Công ty</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors inline-block"
                >
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors inline-block"
                >
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors inline-block"
                >
                  Điều khoản
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Notebooks AI. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <Button variant="ghost" size="icon" asChild aria-label="Email">
              <a href="mailto:contact@notebooks.ai">
                <Mail className="size-5" />
              </a>
            </Button>
            <Button variant="ghost" size="icon" asChild aria-label="Website">
              <a
                href="https://notebooks.ai"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Globe className="size-5" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
