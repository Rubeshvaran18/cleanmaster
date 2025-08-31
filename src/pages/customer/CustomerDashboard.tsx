
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookingModal } from "@/components/BookingModal";
import { FeedbackForm } from "@/components/customer/FeedbackForm";
import { ProfileSection } from "@/components/customer/ProfileSection";
import { ServicesGrid } from "@/components/customer/ServicesGrid";
import { Calendar, Clock, Star, User, Phone, Mail, MapPin, LogOut } from "lucide-react";
import { useBookings } from "@/hooks/useBookings";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { toast } from "sonner";

const CustomerDashboard = () => {
  const { user, signOut } = useAuth();
  const { bookings, loading, refetch } = useBookings();
  const { data: userProfile } = useUserProfile();
  const [showProfile, setShowProfile] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showServices, setShowServices] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out");
    }
  };

  // Filter bookings for current user
  const userBookings = bookings.filter(booking => 
    booking.user_id === user?.id || booking.customer_email === user?.email
  );

  const recentBookings = userBookings.slice(0, 3);
  const upcomingBookings = userBookings.filter(booking => {
    const bookingDate = new Date(booking.booking_date);
    const today = new Date();
    return bookingDate >= today && booking.status === 'Confirmed';
  });

  const stats = [
    { 
      label: "Total Bookings", 
      value: userBookings.length.toString(), 
      icon: Calendar, 
      color: "text-blue-600" 
    },
    { 
      label: "Upcoming", 
      value: upcomingBookings.length.toString(), 
      icon: Clock, 
      color: "text-green-600" 
    },
    { 
      label: "Completed", 
      value: userBookings.filter(b => b.status === 'Completed').length.toString(), 
      icon: Star, 
      color: "text-yellow-600" 
    }
  ];

  const handleBookingComplete = () => {
    setShowBookingModal(false);
    refetch(); // Refresh bookings list
  };

  if (showProfile) {
    return (
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/7d74efec-31df-41e5-b69e-4cc73573e467.png" 
              alt="MASTERKEY Logo" 
              className="h-8 w-auto"
            />
            <div>
              <h1 className="text-2xl font-bold">My Profile</h1>
              <p className="text-sm text-yellow-600 font-semibold">The Key of Trust</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowProfile(false)}>
              Back to Dashboard
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <ProfileSection />
      </div>
    );
  }

  if (showFeedback) {
    return (
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/7d74efec-31df-41e5-b69e-4cc73573e467.png" 
              alt="MASTERKEY Logo" 
              className="h-8 w-auto"
            />
            <div>
              <h1 className="text-2xl font-bold">Give Feedback</h1>
              <p className="text-sm text-yellow-600 font-semibold">The Key of Trust</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowFeedback(false)}>
              Back to Dashboard
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <FeedbackForm />
      </div>
    );
  }

  if (showServices) {
    return (
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/7d74efec-31df-41e5-b69e-4cc73573e467.png" 
              alt="MASTERKEY Logo" 
              className="h-8 w-auto"
            />
            <div>
              <h1 className="text-2xl font-bold">Our Services</h1>
              <p className="text-sm text-yellow-600 font-semibold">The Key of Trust</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowServices(false)}>
              Back to Dashboard
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <ServicesGrid />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/7d74efec-31df-41e5-b69e-4cc73573e467.png" 
              alt="MASTERKEY Logo" 
              className="h-10 w-auto"
            />
            <div>
              <h1 className="text-2xl font-bold">MASTERKEY</h1>
              <p className="text-sm text-yellow-600 font-semibold">The Key of Trust</p>
              <p className="text-muted-foreground text-sm">Welcome Back!</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowBookingModal(true)}>
              Book Service
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                    <div>
                      <p className="text-xl font-bold">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Button 
            variant="outline" 
            className="h-16 flex-col gap-2"
            onClick={() => setShowServices(true)}
          >
            <Star className="h-5 w-5" />
            <span className="text-sm">Browse Services</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-16 flex-col gap-2"
            onClick={() => setShowProfile(true)}
          >
            <User className="h-5 w-5" />
            <span className="text-sm">My Profile</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-16 flex-col gap-2"
            onClick={() => setShowFeedback(true)}
          >
            <Star className="h-5 w-5" />
            <span className="text-sm">Give Feedback</span>
          </Button>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Bookings</h2>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="text-muted-foreground">Loading bookings...</div>
          </div>
        ) : recentBookings.length > 0 ? (
          <div className="space-y-4">
            {recentBookings.map((booking) => (
              <Card key={booking.id} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{booking.service_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(booking.booking_date).toLocaleDateString()} at {booking.booking_time}
                      </p>
                    </div>
                    <Badge 
                      variant={
                        booking.status === 'Completed' ? 'default' : 
                        booking.status === 'Confirmed' ? 'secondary' : 
                        'outline'
                      }
                      className={
                        booking.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'Confirmed' ? 'bg-blue-100 text-blue-800' : ''
                      }
                    >
                      {booking.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{booking.address}</span>
                    </div>
                    {booking.total_amount && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="font-medium">₹{booking.total_amount}</span>
                      </div>
                    )}
                    {booking.notes && (
                      <div className="bg-muted/50 rounded p-2">
                        <p className="text-sm">{booking.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">No bookings yet</h3>
              <p className="text-muted-foreground mb-4">Book your first service to get started</p>
              <Button onClick={() => setShowBookingModal(true)}>
                Book Service
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <BookingModal 
        open={showBookingModal} 
        onClose={() => setShowBookingModal(false)}
        onBookingComplete={handleBookingComplete}
        userProfile={userProfile}
      />
    </div>
  );
};

export default CustomerDashboard;
