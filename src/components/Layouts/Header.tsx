import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { User } from "@interfaces/Auth";
import type { RootState, AppDispatch } from "@redux/store/store";
import { useNavigate, Link } from "react-router-dom";
import { getCookie } from "@libs/utils";
import { logoutUser } from "@redux/slice/Auth/authThunks";
import { fetchWalletThunk } from "@redux/slice/Payment/PaymentThunks";
import logo from "@assets/logo.png";

import  {Button}  from "@components/Ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@components/Ui/DropdownMenu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@components/Ui/Select";

import { User as UserIcon, LogOut, Wallet, ChevronDown, Edit3, Bell } from "lucide-react";
import NotificationItem, { type Notification as NotificationType } from "@components/Ui/NotificationItem";
import api from "@libs/axios";
import VehicleEditModal from "@components/Vehicle/VehicleEditModal";
import { fetchVehiclesThunk } from "@redux/slice/Vehical/VehicalThunk";
import {
  setSelectedVehicle,
  selectVehicles,
  selectSelectedVehicleId,
} from "@redux/slice/Vehical/VehicalSlice";
import { selectVehicalLoading } from "@redux/slice/Vehical/VehicalSelector";

const navItems = [
  { label: "Home", to: "/" },
  { label: "About Us", to: "/about" },
  { label: "News", to: "/news" },
  { label: "Contact Us", to: "/contact" },
];

export default function Header() {
  // Notification popup state và ref phải khai báo trước khi dùng trong useEffect
  const [showNoti, setShowNoti] = useState(false);
  const notiPopupRef = useRef<HTMLDivElement>(null);
  // Đóng popup khi click ra ngoài
  useEffect(() => {
    if (!showNoti) return;
    const handleClick = (e: MouseEvent) => {
      if (notiPopupRef.current && !notiPopupRef.current.contains(e.target as Node)) {
        setShowNoti(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showNoti]);
  const [openMobile, setOpenMobile] = useState(false);
  const [cookieUser, setCookieUser] = useState<User | null>(null);
  // vehicles are stored in redux
  const vehicles = useSelector(selectVehicles);
  const selectedVehicle = useSelector(selectSelectedVehicleId);
  const vehicalLoading = useSelector(selectVehicalLoading);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const wallet = useSelector((state: RootState) => state.payment.wallet);
  const [editingVehicle, setEditingVehicle] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [loadingNoti, setLoadingNoti] = useState(false);
  const [notiError, setNotiError] = useState<string|null>(null);
  const vehicleToEdit = vehicles.find((v) => v.id === editingVehicle) ?? null;

  // Compute membership plan code for display (PRO, BASIC, FREE)
  const planCode: string = (
    (cookieUser as unknown as { membership?: { plan_code?: string } })?.membership?.plan_code ||
    "FREE"
  );

  const renderPlanBadge = (code: string) => {
    const c = (code || 'FREE').toUpperCase();
    const base = 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold mr-2';
    if (c === 'PRO') return <span className={base + ' bg-green-50 text-green-700'}>{c}</span>;
    if (c === 'BASIC') return <span className={base + ' bg-yellow-50 text-yellow-700'}>{c}</span>;
    return <span className={base + ' bg-gray-100 text-gray-700'}>{c}</span>;
  };

  // Fetch notifications when popup opens
  useEffect(() => {
    if (!showNoti) return;
    setLoadingNoti(true);
    setNotiError(null);
    api.get("/notifications")
      .then(res => setNotifications(res.data?.data || []))
      .catch(e => setNotiError(e?.response?.data?.msg || e.message || "Lỗi tải thông báo"))
      .finally(() => setLoadingNoti(false));
  }, [showNoti]);

  // Mark all as read
  const markAllRead = async () => {
    try {
      await api.post("/notifications/read-all");
      setNotifications((n) => n.map((x) => ({ ...x, isRead: true, readAt: x.readAt || new Date().toISOString() })));
    } catch (e) {
      console.error("Failed to mark all notifications as read", e);
    }
  };
  // Mark one as read
  const markOneRead = async (id: string) => {
    try {
      await api.post(`/notifications/${id}/read`);
      setNotifications((n) => n.map((x) => (x.id === id ? { ...x, isRead: true, readAt: x.readAt || new Date().toISOString() } : x)));
    } catch (e) {
      console.error(`Failed to mark notification ${id} as read`, e);
    }
  };

  useEffect(() => {
    const userStr = getCookie("user");
    if (userStr) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(userStr));
        // Also attempt to read membership cookie if backend stored it separately
        const membershipStr = getCookie("membership");
        let userWithMembership: unknown = parsedUser;
        if (membershipStr) {
          try {
            const parsedMembership = JSON.parse(decodeURIComponent(membershipStr));
            userWithMembership = { ...(parsedUser as Record<string, unknown>), membership: parsedMembership };
          } catch (e) {
            console.warn("Failed to parse membership cookie", e);
          }
        }
        setCookieUser(userWithMembership as User);
        dispatch(fetchWalletThunk());
      } catch {
        setCookieUser(null);
      }
    } else {
      setCookieUser(null);
    }

    // fetch user's vehicles from API
    if (userStr) {
      dispatch(fetchVehiclesThunk());
    }
  }, [dispatch]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/login");
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" aria-label="Home">
          <img src={logo} alt="Logo" className="h-10 w-auto" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-12">
          {navItems.map((n) => (
            <Link
              key={n.label}
              to={n.to}
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              {n.label}
            </Link>
          ))}

          {/* Features Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-0 py-0 focus:outline-none focus:ring-0 focus-visible:underline inline-flex items-center gap-1">
                <span>Features</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem asChild>
                <Link to="/booking">Booking</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/pricing">Pricing</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/faq">FAQ</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Right */}
        <div className="flex items-center space-x-3">
          {/* Notification Bell */}
          {cookieUser && (
            <div className="relative">
              <button
                className="relative p-2 rounded-full hover:bg-gray-100 focus:outline-none"
                onClick={() => setShowNoti(v => !v)}
                aria-label="Thông báo"
              >
                <Bell className="w-6 h-6 text-gray-700" />
                {notifications.some(n => !n.isRead) && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>
              {showNoti && (
                <div ref={notiPopupRef} className="absolute right-0 mt-2 w-96 max-w-[90vw] bg-white border rounded-xl shadow-lg z-50">
                  <div className="flex items-center justify-between px-4 py-2 border-b">
                    <span className="font-semibold">Thông báo</span>
                    <button className="text-xs text-blue-600 hover:underline" onClick={markAllRead}>Đánh dấu đã đọc tất cả</button>
                  </div>
                  <div className="max-h-96 overflow-y-auto divide-y">
                    {loadingNoti ? (
                      <div className="p-4 text-center text-gray-500">Đang tải...</div>
                    ) : notiError ? (
                      <div className="p-4 text-center text-red-500">{notiError}</div>
                    ) : notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">Không có thông báo</div>
                    ) : notifications.map(noti => (
                      <div key={noti.id} className="hover:bg-gray-50 transition">
                        <NotificationItem notification={noti} onClick={() => markOneRead(noti.id)} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {/* Wallet */}
          {cookieUser && (
            <Link
              to="/wallet"
              className="hidden md:flex items-center gap-2 px-3 py-1 rounded bg-blue-50 text-blue-700 font-medium hover:bg-blue-100 transition"
            >
              <Wallet className="w-5 h-5" />
              <span>{wallet?.balance !== undefined ? `${wallet.balance.toLocaleString()}₫` : "..."}</span>
            </Link>
          )}

          {/* Vehicle Select or register button */}
          <div className="hidden md:block">
            {vehicalLoading ? (
              <div className="w-[160px] animate-pulse">
                <div className="h-8 bg-gray-200 rounded" />
              </div>
            ) : cookieUser && vehicles.length === 0 ? (
              <Button variant="default" onClick={() => navigate("/vehicles/new")}> 
                Đăng ký xe
              </Button>
            ) : (
              <Select
                value={selectedVehicle ?? ""}
                onValueChange={(value) => {
                  if (value === "__register__") {
                    navigate("/vehicles/new");
                    return;
                  }
                  dispatch(setSelectedVehicle(value || null));
                }}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Chọn xe" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((v) => (
                    <SelectItem key={v.id} value={v.id} className="group">
                      <div className="flex items-center justify-between w-full">
                        <span className="truncate">{v.model}</span>
                        <button
                          type="button"
                          onPointerDown={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setEditingVehicle(v.id);
                            setEditModalOpen(true);
                          }}
                          aria-label={`Edit ${v.model}`}
                          className="ml-2 opacity-0 group-hover:opacity-100"
                        >
                          <Edit3 className="w-4 h-4 text-blue-600" />
                        </button>
                      </div>
                    </SelectItem>
                  ))}
                  {vehicles.length > 0 && (
                    <SelectItem value="__register__">Register another</SelectItem>
                  )}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* User */}
          {cookieUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2">
                      <UserIcon className="w-5 h-5" />
                      {/* membership badge + name */}
                      {renderPlanBadge(planCode)}
                      {cookieUser.name || cookieUser.email}
                    </Button>
                  </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem asChild>
                  <Link to="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="default" onClick={() => navigate("/login")}>
              Login
            </Button>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setOpenMobile((v) => !v)}
            className="md:hidden"
            aria-label="Open menu"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              className="text-gray-700"
            >
              <path
                d="M4 6h16M4 12h16M4 18h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile panel */}
      {openMobile && (
        <div className="md:hidden border-t bg-white">
          <div className="px-3 py-2 space-y-2">
            {navItems.map((n) => (
              <Link
                key={n.label}
                to={n.to}
                className="block px-3 py-2 rounded hover:bg-gray-100 transition"
                onClick={() => setOpenMobile(false)}
              >
                {n.label}
              </Link>
            ))}

            <div className="px-1">
              {vehicalLoading ? (
                <div className="w-full animate-pulse">
                  <div className="h-10 bg-gray-200 rounded" />
                </div>
              ) : (
                <Select
                  value={selectedVehicle ?? ""}
                  onValueChange={(value) => {
                    if (value === "__register__") {
                      setOpenMobile(false);
                      navigate("/vehicles/new");
                      return;
                    }
                    dispatch(setSelectedVehicle(value || null));
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn xe" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((v) => (
                      <SelectItem key={v.id} value={v.id} className="group">
                        <div className="flex items-center justify-between w-full">
                          <span className="truncate">{v.model}</span>
                          <button
                            type="button"
                            onPointerDown={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              setOpenMobile(false);
                              setEditingVehicle(v.id);
                              setEditModalOpen(true);
                            }}
                            aria-label={`Edit ${v.model}`}
                            className="ml-2 opacity-0 group-hover:opacity-100"
                          >
                            <Edit3 className="w-4 h-4 text-blue-600" />
                          </button>
                        </div>
                      </SelectItem>
                    ))}
                    {vehicles.length > 0 && (
                      <SelectItem value="__register__">Register another</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Vehicle edit modal */}
            <VehicleEditModal
              open={editModalOpen}
              onClose={() => setEditModalOpen(false)}
              vehicle={vehicles.find((x) => x.id === editingVehicle) ?? null}
            />

            {!cookieUser && (
              <Button
                variant="default"
                className="w-full"
                onClick={() => {
                  setOpenMobile(false);
                  navigate("/login");
                }}
              >
                Login
              </Button>
            )}
          </div>
        </div>
      )}
      {/* Vehicle edit modal (desktop + mobile) */}
      <VehicleEditModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        vehicle={vehicleToEdit}
      />
    </header>
  );
}
