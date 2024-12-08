import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LayoutDashboard, CalendarDays, BedDouble } from "lucide-react";

const links = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Bookings",
    href: "/bookings",
    icon: CalendarDays,
  },
  {
    title: "Room Statistics",
    href: "/room-statistics",
    icon: BedDouble,
  },
];

export function DashboardSidebar() {
  const location = useLocation();

  return (
    <div className="space-y-4 py-4">
      <div className="px-3 py-2">
        <div className="space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
                location.pathname === link.href
                  ? "bg-muted text-primary"
                  : "text-muted-foreground"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}