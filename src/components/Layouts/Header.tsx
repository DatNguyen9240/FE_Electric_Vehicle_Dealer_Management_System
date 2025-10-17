import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { User } from "@interfaces/Auth";
import type { RootState, AppDispatch } from "@redux/store/store";
import { useNavigate, Link } from "react-router-dom";
import { getCookie } from "@libs/utils";
import { logoutUser } from "@redux/slice/Auth/authThunks";
import { fetchWalletThunk } from "@redux/slice/Payment/PaymentThunk";
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

import { User as UserIcon, LogOut, Wallet, ChevronDown, Edit3 } from "lucide-react";
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
  const vehicleToEdit = vehicles.find((v) => v.id === editingVehicle) ?? null;

  useEffect(() => {
    const userStr = getCookie("user");
    if (userStr) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(userStr));
        setCookieUser(parsedUser);
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
