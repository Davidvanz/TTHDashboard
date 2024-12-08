import Dashboard from "@/pages/Dashboard";
import Bookings from "@/pages/Bookings";
import Recommendations from "@/pages/Recommendations";
import Login from "@/pages/Login";

export const routes = [
  {
    path: "/",
    element: <Dashboard />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/bookings",
    element: <Bookings />,
  },
  {
    path: "/rooms",
    element: <div className="p-8">Room Statistics (Coming Soon)</div>,
  },
  {
    path: "/recommendations",
    element: <Recommendations />,
  },
];