import { Routes, Route, Navigate } from "react-router-dom";
import { DashboardLayout } from "./DashboardLayout";
import { routes } from "@/config/routes";
import Login from "@/pages/Login";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      {routes
        .filter(route => route.path !== "/" && route.path !== "/login")
        .map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={<DashboardLayout>{route.element}</DashboardLayout>}
          />
        ))}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};