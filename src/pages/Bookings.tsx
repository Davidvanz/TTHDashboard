import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Bookings() {
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);
  const [selectedSource, setSelectedSource] = useState(null);

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
  const { data: bookingComData } = useQuery({
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

  // Query for yearly statistics to get accurate total bookings and cancellations
  const { data: yearlyStats } = useQuery({
    queryKey: ['yearlyStats'],
    queryFn: async () => {
      console.log('Fetching yearly statistics');
      const { data, error } = await supabase
        .from('yearly_statistics')
        .select('*')
        .order('year', { ascending: false })
        .limit(1);
      
      if (error) {
        console.error('Error fetching yearly statistics:', error);
        throw error;
      }
      console.log('Yearly statistics:', data);
      return data[0];
    }
  });

  // Calculate totals and percentages
  const totalBookings = yearlyStats?.total_bookings || 0;
  const bookingComTotal = bookingComData?.reduce((acc, curr) => 
    acc + (parseInt(curr.Reservations) || 0), 0) || 0;
  const directBookingsTotal = totalBookings - bookingComTotal;

  // Calculate percentages
  const bookingComPercentage = totalBookings > 0 
    ? (bookingComTotal / totalBookings) * 100 
    : 0;
  const directBookingsPercentage = totalBookings > 0 
    ? (directBookingsTotal / totalBookings) * 100 
    : 0;

  // Handle card click
  const handleSourceClick = (source) => {
    console.log('Clicked source:', source);
    setSelectedSource(source);
    setShowDetails(true);
  };

  // Render details based on selected source
  const renderSourceDetails = () => {
    if (!selectedSource) return null;

    if (selectedSource.name === 'Booking.com') {
      return (
        <div className="space-y-4">
          {bookingComData?.map((booking, index) => (
            <Card key={`${booking.Country}-${index}`}>
              <CardHeader>
                <CardTitle>{booking.Country}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Reservations</p>
                  <p className="text-lg font-semibold">{booking.Reservations}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Average Daily Rate</p>
                  <p className="text-lg font-semibold">{booking.Avg_Daily_Rate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Booking Window</p>
                  <p className="text-lg font-semibold">{booking.Avg_Book_Window} days</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Room Type</TableHead>
            <TableHead>Guest</TableHead>
            <TableHead>Revenue</TableHead>
            <TableHead>Season</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Show direct bookings from yearly stats */}
          <TableRow>
            <TableCell colSpan={4} className="text-center">
              Total Direct Bookings: {directBookingsTotal}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="space-y-8 p-8">
      <h1 className="text-3xl font-bold">Source of Bookings</h1>
      
      {/* Booking Sources Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleSourceClick({ name: 'Booking.com' })}
        >
          <CardHeader>
            <CardTitle>Booking.com</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{bookingComTotal}</div>
            <p className="text-muted-foreground">
              {bookingComPercentage.toFixed(1)}% of total bookings
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Total bookings: {totalBookings}
            </p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleSourceClick({ name: 'Direct Bookings' })}
        >
          <CardHeader>
            <CardTitle>Direct Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{directBookingsTotal}</div>
            <p className="text-muted-foreground">
              {directBookingsPercentage.toFixed(1)}% of total bookings
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Total bookings: {totalBookings}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedSource?.name} Details
            </DialogTitle>
          </DialogHeader>
          {renderSourceDetails()}
        </DialogContent>
      </Dialog>
    </div>
  );
}