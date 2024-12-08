import { useState } from "react";
import { DollarSign, Percent, BedDouble, XCircle } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const [timeframe, setTimeframe] = useState<"month" | "year">("month");

  // Query for monthly statistics
  const { data: monthlyStats } = useQuery({
    queryKey: ['monthlyStats'],
    queryFn: async () => {
      console.log('Fetching monthly statistics...');
      const { data, error } = await supabase
        .from('monthly_statistics')
        .select('*')
        .order('year', { ascending: false })
        .order('Arrival_Month_Num', { ascending: false })
        .limit(1);
      
      if (error) {
        console.error('Error fetching monthly stats:', error);
        throw error;
      }
      console.log('Monthly stats data:', data);
      return data?.[0];
    }
  });

  // Query for yearly statistics
  const { data: yearlyStats } = useQuery({
    queryKey: ['yearlyStats'],
    queryFn: async () => {
      console.log('Fetching yearly statistics...');
      const { data, error } = await supabase
        .from('yearly_statistics')
        .select('*')
        .order('year', { ascending: false })
        .limit(1);
      
      if (error) {
        console.error('Error fetching yearly stats:', error);
        throw error;
      }
      console.log('Yearly stats data:', data);
      return data?.[0];
    }
  });

  const currentStats = timeframe === "month" ? monthlyStats : yearlyStats;
  const previousStats = timeframe === "month" ? monthlyStats : yearlyStats; // We'll implement previous period comparison later

  // Calculate trends (comparing with previous period)
  const calculateTrend = (current: number, previous: number) => {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

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
          value={currentStats ? formatCurrency(currentStats.total_revenue) : '$0'}
          trend={calculateTrend(
            currentStats?.total_revenue || 0,
            previousStats?.total_revenue || 0
          )}
          icon={<DollarSign className="w-4 h-4 text-primary" />}
        />
        <StatCard
          title="Average Rate"
          value={currentStats ? formatCurrency(currentStats.avg_rate) : '$0'}
          trend={calculateTrend(
            currentStats?.avg_rate || 0,
            previousStats?.avg_rate || 0
          )}
          icon={<Percent className="w-4 h-4 text-primary" />}
        />
        <StatCard
          title="Occupancy Rate"
          value={currentStats ? 
            `${Math.round((currentStats.total_room_nights / (timeframe === "month" ? 30 : 365)) * 100)}%` 
            : '0%'
          }
          trend={calculateTrend(
            currentStats?.total_room_nights || 0,
            previousStats?.total_room_nights || 0
          )}
          icon={<BedDouble className="w-4 h-4 text-primary" />}
        />
        <StatCard
          title="Cancellation Rate"
          value={currentStats ? 
            `${Math.round((currentStats.cancellations / currentStats.total_bookings) * 100)}%`
            : '0%'
          }
          trend={-calculateTrend(
            currentStats?.cancellations || 0,
            previousStats?.cancellations || 0
          )}
          icon={<XCircle className="w-4 h-4 text-primary" />}
        />
      </div>
    </div>
  );
};

export default Dashboard;