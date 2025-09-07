import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, DollarSign, Users, TrendingUp, Plus, Eye } from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';
import { useRevenue } from '@/hooks/useRevenue';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const { events, loading, loadUserEvents } = useEvents();
  const { analytics } = useRevenue();
  const navigate = useNavigate();
  const [todayEvents, setTodayEvents] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);

  // Load events on component mount
  useEffect(() => {
    loadUserEvents();
  }, []);

  useEffect(() => {
    if (events) {
      const today = new Date();
      const todayStr = today.toDateString();
      const oneWeekFromNow = new Date();
      oneWeekFromNow.setDate(today.getDate() + 7);

      const todayEventsFiltered = events.filter(event => 
        event.eventDate && new Date(event.eventDate).toDateString() === todayStr
      );

      const upcomingEventsFiltered = events.filter(event => {
        if (!event.eventDate) return false;
        const eventDate = new Date(event.eventDate);
        return eventDate > today && eventDate <= oneWeekFromNow;
      }).slice(0, 5);

      setTodayEvents(todayEventsFiltered);
      setUpcomingEvents(upcomingEventsFiltered);
    }
  }, [events]);

  const thisWeekEvents = events.filter(event => {
    if (!event.eventDate) return false;
    const eventDate = new Date(event.eventDate);
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    return eventDate >= weekStart && eventDate <= weekEnd;
  }).length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading dashboard...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Events This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{thisWeekEvents}</div>
            <p className="text-xs text-muted-foreground">
              {todayEvents.length} happening today
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue MTD</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${analytics?.totalRevenue.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              ${analytics?.totalProfit.toFixed(2) || '0.00'} profit
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
            <p className="text-xs text-muted-foreground">
              All time events
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.profitMargin.toFixed(1) || '0.0'}%
            </div>
            <p className="text-xs text-muted-foreground">
              Average margin
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Today's Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Today's Events
              <Badge variant="secondary">{todayEvents.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayEvents.length > 0 ? (
              <div className="space-y-4">
                {todayEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{event.title || 'Event'}</h4>
                      <p className="text-sm text-muted-foreground">
                        {event.clientName} • {event.guestCount} guests
                      </p>
                      {event.eventTime && (
                        <p className="text-sm text-muted-foreground">
                          {event.eventTime}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(event.status)}>
                        {event.status}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/admin/events/${event.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No events scheduled for today</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Upcoming Events
              <Badge variant="secondary">{upcomingEvents.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{event.title || 'Event'}</h4>
                      <p className="text-sm text-muted-foreground">
                        {event.clientName} • {event.guestCount} guests
                      </p>
                      {event.eventDate && (
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(event.eventDate), 'MMM dd, yyyy')}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(event.status)}>
                        {event.status}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/admin/events/${event.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No upcoming events this week</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/admin/events')}
              className="h-20 flex flex-col"
            >
              <Calendar className="h-6 w-6 mb-2" />
              View All Events
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/admin/clients')}
              className="h-20 flex flex-col"
            >
              <Users className="h-6 w-6 mb-2" />
              Manage Clients
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/admin/billing')}
              className="h-20 flex flex-col"
            >
              <DollarSign className="h-6 w-6 mb-2" />
              Billing & Invoices
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/admin/analytics')}
              className="h-20 flex flex-col"
            >
              <TrendingUp className="h-6 w-6 mb-2" />
              View Analytics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}