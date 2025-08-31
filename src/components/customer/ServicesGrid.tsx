
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, MapPin, IndianRupee } from 'lucide-react';
import { BookingModal } from '@/components/BookingModal';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from '@/hooks/useUserProfile';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_hours: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export const ServicesGrid = () => {
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const { data: userProfile } = useUserProfile();

  const { data: services, isLoading, error } = useQuery({
    queryKey: ['services', 'active'],
    queryFn: async () => {
      console.log('ServicesGrid: Fetching services...');
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('status', 'Active')
        .order('name');
      
      if (error) {
        console.error('ServicesGrid: Error fetching services:', error);
        throw error;
      }
      console.log('ServicesGrid: Services fetched:', data);
      return data as Service[];
    }
  });

  const handleBookService = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setIsBookingModalOpen(true);
  };

  const handleBookingComplete = () => {
    setIsBookingModalOpen(false);
    setSelectedServiceId(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2">Our Cleaning Services</h2>
          <p className="text-muted-foreground">Professional cleaning services at your doorstep</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-gray-200 rounded mb-4"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    console.error('ServicesGrid: Query error:', error);
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2">Our Cleaning Services</h2>
          <p className="text-muted-foreground">Professional cleaning services at your doorstep</p>
        </div>
        
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-6xl mb-4 opacity-20">⚠️</div>
            <h3 className="text-xl font-semibold mb-2">Error Loading Services</h3>
            <p className="text-muted-foreground">Unable to load services. Please refresh the page or try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log('ServicesGrid: Rendering services:', services);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Our Cleaning Services</h2>
        <p className="text-muted-foreground">Professional cleaning services at your doorstep</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services?.map((service) => (
          <Card key={service.id} className="hover:shadow-lg transition-all duration-300 overflow-hidden group border-2 hover:border-primary/20">
            <div className="relative">
              <div className="w-full h-48 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                <div className="text-6xl opacity-20">🧹</div>
              </div>
              <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground">
                Professional
              </Badge>
              <Badge 
                variant="secondary" 
                className="absolute top-3 left-3 bg-green-500 text-white"
              >
                {service.status}
              </Badge>
            </div>
            
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                  {service.name}
                </CardTitle>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-sm font-medium">4.8</span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0 space-y-4">
              <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                {service.description || "Professional cleaning service tailored to your needs."}
              </p>
              
              <div className="flex items-center justify-between text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="font-medium">{service.duration_hours}h duration</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="font-medium">On-site</span>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-3">
                  <div className="text-sm text-muted-foreground">Service Price:</div>
                  <div className="flex items-center gap-1 text-2xl font-bold text-primary">
                    <IndianRupee className="h-5 w-5" />
                    {service.price}
                  </div>
                </div>
                
                <Button 
                  onClick={() => handleBookService(service.id)}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2 transition-all duration-200"
                  size="lg"
                >
                  Book Now
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {services && services.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-6xl mb-4 opacity-20">🧹</div>
            <h3 className="text-xl font-semibold mb-2">No Services Available</h3>
            <p className="text-muted-foreground">We're working on adding new services. Please check back later!</p>
          </CardContent>
        </Card>
      )}

      <BookingModal
        open={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onBookingComplete={handleBookingComplete}
        preSelectedServiceId={selectedServiceId || ''}
        userProfile={userProfile}
      />
    </div>
  );
};
