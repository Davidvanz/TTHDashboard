import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { DashboardStats } from "@/components/DashboardStats";
import { MonthlyPerformanceChart } from "@/components/MonthlyPerformanceChart";

const TOTAL_ROOMS = 7;

const Dashboard = () => {
  const [selectedYear, setSelectedYear] = useState<2023 | 2024>(2024);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log("No active session found, redirecting to login");
        navigate("/login");
        return;
      }
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        console.log("User signed out, redirecting to login");
        navigate("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const { data: currentYearStats } = useQuery({
    queryKey: ['yearlyStats', selectedYear],
    queryFn: async () => {
      console.log('Fetching yearly statistics for year:', selectedYear);
      const { data, error } = await supabase
        .from('yearly_statistics')
        .select('*')
        .eq('year', selectedYear);
      
      if (error) {
        console.error('Error fetching yearly stats:', error);
        throw error;
      }
      console.log('Yearly stats data:', data);
      return data?.[0] || {
        total_revenue: 0,
        avg_rate: 0,
        total_bookings: 0,
        total_room_nights: 0,
        cancellations: 0
      };
    }
  });

  const { data: previousYearStats } = useQuery({
    queryKey: ['yearlyStats', selectedYear - 1],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('yearly_statistics')
        .select('*')
        .eq('year', selectedYear - 1);
      
      if (error) {
        console.error('Error fetching previous year stats:', error);
        throw error;
      }
      return data?.[0] || {
        total_revenue: 0,
        avg_rate: 0,
        total_bookings: 0,
        total_room_nights: 0,
        cancellations: 0
      };
    }
  });

  const { data: monthlyStats } = useQuery({
    queryKey: ['monthlyStats', selectedYear],
    queryFn: async () => {
      console.log('Fetching monthly statistics for year:', selectedYear);
      const { data, error } = await supabase
        .from('monthly_statistics')
        .select('*')
        .eq('year', selectedYear)
        .order('Arrival_Month_Num', { ascending: true });
      
      if (error) {
        console.error('Error fetching monthly stats:', error);
        throw error;
      }
      console.log('Monthly stats data:', data);
      return data || [];
    }
  });

  // Format currency to South African Rand
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Calculate year-over-year change with 2 decimal places
  const calculateYoYChange = (current: number | undefined, previous: number | undefined) => {
    if (!current || !previous) return 0;
    return Number(((current - previous) / previous * 100).toFixed(2));
  };

  const calculateOccupancyRate = (roomNights: number) => {
    const totalPossibleNights = 365 * TOTAL_ROOMS;
    return (roomNights / totalPossibleNights) * 100;
  };

  // Calculate YoY changes
  const revenueChange = calculateYoYChange(
    currentYearStats?.total_revenue,
    previousYearStats?.total_revenue
  );

  const avgRateChange = calculateYoYChange(
    currentYearStats?.avg_rate,
    previousYearStats?.avg_rate
  );

  const occupancyChange = calculateYoYChange(
    currentYearStats?.total_room_nights ? calculateOccupancyRate(currentYearStats.total_room_nights) : 0,
    previousYearStats?.total_room_nights ? calculateOccupancyRate(previousYearStats.total_room_nights) : 0
  );

  const cancellationChange = calculateYoYChange(
    currentYearStats?.cancellations,
    previousYearStats?.cancellations
  );

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <div className="flex gap-2 items-center">
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
            variant="outline"
            onClick={handleSignOut}
          >
            Sign Out
          </Button>
        </div>
      </div>

      <DashboardStats
        currentYearStats={currentYearStats}
        formatCurrency={formatCurrency}
        calculateOccupancyRate={calculateOccupancyRate}
        revenueChange={revenueChange}
        avgRateChange={avgRateChange}
        occupancyChange={occupancyChange}
        cancellationChange={cancellationChange}
      />

      <MonthlyPerformanceChart
        monthlyStats={monthlyStats || []}
        formatCurrency={formatCurrency}
      />
    </div>
  );
};

export default Dashboard;