import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, CalendarIcon, Clock, MapPin, Users, ArrowLeft, Save } from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';
import { useEventTypes } from '@/hooks/useEventTypes';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function CreateEvent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { saveEvent, loading } = useEvents();
  const { eventTypes, loading: eventTypesLoading } = useEventTypes();

  // Get date from URL parameter if provided
  const preselectedDate = searchParams.get('date');

  const [formData, setFormData] = useState({
    clientName: '',
    eventDate: preselectedDate || '',
    eventTime: '',
    address: '',
    numberOfGuests: 10,
    status: 'booked' as const,
    eventTypeId: '',
    specialRequests: ''
  });

  const updateFormData = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientName || !formData.eventDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (eventTypes.length === 0) {
      toast.error('Please set up event types first in Admin Settings → Event Types');
      return;
    }

    if (!formData.eventTypeId || formData.eventTypeId === 'no-types') {
      toast.error('Please select an event type');
      return;
    }

    const eventData = {
      ...formData,
      guests: [] // Empty guests array for now
    };

    const eventId = await saveEvent(eventData);
    if (eventId) {
      toast.success('Event created successfully!');
      navigate('/admin/events');
    }
  };

  const isFormValid = formData.clientName && formData.eventDate && (eventTypes.length === 0 || (formData.eventTypeId && formData.eventTypeId !== 'no-types'));

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/events')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Create New Event</h1>
            <p className="text-muted-foreground">
              {preselectedDate ? `Creating event for ${format(new Date(preselectedDate), 'EEEE, MMMM d, yyyy')}` : 'Add a new catering event to your calendar'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Event Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Event Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientName">
                  Client Name *
                </Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) => updateFormData('clientName', e.target.value)}
                  placeholder="Enter client or event name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="eventType">
                  Event Type *
                </Label>
                <Select
                  value={formData.eventTypeId}
                  onValueChange={(value) => updateFormData('eventTypeId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={eventTypes.length === 0 ? "No event types available" : "Select event type"} />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg z-50">
                    {eventTypes.length === 0 ? (
                      <SelectItem value="no-types" disabled>
                        No event types found - Set up event types in settings
                      </SelectItem>
                    ) : (
                      eventTypes.map((eventType) => (
                        <SelectItem key={eventType.id} value={eventType.id}>
                          {eventType.name} {eventType.base_price > 0 && `- $${eventType.base_price}`}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {eventTypes.length === 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Go to Admin Settings → Event Types to add event types like "Hibachi" or "Catering"
                  </p>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="eventDate">
                  Event Date *
                </Label>
                <Input
                  id="eventDate"
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) => updateFormData('eventDate', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="eventTime">
                  Event Time
                </Label>
                <Select
                  value={formData.eventTime}
                  onValueChange={(value) => updateFormData('eventTime', value)}
                >
                  <SelectTrigger className="border">
                    <SelectValue placeholder="Select event time" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg z-50 max-h-60">
                    {/* Generate time options every 30 minutes from 6:00 AM to 11:30 PM */}
                    {Array.from({ length: 36 }, (_, i) => {
                      const totalMinutes = 360 + (i * 30); // Start at 6:00 AM (360 minutes)
                      const hours = Math.floor(totalMinutes / 60);
                      const minutes = totalMinutes % 60;
                      const hour12 = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
                      const ampm = hours >= 12 ? 'PM' : 'AM';
                      const timeValue = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                      const timeDisplay = `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
                      
                      return (
                        <SelectItem key={timeValue} value={timeValue}>
                          {timeDisplay}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="numberOfGuests">
                  Number of Guests
                </Label>
                <Input
                  id="numberOfGuests"
                  type="number"
                  min="1"
                  max="1000"
                  value={formData.numberOfGuests}
                  onChange={(e) => updateFormData('numberOfGuests', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">
                Event Address
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => updateFormData('address', e.target.value)}
                placeholder="Enter event location"
              />
            </div>

            <div>
              <Label htmlFor="status">
                Event Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => updateFormData('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-50">
                  <SelectItem value="booked">Booked</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="specialRequests">
                Special Requests / Notes
              </Label>
              <Textarea
                id="specialRequests"
                value={formData.specialRequests}
                onChange={(e) => updateFormData('specialRequests', e.target.value)}
                placeholder="Any special dietary requirements, setup instructions, or other notes..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Event Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Event Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>
                  {formData.eventDate ? format(new Date(formData.eventDate), 'EEEE, MMMM d, yyyy') : 'No date selected'}
                  {formData.eventTime && ` at ${formData.eventTime}`}
                </span>
              </div>
              
              <div className="flex items-center text-sm">
                <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{formData.numberOfGuests} guests expected</span>
              </div>
              
              {formData.address && (
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{formData.address}</span>
                </div>
              )}

              {formData.clientName && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Client: </span>
                  <span className="font-medium">{formData.clientName}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/events')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!isFormValid || loading}
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Creating Event...' : 'Create Event'}
          </Button>
        </div>
      </form>
    </div>
  );
}