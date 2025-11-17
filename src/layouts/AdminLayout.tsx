import React from "react";
import SideBar from "@components/Layouts/SideBar";
import type { SidebarMenuItem } from "@components/Layouts/SideBar";
import { Outlet } from "react-router-dom";
import LableTitle from "@components/Layouts/LableTitle";
import { useTitle } from "../contexts";
import { Home, Users, CreditCard, BatteryCharging, Cpu, Zap, FileText, Crown, AlertTriangle, MessageSquare } from "lucide-react";

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
            { key: "sessions", label: "Sessions", icon: <Zap size={20} />, to: "/admin/sessions" },
            { key: "invoices", label: "Invoices", icon: <FileText size={20} />, to: "/admin/invoices" },
            { key: "incidents", label: "Incidents", icon: <AlertTriangle size={20} />, to: "/admin/incidents" },
            { key: "feedbacks", label: "Feedbacks", icon: <MessageSquare size={20} />, to: "/admin/feedbacks" },
            { key: "membership-plans", label: "Membership Plans", icon: <Crown size={20} />, to: "/admin/membership-plans" },
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
