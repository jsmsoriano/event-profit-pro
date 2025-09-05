import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CalendarIcon, Users, Mail, Phone, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useMenu } from '@/hooks/useMenu';
import { toast } from '@/hooks/use-toast';

interface BookingStep {
  title: string;
  description: string;
}

const steps: BookingStep[] = [
  { title: 'Menu Selection', description: 'Choose your dishes and packages' },
  { title: 'Event Details', description: 'Date, venue, and guest count' },
  { title: 'Contact Info', description: 'Your contact information' },
  { title: 'Review & Book', description: 'Review your selection and confirm' }
];

export default function BookEvent() {
  const [currentStep, setCurrentStep] = useState(0);
  const [bookingData, setBookingData] = useState({
    selectedItems: { dishes: [], packages: [] },
    eventDate: '',
    eventTime: '',
    guestCount: '',
    venue: '',
    specialRequests: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    estimatedTotal: 0
  });

  const navigate = useNavigate();
  const { user } = useAuth();
  const { dishes, packages } = useMenu();

  useEffect(() => {
    // Load selected items from localStorage if available
    const savedSelection = localStorage.getItem('selectedMenuItems');
    if (savedSelection) {
      const parsedSelection = JSON.parse(savedSelection);
      setBookingData(prev => ({
        ...prev,
        selectedItems: parsedSelection
      }));
      calculateTotal(parsedSelection);
    }
  }, [dishes, packages]);

  const calculateTotal = (selectedItems: any) => {
    let total = 0;
    const guestCount = parseInt(bookingData.guestCount) || 20; // Default estimate

    // Calculate dish costs
    selectedItems.dishes.forEach((dishId: string) => {
      const dish = dishes.find(d => d.id === dishId);
      if (dish) {
        total += dish.base_price_per_guest * guestCount;
      }
    });

    // Calculate package costs
    selectedItems.packages.forEach((packageId: string) => {
      const pkg = packages.find(p => p.id === packageId);
      if (pkg) {
        total += pkg.price_per_guest * guestCount;
      }
    });

    setBookingData(prev => ({ ...prev, estimatedTotal: total }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const submitBooking = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to complete your booking",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    // Here would be the API call to create the event
    toast({
      title: "Booking submitted!",
      description: "We'll contact you within 24 hours to confirm your event details.",
    });

    // Clear localStorage
    localStorage.removeItem('selectedMenuItems');
    
    // Navigate to success page or events
    navigate('/my-events');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Selected Menu Items</h3>
            
            {bookingData.selectedItems.packages.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Packages</h4>
                <div className="space-y-2">
                  {bookingData.selectedItems.packages.map((packageId: string) => {
                    const pkg = packages.find(p => p.id === packageId);
                    return pkg ? (
                      <div key={pkg.id} className="flex justify-between items-center p-3 border rounded">
                        <div>
                          <span className="font-medium">{pkg.name}</span>
                          <p className="text-sm text-muted-foreground">{pkg.description}</p>
                        </div>
                        <Badge>${pkg.price_per_guest}/guest</Badge>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}
            
            {bookingData.selectedItems.dishes.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Individual Dishes</h4>
                <div className="space-y-2">
                  {bookingData.selectedItems.dishes.map((dishId: string) => {
                    const dish = dishes.find(d => d.id === dishId);
                    return dish ? (
                      <div key={dish.id} className="flex justify-between items-center p-3 border rounded">
                        <div>
                          <span className="font-medium">{dish.name}</span>
                          <p className="text-sm text-muted-foreground">{dish.description}</p>
                        </div>
                        <Badge>${dish.base_price_per_guest}/guest</Badge>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}
            
            {bookingData.selectedItems.dishes.length === 0 && bookingData.selectedItems.packages.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No items selected yet</p>
                <Button onClick={() => navigate('/menu')}>Browse Menu</Button>
              </div>
            )}
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Event Details</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="eventDate">Event Date</Label>
                <Input
                  id="eventDate"
                  type="date"
                  value={bookingData.eventDate}
                  onChange={(e) => setBookingData(prev => ({ ...prev, eventDate: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="eventTime">Event Time</Label>
                <Input
                  id="eventTime"
                  type="time"
                  value={bookingData.eventTime}
                  onChange={(e) => setBookingData(prev => ({ ...prev, eventTime: e.target.value }))}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="guestCount">Number of Guests</Label>
              <Input
                id="guestCount"
                type="number"
                placeholder="e.g., 50"
                value={bookingData.guestCount}
                onChange={(e) => {
                  setBookingData(prev => ({ ...prev, guestCount: e.target.value }));
                  calculateTotal(bookingData.selectedItems);
                }}
              />
            </div>
            
            <div>
              <Label htmlFor="venue">Venue/Location</Label>
              <Input
                id="venue"
                placeholder="Event venue or address"
                value={bookingData.venue}
                onChange={(e) => setBookingData(prev => ({ ...prev, venue: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="specialRequests">Special Requests</Label>
              <Textarea
                id="specialRequests"
                placeholder="Any dietary restrictions, special arrangements, or additional requests..."
                value={bookingData.specialRequests}
                onChange={(e) => setBookingData(prev => ({ ...prev, specialRequests: e.target.value }))}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Contact Information</h3>
            
            <div>
              <Label htmlFor="contactName">Full Name</Label>
              <Input
                id="contactName"
                placeholder="Your full name"
                value={bookingData.contactName}
                onChange={(e) => setBookingData(prev => ({ ...prev, contactName: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="contactEmail">Email Address</Label>
              <Input
                id="contactEmail"
                type="email"
                placeholder="your.email@example.com"
                value={bookingData.contactEmail}
                onChange={(e) => setBookingData(prev => ({ ...prev, contactEmail: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="contactPhone">Phone Number</Label>
              <Input
                id="contactPhone"
                type="tel"
                placeholder="(555) 123-4567"
                value={bookingData.contactPhone}
                onChange={(e) => setBookingData(prev => ({ ...prev, contactPhone: e.target.value }))}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Review Your Booking</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Event Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{bookingData.eventDate || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time:</span>
                    <span>{bookingData.eventTime || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Guests:</span>
                    <span>{bookingData.guestCount || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Venue:</span>
                    <span className="text-right">{bookingData.venue || 'Not specified'}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Name:</span>
                    <span>{bookingData.contactName || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <span>{bookingData.contactEmail || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phone:</span>
                    <span>{bookingData.contactPhone || 'Not specified'}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Estimated Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  ${bookingData.estimatedTotal.toFixed(2)}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  *Final pricing will be confirmed based on actual guest count and specific requirements
                </p>
              </CardContent>
            </Card>
            
            {bookingData.specialRequests && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Special Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{bookingData.specialRequests}</p>
                </CardContent>
              </Card>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return bookingData.selectedItems.dishes.length > 0 || bookingData.selectedItems.packages.length > 0;
      case 1:
        return bookingData.eventDate && bookingData.guestCount && bookingData.venue;
      case 2:
        return bookingData.contactName && bookingData.contactEmail && bookingData.contactPhone;
      case 3:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Book Your Event</h1>
        <p className="text-muted-foreground">Let's create an amazing experience for your guests</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex items-center ${index <= currentStep ? 'text-primary' : 'text-muted-foreground'}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 ${
                  index < currentStep
                    ? 'bg-primary text-primary-foreground border-primary'
                    : index === currentStep
                    ? 'border-primary text-primary'
                    : 'border-muted-foreground'
                }`}
              >
                {index < currentStep ? <Check className="h-4 w-4" /> : index + 1}
              </div>
              <div className="ml-2 hidden sm:block">
                <div className="text-sm font-medium">{step.title}</div>
                <div className="text-xs">{step.description}</div>
              </div>
            </div>
          ))}
        </div>
        <Progress value={(currentStep / (steps.length - 1)) * 100} className="w-full" />
      </div>

      {/* Step Content */}
      <Card className="mb-8">
        <CardContent className="p-6">
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        {currentStep < steps.length - 1 ? (
          <Button
            onClick={nextStep}
            disabled={!canProceed()}
          >
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={submitBooking}
            disabled={!canProceed()}
            className="bg-primary"
          >
            Submit Booking
            <Check className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}