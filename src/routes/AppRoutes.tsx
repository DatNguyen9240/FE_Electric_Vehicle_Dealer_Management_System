import { Suspense, lazy } from "react";
const FakeStationPage = lazy(() => import("@pages/FakeStationPage"));
import { Routes, Route } from "react-router-dom";
import LazyLoading from "@components/Ui/LazyLoading";

// Lazy load layouts
const MainLayout = lazy(() => import("@layouts/MainLayout"));
const AdminLayout = lazy(() => import("@layouts/AdminLayout"));

// Lazy load main pages
const Home = lazy(() => import("@pages/Home"));
const ContactUs = lazy(() => import("@pages/ContactUs"));
const FAQ = lazy(() => import("@pages/FAQ"));
const News = lazy(() => import("@pages/News"));
const Login = lazy(() => import("@pages/Login"));
const Signup = lazy(() => import("@pages/Signup"));
const Pricing = lazy(() => import("@pages/Pricing"));
const AboutUs = lazy(() => import("@pages/AboutUs"));
const Booking = lazy(() => import("@pages/Booking"));
const Wallet = lazy(() => import("@pages/Wallet"));
const NewVehicle = lazy(() => import("@pages/Vehicles/NewVehicle"));
const Topup = lazy(() => import("@pages/Topup"));
const TopupCancel = lazy(() => import("@pages/TopupCancel"));
const TopupSuccess = lazy(() => import("@pages/TopupSuccess"));
const BookingSlots = lazy(() => import("@pages/BookingSlots"));
const ChargingHistory = lazy(() => import("@pages/ChargingHistory"));
const UserProfile = lazy(() => import("@pages/UserProfile"));
const UserChargerList = lazy(() => import("@pages/ChargerList"));
const UserBookingDetails = lazy(() => import("@pages/UserBookingDetails"));
const PurchaseMembership = lazy(
  () => import("@pages/PurchaseMembership")
);
const AdminDashboard = lazy(() => import("@pages/Admin/AdminDashboard"));
const StaffManager = lazy(() => import("@pages/Admin/Staffs/StaffManager"));
const UserManager = lazy(() => import("@pages/Admin/Users/UserManager"));
const AdminTariffs = lazy(() => import("@pages/Admin/Tariffs/Tariffs"));

const StaffLayout = lazy(() => import("@layouts/StaffLayout"));
// Staff pages (staff-facing)
const StaffStationDashboard = lazy(() => import("@pages/Staff/StationDashboard"));
const StaffChargingSessions = lazy(() => import("@pages/Staff/ChargingSessions"));
const StaffOnsitePayment = lazy(() => import("@pages/Staff/OnsitePayment"));
const StaffIncidents = lazy(() => import("@pages/Staff/Incidents"));
const StaffBookings = lazy(() => import("@pages/Staff/Bookings"));


const PaymentManager = lazy(
  () => import("@pages/Admin/Payments/PaymentManager")
);
const StationList = lazy(
  () => import("@pages/Admin/Bookings/StationList")
);
const StationConnectors = lazy(
  () => import("@pages/Admin/Bookings/ChargerList")
);
const SlotList = lazy(
  () => import("@pages/Admin/Bookings/SlotList")
);
const BookingDetails = lazy(
  () => import("@pages/Admin/Bookings/BookingDetails")
);

const createLazyRoute = (
  Component: React.LazyExoticComponent<React.ComponentType<object>>,
  message: string
) => (
  <Suspense fallback={<LazyLoading message={message} />}>
    <Component />
  </Suspense>
);

export default function AppRoutes() {
  return (
    <Suspense fallback={<LazyLoading message="Starting application..." />}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route
            path="/"
            element={createLazyRoute(Home, "Loading home page...")}
          />
          <Route
            path="/contact"
            element={createLazyRoute(ContactUs, "Loading contact page...")}
          />
          <Route path="/faq" element={createLazyRoute(FAQ, "Loading FAQ...")} />
          <Route
            path="/news"
            element={createLazyRoute(News, "Loading news...")}
          />
          <Route
            path="/pricing"
            element={createLazyRoute(Pricing, "Loading pricing...")}
          />
          <Route
            path="/membership/purchase/:code"
            element={createLazyRoute(PurchaseMembership, "Loading purchase membership...")}
          />
          <Route
            path="/about"
            element={createLazyRoute(AboutUs, "Loading about us...")}
          />
          <Route
            path="/booking"
            element={createLazyRoute(Booking, "Loading booking system...")}
          />
          <Route
            path="/wallet"
            element={createLazyRoute(Wallet, "Loading wallet...")}
          />
          <Route
            path="/topup"
            element={createLazyRoute(Topup, "Loading top-up page...")}
          />
          <Route
            path="/topup/cancel"
            element={createLazyRoute(TopupCancel, "Loading cancel page...")}
          />
          <Route
            path="/topup/success"
            element={createLazyRoute(TopupSuccess, "Loading success page...")}
          />
          <Route
            path="/booking/station/:stationId"
            element={createLazyRoute(UserChargerList, "Loading chargers...")}
          />
          <Route
            path="/booking/station/:stationId/charger/:chargerId"
            element={createLazyRoute(BookingSlots, "Loading slot selection...")}
          />
          <Route
            path="/booking/station/:stationId/charger/:chargerId/book/:timeSlot"
            element={createLazyRoute(UserBookingDetails, "Loading booking details...")}
          />
          <Route
            path="/charging-history"
            element={createLazyRoute(ChargingHistory, "Loading charging history...")}
          />
          <Route
            path="/profile"
            element={createLazyRoute(UserProfile, "Loading user profile...")}
          />
          <Route
            path="/vehicles/new"
            element={createLazyRoute(NewVehicle, "Loading vehicle registration...")}
          />
          <Route
            path="/fake-station"
            element={createLazyRoute(FakeStationPage, "Loading fake station...")}
          />
          <Route
            path="/fake-station/:stationId"
            element={createLazyRoute(FakeStationPage, "Loading fake station...")}
          />
          {/* Đã bỏ route /fake-station/:stationId/charger/:chargerId */}
        </Route>
        <Route
          path="/login"
          element={createLazyRoute(Login, "Loading login page...")}
        />
        <Route
          path="/signup"
          element={createLazyRoute(Signup, "Loading signup page...")}
        />

        <Route element={<AdminLayout />}>
          <Route
            path="/admin"
            element={createLazyRoute(
              AdminDashboard,
              "Loading admin dashboard..."
            )}
          />
          <Route
            path="/admin/staffs"
            element={createLazyRoute(
              StaffManager,
              "Loading staff management..."
            )}
          />
        
          <Route
            path="/admin/users"
            element={createLazyRoute(UserManager, "Loading user management...")}
          />
          <Route
            path="/admin/tariffs"
            element={createLazyRoute(
              AdminTariffs,
              "Loading tariff management..."
            )}
          />
          <Route
            path="/admin/payments"
            element={createLazyRoute(
              PaymentManager,
              "Loading payment management..."
            )}
          />
          <Route
            path="/admin/bookings"
            element={createLazyRoute(
              StationList,
              "Loading stations..."
            )}
          />
          <Route
            path="/admin/bookings/station/:stationId"
            element={createLazyRoute(
              StationConnectors,
              "Loading chargers..."
            )}
          />
          <Route
            path="/admin/bookings/station/:stationId/charger/:chargerId"
            element={createLazyRoute(
              SlotList,
              "Loading time slots..."
            )}
          />
          <Route
            path="/admin/bookings/station/:stationId/charger/:chargerId/book/:timeSlot"
            element={createLazyRoute(
              BookingDetails,
              "Loading booking details..."
            )}
          />
        </Route>
        <Route element={<StaffLayout />}>
          <Route path="/staff" element={createLazyRoute(StaffStationDashboard, "Loading staff dashboard...")} />
          <Route path="/staff/sessions" element={createLazyRoute(StaffChargingSessions, "Loading sessions...")} />
          <Route path="/staff/payments" element={createLazyRoute(StaffOnsitePayment, "Loading onsite payment...")} />
          <Route path="/staff/incidents" element={createLazyRoute(StaffIncidents, "Loading incidents...")} />
          <Route path="/staff/bookings" element={createLazyRoute(StaffBookings, "Loading bookings...")} />
          <Route path="/staff/manage" element={createLazyRoute(StaffManager, "Loading staff management...")} />
        </Route>
      </Routes>
    </Suspense>
  );
}
