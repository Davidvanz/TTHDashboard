import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, Calendar, TrendingUp, Bed } from "lucide-react";

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
  const { data: roomStats, isLoading } = useQuery({
    queryKey: ['roomYearlyStatistics'],
    queryFn: async () => {
      console.log('Fetching room yearly statistics...');
      const { data, error } = await supabase
        .from('room_yearly_statistics')
        .select('*')
        .order('year', { ascending: false });

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
    return <div className="p-8">No room statistics available.</div>;
  }

  // Get the most recent year's data
  const currentYear = Math.max(...roomStats.map(stat => stat.year));
  const currentYearStats = roomStats.filter(stat => stat.year === currentYear);

  // Calculate totals for the current year
  const yearlyTotals = currentYearStats.reduce((acc, curr) => ({
    total_revenue: acc.total_revenue + curr.total_revenue,
    total_bookings: acc.total_bookings + curr.total_bookings,
    total_room_nights: acc.total_room_nights + curr.total_room_nights,
  }), {
    total_revenue: 0,
    total_bookings: 0,
    total_room_nights: 0,
  });

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Room Statistics ({currentYear})</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{yearlyTotals.total_bookings}</div>
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Occupancy</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(currentYearStats.reduce((acc, curr) => acc + curr.occupancy_rate, 0) / currentYearStats.length).toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Room Performance Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Room</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Bookings</TableHead>
                <TableHead className="text-right">Room Nights</TableHead>
                <TableHead className="text-right">Avg. Daily Rate</TableHead>
                <TableHead className="text-right">Occupancy Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentYearStats.map((stat) => (
                <TableRow key={stat.room_description}>
                  <TableCell className="font-medium">{stat.room_description}</TableCell>
                  <TableCell className="text-right">{formatCurrency(stat.total_revenue)}</TableCell>
                  <TableCell className="text-right">{stat.total_bookings}</TableCell>
                  <TableCell className="text-right">{stat.total_room_nights}</TableCell>
                  <TableCell className="text-right">{formatCurrency(stat.avg_daily_rate)}</TableCell>
                  <TableCell className="text-right">{stat.occupancy_rate}%</TableCell>
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