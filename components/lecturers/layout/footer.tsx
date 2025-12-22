import Image from "next/image";

export default function LecturerFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/50 bg-muted/20">
      <div className="px-4 lg:px-6 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <Image
              src="/logo/vinh-university-logo.png"
              alt="Đại học Vinh"
              width={24}
              height={24}
            />
            <span className="text-sm font-medium">EduGenius</span>
          </div>

          {/* Copyright */}
          <p className="text-xs text-muted-foreground">
            © {currentYear} Trường Đại học Vinh
          </p>
        </div>
      </div>
    </footer>
  );
}
