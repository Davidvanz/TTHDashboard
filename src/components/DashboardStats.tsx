import { DollarSign, Percent, BedDouble, XCircle } from "lucide-react";
import { StatCard } from "@/components/StatCard";

interface DashboardStatsProps {
  currentYearStats: any;
  formatCurrency: (value: number) => string;
  calculateOccupancyRate: (roomNights: number) => number;
  revenueChange: number;
  avgRateChange: number;
  occupancyChange: number;
  cancellationChange: number;
}

export const DashboardStats = ({
  currentYearStats,
  formatCurrency,
  calculateOccupancyRate,
  revenueChange,
  avgRateChange,
  occupancyChange,
  cancellationChange,
}: DashboardStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Revenue"
        value={currentYearStats ? formatCurrency(currentYearStats.total_revenue) : 'R0'}
        trend={revenueChange}
        icon={<DollarSign className="w-4 h-4 text-primary" />}
      />
      <StatCard
        title="Average Rate"
        value={currentYearStats ? formatCurrency(currentYearStats.avg_rate) : 'R0'}
        trend={avgRateChange}
        icon={<Percent className="w-4 h-4 text-primary" />}
      />
      <StatCard
        title="Occupancy Rate"
        value={currentYearStats ? 
          `${Math.round(calculateOccupancyRate(currentYearStats.total_room_nights))}%` 
          : '0%'
        }
        trend={occupancyChange}
        icon={<BedDouble className="w-4 h-4 text-primary" />}
      />
      <StatCard
        title="Cancellation Rate"
        value={currentYearStats ? 
          `${Math.round((currentYearStats.cancellations / currentYearStats.total_bookings) * 100)}%`
          : '0%'
        }
        trend={cancellationChange}
        icon={<XCircle className="w-4 h-4 text-primary" />}
        invertTrendColors={true}
      />
    </div>
  );
};