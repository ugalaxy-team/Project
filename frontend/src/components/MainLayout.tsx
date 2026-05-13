import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { ScrollToTop } from "./ScrollToTop";

export const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-bg-body transition-colors duration-300">
      <ScrollToTop />
      <Header />
      <main className="flex-grow w-full">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
