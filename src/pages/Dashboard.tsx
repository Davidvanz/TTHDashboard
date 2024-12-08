import { useState, useEffect } from "react";
import { DollarSign, Percent, BedDouble, XCircle } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const TOTAL_ROOMS = 7; // Updated to reflect correct number of rooms

const Dashboard = () => {
  const [selectedYear, setSelectedYear] = useState<2023 | 2024>(2024);
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
        console.error('Error fetching yearly stats:', error);
        throw error;
      }
      console.log('Yearly stats data:', data);
      return data;
    }
  });

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Calculate year-over-year change
  const calculateYoYChange = (current: number, previous: number) => {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
  };

  // Calculate occupancy rate based on room nights
  const calculateOccupancyRate = (roomNights: number) => {
    // Total possible room nights in a year (365 days * number of rooms)
    const totalPossibleNights = 365 * TOTAL_ROOMS;
    return (roomNights / totalPossibleNights) * 100;
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
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
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Revenue"
          value={yearlyStats ? formatCurrency(yearlyStats.total_revenue) : '$0'}
          trend={calculateYoYChange(
            yearlyStats?.total_revenue || 0,
            yearlyStats?.total_revenue || 0
          )}
          icon={<DollarSign className="w-4 h-4 text-primary" />}
        />
        <StatCard
          title="Average Rate"
          value={yearlyStats ? formatCurrency(yearlyStats.avg_rate) : '$0'}
          trend={calculateYoYChange(
            yearlyStats?.avg_rate || 0,
            yearlyStats?.avg_rate || 0
          )}
          icon={<Percent className="w-4 h-4 text-primary" />}
        />
        <StatCard
          title="Occupancy Rate"
          value={yearlyStats ? 
            `${Math.round(calculateOccupancyRate(yearlyStats.total_room_nights))}%` 
            : '0%'
          }
          trend={calculateYoYChange(
            yearlyStats?.total_room_nights || 0,
            yearlyStats?.total_room_nights || 0
          )}
          icon={<BedDouble className="w-4 h-4 text-primary" />}
        />
        <StatCard
          title="Cancellation Rate"
          value={yearlyStats ? 
            `${Math.round((yearlyStats.cancellations / yearlyStats.total_bookings) * 100)}%`
            : '0%'
          }
          trend={-calculateYoYChange(
            yearlyStats?.cancellations || 0,
            yearlyStats?.cancellations || 0
          )}
          icon={<XCircle className="w-4 h-4 text-primary" />}
        />
      </div>
    </div>
  );
};

export default Dashboard;