import React from "react";
import SideBar from "@components/Layouts/SideBar";
import type { SidebarMenuItem } from "@components/Layouts/SideBar";
import { Outlet } from "react-router-dom";
import LableTitle from "@components/Layouts/LableTitle";
import { useTitle } from "../contexts";
import { Home, Users, CreditCard, BatteryCharging, UserCog, ChevronsUpDown } from "lucide-react";

const AdminLayout: React.FC = () => {
  const { title } = useTitle();

  return (
    <div className="flex h-screen">
      {/* Admin-specific menu passed into generic SideBar */}
      <SideBar
        avatarName="Đạt Nguyễn"
        menu={(
          [
            { key: "home", label: "Home", icon: <Home size={20} />, to: "/admin" },
            { key: "staff", label: "Staff", icon: <UserCog size={20} />, to: "/admin/staffs" },
            { key: "users", label: "Users", icon: <Users size={20} />, to: "/admin/users" },
            { key: "payments", label: "Payment", icon: <CreditCard size={20} />, to: "/admin/payments" },
            { key: "bookings", label: "Bookings", icon: <BatteryCharging size={20} />, to: "/admin/bookings" },
            { key: "tariffs", label: "Tariffs", icon: <ChevronsUpDown size={20} />, to: "/admin/tariffs" },
          ] as SidebarMenuItem[]
        )}
      />
      <main className="flex-1 bg-gray-50 overflow-auto p-6">
        <LableTitle>{title}</LableTitle>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
