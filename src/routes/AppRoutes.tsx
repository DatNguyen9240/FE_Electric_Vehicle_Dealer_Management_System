import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import LazyLoading from "@components/Ui/LazyLoading";

// Simple lazy loading without error handling
const MainLayout = lazy(() => import("@layouts/MainLayout"));
const AdminLayout = lazy(() => import("@layouts/AdminLayout"));

const Home = lazy(() => import("@pages/Home"));
const ContactUs = lazy(() => import("@pages/ContactUs"));
const FAQ = lazy(() => import("@pages/FAQ"));
const News = lazy(() => import("@pages/News"));
const Login = lazy(() => import("@pages/Login"));
const Signup = lazy(() => import("@pages/Signup"));
const Pricing = lazy(() => import("@pages/Pricing"));
const AboutUs = lazy(() => import("@pages/AboutUs"));
const Booking = lazy(() => import("@pages/Booking"));

const AdminDashboard = lazy(() => import("@pages/Admin/AdminDashboard"));
const StaffManager = lazy(() => import("@pages/Admin/Staffs/StaffManager"));
const UserManager = lazy(() => import("@pages/Admin/Users/UserManager"));
const PaymentManager = lazy(
  () => import("@pages/Admin/Payments/PaymentManager")
);
const BookingManager = lazy(
  () => import("@pages/Admin/Bookings/BookingManager")
);

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        element={
          <Suspense fallback={<LazyLoading message="Loading layout..." />}>
            <MainLayout />
          </Suspense>
        }
      >
        <Route
          path="/"
          element={
            <Suspense fallback={<LazyLoading message="Loading home..." />}>
              <Home />
            </Suspense>
          }
        />
        <Route
          path="/contact"
          element={
            <Suspense fallback={<LazyLoading message="Loading contact..." />}>
              <ContactUs />
            </Suspense>
          }
        />
        <Route
          path="/faq"
          element={
            <Suspense fallback={<LazyLoading message="Loading FAQ..." />}>
              <FAQ />
            </Suspense>
          }
        />
        <Route
          path="/news"
          element={
            <Suspense fallback={<LazyLoading message="Loading news..." />}>
              <News />
            </Suspense>
          }
        />
        <Route
          path="/pricing"
          element={
            <Suspense fallback={<LazyLoading message="Loading pricing..." />}>
              <Pricing />
            </Suspense>
          }
        />
        <Route
          path="/about"
          element={
            <Suspense fallback={<LazyLoading message="Loading about..." />}>
              <AboutUs />
            </Suspense>
          }
        />
        <Route
          path="/booking"
          element={
            <Suspense fallback={<LazyLoading message="Loading booking..." />}>
              <Booking />
            </Suspense>
          }
        />
      </Route>

      <Route
        path="/login"
        element={
          <Suspense fallback={<LazyLoading message="Loading login..." />}>
            <Login />
          </Suspense>
        }
      />
      <Route
        path="/signup"
        element={
          <Suspense fallback={<LazyLoading message="Loading signup..." />}>
            <Signup />
          </Suspense>
        }
      />

      <Route
        element={
          <Suspense
            fallback={<LazyLoading message="Loading admin layout..." />}
          >
            <AdminLayout />
          </Suspense>
        }
      >
        <Route
          path="/admin"
          element={
            <Suspense fallback={<LazyLoading message="Loading dashboard..." />}>
              <AdminDashboard />
            </Suspense>
          }
        />
        <Route
          path="/admin/staffs"
          element={
            <Suspense
              fallback={<LazyLoading message="Loading staff management..." />}
            >
              <StaffManager />
            </Suspense>
          }
        />
        <Route
          path="/admin/users"
          element={
            <Suspense
              fallback={<LazyLoading message="Loading user management..." />}
            >
              <UserManager />
            </Suspense>
          }
        />
        <Route
          path="/admin/payments"
          element={
            <Suspense fallback={<LazyLoading message="Loading payments..." />}>
              <PaymentManager />
            </Suspense>
          }
        />
        <Route
          path="/admin/bookings"
          element={
            <Suspense fallback={<LazyLoading message="Loading bookings..." />}>
              <BookingManager />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  );
}
