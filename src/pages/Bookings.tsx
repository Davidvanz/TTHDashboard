import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Bookings = () => {
  const navigate = useNavigate();

  // Check authentication
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

  // Query for Booking.com data
  const { data: bookingComData, isLoading: isLoadingBookingCom } = useQuery({
    queryKey: ['bookingComData'],
    queryFn: async () => {
      console.log('Fetching Booking.com data');
      const { data, error } = await supabase
        .from('Booking.com Data')
        .select('*');
      
      if (error) {
        console.error('Error fetching Booking.com data:', error);
        throw error;
      }
      console.log('Booking.com data:', data);
      return data;
    }
  });

  // Query for Revenue data to get other booking sources
  const { data: revenueData, isLoading: isLoadingRevenue } = useQuery({
    queryKey: ['revenueData'],
    queryFn: async () => {
      console.log('Fetching revenue data');
      const { data, error } = await supabase
        .from('RevenueData_2023-2025')
        .select('*');
      
      if (error) {
        console.error('Error fetching revenue data:', error);
        throw error;
      }
      console.log('Revenue data:', data);
      return data;
    }
  });

  if (isLoadingBookingCom || isLoadingRevenue) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Source of Bookings</h1>
      
      {/* Booking.com Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bookingComData?.map((booking) => (
          <Card key={`${booking.Country}-${booking.Year}`}>
            <CardHeader>
              <CardTitle>{booking.Country}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Year</p>
                <p className="text-lg font-semibold">{booking.Year}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Reservations</p>
                <p className="text-lg font-semibold">{booking.Reservations}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Daily Rate</p>
                <p className="text-lg font-semibold">{booking.Avg_Daily_Rate}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cancellation Rate</p>
                <p className="text-lg font-semibold">{booking.Cancellation_Rate}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Booking Window</p>
                <p className="text-lg font-semibold">{booking.Avg_Book_Window} days</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Data Table */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Other Booking Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room Type</TableHead>
                  <TableHead>Guest</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Season</TableHead>
                  <TableHead>Room Nights</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {revenueData?.map((booking, index) => (
                  <TableRow key={`${booking.Guest}-${index}`}>
                    <TableCell>{booking.Room_Type}</TableCell>
                    <TableCell>{booking.Guest}</TableCell>
                    <TableCell>{booking.Revenue}</TableCell>
                    <TableCell>{booking.Season}</TableCell>
                    <TableCell>{booking.Room_Nights}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Bookings;