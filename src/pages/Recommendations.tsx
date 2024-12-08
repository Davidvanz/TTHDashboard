import { useQuery } from "@tanstack/react-query";
import { Brain } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const Recommendations = () => {
  // Fetch yearly statistics
  const { data: yearlyStats, isLoading: yearlyLoading } = useQuery({
    queryKey: ['yearlyStats'],
    queryFn: async () => {
      console.log('Fetching yearly statistics for AI analysis');
      const { data, error } = await supabase
        .from('yearly_statistics')
        .select('*')
        .order('year', { ascending: false });
      
      if (error) {
        console.error('Error fetching yearly stats:', error);
        throw error;
      }
      console.log('Yearly stats data for AI:', data);
      return data || [];
    }
  });

  // Fetch booking.com data
  const { data: bookingData, isLoading: bookingLoading } = useQuery({
    queryKey: ['bookingComData'],
    queryFn: async () => {
      console.log('Fetching Booking.com data for AI analysis');
      const { data, error } = await supabase
        .from('Booking.com Data')
        .select('*')
        .order('Year', { ascending: false });
      
      if (error) {
        console.error('Error fetching Booking.com data:', error);
        throw error;
      }
      console.log('Booking.com data for AI:', data);
      return data || [];
    }
  });

  const generateInsights = () => {
    if (!yearlyStats?.length || !bookingData?.length) return [];

    const insights = [];
    const currentYear = yearlyStats[0];
    const previousYear = yearlyStats[1];
    const bookingMetrics = bookingData[0];

    // Revenue Growth Analysis
    if (currentYear && previousYear) {
      const revenueGrowth = ((currentYear.total_revenue - previousYear.total_revenue) / previousYear.total_revenue) * 100;
      insights.push({
        title: "Revenue Performance",
        description: `Your revenue has ${revenueGrowth > 0 ? 'increased' : 'decreased'} by ${Math.abs(revenueGrowth).toFixed(1)}% compared to the previous year. ${
          revenueGrowth > 0 ? 'Great job! This shows strong business growth.' : 'Consider reviewing your pricing strategy and marketing efforts.'
        }`
      });
    }

    // Booking Window Analysis
    if (bookingMetrics?.Avg_Book_Window) {
      insights.push({
        title: "Booking Patterns",
        description: `Guests typically book ${Math.round(bookingMetrics.Avg_Book_Window)} days in advance. ${
          bookingMetrics.Avg_Book_Window > 30 
            ? 'This long booking window suggests good planning potential for revenue management.'
            : 'Consider offering early booking incentives to extend this window.'
        }`
      });
    }

    // Occupancy and Rate Analysis
    if (currentYear) {
      const occupancyRate = (currentYear.total_room_nights / (365 * 7)) * 100; // Assuming 7 rooms
      insights.push({
        title: "Occupancy Optimization",
        description: `Your current occupancy rate is ${occupancyRate.toFixed(1)}%. ${
          occupancyRate > 70 
            ? 'This is excellent! Consider testing higher rates during peak periods.'
            : 'There might be opportunity to increase occupancy through targeted promotions.'
        }`
      });
    }

    // Cancellation Analysis
    if (bookingMetrics?.Cancellation_Rate) {
      const cancellationRate = parseFloat(bookingMetrics.Cancellation_Rate.replace('%', ''));
      insights.push({
        title: "Cancellation Management",
        description: `Your cancellation rate is ${bookingMetrics.Cancellation_Rate}. ${
          cancellationRate < 15 
            ? 'This is a healthy rate, indicating effective booking policies.'
            : 'Consider reviewing your cancellation policy and deposit requirements.'
        }`
      });
    }

    return insights;
  };

  const insights = generateInsights();

  if (yearlyLoading || bookingLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">AI Recommendations</h1>
        </div>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-[250px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[80%] mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Brain className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold">AI Recommendations</h1>
      </div>
      
      {insights.length > 0 ? (
        insights.map((insight, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{insight.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">{insight.description}</CardDescription>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Data Available</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Unable to generate recommendations. Please ensure there is sufficient historical data available.
            </CardDescription>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Recommendations;