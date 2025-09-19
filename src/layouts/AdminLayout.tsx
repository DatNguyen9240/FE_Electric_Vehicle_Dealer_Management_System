import React from "react";
import SideBar from "@components/Layouts/SideBar";
import { Outlet } from "react-router-dom";
import LableTitle from "@components/Layouts/LableTitle";
import { useTitle } from "../contexts";

const AdminLayout: React.FC = () => {
  const { title } = useTitle();

  return (
    <div className="flex h-screen">
      <SideBar />
      <main className="flex-1 bg-gray-50 overflow-auto p-6">
        <LableTitle>{title}</LableTitle>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
