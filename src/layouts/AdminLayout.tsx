import React from "react";
import SideBar from "@components/Layouts/SideBar";
import type { SidebarMenuItem } from "@components/Layouts/SideBar";
import { Outlet } from "react-router-dom";
import LableTitle from "@components/Layouts/LableTitle";
import { useTitle } from "../contexts";
import { Home, Users, CreditCard, BatteryCharging, Cpu } from "lucide-react";

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
            { key: "users", label: "Users", icon: <Users size={20} />, to: "/admin/users" },
            { key: "payments", label: "Payment", icon: <CreditCard size={20} />, to: "/admin/payments" },
            { key: "bookings", label: "Bookings", icon: <BatteryCharging size={20} />, to: "/admin/bookings" },
            { key: "ai", label: "AI Forecast", icon: <Cpu size={20} />, to: "/admin/ai-forecast" },
          ] as SidebarMenuItem[]
        )}
        showInfrastructure={true}
      />
      <main className="flex-1 bg-gray-50 overflow-auto p-6">
        <LableTitle>{title}</LableTitle>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
