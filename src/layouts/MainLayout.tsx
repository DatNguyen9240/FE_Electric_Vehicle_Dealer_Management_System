import { Footer, Header } from "@components/Layouts";
import { Outlet } from "react-router-dom";

const MainLayout: React.FC = () => (
  <div className="flex flex-col min-h-screen">
    <Header />
    <main>
      <Outlet />
    </main>
    <Footer />
  </div>
);

export default MainLayout;
