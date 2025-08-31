
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, User, Phone, Mail } from "lucide-react";
import { format } from "date-fns";
import type { Booking } from "@/hooks/useBookings";

interface BookingTaskCardProps {
  booking: Booking;
  onStatusUpdate: (id: string, status: string) => void;
}

export const BookingTaskCard = ({ booking, onStatusUpdate }: BookingTaskCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Confirmed': return 'bg-blue-100 text-blue-800';
      case 'In Progress': return 'bg-purple-100 text-purple-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">{booking.service_name}</CardTitle>
          <Badge className={getStatusColor(booking.status || 'Pending')}>
            {booking.status || 'Pending'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{booking.customer_name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{booking.customer_email}</span>
            </div>
            {booking.customer_phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{booking.customer_phone}</span>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{format(new Date(booking.booking_date), 'PPP')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{booking.booking_time}</span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <span className="break-words">{booking.address}</span>
            </div>
          </div>
        </div>

        {booking.notes && (
          <div className="p-3 bg-muted rounded-md">
            <p className="text-sm"><strong>Notes:</strong> {booking.notes}</p>
          </div>
        )}

        {booking.total_amount && (
          <div className="flex justify-between items-center pt-2 border-t">
            <span className="text-sm font-medium">Total Amount:</span>
            <span className="text-lg font-semibold">₹{booking.total_amount.toLocaleString()}</span>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {booking.status === 'Pending' && (
            <Button
              size="sm"
              onClick={() => onStatusUpdate(booking.id, 'Confirmed')}
            >
              Confirm
            </Button>
          )}
          {booking.status === 'Confirmed' && (
            <Button
              size="sm"
              onClick={() => onStatusUpdate(booking.id, 'In Progress')}
            >
              Start Work
            </Button>
          )}
          {booking.status === 'In Progress' && (
            <Button
              size="sm"
              onClick={() => onStatusUpdate(booking.id, 'Completed')}
            >
              Complete
            </Button>
          )}
          {booking.status !== 'Cancelled' && booking.status !== 'Completed' && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onStatusUpdate(booking.id, 'Cancelled')}
            >
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
