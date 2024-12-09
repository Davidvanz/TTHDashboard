interface YearlyStats {
  total_revenue: number;
  avg_rate: number;
  total_bookings: number;
  total_room_nights: number;
  cancellations: number;
}

interface MonthlyStats {
  Arrival_Month: string;
  total_revenue: number;
  avg_rate: number;
  total_bookings: number;
  total_room_nights: number;
  cancellations: number;
}

export const generateInsights = (
  yearlyStats: YearlyStats[],
  monthlyStats: MonthlyStats[]
) => {
  if (!yearlyStats?.length || !monthlyStats?.length) return [];

  const insights = [];
  const currentYear = yearlyStats[0]; // 2024
  const previousYear = yearlyStats[1]; // 2023
  const currentYearMonths = monthlyStats.filter(m => m.year === currentYear.year);
  const previousYearMonths = monthlyStats.filter(m => m.year === previousYear.year);

  // Revenue and Pricing Strategy
  const revenueGrowth = ((currentYear.total_revenue - previousYear.total_revenue) / previousYear.total_revenue) * 100;
  const avgRateGrowth = ((currentYear.avg_rate - previousYear.avg_rate) / previousYear.avg_rate) * 100;
  
  insights.push({
    title: "Revenue & Pricing Strategy",
    description: `Revenue has ${revenueGrowth > 0 ? 'increased' : 'decreased'} by ${Math.abs(revenueGrowth).toFixed(1)}% with average rates ${avgRateGrowth > 0 ? 'up' : 'down'} ${Math.abs(avgRateGrowth).toFixed(1)}%.\n\n` +
      `As a boutique hotel, your pricing strategy should reflect your unique value proposition:\n` +
      `• Current average rate: ${currentYear.avg_rate.toFixed(0)} ZAR\n` +
      `• Recommended actions: ${
        avgRateGrowth > 15
          ? 'Focus on maintaining service quality to justify premium rates. Consider adding luxury amenities or exclusive experiences.'
          : 'Gradually increase rates while enhancing the guest experience through personalized services and unique offerings.'
      }`
  });

  // Seasonal Pattern Analysis
  const peakMonths = currentYearMonths
    .sort((a, b) => b.total_revenue - a.total_revenue)
    .slice(0, 3)
    .map(m => m.Arrival_Month);
  
  const lowMonths = currentYearMonths
    .sort((a, b) => a.total_revenue - b.total_revenue)
    .slice(0, 3)
    .map(m => m.Arrival_Month);

  insights.push({
    title: "Seasonal Strategy & Marketing",
    description: `Peak months: ${peakMonths.join(', ')}\nLow season: ${lowMonths.join(', ')}\n\n` +
      `Marketing Recommendations:\n` +
      `• Create Instagram-worthy moments in your property, especially during ${peakMonths[0]}\n` +
      `• Partner with local attractions and events during ${lowMonths.join(' and ')} to drive demand\n` +
      `• Develop themed packages for different seasons (wellness retreats, romantic getaways)\n` +
      `• Leverage user-generated content and encourage guest reviews\n` +
      `• Consider influencer collaborations during shoulder seasons`
  });

  // Occupancy Optimization
  const avgOccupancy = (currentYear.total_room_nights / (365 * 7)) * 100; // Assuming 7 rooms
  const roomNightGrowth = ((currentYear.total_room_nights - previousYear.total_room_nights) / previousYear.total_room_nights) * 100;

  insights.push({
    title: "Occupancy Optimization",
    description: `Current occupancy: ${avgOccupancy.toFixed(1)}%\nRoom night growth: ${roomNightGrowth.toFixed(1)}%\n\n` +
      `Recommendations to boost occupancy:\n` +
      `• ${avgOccupancy < 60 ? 'Implement mid-week special offers for local travelers' : 'Focus on maintaining high service standards'}\n` +
      `• Create partnerships with local businesses for corporate retreats\n` +
      `• Develop a loyalty program for returning guests\n` +
      `• Consider hosting exclusive events or workshops\n` +
      `• ${lowMonths.length ? `Special focus needed on ${lowMonths.join(', ')} - consider themed events or packages` : ''}`
  });

  // Length of Stay & Package Optimization
  const avgBookingsPerMonth = currentYear.total_bookings / 12;
  insights.push({
    title: "Guest Experience & Retention",
    description: `Monthly average bookings: ${avgBookingsPerMonth.toFixed(0)}\n\n` +
      `Enhancement Strategies:\n` +
      `• Introduce minimum stay requirements during ${peakMonths.join(', ')}\n` +
      `• Create compelling packages for extended stays\n` +
      `• Develop a strong social media presence showcasing unique experiences\n` +
      `• Implement a guest feedback system for continuous improvement\n` +
      `• Consider adding experiential offerings like cooking classes or wine tastings`
  });

  // Digital Presence & Marketing
  const cancellationRate = (currentYear.cancellations / currentYear.total_bookings) * 100;
  insights.push({
    title: "Digital Marketing Strategy",
    description: `Current cancellation rate: ${cancellationRate.toFixed(1)}%\n\n` +
      `Digital Marketing Recommendations:\n` +
      `• Enhance website with virtual tours and high-quality photography\n` +
      `• Implement email marketing campaigns for different seasons\n` +
      `• Create content highlighting local attractions and experiences\n` +
      `• Use targeted social media advertising during low seasons\n` +
      `• Develop a strong presence on luxury travel platforms`
  });

  return insights;
};