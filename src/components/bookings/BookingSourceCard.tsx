import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BookingSourceCardProps {
  title: string;
  total: number;
  percentage: number;
  totalBookings: number;
  onClick: () => void;
}

export function BookingSourceCard({ 
  title, 
  total, 
  percentage, 
  totalBookings, 
  onClick 
}: BookingSourceCardProps) {
  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold">{total}</div>
        <p className="text-muted-foreground">
          {percentage.toFixed(1)}% of total bookings
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Total bookings: {totalBookings}
        </p>
      </CardContent>
    </Card>
  );
}