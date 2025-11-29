import AdminHeader from "@/components/admin/shared/header";
import AdminSidebar from "@/components/admin/shared/sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <AdminSidebar />
      <div className="lg:ml-64 flex flex-col min-h-screen">
        <AdminHeader />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
