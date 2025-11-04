import React from "react";
import SideBar from "@components/Layouts/SideBar";
import { Outlet, Link } from "react-router-dom";
import LableTitle from "@components/Layouts/LableTitle";

const StaffLayout: React.FC = () => {
  return (
    <div className="flex h-screen">
      <SideBar />
      <main className="flex-1 bg-gray-50 overflow-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <LableTitle>Staff area</LableTitle>
            <div className="flex items-center gap-2">
              <Link to="/staff" className="text-sm text-gray-600 hover:underline">Dashboard</Link>
              <Link to="/staff/manage" className="text-sm text-gray-600 hover:underline">Manage</Link>
            </div>
          </div>
          <div className="p-4">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default StaffLayout;
