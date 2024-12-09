import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { Button } from "@/components/ui/button";

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
        const revenue = parseFloat(booking.Revenue) || 0;
        const nights = parseInt(booking.Room_Nights) || 0;

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
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
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

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Room Name</TableHead>
            <TableHead className="text-right">Total Revenue</TableHead>
            <TableHead className="text-right">Average Rate</TableHead>
            <TableHead className="text-right">Occupancy Rate</TableHead>
            <TableHead className="text-right">Total Nights</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roomStats && roomStats.map((stats) => (
            <TableRow key={stats.roomDescription}>
              <TableCell className="font-medium">{stats.roomDescription}</TableCell>
              <TableCell className="text-right">
                {formatCurrency(stats.totalRevenue)}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(stats.averageRate)}
              </TableCell>
              <TableCell className="text-right">
                {stats.occupancyRate.toFixed(1)}%
              </TableCell>
              <TableCell className="text-right">{stats.totalNights}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default RoomStatistics;