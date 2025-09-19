// src/routes/AppRoutes.tsx
import { Routes, Route } from "react-router-dom";
import { MainLayout, AdminLayout } from "@layouts/index";
import {
  Home,
  ContactUs,
  FAQ,
  News,
  Login,
  Signup,
  Pricing,
  AboutUs,
  Booking,
  AdminDashboard,
} from "@pages";
export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/news" element={<News />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/booking" element={<Booking />} />
        {/* Các trang dùng MainLayout */}
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>
    </Routes>
  );
}
