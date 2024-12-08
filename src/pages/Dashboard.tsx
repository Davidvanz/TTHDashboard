import { useState } from "react";
import { DollarSign, Percent, BedDouble, XCircle } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const [timeframe, setTimeframe] = useState<"month" | "year">("month");

  // Placeholder data - will be replaced with real data
  const stats = {
    month: {
      revenue: { value: "$45,231", trend: 12.5 },
      averageRate: { value: "$195", trend: -2.3 },
      occupancyRate: { value: "78%", trend: 5.2 },
      cancellationRate: { value: "12%", trend: -1.8 },
    },
    year: {
      revenue: { value: "$534,762", trend: 8.7 },
      averageRate: { value: "$189", trend: 3.1 },
      occupancyRate: { value: "82%", trend: 7.5 },
      cancellationRate: { value: "10%", trend: -2.4 },
    },
  };

  const currentStats = stats[timeframe];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <div className="flex gap-2">
          <Button
            variant={timeframe === "month" ? "default" : "outline"}
            onClick={() => setTimeframe("month")}
          >
            Month
          </Button>
          <Button
            variant={timeframe === "year" ? "default" : "outline"}
            onClick={() => setTimeframe("year")}
          >
            Year
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Revenue"
          value={currentStats.revenue.value}
          trend={currentStats.revenue.trend}
          icon={<DollarSign className="w-4 h-4 text-primary" />}
        />
        <StatCard
          title="Average Rate"
          value={currentStats.averageRate.value}
          trend={currentStats.averageRate.trend}
          icon={<Percent className="w-4 h-4 text-primary" />}
        />
        <StatCard
          title="Occupancy Rate"
          value={currentStats.occupancyRate.value}
          trend={currentStats.occupancyRate.trend}
          icon={<BedDouble className="w-4 h-4 text-primary" />}
        />
        <StatCard
          title="Cancellation Rate"
          value={currentStats.cancellationRate.value}
          trend={currentStats.cancellationRate.trend}
          icon={<XCircle className="w-4 h-4 text-primary" />}
        />
      </div>
    </div>
  );
};

export default Dashboard;