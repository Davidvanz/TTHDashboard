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
import { PieChart, Pie, Cell, Legend, Tooltip } from "recharts";

const COLORS = {
  BOOKING_COM: '#0052CC',
  DIRECT: '#00875A',
};

export default function Bookings() {
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

  // Query for Revenue data
  const { data: revenueData } = useQuery({
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

  // Dialog state
  const [showDetails, setShowDetails] = useState(false);
  const [selectedSource, setSelectedSource] = useState(null);

  // Calculate totals for pie chart
  const bookingComTotal = bookingComData?.reduce((acc, curr) => 
    acc + (parseInt(curr.Reservations) || 0), 0) || 0;
  const directBookingsTotal = revenueData?.length || 0;

  const pieData = [
    { name: 'Booking.com', value: bookingComTotal, fill: COLORS.BOOKING_COM },
    { name: 'Direct Bookings', value: directBookingsTotal, fill: COLORS.DIRECT },
  ];

  // Handle pie segment click
  const handleSourceClick = (entry) => {
    console.log('Clicked pie segment:', entry);
    if (entry?.payload) {
      setSelectedSource(entry.payload);
      setShowDetails(true);
    }
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
  };

  return (
    <div className="space-y-8 p-8">
      <h1 className="text-3xl font-bold">Source of Bookings</h1>
      
      {/* Pie Chart Card */}
      <Card>
        <CardHeader>
          <CardTitle>Booking Sources Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-[400px]">
            <PieChart width={400} height={400}>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={150}
                label={(entry) => `${entry.name}: ${entry.value}`}
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
}