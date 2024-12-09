import { useQuery } from "@tanstack/react-query";
import { Brain } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { InsightCard } from "@/components/recommendations/InsightCard";
import { generateInsights } from "@/utils/insights-generator";
import { icons } from "@/utils/insight-icons";

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

  const insights = generateInsights(yearlyStats || [], monthlyStats || []);

  if (yearlyLoading || monthlyLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">AI Recommendations</h1>
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="w-full">
            <CardContent className="p-6">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-full mt-4" />
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
            <InsightCard
              key={index}
              title={insight.title}
              description={insight.description}
              icon={icons[index % icons.length]}
            />
          ))
        ) : (
          <Card className="col-span-2">
            <CardContent className="p-6">
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