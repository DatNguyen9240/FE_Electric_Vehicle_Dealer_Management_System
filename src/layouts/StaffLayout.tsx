import React from "react";
import SideBar from "@components/Layouts/SideBar";
import { Outlet} from "react-router-dom";
import LableTitle from "@components/Layouts/LableTitle";
import { Home, CreditCard, Zap, AlertCircle, CalendarCheck } from "lucide-react";
import type { SidebarMenuItem } from "@components/Layouts/SideBar";
import { useTitle } from "../contexts";
  
const StaffLayout: React.FC = () => {
  const { title } = useTitle();

  const staffMenu: SidebarMenuItem[] = [
    { key: "dashboard", label: "Dashboard", icon: <Home size={20} />, to: "/staff" },
    { key: "sessions", label: "Sessions", icon: <Zap size={20} />, to: "/staff/sessions" },
    { key: "payments", label: "Onsite Payment", icon: <CreditCard size={20} />, to: "/staff/payments" },
    { key: "incidents", label: "Incidents", icon: <AlertCircle size={20} />, to: "/staff/incidents" },
    { key: "bookings", label: "Bookings", icon: <CalendarCheck size={20} />, to: "/staff/bookings" },
  ];

  return (
    <div className="flex h-screen">
      <SideBar avatarName="Staff" menu={staffMenu} />
      <main className="flex-1 bg-gray-50 overflow-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <LableTitle>{title}</LableTitle>
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
