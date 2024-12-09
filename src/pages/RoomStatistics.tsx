import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface RoomStats {
  room_description: string;
  total_revenue: number;
  avg_rate: number;
  occupancy_rate: number;
  total_nights: number;
}

const RoomStatistics = () => {
  const [selectedYear, setSelectedYear] = useState<2023 | 2024>(2024);

  const { data: roomStats, isLoading } = useQuery({
    queryKey: ["roomStats", selectedYear],
    queryFn: async () => {
      console.log("Fetching room statistics for year:", selectedYear);
      const { data, error } = await supabase
        .from("RevenueData_2023-2025")
        .select("Room_Description, Revenue, Room_Nights, Arrival")
        .like("Arrival", `${selectedYear}%`);

      if (error) {
        console.error("Error fetching room stats:", error);
        throw error;
      }

      // Group and calculate statistics by room description
      const roomStatsMap = data.reduce((acc: { [key: string]: RoomStats }, curr) => {
        const roomDescription = curr.Room_Description || "Unknown";
        
        if (!acc[roomDescription]) {
          acc[roomDescription] = {
            room_description: roomDescription,
            total_revenue: 0,
            avg_rate: 0,
            occupancy_rate: 0,
            total_nights: 0,
          };
        }

        acc[roomDescription].total_revenue += curr.Revenue || 0;
        acc[roomDescription].total_nights += curr.Room_Nights || 0;

        return acc;
      }, {});

      // Calculate averages and occupancy rates
      const roomStats = Object.values(roomStatsMap).map(room => {
        const daysInYear = selectedYear % 4 === 0 ? 366 : 365;
        return {
          ...room,
          avg_rate: room.total_nights > 0 ? room.total_revenue / room.total_nights : 0,
          occupancy_rate: (room.total_nights / daysInYear) * 100,
        };
      });

      // Sort rooms by total revenue in descending order
      return roomStats.sort((a, b) => b.total_revenue - a.total_revenue);
    },
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
    <div className="space-y-8 p-8">
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
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <p>Loading room statistics...</p>
        </div>
      ) : (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Room Performance Overview - {selectedYear}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Room Description</TableHead>
                    <TableHead>Total Revenue</TableHead>
                    <TableHead>Average Rate</TableHead>
                    <TableHead>Occupancy Rate</TableHead>
                    <TableHead>Total Nights Booked</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roomStats?.map((room) => (
                    <TableRow key={room.room_description}>
                      <TableCell className="font-medium">{room.room_description}</TableCell>
                      <TableCell>{formatCurrency(room.total_revenue)}</TableCell>
                      <TableCell>{formatCurrency(room.avg_rate)}</TableCell>
                      <TableCell>{room.occupancy_rate.toFixed(1)}%</TableCell>
                      <TableCell>{room.total_nights}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default RoomStatistics;