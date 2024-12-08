import { useQuery } from "@tanstack/react-query";
import { Brain, TrendingUp, Calendar, Users, Ban } from "lucide-react";
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
        .in('year', [2023, 2024])
        .order('year', { ascending: false });
      
      if (error) {
        console.error('Error fetching yearly stats:', error);
        throw error;
      }
      console.log('Yearly stats data:', data);
      return data || [];
    }
  });

  // Fetch monthly statistics
  const { data: monthlyStats, isLoading: monthlyLoading } = useQuery({
    queryKey: ['monthlyStats'],
    queryFn: async () => {
      console.log('Fetching monthly statistics for AI analysis');
      const { data, error } = await supabase
        .from('monthly_statistics')
        .select('*')
        .in('year', [2023, 2024])
        .order('year', { ascending: false })
        .order('Arrival_Month_Num', { ascending: true });
      
      if (error) {
        console.error('Error fetching monthly stats:', error);
        throw error;
      }
      console.log('Monthly stats data:', data);
      return data || [];
    }
  });

  const generateInsights = () => {
    if (!yearlyStats?.length || !monthlyStats?.length) return [];

    const insights = [];
    const currentYear = yearlyStats[0]; // 2024
    const previousYear = yearlyStats[1]; // 2023
    const currentYearMonths = monthlyStats.filter(m => m.year === currentYear.year);
    
    // Revenue Growth Analysis
    if (currentYear && previousYear) {
      const revenueGrowth = ((currentYear.total_revenue - previousYear.total_revenue) / previousYear.total_revenue) * 100;
      insights.push({
        title: "Revenue Performance",
        description: `Revenue has ${revenueGrowth > 0 ? 'increased' : 'decreased'} by ${Math.abs(revenueGrowth).toFixed(1)}% from 2023 to 2024. ${
          revenueGrowth > 0 
            ? 'This shows strong business growth. Consider reinvesting in property improvements.' 
            : 'Consider reviewing your pricing strategy and marketing efforts.'
        }`,
        icon: <TrendingUp className="w-6 h-6 text-primary" />
      });
    }

    // Booking Volume Analysis
    if (currentYear && previousYear) {
      const bookingGrowth = ((currentYear.total_bookings - previousYear.total_bookings) / previousYear.total_bookings) * 100;
      insights.push({
        title: "Booking Patterns",
        description: `Booking volume has ${bookingGrowth > 0 ? 'grown' : 'decreased'} by ${Math.abs(bookingGrowth).toFixed(1)}% compared to 2023. ${
          bookingGrowth > 0 
            ? 'Your marketing efforts are showing positive results.' 
            : 'Consider implementing new marketing strategies to increase bookings.'
        }`,
        icon: <Calendar className="w-6 h-6 text-primary" />
      });
    }

    // Occupancy Analysis
    if (currentYear && previousYear) {
      const currentOccupancy = (currentYear.total_room_nights / (365 * 7)) * 100; // Assuming 7 rooms
      const previousOccupancy = (previousYear.total_room_nights / (365 * 7)) * 100;
      const occupancyChange = currentOccupancy - previousOccupancy;
      
      insights.push({
        title: "Occupancy Optimization",
        description: `Your current occupancy rate is ${currentOccupancy.toFixed(1)}%, ${
          occupancyChange > 0 ? 'up' : 'down'
        } ${Math.abs(occupancyChange).toFixed(1)}% from last year. ${
          currentOccupancy > 70 
            ? 'Consider testing higher rates during peak periods.' 
            : 'Focus on increasing mid-week occupancy through targeted promotions.'
        }`,
        icon: <Users className="w-6 h-6 text-primary" />
      });
    }

    // Cancellation Analysis
    if (currentYear && previousYear) {
      const currentCancellationRate = (currentYear.cancellations / currentYear.total_bookings) * 100;
      const previousCancellationRate = (previousYear.cancellations / previousYear.total_bookings) * 100;
      const cancellationChange = currentCancellationRate - previousCancellationRate;
      
      insights.push({
        title: "Cancellation Management",
        description: `Your cancellation rate is ${currentCancellationRate.toFixed(1)}%, ${
          cancellationChange > 0 ? 'up' : 'down'
        } ${Math.abs(cancellationChange).toFixed(1)}% from last year. ${
          currentCancellationRate < 15 
            ? 'Your booking policies are working effectively.' 
            : 'Consider adjusting your cancellation policy and deposit requirements.'
        }`,
        icon: <Ban className="w-6 h-6 text-primary" />
      });
    }

    return insights;
  };

  const insights = generateInsights();

  if (yearlyLoading || monthlyLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">AI Recommendations</h1>
        </div>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="w-full">
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
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-2">
        <Brain className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold">AI Recommendations</h1>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {insights.length > 0 ? (
          insights.map((insight, index) => (
            <Card key={index} className="w-full">
              <CardHeader className="flex flex-row items-center gap-4">
                {insight.icon}
                <CardTitle>{insight.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{insight.description}</CardDescription>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-2">
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
    </div>
  );
};

export default Recommendations;