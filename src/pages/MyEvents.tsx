import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar as CalendarIcon, Users, Clock, MapPin, Phone, Mail, DollarSign, Eye, CalendarDays } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { useEvents } from '@/hooks/useEvents';
import { useNavigate } from 'react-router-dom';
import { format, isSameDay, parseISO } from 'date-fns';

export default function MyEvents() {
  const { events, loading } = useEvents();
  const navigate = useNavigate();
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [pastEvents, setPastEvents] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    if (events) {
      const now = new Date();
      const upcoming = events.filter(event => 
        event.eventDate && new Date(event.eventDate) >= now
      );
      const past = events.filter(event => 
        event.eventDate && new Date(event.eventDate) < now
      );
      
      setUpcomingEvents(upcoming);
      setPastEvents(past);
    }
  }, [events]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      event.eventDate && isSameDay(parseISO(event.eventDate), date)
    );
  };

  const getSelectedDateEvents = () => {
    if (!selectedDate) return [];
    return getEventsForDate(selectedDate);
  };

  const EventCard = ({ event, isPast = false }: { event: any; isPast?: boolean }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{event.clientName || 'Your Event'}</CardTitle>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <CalendarIcon className="h-4 w-4 mr-1" />
              {event.eventDate && format(new Date(event.eventDate), 'PPP')}
              {event.eventTime && (
                <>
                  <Clock className="h-4 w-4 ml-3 mr-1" />
                  {event.eventTime}
                </>
              )}
            </div>
          </div>
          <Badge className={getStatusColor(event.status)}>
            {event.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center text-sm">
            <Users className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{event.numberOfGuests || 'Not specified'} guests</span>
          </div>
          
          {event.address && (
            <div className="flex items-center text-sm">
              <MapPin className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground">{event.address}</span>
            </div>
          )}
          
          <div className="flex justify-between items-center pt-3 border-t">
            <div className="text-sm text-muted-foreground">
              Created {event.createdAt && format(new Date(event.createdAt), 'MMM dd, yyyy')}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/my-events/${event.id}`)}
            >
              <Eye className="h-4 w-4 mr-1" />
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="glass-card p-8">
          <div className="animate-pulse text-center">
            <div className="w-8 h-8 bg-primary rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your events...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Events</h1>
          <p className="text-muted-foreground">Manage your upcoming and past events</p>
        </div>
        <Button onClick={() => navigate('/admin/events/new')}>
          Create New Event
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingEvents.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Past Events</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pastEvents.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Events Tabs */}
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
          <TabsTrigger value="past">Past Events</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="space-y-4">
          {loading ? (
            <div className="text-center py-8">Loading your events...</div>
          ) : upcomingEvents.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No upcoming events</h3>
                <p className="text-muted-foreground text-center mb-4">
                  You don't have any upcoming events scheduled yet.
                </p>
                <Button onClick={() => navigate('/admin/events/new')}>
                  Create Your First Event
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="past" className="space-y-4">
          {pastEvents.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {pastEvents.map((event) => (
                <EventCard key={event.id} event={event} isPast />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No past events</h3>
                <p className="text-muted-foreground text-center">
                  Your past events will appear here after they've concluded.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="calendar" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarDays className="h-5 w-5 mr-2" />
                  Events Calendar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  modifiers={{
                    hasEvent: (date) => getEventsForDate(date).length > 0
                  }}
                  modifiersStyles={{
                    hasEvent: { 
                      backgroundColor: 'hsl(var(--primary))',
                      color: 'hsl(var(--primary-foreground))',
                      fontWeight: 'bold'
                    }
                  }}
                  className="rounded-md border pointer-events-auto"
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : 'Select a date'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDate ? (
                  <div className="space-y-3">
                    {getSelectedDateEvents().length > 0 ? (
                      getSelectedDateEvents().map((event) => (
                        <div key={event.id} className="border rounded-lg p-3 hover:bg-accent/50 cursor-pointer"
                             onClick={() => navigate(`/my-events/${event.id}`)}>
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium">{event.clientName || 'Your Event'}</h4>
                            <Badge className={getStatusColor(event.status)}>
                              {event.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            {event.eventTime && (
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-2" />
                                {event.eventTime}
                              </div>
                            )}
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-2" />
                              {event.numberOfGuests || 'Not specified'} guests
                            </div>
                            {event.address && (
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                                <span className="truncate">{event.address}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <CalendarIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">No events scheduled for this date</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CalendarIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Select a date to view events</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}