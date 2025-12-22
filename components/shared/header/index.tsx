import Link from "next/link";
import Image from "next/image";

export default function ShareHeader() {
  return (
    <header className="border-b bg-background">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <Image
                src="/logo/vinh-university-logo.png"
                alt="EduGenius"
                width={32}
                height={32}
                className="text-foreground group-hover:opacity-80 transition-opacity"
              />
            </div>
            <span className="text-lg font-bold text-foreground tracking-tight">
              EduGenius
            </span>
          </Link>
        </div>
      </nav>
    </header>
  );
}

