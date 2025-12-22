import LecturerSidebar from "@/components/lecturers/layout/sidebar";
import LecturerHeader from "@/components/lecturers/layout/header";
import LecturerFooter from "@/components/lecturers/layout/footer";

export default function LecturerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - Desktop only */}
      <LecturerSidebar />

      {/* Main Content */}
      <div className="lg:ml-64 flex flex-col min-h-screen transition-all duration-300">
        <LecturerHeader />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
        <LecturerFooter />
      </div>
    </div>
  );
}
