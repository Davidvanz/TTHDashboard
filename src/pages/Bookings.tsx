import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { BookingSourceCard } from "@/components/bookings/BookingSourceCard";
import { BookingDetails } from "@/components/bookings/BookingDetails";
import { Button } from "@/components/ui/button";

const Bookings = () => {
  const [selectedYear, setSelectedYear] = useState<2023 | 2024 | 2025>(2024);
  const [selectedSource, setSelectedSource] = useState<{ name: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
      }
    };
    checkAuth();
  }, [navigate]);

  // Fetch yearly statistics
  const { data: yearlyStats } = useQuery({
    queryKey: ['yearlyStats', selectedYear],
    queryFn: async () => {
      console.log('Fetching yearly statistics for year:', selectedYear);
      const { data, error } = await supabase
        .from('yearly_statistics')
        .select('*')
        .eq('year', selectedYear)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch Booking.com data
  const { data: bookingComData } = useQuery({
    queryKey: ['bookingComData', selectedYear],
    queryFn: async () => {
      console.log('Fetching Booking.com data for year:', selectedYear);
      const { data, error } = await supabase
        .from('Booking.com Data')
        .select('*')
        .eq('Year', selectedYear);
      
      if (error) throw error;
      console.log('Raw Booking.com data:', data);
      return data;
    }
  });

  // Calculate totals and percentages
  const totalBookings = yearlyStats?.total_bookings || 0;
  
  // Count Booking.com bookings as the number of rows in the table
  const bookingComTotal = bookingComData?.length || 0;
  console.log('Total Booking.com bookings:', bookingComTotal);
  
  // Direct bookings are the remaining bookings
  const directBookingsTotal = totalBookings - bookingComTotal;
  console.log('Total direct bookings:', directBookingsTotal);

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Booking Sources</h1>
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
          <Button
            variant={selectedYear === 2025 ? "default" : "outline"}
            onClick={() => setSelectedYear(2025)}
          >
            2025
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BookingSourceCard
          title="Booking.com"
          total={bookingComTotal}
          percentage={(bookingComTotal / totalBookings) * 100}
          totalBookings={totalBookings}
          onClick={() => setSelectedSource({ name: 'Booking.com' })}
        />
        <BookingSourceCard
          title="Direct Bookings"
          total={directBookingsTotal}
          percentage={(directBookingsTotal / totalBookings) * 100}
          totalBookings={totalBookings}
          onClick={() => setSelectedSource({ name: 'Direct' })}
        />
      </div>

      {selectedSource && (
        <BookingDetails
          selectedSource={selectedSource}
          bookingComData={bookingComData}
          directBookingsTotal={directBookingsTotal}
        />
      )}
    </div>
  );
};

export default Bookings;