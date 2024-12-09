import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Toggle } from "@/components/ui/toggle";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export const BookingSourcesComparison = () => {
  const [selectedYear, setSelectedYear] = useState<"2023" | "2024">("2024");

  const { data: bookingSources, isLoading } = useQuery({
    queryKey: ["bookingSources", selectedYear],
    queryFn: async () => {
      console.log('Fetching booking sources for year:', selectedYear);
      const { data, error } = await supabase
        .from('booking_sources_by_year')
        .select('*')
        .eq('year', selectedYear)
        .single();

      if (error) {
        console.error('Error fetching booking sources:', error);
        throw error;
      }
      
      console.log('Booking sources data:', data);
      return data;
    },
  });

  const chartData = bookingSources ? [
    {
      name: "Booking Sources",
      "Booking.com": bookingSources.booking_com_total || 0,
      "Direct Bookings": bookingSources.direct_bookings_total || 0,
    },
  ] : [];

  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
        <CardTitle>Booking Sources Comparison</CardTitle>
        <div className="flex gap-2">
          <Toggle
            pressed={selectedYear === "2023"}
            onPressedChange={() => setSelectedYear("2023")}
          >
            2023
          </Toggle>
          <Toggle
            pressed={selectedYear === "2024"}
            onPressedChange={() => setSelectedYear("2024")}
          >
            2024
          </Toggle>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-[400px]">
            Loading...
          </div>
        ) : (
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="Booking.com"
                  fill="#2563eb"
                  name="Booking.com Reservations"
                />
                <Bar
                  dataKey="Direct Bookings"
                  fill="#16a34a"
                  name="Direct Reservations"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};