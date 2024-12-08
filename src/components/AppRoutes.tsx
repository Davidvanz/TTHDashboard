import { Routes, Route } from "react-router-dom";
import { DashboardLayout } from "./DashboardLayout";
import { routes } from "@/config/routes";

export const AppRoutes = () => {
  return (
    <Routes>
      {routes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={<DashboardLayout>{route.element}</DashboardLayout>}
        />
      ))}
    </Routes>
  );
};