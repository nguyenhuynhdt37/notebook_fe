import ShareHeader from "@/components/shared/header";

export default function ShareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ShareHeader />
      <main className="flex-1 flex items-center justify-center">
        {children}
      </main>
    </div>
  );
}
