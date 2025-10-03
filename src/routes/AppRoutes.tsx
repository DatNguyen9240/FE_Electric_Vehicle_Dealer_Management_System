import { Suspense, lazy } from "react";
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
const BookingSlots = lazy(() => import("@pages/BookingSlots"));
const ChargingHistory = lazy(() => import("@pages/ChargingHistory"));
const UserProfile = lazy(() => import("@pages/UserProfile"));

const AdminDashboard = lazy(() => import("@pages/Admin/AdminDashboard"));
const StaffManager = lazy(() => import("@pages/Admin/Staffs/StaffManager"));
const UserManager = lazy(() => import("@pages/Admin/Users/UserManager"));
const AdminTariffs = lazy(() => import("@pages/Admin/Tariffs/Tariffs"));
const PaymentManager = lazy(
  () => import("@pages/Admin/Payments/PaymentManager")
);
const BookingManager = lazy(
  () => import("@pages/Admin/Bookings/BookingManager")
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
            path="/about"
            element={createLazyRoute(AboutUs, "Loading about us...")}
          />
          <Route
            path="/booking"
            element={createLazyRoute(Booking, "Loading booking system...")}
          />
          <Route
            path="/booking-slots"
            element={createLazyRoute(BookingSlots, "Loading slot selection...")}
          />
          <Route
            path="/charging-history"
            element={createLazyRoute(ChargingHistory, "Loading charging history...")}
          />
          <Route
            path="/profile"
            element={createLazyRoute(UserProfile, "Loading user profile...")}
          />
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
              BookingManager,
              "Loading booking management..."
            )}
          />
        </Route>
      </Routes>
    </Suspense>
  );
}
