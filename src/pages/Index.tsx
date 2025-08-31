
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Shield, Clock, Star, ArrowRight } from "lucide-react";
import { BookingModal } from "@/components/BookingModal";
import { useUserProfile } from "@/hooks/useUserProfile";

const Index = () => {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const { data: userProfile } = useUserProfile();

  const services = [
    {
      title: "House Cleaning",
      description: "Complete home cleaning service",
      price: "₹2,000",
      duration: "2-3 hours",
      features: ["Deep cleaning", "Sanitization", "Eco-friendly products"]
    },
    {
      title: "Office Cleaning",
      description: "Professional office cleaning",
      price: "₹1,500",
      duration: "1-2 hours",
      features: ["Desk cleaning", "Floor mopping", "Trash removal"]
    },
    {
      title: "Kitchen Deep Clean",
      description: "Specialized kitchen cleaning",
      price: "₹1,200",
      duration: "1.5-2 hours",
      features: ["Appliance cleaning", "Grease removal", "Cabinet wiping"]
    }
  ];

  const handleBookingComplete = () => {
    setShowBookingModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            {/* Company Logo and Branding */}
            <div className="flex flex-col items-center mb-8">
              <img 
                src="/lovable-uploads/7d74efec-31df-41e5-b69e-4cc73573e467.png" 
                alt="MASTERKEY Logo" 
                className="h-24 w-auto mb-4"
              />
              <h1 className="text-4xl md:text-6xl font-bold mb-2 text-white">
                MASTERKEY
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-yellow-300 font-semibold">
                The Key of Trust
              </p>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Professional Cleaning
              <span className="block text-yellow-300">Services</span>
            </h2>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Experience spotless spaces with our premium cleaning solutions. 
              Trusted by thousands of satisfied customers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => setShowBookingModal(true)}
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8 py-4 text-lg"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Book Now
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg"
              >
                Learn More
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Services
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose from our range of professional cleaning services
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="hover:shadow-xl transition-shadow duration-300 border-0 shadow-lg">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl font-bold text-gray-900">{service.title}</CardTitle>
                  <CardDescription className="text-gray-600">{service.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-blue-600">{service.price}</span>
                    <div className="flex items-center justify-center mt-2 text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      <span className="text-sm">{service.duration}</span>
                    </div>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center justify-center text-sm text-gray-600">
                        <Shield className="h-4 w-4 mr-2 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => setShowBookingModal(true)}
                  >
                    Book Service
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <BookingModal 
        open={showBookingModal} 
        onClose={() => setShowBookingModal(false)}
        onBookingComplete={handleBookingComplete}
        userProfile={userProfile}
      />
    </div>
  );
};

export default Index;
