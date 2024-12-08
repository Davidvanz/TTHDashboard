import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PieChart, Pie, Cell, Legend, Tooltip } from "recharts";

const Bookings = () => {
  const navigate = useNavigate();
  const [selectedSource, setSelectedSource] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

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

  // Process data for the pie chart
  const bookingComTotal = bookingComData?.reduce((acc, curr) => 
    acc + (parseInt(curr.Reservations) || 0), 0) || 0;
  
  const otherBookingsTotal = revenueData?.length || 0;

  const pieData = [
    { name: 'Booking.com', value: bookingComTotal, fill: '#0052CC' },
    { name: 'Direct Bookings', value: otherBookingsTotal, fill: '#00875A' },
  ];

  const handleSourceClick = (entry) => {
    console.log("Clicked entry:", entry);
    if (entry && entry.payload) {
      setSelectedSource(entry.payload);
      setShowDetails(true);
    }
  };

  const renderSourceDetails = () => {
    if (!selectedSource) return null;

    if (selectedSource.name === 'Booking.com') {
      return (
        <div className="space-y-4">
          {bookingComData?.map((booking, index) => (
            <Card key={`${booking.Country}-${index}`} className="w-full">
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
    } else {
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
            {revenueData?.map((booking, index) => (
              <TableRow key={`${booking.Guest}-${index}`}>
                <TableCell>{booking.Room_Type}</TableCell>
                <TableCell>{booking.Guest}</TableCell>
                <TableCell>{booking.Revenue}</TableCell>
                <TableCell>{booking.Season}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );
    }
  };

  return (
    <div className="space-y-8 p-8">
      <h1 className="text-3xl font-bold">Source of Bookings</h1>
      
      {/* Pie Chart */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Booking Sources Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ width: '100%', height: 400 }}>
            <PieChart width={400} height={400} style={{ margin: '0 auto' }}>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={150}
                label={(entry) => entry.name}
                onClick={handleSourceClick}
                className="cursor-pointer"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </div>
        </CardContent>
      </Card>

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
};

export default Bookings;