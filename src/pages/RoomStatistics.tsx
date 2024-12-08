import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";

interface RoomStatistics {
  Room_Type: string;
  total_bookings: number;
  avg_rate: number;
}

const RoomStatistics = () => {
  const [selectedYear, setSelectedYear] = useState<2023 | 2024 | 2025>(2024);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
      }
    };
    checkAuth();
  }, [navigate]);

  // Fetch room statistics
  const { data: roomStats } = useQuery({
    queryKey: ['roomStats', selectedYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('RevenueData_2023-2025')
        .select('Room_Type, Revenue, Room_Nights')
        .ilike('Arrival', `${selectedYear}%`);
      
      if (error) throw error;

      // Process data to get statistics per room type
      const roomStatsMap = data.reduce((acc: { [key: string]: RoomStatistics }, curr) => {
        if (!acc[curr.Room_Type]) {
          acc[curr.Room_Type] = {
            Room_Type: curr.Room_Type,
            total_bookings: 0,
            avg_rate: 0,
          };
        }
        acc[curr.Room_Type].total_bookings += 1;
        acc[curr.Room_Type].avg_rate += curr.Revenue / curr.Room_Nights;
        return acc;
      }, {});

      // Calculate averages and convert to array
      return Object.values(roomStatsMap).map(room => ({
        ...room,
        avg_rate: room.avg_rate / room.total_bookings
      }));
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

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Room Statistics</h1>
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
          <Button
            variant={selectedYear === 2025 ? "default" : "outline"}
            onClick={() => setSelectedYear(2025)}
          >
            2025
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Room Popularity Chart */}
        <div className="bg-card rounded-lg p-4 shadow">
          <h3 className="text-lg font-medium mb-4">Room Popularity</h3>
          <div className="h-[300px]">
            <ChartContainer
              config={{
                bookings: {
                  theme: {
                    light: "hsl(var(--primary))",
                    dark: "hsl(var(--primary))",
                  },
                },
              }}
            >
              <BarChart data={roomStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="Room_Type"
                  angle={-45}
                  textAnchor="end"
                  height={70}
                />
                <YAxis />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid gap-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-medium">
                                {payload[0].payload.Room_Type}
                              </span>
                              <span className="font-medium">
                                {payload[0].value} bookings
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="total_bookings"
                  fill="currentColor"
                  className="fill-primary"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </div>
        </div>

        {/* Average Rate Chart */}
        <div className="bg-card rounded-lg p-4 shadow">
          <h3 className="text-lg font-medium mb-4">Average Rate per Room</h3>
          <div className="h-[300px]">
            <ChartContainer
              config={{
                rate: {
                  theme: {
                    light: "hsl(var(--primary))",
                    dark: "hsl(var(--primary))",
                  },
                },
              }}
            >
              <BarChart data={roomStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="Room_Type"
                  angle={-45}
                  textAnchor="end"
                  height={70}
                />
                <YAxis />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid gap-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-medium">
                                {payload[0].payload.Room_Type}
                              </span>
                              <span className="font-medium">
                                {formatCurrency(Number(payload[0].value))}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="avg_rate"
                  fill="currentColor"
                  className="fill-primary"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomStatistics;