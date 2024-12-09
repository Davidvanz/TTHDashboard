import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, TrendingUp, Bed } from "lucide-react";
import { useState } from "react";

interface RoomYearlyStats {
  year: number;
  room_description: string;
  total_bookings: number;
  total_room_nights: number;
  total_revenue: number;
  avg_daily_rate: number;
  occupancy_rate: number;
}

const RoomStatistics = () => {
  const [selectedYear, setSelectedYear] = useState<string>("2024");

  const { data: roomStats, isLoading } = useQuery({
    queryKey: ['roomYearlyStatistics', selectedYear],
    queryFn: async () => {
      console.log('Fetching room yearly statistics...');
      const { data, error } = await supabase
        .from('room_yearly_statistics')
        .select('*')
        .eq('year', selectedYear)
        .order('room_description');

      if (error) {
        console.error('Error fetching room statistics:', error);
        throw error;
      }

      console.log('Room statistics data:', data);
      return data as RoomYearlyStats[];
    }
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return <div className="p-8">Loading room statistics...</div>;
  }

  if (!roomStats || roomStats.length === 0) {
    return <div className="p-8">No room statistics available for {selectedYear}.</div>;
  }

  // Calculate totals for the selected year
  const yearlyTotals = roomStats.reduce((acc, curr) => ({
    total_revenue: acc.total_revenue + curr.total_revenue,
    total_room_nights: acc.total_room_nights + curr.total_room_nights,
    occupancy_rate: curr.occupancy_rate, // We'll use the last room's occupancy rate as they should all be the same
  }), {
    total_revenue: 0,
    total_room_nights: 0,
    occupancy_rate: 0,
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Room Statistics</h1>
        <Tabs value={selectedYear} onValueChange={setSelectedYear} className="w-[200px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="2023">2023</TabsTrigger>
            <TabsTrigger value="2024">2024</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(yearlyTotals.total_revenue)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Room Nights</CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{yearlyTotals.total_room_nights}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Room Performance Details ({selectedYear})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Room</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Room Nights</TableHead>
                <TableHead className="text-right">Avg. Daily Rate</TableHead>
                <TableHead className="text-right">Occupancy Rate per Room</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roomStats.map((stat) => (
                <TableRow key={stat.room_description}>
                  <TableCell className="font-medium">{stat.room_description}</TableCell>
                  <TableCell className="text-right">{formatCurrency(stat.total_revenue)}</TableCell>
                  <TableCell className="text-right">{stat.total_room_nights}</TableCell>
                  <TableCell className="text-right">{formatCurrency(stat.avg_daily_rate)}</TableCell>
                  <TableCell className="text-right">{stat.occupancy_rate.toFixed(1)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoomStatistics;