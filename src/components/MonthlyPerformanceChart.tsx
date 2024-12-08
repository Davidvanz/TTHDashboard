import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { ChartContainer } from "@/components/ui/chart";

interface MonthlyPerformanceChartProps {
  monthlyStats: any[];
  formatCurrency: (value: number) => string;
}

export const MonthlyPerformanceChart = ({ monthlyStats, formatCurrency }: MonthlyPerformanceChartProps) => {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-4">Monthly Performance</h2>
      <div className="h-[150px] w-full">
        <ChartContainer
          config={{
            revenue: {
              theme: {
                light: "hsl(var(--primary))",
                dark: "hsl(var(--primary))",
              },
            },
          }}
        >
          <BarChart data={monthlyStats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="Arrival_Month"
              tickFormatter={(value) => value.substring(0, 3)}
            />
            <YAxis />
            <Tooltip content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium">
                          {payload[0].payload.Arrival_Month}
                        </span>
                        <span className="font-medium">
                          {formatCurrency(payload[0].value as number)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              }
              return null
            }} />
            <Bar
              dataKey="total_revenue"
              fill="currentColor"
              className="fill-primary"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
};