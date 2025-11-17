import React from "react";
import SideBar from "@components/Layouts/SideBar";
import { Outlet, useNavigate } from "react-router-dom";
import LableTitle from "@components/Layouts/LableTitle";
import { Home, CreditCard, Zap, AlertCircle, CalendarCheck, MessageCircle } from "lucide-react";
import type { SidebarMenuItem } from "@components/Layouts/SideBar";
import { useTitle } from "../contexts";
import { useDispatch } from "react-redux";
import { logoutUser } from "../redux/slice/Auth/authThunks";
import type { AppDispatch } from "../redux/store/store";
import { useUi } from "../contexts/uiContextCore";
  
const StaffLayout: React.FC = () => {
  const { title } = useTitle();

  const staffMenu: SidebarMenuItem[] = [
    { key: "dashboard", label: "Dashboard", icon: <Home size={20} />, to: "/staff" },
    { key: "sessions", label: "Sessions", icon: <Zap size={20} />, to: "/staff/sessions" },
    { key: "incidents", label: "Incidents", icon: <AlertCircle size={20} />, to: "/staff/incidents" },
    { key: "bookings", label: "Bookings", icon: <CalendarCheck size={20} />, to: "/staff/bookings" },
    { key: "feedbacks", label: "Feedbacks", icon: <MessageCircle size={20} />, to: "/staff/feedbacks" },
    { key: "invoices", label: "Invoices", icon: <CreditCard size={20} />, to: "/staff/invoices" },
  ];

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { confirm, showToast } = useUi();

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
          // ignore errors during logout
        }
        showToast('Logged out', 'success');
        navigate('/login');
      },
      danger: true,
    },
  ];

  return (
    <div className="flex h-screen">
      <SideBar avatarName="Staff" menu={staffMenu} dropdownItems={dropdownItems} />
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
