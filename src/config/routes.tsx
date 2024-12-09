import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import Bookings from "@/pages/Bookings";
import Recommendations from "@/pages/Recommendations";

export const routes = [
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/bookings",
    element: <Bookings />,
  },
  {
    path: "/recommendations",
    element: <Recommendations />,
  },
];