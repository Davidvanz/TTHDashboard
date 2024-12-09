import { useQuery } from "@tanstack/react-query";
import { Brain, TrendingUp, Calendar, Users, Ban, DollarSign, Clock, LineChart } from "lucide-react";
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
    const previousYearMonths = monthlyStats.filter(m => m.year === previousYear.year);
    
    // Revenue Growth Analysis
    if (currentYear && previousYear) {
      const revenueGrowth = ((currentYear.total_revenue - previousYear.total_revenue) / previousYear.total_revenue) * 100;
      const avgRateGrowth = ((currentYear.avg_rate - previousYear.avg_rate) / previousYear.avg_rate) * 100;
      
      insights.push({
        title: "Revenue & Pricing Strategy",
        description: `Revenue has ${revenueGrowth > 0 ? 'increased' : 'decreased'} by ${Math.abs(revenueGrowth).toFixed(1)}% with average rates ${avgRateGrowth > 0 ? 'up' : 'down'} ${Math.abs(avgRateGrowth).toFixed(1)}%. ${
          revenueGrowth > 0 && avgRateGrowth > 0
            ? 'Your pricing strategy is effective. Consider gradual rate increases in peak periods.' 
            : revenueGrowth < 0 && avgRateGrowth > 0
            ? 'High rates might be affecting bookings. Consider seasonal promotions.'
            : 'Review your pricing strategy and market positioning.'
        }`,
        icon: <DollarSign className="w-6 h-6 text-primary" />
      });
    }

    // Seasonal Pattern Analysis
    if (currentYearMonths.length && previousYearMonths.length) {
      const peakMonths = currentYearMonths
        .sort((a, b) => b.total_revenue - a.total_revenue)
        .slice(0, 3)
        .map(m => m.Arrival_Month);
      
      const lowMonths = currentYearMonths
        .sort((a, b) => a.total_revenue - b.total_revenue)
        .slice(0, 3)
        .map(m => m.Arrival_Month);

      insights.push({
        title: "Seasonal Patterns",
        description: `Peak performance months are ${peakMonths.join(', ')}, while ${lowMonths.join(', ')} show lower demand. ${
          peakMonths.some(month => currentYearMonths.find(m => m.Arrival_Month === month)?.occupancy_rate > 80)
            ? 'Consider implementing dynamic pricing during peak months.'
            : 'Focus on special packages and promotions during off-peak periods.'
        }`,
        icon: <LineChart className="w-6 h-6 text-primary" />
      });
    }

    // Booking Window Analysis
    const avgBookingWindow = currentYearMonths.reduce((acc, curr) => acc + (curr.total_bookings || 0), 0) / currentYearMonths.length;
    insights.push({
      title: "Booking Patterns",
      description: `Average monthly bookings are ${avgBookingWindow.toFixed(0)}. ${
        avgBookingWindow > previousYearMonths.reduce((acc, curr) => acc + (curr.total_bookings || 0), 0) / previousYearMonths.length
          ? 'Booking momentum is strong. Consider early bird discounts to encourage advance bookings.'
          : 'To increase advance bookings, implement targeted early booking promotions.'
      }`,
      icon: <Clock className="w-6 h-6 text-primary" />
    });

    // Occupancy and Room Night Analysis
    if (currentYear && previousYear) {
      const roomNightGrowth = ((currentYear.total_room_nights - previousYear.total_room_nights) / previousYear.total_room_nights) * 100;
      const avgOccupancy = (currentYear.total_room_nights / (365 * 7)) * 100; // Assuming 7 rooms
      
      insights.push({
        title: "Occupancy Optimization",
        description: `Room nights have ${roomNightGrowth > 0 ? 'increased' : 'decreased'} by ${Math.abs(roomNightGrowth).toFixed(1)}% with ${avgOccupancy.toFixed(1)}% average occupancy. ${
          avgOccupancy > 70 
            ? 'High occupancy indicates strong demand. Consider strategic rate increases.' 
            : avgOccupancy < 50
            ? 'Focus on midweek promotions and extended stay discounts.'
            : 'Maintain competitive rates while implementing targeted promotions.'
        }`,
        icon: <Users className="w-6 h-6 text-primary" />
      });
    }

    // Cancellation Analysis with Monthly Trends
    if (currentYear && previousYear) {
      const currentCancellationRate = (currentYear.cancellations / currentYear.total_bookings) * 100;
      const highCancellationMonths = currentYearMonths
        .filter(m => (m.cancellations / m.total_bookings) * 100 > currentCancellationRate)
        .map(m => m.Arrival_Month);
      
      insights.push({
        title: "Cancellation Management",
        description: `Overall cancellation rate is ${currentCancellationRate.toFixed(1)}%, with higher rates in ${
          highCancellationMonths.length ? highCancellationMonths.join(', ') : 'some months'
        }. ${
          currentCancellationRate > 15 
            ? 'Consider adjusting deposit requirements and implementing a tiered cancellation policy.'
            : 'Current cancellation policies are effective. Monitor for seasonal variations.'
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
        {[1, 2, 3, 4, 5].map((i) => (
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