import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  trend: number;
  icon: React.ReactNode;
}

export function StatCard({ title, value, trend, icon }: StatCardProps) {
  const isPositive = trend > 0;
  
  return (
    <div className="stat-card">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className="p-2 bg-primary/10 rounded-full">
          {icon}
        </div>
      </div>
      
      <div className="flex items-center gap-1">
        {isPositive ? (
          <ArrowUpIcon className="w-4 h-4 trend-up" />
        ) : (
          <ArrowDownIcon className="w-4 h-4 trend-down" />
        )}
        <span className={cn(
          "text-sm font-medium",
          isPositive ? "trend-up" : "trend-down"
        )}>
          {Math.abs(trend)}%
        </span>
        <span className="text-sm text-muted-foreground ml-1">vs last period</span>
      </div>
    </div>
  );
}