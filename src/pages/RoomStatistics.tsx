import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RoomStats {
  roomDescription: string;
  totalRevenue: number;
  averageRate: number;
  occupancyRate: number;
  totalNights: number;
}

const RoomStatistics = () => {
  const [selectedYear, setSelectedYear] = useState<number>(2023);

  const { data: roomStats, isLoading } = useQuery({
    queryKey: ["roomStats", selectedYear],
    queryFn: async () => {
      console.log(`Fetching room statistics for year ${selectedYear}`);
      const { data, error } = await supabase
        .from("RevenueData_2023-2025")
        .select("*")
        .like("Arrival", `${selectedYear}%`);

      if (error) {
        console.error("Error fetching room statistics:", error);
        throw error;
      }

      console.log("Raw data from database:", data);

      // Group and calculate statistics by room
      const roomMap = new Map<string, RoomStats>();
      
      data.forEach((booking) => {
        const room = booking.Room_Description;
        const revenue = Number(booking.Revenue) || 0;
        const nights = Number(booking.Room_Nights) || 0;

        if (!roomMap.has(room)) {
          roomMap.set(room, {
            roomDescription: room,
            totalRevenue: 0,
            averageRate: 0,
            occupancyRate: 0,
            totalNights: 0,
          });
        }

        const stats = roomMap.get(room)!;
        stats.totalRevenue += revenue;
        stats.totalNights += nights;
      });

      // Calculate averages and rates after accumulating totals
      roomMap.forEach((stats) => {
        stats.averageRate = stats.totalNights > 0 ? stats.totalRevenue / stats.totalNights : 0;
        // Calculate occupancy rate based on 365 days per year
        stats.occupancyRate = (stats.totalNights / 365) * 100;
      });

      // Convert map to array and sort by total revenue
      const sortedStats = Array.from(roomMap.values())
        .sort((a, b) => b.totalRevenue - a.totalRevenue);

      console.log("Processed room statistics:", sortedStats);
      return sortedStats;
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-[250px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Room Statistics</h1>
        <div className="space-x-2">
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {roomStats && roomStats.map((stats) => (
          <Card key={stats.roomDescription}>
            <CardHeader>
              <CardTitle>{stats.roomDescription}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(stats.totalRevenue)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Average Rate</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(stats.averageRate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Occupancy Rate</p>
                  <p className="text-2xl font-bold">
                    {stats.occupancyRate.toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Nights</p>
                  <p className="text-2xl font-bold">{stats.totalNights}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RoomStatistics;