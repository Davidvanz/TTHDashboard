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

  const { data: bookingData, isLoading } = useQuery({
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

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Source of Bookings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bookingData?.map((booking) => (
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

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Detailed Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Country</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Growth YTD</TableHead>
                  <TableHead>Rate Growth</TableHead>
                  <TableHead>Avg Length of Stay</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookingData?.map((booking) => (
                  <TableRow key={`${booking.Country}-${booking.Year}-table`}>
                    <TableCell>{booking.Country}</TableCell>
                    <TableCell>{booking.Year}</TableCell>
                    <TableCell>{booking.Res_Growth_YTD}</TableCell>
                    <TableCell>{booking.Avg_Rate_Growth_YTD}</TableCell>
                    <TableCell>{booking.Avg_Length_of_Stay} nights</TableCell>
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