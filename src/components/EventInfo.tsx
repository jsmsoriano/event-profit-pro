import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CalendarDays, Plus, Trash2, Users, Save, FileText } from "lucide-react"
import { useEvents, type EventData } from "@/hooks/useEvents"
import { toast } from "sonner"

interface Protein {
  name: string
  upcharge: number
}

interface Guest {
  id: string
  name: string
  type: 'adult' | 'child'
  proteins: string[]
  specialRequests: string
}

const proteins: Protein[] = [
  { name: "Shrimp", upcharge: 0 },
  { name: "Chicken", upcharge: 0 },
  { name: "Steak", upcharge: 0 },
  { name: "Filet Mignon", upcharge: 7 },
  { name: "Scallops", upcharge: 5 }
]

const EventInfo = () => {
  // Event Information
  const [eventDate, setEventDate] = useState("")
  const [clientName, setClientName] = useState("")
  const [address, setAddress] = useState("")
  const [eventTime, setEventTime] = useState("")
  const [numberOfGuests, setNumberOfGuests] = useState(15)
  const [status, setStatus] = useState<'booked' | 'cancelled' | 'completed'>('booked')
  const [currentEventId, setCurrentEventId] = useState<string | null>(null)
  
  // Guest Management
  const [guests, setGuests] = useState<Guest[]>([])

  const { saveEvent, loadEvent, loadUserEvents, events, loading } = useEvents()
  

  // Auto-generate guests when number changes
  useEffect(() => {
    if (numberOfGuests > guests.length) {
      const newGuests = Array.from({ length: numberOfGuests - guests.length }, (_, i) => ({
        id: (Date.now() + i).toString(),
        name: "",
        type: 'adult' as const,
        proteins: [],
        specialRequests: ""
      }))
      setGuests([...guests, ...newGuests])
    } else if (numberOfGuests < guests.length) {
      setGuests(guests.slice(0, numberOfGuests))
    }
  }, [numberOfGuests])

  useEffect(() => {
    loadUserEvents()
  }, [])

  const addGuest = () => {
    const newGuest: Guest = {
      id: Date.now().toString(),
      name: "",
      type: 'adult',
      proteins: [],
      specialRequests: ""
    }
    setGuests([...guests, newGuest])
    setNumberOfGuests(numberOfGuests + 1)
  }

  const removeGuest = (id: string) => {
    setGuests(guests.filter(guest => guest.id !== id))
    setNumberOfGuests(numberOfGuests - 1)
  }

  const updateGuest = (id: string, field: keyof Guest, value: any) => {
    setGuests(guests.map(guest => 
      guest.id === id ? { ...guest, [field]: value } : guest
    ))
  }

  const toggleGuestProtein = (guestId: string, proteinName: string) => {
    const guest = guests.find(g => g.id === guestId)
    if (!guest) return

    const newProteins = guest.proteins.includes(proteinName)
      ? guest.proteins.filter(p => p !== proteinName)
      : guest.proteins.length < 2
        ? [...guest.proteins, proteinName]
        : guest.proteins

    updateGuest(guestId, 'proteins', newProteins)
  }

  const handleSaveEvent = async () => {
    const eventData: EventData = {
      id: currentEventId || undefined,
      clientName,
      eventDate,
      address,
      eventTime,
      numberOfGuests,
      status,
      guests: guests.map(guest => ({
        name: guest.name,
        type: guest.type,
        proteins: guest.proteins,
        specialRequests: guest.specialRequests
      }))
    }

    const savedId = await saveEvent(eventData)
    if (savedId) {
      setCurrentEventId(savedId)
    }
  }

  const handleLoadEvent = async (eventId: string) => {
    const eventData = await loadEvent(eventId)
    if (eventData) {
      setCurrentEventId(eventData.id || null)
      setClientName(eventData.clientName)
      setEventDate(eventData.eventDate)
      setAddress(eventData.address)
      setEventTime(eventData.eventTime)
      setNumberOfGuests(eventData.numberOfGuests)
      setStatus(eventData.status)
      setGuests(eventData.guests.map((guest, index) => ({
        id: guest.id || (Date.now() + index).toString(),
        name: guest.name,
        type: guest.type,
        proteins: guest.proteins,
        specialRequests: guest.specialRequests
      })))
      toast.success('Event loaded successfully')
    }
  }

  const handleCreateNewEvent = () => {
    setCurrentEventId(null)
    setClientName("")
    setEventDate("")
    setAddress("")
    setEventTime("")
    setNumberOfGuests(15)
    setStatus('booked')
    setGuests([])
  }

  return (
    <div className="space-y-6">
      {/* Header with New Event Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Event Info</h1>
          <p className="text-muted-foreground">Manage event details and guest preferences</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCreateNewEvent} variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            Create New Event
          </Button>
          <Button onClick={handleSaveEvent} disabled={loading} className="gap-2">
            <Save className="h-4 w-4" />
            {loading ? 'Saving...' : currentEventId ? 'Update Event' : 'Save Event'}
          </Button>
        </div>
      </div>

      {/* Load Existing Events */}
      {events.length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle>Load Existing Event</CardTitle>
            </div>
            <CardDescription>
              Select an event to edit
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {events.map(event => (
                <Button
                  key={event.id}
                  onClick={() => handleLoadEvent(event.id!)}
                  variant="outline"
                  className="h-auto p-3 justify-start"
                >
                  <div className="text-left">
                    <div className="font-medium">{event.clientName}</div>
                    <div className="text-sm text-muted-foreground">
                      {event.eventDate} • {event.numberOfGuests} guests
                    </div>
                    <Badge variant={event.status === 'booked' ? 'default' : event.status === 'completed' ? 'secondary' : 'destructive'} className="mt-1">
                      {event.status}
                    </Badge>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Event Information */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            <CardTitle>Event Details</CardTitle>
          </div>
          <CardDescription>
            Basic information about the event
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name</Label>
              <Input
                id="clientName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Enter client name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eventDate">Event Date</Label>
              <Input
                id="eventDate"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="numberOfGuests">Number of Guests</Label>
              <Input
                id="numberOfGuests"
                type="number"
                min="0"
                value={numberOfGuests}
                onChange={(e) => setNumberOfGuests(Number(e.target.value) || 0)}
                placeholder="Enter number of guests"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="address">Event Address</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter event address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eventTime">Event Time</Label>
              <Input
                id="eventTime"
                type="time"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Event Status</Label>
            <Select value={status} onValueChange={(value: 'booked' | 'cancelled' | 'completed') => setStatus(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="booked">Booked</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Guest Menu */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <CardTitle>Guest Menu</CardTitle>
            </div>
            <Button onClick={addGuest} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Guest
            </Button>
          </div>
          <CardDescription>
            Manage individual guest preferences and dietary requirements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Meal Summary */}
          <div className="bg-accent/50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-3">What's Included in Each Meal</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                <span>Fresh Salad</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                <span>2 Proteins (Your Choice)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                <span>Seasonal Vegetables</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                <span>Fried Rice</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                <span>Noodles</span>
              </div>
            </div>
          </div>

          {/* Guest Table */}
          {numberOfGuests === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Enter number of guests above to start adding guest information.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">#</TableHead>
                    <TableHead>Guest Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Protein 1</TableHead>
                    <TableHead>Protein 2</TableHead>
                    <TableHead>Special Requests</TableHead>
                    <TableHead className="w-[50px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {guests.map((guest, index) => (
                    <TableRow key={guest.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <Input
                          value={guest.name}
                          onChange={(e) => updateGuest(guest.id, 'name', e.target.value)}
                          placeholder="Enter name"
                          className="w-full"
                        />
                      </TableCell>
                      <TableCell>
                        <Select value={guest.type} onValueChange={(value: 'adult' | 'child') => updateGuest(guest.id, 'type', value)}>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="adult">Adult</SelectItem>
                            <SelectItem value="child">Child</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={guest.proteins[0] || ""} 
                          onValueChange={(value) => {
                            const newProteins = [value, guest.proteins[1] || ""].filter(Boolean)
                            updateGuest(guest.id, 'proteins', newProteins)
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select protein" />
                          </SelectTrigger>
                          <SelectContent>
                            {proteins.map((protein) => (
                              <SelectItem key={protein.name} value={protein.name}>
                                {protein.name} {protein.upcharge > 0 && `(+$${protein.upcharge})`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={guest.proteins[1] || ""} 
                          onValueChange={(value) => {
                            const newProteins = [guest.proteins[0] || "", value].filter(Boolean)
                            updateGuest(guest.id, 'proteins', newProteins)
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select protein" />
                          </SelectTrigger>
                          <SelectContent>
                            {proteins.map((protein) => (
                              <SelectItem key={protein.name} value={protein.name}>
                                {protein.name} {protein.upcharge > 0 && `(+$${protein.upcharge})`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Textarea
                          value={guest.specialRequests}
                          onChange={(e) => updateGuest(guest.id, 'specialRequests', e.target.value)}
                          placeholder="Allergies, restrictions..."
                          rows={2}
                          className="w-full min-w-[200px]"
                        />
                      </TableCell>
                      <TableCell>
                        <Button 
                          onClick={() => removeGuest(guest.id)} 
                          size="sm" 
                          variant="ghost"
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default EventInfo