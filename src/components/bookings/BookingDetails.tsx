import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface BookingDetailsProps {
  selectedSource: { name: string } | null;
  bookingComData: any[] | null;
  directBookingsTotal: number;
}

export function BookingDetails({ 
  selectedSource, 
  bookingComData, 
  directBookingsTotal 
}: BookingDetailsProps) {
  if (!selectedSource) return null;

  if (selectedSource.name === 'Booking.com') {
    return (
      <div className="space-y-4">
        {bookingComData?.map((booking, index) => (
          <Card key={`${booking.Country}-${index}`}>
            <CardHeader>
              <CardTitle>{booking.Country}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Reservations</p>
                <p className="text-lg font-semibold">{booking.Reservations}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Daily Rate</p>
                <p className="text-lg font-semibold">{booking.Avg_Daily_Rate}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Booking Window</p>
                <p className="text-lg font-semibold">{booking.Avg_Book_Window} days</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Room Type</TableHead>
          <TableHead>Guest</TableHead>
          <TableHead>Revenue</TableHead>
          <TableHead>Season</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell colSpan={4} className="text-center">
            Total Direct Bookings: {directBookingsTotal}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}