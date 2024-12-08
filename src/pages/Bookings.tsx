import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { YearSelector } from "@/components/bookings/YearSelector";
import { BookingSourceCard } from "@/components/bookings/BookingSourceCard";
import { BookingDetails } from "@/components/bookings/BookingDetails";

export default function Bookings() {
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);
  const [selectedSource, setSelectedSource] = useState(null);
  const [selectedYear, setSelectedYear] = useState(2025);

  // Available years for selection
  const availableYears = [2023, 2024, 2025];

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

  // Query for yearly statistics
  const { data: yearlyStats } = useQuery({
    queryKey: ['yearlyStats', selectedYear],
    queryFn: async () => {
      console.log('Fetching yearly statistics for year:', selectedYear);
      const { data, error } = await supabase
        .from('yearly_statistics')
        .select('*')
        .eq('year', selectedYear)
        .single();
      
      if (error) {
        console.error('Error fetching yearly statistics:', error);
        throw error;
      }
      console.log('Yearly statistics:', data);
      return data;
    }
  });

  // Query for Booking.com data
  const { data: bookingComData } = useQuery({
    queryKey: ['bookingComData', selectedYear],
    queryFn: async () => {
      console.log('Fetching Booking.com data for year:', selectedYear);
      const { data, error } = await supabase
        .from('Booking.com Data')
        .select('*')
        .eq('Year', selectedYear);
      
      if (error) {
        console.error('Error fetching Booking.com data:', error);
        throw error;
      }
      console.log('Booking.com data:', data);
      return data;
    }
  });

  // Calculate totals and percentages
  const totalBookings = yearlyStats?.total_bookings || 0;
  
  // Count all rows in Booking.com Data as Booking.com bookings
  const bookingComTotal = bookingComData?.length || 0;
  console.log('Total Booking.com bookings:', bookingComTotal);
  
  // Direct bookings are the remaining bookings
  const directBookingsTotal = totalBookings - bookingComTotal;
  console.log('Total direct bookings:', directBookingsTotal);

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

  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Source of Bookings</h1>
        <YearSelector
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          availableYears={availableYears}
        />
      </div>
      
      {/* Booking Sources Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BookingSourceCard
          title="Booking.com"
          total={bookingComTotal}
          percentage={bookingComPercentage}
          totalBookings={totalBookings}
          onClick={() => handleSourceClick({ name: 'Booking.com' })}
        />

        <BookingSourceCard
          title="Direct Bookings"
          total={directBookingsTotal}
          percentage={directBookingsPercentage}
          totalBookings={totalBookings}
          onClick={() => handleSourceClick({ name: 'Direct Bookings' })}
        />
      </div>

      {/* Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedSource?.name} Details
            </DialogTitle>
          </DialogHeader>
          <BookingDetails
            selectedSource={selectedSource}
            bookingComData={bookingComData}
            directBookingsTotal={directBookingsTotal}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}