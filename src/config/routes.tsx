import Dashboard from "@/pages/Dashboard";
import Bookings from "@/pages/Bookings";
import Recommendations from "@/pages/Recommendations";

export const routes = [
  {
    path: "/",
    element: <Dashboard />,
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