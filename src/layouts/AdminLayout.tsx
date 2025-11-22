import React, { useEffect, useState } from "react";
import SideBar from "@components/Layouts/SideBar";
import type { SidebarMenuItem } from "@components/Layouts/SideBar";
import { Outlet, useNavigate } from "react-router-dom";
import LableTitle from "@components/Layouts/LableTitle";
import { useTitle } from "../contexts";
import { Home, Users, CreditCard, BatteryCharging, Cpu, Zap, FileText, Crown, AlertTriangle, MessageSquare } from "lucide-react";
import { useDispatch } from "react-redux";
import { logoutUser } from "../redux/slice/Auth/authThunks";
import type { AppDispatch } from "../redux/store/store";
import { useUi } from "../contexts/uiContextCore";
import { getCookie } from "../libs/utils";
import type { User } from "../interfaces/Auth";

const AdminLayout: React.FC = () => {
  const { title } = useTitle();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { confirm, showToast } = useUi();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userStr = getCookie("user");
    if (userStr) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(userStr));
        setUser(parsedUser as User);
      } catch {
        setUser(null);
      }
    }
  }, []);

  const dropdownItems = [
    {
      key: 'logout',
      label: 'Logout',
      onClick: async () => {
        const ok = await confirm('Sign out?');
        if (!ok) return;
        try {
          await dispatch(logoutUser());
        } catch (err) {
          // ignore
        }
        showToast('Logged out', 'success');
        navigate('/login');
      },
      danger: true,
    },
  ];

  

  return (
    <div className="flex h-screen">
      {/* Admin-specific menu passed into generic SideBar */}
      <SideBar
        avatarName={user?.name || user?.email || "Admin"}
        menu={[
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
            { key: "contacts", label: "Contacts", icon: <MessageSquare size={20} />, to: "/admin/contacts" },
          ] as SidebarMenuItem[]}
        dropdownItems={dropdownItems}
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
