// src/routes/AppRoutes.tsx
import { Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Home from "../pages/Home";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        {/* <Route path="/about" element={<About />} /> */}
        {/* Các trang dùng MainLayout */}
      </Route>
      {/* <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
      </Route> */}
    </Routes>
  );
}
