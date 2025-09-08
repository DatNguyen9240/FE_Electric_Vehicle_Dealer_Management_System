import React from "react";
import { Outlet } from "react-router-dom";

const Header = () => (
  <header className="p-4 bg-gray-100 border-b border-gray-300">
    <h1 className="text-xl font-bold">Header</h1>
  </header>
);

const Footer = () => (
  <footer className="p-4 bg-gray-100 border-t border-gray-300 mt-auto">
    <p className="text-center text-sm text-gray-500">Footer</p>
  </footer>
);

const MainLayout: React.FC = () => (
  <div className="flex flex-col min-h-screen">
    <Header />
    <main className="flex-1 p-6">
      <Outlet />
    </main>
    <Footer />
  </div>
);

export default MainLayout;
