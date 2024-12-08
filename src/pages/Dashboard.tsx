import { useState, useEffect } from "react";
import { DollarSign, Percent, BedDouble, XCircle } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";

const TOTAL_ROOMS = 7;

const Dashboard = () => {
  const [selectedYear, setSelectedYear] = useState<2023 | 2024>(2024);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log("No active session found, redirecting to login");
        navigate("/login");
      }
    };
    checkAuth();
  }, [navigate]);

  const { data: currentYearStats } = useQuery({
    queryKey: ['yearlyStats', selectedYear],
    queryFn: async () => {
      console.log('Fetching yearly statistics for year:', selectedYear);
      const { data, error } = await supabase
        .from('yearly_statistics')
        .select('*')
        .eq('year', selectedYear);
      
      if (error) {
        console.error('Error fetching yearly stats:', error);
        throw error;
      }
      console.log('Yearly stats data:', data);
      // Return first item if exists, otherwise return default values
      return data?.[0] || {
        total_revenue: 0,
        avg_rate: 0,
        total_bookings: 0,
        total_room_nights: 0,
        cancellations: 0
      };
    }
  });

  const { data: previousYearStats } = useQuery({
    queryKey: ['yearlyStats', selectedYear - 1],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('yearly_statistics')
        .select('*')
        .eq('year', selectedYear - 1);
      
      if (error) {
        console.error('Error fetching previous year stats:', error);
        throw error;
      }
      // Return first item if exists, otherwise return default values
      return data?.[0] || {
        total_revenue: 0,
        avg_rate: 0,
        total_bookings: 0,
        total_room_nights: 0,
        cancellations: 0
      };
    }
  });

  const { data: monthlyStats } = useQuery({
    queryKey: ['monthlyStats', selectedYear],
    queryFn: async () => {
      console.log('Fetching monthly statistics for year:', selectedYear);
      const { data, error } = await supabase
        .from('monthly_statistics')
        .select('*')
        .eq('year', selectedYear)
        .order('Arrival_Month_Num', { ascending: true });
      
      if (error) {
        console.error('Error fetching monthly stats:', error);
        throw error;
      }
      console.log('Monthly stats data:', data);
      return data || [];
    }
  });

  // Format currency to South African Rand
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Calculate year-over-year change with 2 decimal places
  const calculateYoYChange = (current: number | undefined, previous: number | undefined) => {
    if (!current || !previous) return 0;
    return Number(((current - previous) / previous * 100).toFixed(2));
  };

  const calculateOccupancyRate = (roomNights: number) => {
    const totalPossibleNights = 365 * TOTAL_ROOMS;
    return (roomNights / totalPossibleNights) * 100;
  };

  // Calculate YoY changes
  const revenueChange = calculateYoYChange(
    currentYearStats?.total_revenue,
    previousYearStats?.total_revenue
  );

  const avgRateChange = calculateYoYChange(
    currentYearStats?.avg_rate,
    previousYearStats?.avg_rate
  );

  const occupancyChange = calculateYoYChange(
    currentYearStats?.total_room_nights ? calculateOccupancyRate(currentYearStats.total_room_nights) : 0,
    previousYearStats?.total_room_nights ? calculateOccupancyRate(previousYearStats.total_room_nights) : 0
  );

  const cancellationChange = calculateYoYChange(
    currentYearStats?.cancellations,
    previousYearStats?.cancellations
  );

  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <div className="flex gap-2">
          <Button
            variant={selectedYear === 2023 ? "default" : "outline"}
            onClick={() => setSelectedYear(2023)}
          >
            2023
          </Button>
          <Button
            variant={selectedYear === 2024 ? "default" : "outline"}
            onClick={() => setSelectedYear(2024)}
          >
            2024
          </Button>
        </div>
      </div>

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

      {/* Monthly Performance Chart */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Monthly Performance</h2>
        <div className="h-[300px] w-full"> {/* Changed from h-[400px] to h-[300px] */}
          <ChartContainer
            config={{
              revenue: {
                theme: {
                  light: "hsl(var(--primary))",
                  dark: "hsl(var(--primary))",
                },
              },
            }}
          >
            <BarChart data={monthlyStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="Arrival_Month"
                tickFormatter={(value) => value.substring(0, 3)}
              />
              <YAxis />
              <Tooltip content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid gap-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium">
                            {payload[0].payload.Arrival_Month}
                          </span>
                          <span className="font-medium">
                            {formatCurrency(payload[0].value as number)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                }
                return null
              }} />
              <Bar
                dataKey="total_revenue"
                fill="currentColor"
                className="fill-primary"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;