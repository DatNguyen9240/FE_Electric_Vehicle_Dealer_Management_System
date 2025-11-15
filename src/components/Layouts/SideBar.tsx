import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  ServerCog,
  Building2,
  Plug,
  Zap,
  BadgeDollarSign,
  ChevronDown,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export type SidebarMenuItem = {
  key?: string;
  label: string;
  icon: React.ReactNode;
  to?: string;
  onClick?: () => void;
};

type DropdownItem = {
  key?: string;
  label: string;
  to?: string;
  onClick?: (e: React.MouseEvent) => void;
  danger?: boolean;
};

type SideBarProps = {
  menu?: SidebarMenuItem[];
  avatarSrc?: string;
  avatarName?: string;
  dropdownItems?: DropdownItem[];
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onToggle?: (collapsed: boolean) => void;
  currentPath?: string;
  showInfrastructure?: boolean; // Thêm prop để hiển thị infrastructure section
};

const SideBar: React.FC<SideBarProps> = ({
  menu = [],
  avatarSrc = "/avatar/01.png",
  avatarName = "",
  dropdownItems = [],
  collapsed: collapsedProp,
  defaultCollapsed = false,
  onToggle,
  currentPath,
  showInfrastructure = false,
}) => {
  const location = useLocation();
  const [internalCollapsed, setInternalCollapsed] = React.useState(defaultCollapsed);
  const collapsed = typeof collapsedProp === "boolean" ? collapsedProp : internalCollapsed;

  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [infraOpen, setInfraOpen] = React.useState(false);

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

  const handleToggle = () => {
    const next = !collapsed;
    if (typeof collapsedProp !== "boolean") {
      setInternalCollapsed(next);
    }
    onToggle?.(next);
  };

  const activePath = currentPath ?? location.pathname;

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
            src={avatarSrc}
            alt="Avatar"
            className="w-10 h-10 rounded-full object-cover bg-gray-100 transition-all duration-300"
          />
          <span
            className={`flex items-center font-bold text-xl tracking-wide transition-all duration-300 whitespace-nowrap overflow-hidden
              ${collapsed ? "w-0 opacity-0 ml-0" : "w-auto opacity-100 ml-2"}
              text-gray-900
              ${dropdownOpen ? "text-white" : "group-hover:text-white"}
            `}
          >
            {avatarName}
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
        {dropdownOpen && dropdownItems.length > 0 && (
          <div
            className="absolute left-16 top-20 z-20 bg-white border rounded-lg shadow-lg min-w-[160px] py-2 animate-fade-in"
            id="sidebar-avatar-dropdown-menu"
          >
            {dropdownItems.map((it) => {
              const key = it.key ?? it.label;
              const className = `block w-full text-left px-4 py-2 hover:bg-blue-50 ${it.danger ? "text-red-500" : ""}`;
              if (it.to) {
                return (
                  <Link key={key} to={it.to} className={className} onClick={() => setDropdownOpen(false)}>
                    {it.label}
                  </Link>
                );
              }
              return (
                <button
                  key={key}
                  className={className}
                  onClick={(e) => {
                    setDropdownOpen(false);
                    it.onClick?.(e);
                  }}
                >
                  {it.label}
                </button>
              );
            })}
          </div>
        )}
        <button
          className="absolute -right-3 top-1/2 -translate-y-1/2 bg-white border rounded-full shadow p-1 hover:bg-gray-100 transition z-10"
          onClick={handleToggle}
          aria-label="Toggle sidebar"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
      {/* Menu */}
      <ul className="flex flex-col gap-1 py-6 flex-1">
        {menu.map((item) => {
          const key = item.key ?? item.to ?? item.label;
          const active = item.to ? activePath === item.to : false;
          const baseClass = `flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
            active
              ? "bg-gradient-to-r from-blue-600 to-blue-400 text-white shadow-lg border-l-4 border-blue-300"
              : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
          }`;

          return (
            <li key={key}>
              {item.to ? (
                <Link to={item.to} className={baseClass} onClick={item.onClick}>
                  <span className="flex-shrink-0 pl-3">{item.icon}</span>
                  <span
                    className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${
                      collapsed ? "w-0 opacity-0 ml-0" : "w-auto opacity-100 ml-2"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              ) : (
                <button className={baseClass} onClick={item.onClick}>
                  <span className="flex-shrink-0 pl-3">{item.icon}</span>
                  <span
                    className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${
                      collapsed ? "w-0 opacity-0 ml-0" : "w-auto opacity-100 ml-2"
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              )}
            </li>
          );
        })}

        {/* Infrastructure group */}
        {showInfrastructure && (
          <li className="mt-2">
            <button
              onClick={() => setInfraOpen((v) => !v)}
              className={`w-full flex items-center justify-between px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                activePath.startsWith("/admin/infrastructure")
                  ? "bg-gradient-to-r from-blue-600 to-blue-400 text-white shadow-lg border-l-4 border-blue-300"
                  : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
              }`}
            >
              <span className="flex items-center gap-3">
                <ServerCog size={20} />
                <span className={`${collapsed ? "hidden" : "block"}`}>Infrastructure</span>
              </span>
              {!collapsed && <ChevronDown className={`${infraOpen ? "rotate-180" : ""} transition-transform`} size={16} />}
            </button>
            {infraOpen && !collapsed && (
              <ul className="mt-1 ml-8 flex flex-col gap-1">
                <li>
                  <Link
                    to="/admin/infrastructure/stations"
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                      activePath === "/admin/infrastructure/stations"
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-700 hover:bg-blue-50"
                    }`}
                  >
                    <Building2 size={18} />
                    Stations
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/infrastructure/chargers"
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                      activePath === "/admin/infrastructure/chargers"
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-700 hover:bg-blue-50"
                    }`}
                  >
                    <Zap size={18} />
                    Chargers
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/infrastructure/connectors"
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                      activePath === "/admin/infrastructure/connectors"
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-700 hover:bg-blue-50"
                    }`}
                  >
                    <Plug size={18} />
                    Connectors
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/infrastructure/tariffs"
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                      activePath === "/admin/infrastructure/tariffs"
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-700 hover:bg-blue-50"
                    }`}
                  >
                    <BadgeDollarSign size={18} />
                    Tariffs
                  </Link>
                </li>
              </ul>
            )}
          </li>
        )}
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
