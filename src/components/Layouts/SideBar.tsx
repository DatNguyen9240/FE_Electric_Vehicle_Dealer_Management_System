import React from "react";
import {
  Home,
  Users,
  CreditCard,
  BatteryCharging,
  UserCog,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown, // Thêm icon này
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const menu = [
  { label: "Home", icon: <Home size={20} />, to: "/admin" },
  { label: "Staff", icon: <UserCog size={20} />, to: "/admin/staffs" },
  { label: "Users", icon: <Users size={20} />, to: "/admin/users" },
  { label: "Payment", icon: <CreditCard size={20} />, to: "/admin/payments" },
  {
    label: "Bookings",
    icon: <BatteryCharging size={20} />,
    to: "/admin/bookings",
  },
  {
    label: "Tariffs",
    icon: <ChevronsUpDown size={20} />,
    to: "/admin/tariffs",
  },
];

const SideBar: React.FC = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = React.useState(false);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  // Đóng dropdown khi click ngoài
  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("#sidebar-avatar-dropdown")) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  return (
    <aside
      className={`h-screen bg-white border-r shadow-lg flex flex-col transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Logo & Toggle */}
      <div className="flex items-center gap-3 px-4 py-6 border-b relative transition-all duration-300 group">
        {/* Nền mờ đen chỉ hiện khi hover, khi thu nhỏ thì bo tròn quanh avatar */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 z-0 transition-all duration-300 left-2
            ${
              collapsed
                ? "w-14 h-14 rounded-full"
                : "w-[calc(100%-32px)] h-16 rounded-xl"
            }
            bg-black/80 backdrop-blur-lg
            ${
              dropdownOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }
          `}
        ></div>
        {/* Avatar + Tên bọc trong button để mở dropdown */}
        <button
          id="sidebar-avatar-dropdown"
          type="button"
          className="flex items-center z-10 focus:outline-none relative cursor-pointer"
          onClick={() => setDropdownOpen((v) => !v)}
        >
          <img
            src="/avatar/01.png"
            alt="Logo"
            className="w-10 h-10 rounded-full object-cover bg-gray-100 transition-all duration-300"
          />
          <span
            className={`flex items-center font-bold text-xl tracking-wide transition-all duration-300 whitespace-nowrap overflow-hidden
              ${collapsed ? "w-0 opacity-0 ml-0" : "w-auto opacity-100 ml-2"}
              text-gray-900
              ${dropdownOpen ? "text-white" : "group-hover:text-white"}
            `}
          >
            Đạt Nguyễn
            <ChevronsUpDown
              className={`ml-2 w-4 h-4 transition-colors duration-300
                ${
                  dropdownOpen
                    ? "text-yellow-300"
                    : "text-blue-400 group-hover:text-yellow-300"
                }
              `}
            />
          </span>
        </button>
        {/* Dropdown menu */}
        {dropdownOpen && (
          <div
            className="absolute left-16 top-20 z-20 bg-white border rounded-lg shadow-lg min-w-[160px] py-2 animate-fade-in"
            id="sidebar-avatar-dropdown-menu"
          >
            <Link 
              to="/profile" 
              className="block w-full text-left px-4 py-2 hover:bg-blue-50"
              onClick={() => setDropdownOpen(false)}
            >
              Thông tin cá nhân
            </Link>
            <button className="block w-full text-left px-4 py-2 hover:bg-blue-50">
              Đổi mật khẩu
            </button>
            <button className="block w-full text-left px-4 py-2 hover:bg-blue-50 text-red-500">
              Đăng xuất
            </button>
          </div>
        )}
        <button
          className="absolute -right-3 top-1/2 -translate-y-1/2 bg-white border rounded-full shadow p-1 hover:bg-gray-100 transition z-10"
          onClick={() => setCollapsed((c) => !c)}
          aria-label="Toggle sidebar"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
      {/* Menu */}
      <ul className="flex flex-col gap-1 py-6 flex-1">
        {menu.map((item) => (
          <li key={item.to}>
            <Link
              to={item.to}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-all duration-300
  ${
    location.pathname === item.to
      ? "bg-gradient-to-r from-blue-600 to-blue-400 text-white shadow-lg border-l-4 border-blue-300"
      : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
  }`}
            >
              <span className="flex-shrink-0 pl-3">{item.icon}</span>
              <span
                className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${
                  collapsed ? "w-0 opacity-0 ml-0" : "w-auto opacity-100 ml-2"
                }`}
              >
                {item.label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {/* Footer */}
      <div
        className={`px-6 py-4 border-t text-xs text-gray-400 transition-all duration-300 whitespace-nowrap overflow-hidden ${
          collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
        }`}
      >
        © 2025 EV Charging
      </div>
    </aside>
  );
};

export default SideBar;
