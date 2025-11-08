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
const UserManager = lazy(() => import("@pages/Admin/Users/UserManager"));
const EditUser = lazy(() => import("@pages/Admin/Users/EditUser"));
const UserDetail = lazy(() => import("@pages/Admin/Users/UserDetail"));
const AdminTariffs = lazy(() => import("@pages/Admin/Tariffs/Tariffs"));
const StationsManager = lazy(() => import("@pages/Admin/Infrastructure/StationsManager"));
const ChargersManager = lazy(() => import("@pages/Admin/Infrastructure/ChargersManager"));
const ConnectorsManager = lazy(() => import("@pages/Admin/Infrastructure/ConnectorsManager"));
const StationsCreateEdit = lazy(() => import("@pages/Admin/Infrastructure/StationsCreateEdit"));
const ChargersCreateEdit = lazy(() => import("@pages/Admin/Infrastructure/ChargersCreateEdit"));
const ConnectorsCreateEdit = lazy(() => import("@pages/Admin/Infrastructure/ConnectorsCreateEdit"));
const EditTariff = lazy(() => import("@pages/Admin/Tariffs/EditTariff"));
const CreateTariff = lazy(() => import("@pages/Admin/Tariffs/CreateTariff"));
const AIForecast = lazy(() => import("@pages/Admin/AIForecast"));



const PaymentManager = lazy(
  () => import("@pages/Admin/Payments/PaymentManager")
);
const BookingManagement = lazy(
  () => import("@pages/Admin/Bookings/BookingManagement")
);
const BookingManagementDetail = lazy(
  () => import("@pages/Admin/Bookings/BookingManagementDetail")
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
            path="/admin/users"
            element={createLazyRoute(UserManager, "Loading user management...")}
          />
          <Route
            path="/admin/users/edit/:userId"
            element={createLazyRoute(EditUser, "Loading edit user...")}
          />
          <Route
            path="/admin/users/view/:userId"
            element={createLazyRoute(UserDetail, "Loading user details...")}
          />
          {/* Legacy tariffs route - optional keep */}
          <Route path="/admin/tariffs" element={createLazyRoute(AdminTariffs, "Loading tariff management...")} />
          {/* Infrastructure group */}
          <Route path="/admin/infrastructure/stations" element={createLazyRoute(StationsManager, "Loading stations management...")} />
          <Route path="/admin/infrastructure/stations/create" element={createLazyRoute(StationsCreateEdit, "Loading create station...")} />
          <Route path="/admin/infrastructure/stations/edit/:stationId" element={createLazyRoute(StationsCreateEdit, "Loading edit station...")} />
          <Route path="/admin/infrastructure/chargers" element={createLazyRoute(ChargersManager, "Loading chargers management...")} />
          <Route path="/admin/infrastructure/chargers/create" element={createLazyRoute(ChargersCreateEdit, "Loading create charger...")} />
          <Route path="/admin/infrastructure/chargers/edit/:chargerId" element={createLazyRoute(ChargersCreateEdit, "Loading edit charger...")} />
          <Route path="/admin/infrastructure/connectors" element={createLazyRoute(ConnectorsManager, "Loading connectors management...")} />
          <Route path="/admin/infrastructure/connectors/create" element={createLazyRoute(ConnectorsCreateEdit, "Loading create connector...")} />
          <Route path="/admin/infrastructure/connectors/edit/:connectorId" element={createLazyRoute(ConnectorsCreateEdit, "Loading edit connector...")} />
          <Route path="/admin/infrastructure/tariffs" element={createLazyRoute(AdminTariffs, "Loading tariff management...")} />
          <Route
            path="/admin/tariffs/create"
            element={createLazyRoute(CreateTariff, "Loading create tariff...")}
          />
          <Route
            path="/admin/ai-forecast"
            element={createLazyRoute(AIForecast, "Loading AI forecast...")}
          />
          <Route
            path="/admin/tariffs/edit/:tariffId"
            element={createLazyRoute(EditTariff, "Loading edit tariff...")}
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
              BookingManagement,
              "Loading booking management..."
            )}
          />
          <Route
            path="/admin/bookings/view/:bookingId"
            element={createLazyRoute(
              BookingManagementDetail,
              "Loading booking detail..."
            )}
          />
        </Route>
      </Routes>
    </Suspense>
  );
}
