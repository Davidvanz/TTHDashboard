import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Calendar, TrendingUp } from "lucide-react";

interface RoomData {
  Room_Description: string;
  total_revenue: number;
  total_bookings: number;
  avg_revenue_per_booking: number;
}

const RoomStatistics = () => {
  const { data: roomStats, isLoading } = useQuery({
    queryKey: ['roomStatistics'],
    queryFn: async () => {
      console.log('Fetching room statistics...');
      const { data, error } = await supabase
        .from('RevenueData_2023-2025')
        .select('Room_Description, Arrival, Revenue')
        .not('Room_Description', 'is', null); // Ensure we only get rows with valid room descriptions

      if (error) {
        console.error('Error fetching room statistics:', error);
        throw error;
      }

      console.log('Raw data from database:', data);

      // Process the data to get statistics per room
      const roomMap = new Map<string, RoomData>();

      data.forEach(booking => {
        const existingData = roomMap.get(booking.Room_Description) || {
          Room_Description: booking.Room_Description,
          total_revenue: 0,
          total_bookings: 0,
          avg_revenue_per_booking: 0
        };

        existingData.total_revenue += booking.Revenue || 0;
        existingData.total_bookings += 1;
        roomMap.set(booking.Room_Description, existingData);
      });

      // Calculate averages and convert to array
      const processedData = Array.from(roomMap.values()).map(room => ({
        ...room,
        avg_revenue_per_booking: room.total_revenue / room.total_bookings
      }));

      console.log('Processed room statistics:', processedData);
      return processedData;
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

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Room Statistics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roomStats.map((room) => (
          <Card key={room.Room_Description} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl">{room.Room_Description}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-primary/10 rounded-full">
                  <DollarSign className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(room.total_revenue)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Bookings</p>
                  <p className="text-2xl font-bold">{room.total_bookings}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="p-2 bg-primary/10 rounded-full">
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Average Revenue per Booking</p>
                  <p className="text-2xl font-bold">{formatCurrency(room.avg_revenue_per_booking)}</p>
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