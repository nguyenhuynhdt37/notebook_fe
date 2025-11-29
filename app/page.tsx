import Header from "@/components/user/shared/header";
import Footer from "@/components/user/shared/footer";
import Home from "@/components/user/home";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Home />
      </main>
      <Footer />
    </div>
  );
}
