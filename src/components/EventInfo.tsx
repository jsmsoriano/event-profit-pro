import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { CalendarDays, Plus, Trash2, Users, Save, FileText, RefreshCw } from "lucide-react"
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
  const [gratuity, setGratuity] = useState(20)

  const { saveEvent, loadEvent, loadUserEvents, events, loading } = useEvents()
  
  const adultPlatePrice = 60
  const childPlatePrice = 30

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

  const calculateTotal = () => {
    const adultCount = guests.filter(g => g.type === 'adult').length
    const childCount = guests.filter(g => g.type === 'child').length
    
    const guestUpcharges = guests.reduce((total, guest) => {
      return total + guest.proteins.reduce((proteinTotal, proteinName) => {
        const protein = proteins.find(p => p.name === proteinName)
        return proteinTotal + (protein?.upcharge || 0)
      }, 0)
    }, 0)

    const adultTotal = adultCount * adultPlatePrice
    const childTotal = childCount * childPlatePrice
    const subtotal = adultTotal + childTotal + guestUpcharges
    const gratuityAmount = (subtotal * gratuity) / 100
    
    return {
      adultCount,
      childCount,
      adultTotal,
      childTotal,
      guestUpcharges,
      subtotal,
      gratuityAmount,
      total: subtotal + gratuityAmount
    }
  }

  const handleSaveEvent = async () => {
    const eventData: EventData = {
      id: currentEventId || undefined,
      clientName,
      eventDate,
      address,
      eventTime,
      numberOfGuests,
      gratuity,
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
      setGratuity(eventData.gratuity)
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
    setGratuity(20)
    setGuests([])
  }

  const totals = calculateTotal()

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

          {/* Guest List */}
          {numberOfGuests === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Enter number of guests above to start adding guest information.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {guests.map((guest, index) => (
                <Card key={guest.id} className="border-l-4 border-l-primary/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold">Guest {index + 1}</h4>
                      <Button 
                        onClick={() => removeGuest(guest.id)} 
                        size="sm" 
                        variant="ghost"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <Label>Guest Name</Label>
                        <Input
                          value={guest.name}
                          onChange={(e) => updateGuest(guest.id, 'name', e.target.value)}
                          placeholder="Enter guest name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <Select value={guest.type} onValueChange={(value: 'adult' | 'child') => updateGuest(guest.id, 'type', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="adult">Adult (${adultPlatePrice})</SelectItem>
                            <SelectItem value="child">Child (${childPlatePrice})</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <Label>Select 2 Proteins</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {proteins.map((protein) => (
                          <div
                            key={protein.name}
                            className={`flex items-center space-x-3 p-3 rounded-md border transition-colors ${
                              guest.proteins.includes(protein.name)
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:bg-accent'
                            }`}
                          >
                            <Checkbox
                              id={`${guest.id}-${protein.name}`}
                              checked={guest.proteins.includes(protein.name)}
                              onCheckedChange={() => toggleGuestProtein(guest.id, protein.name)}
                              disabled={
                                !guest.proteins.includes(protein.name) && guest.proteins.length >= 2
                              }
                            />
                            <Label
                              htmlFor={`${guest.id}-${protein.name}`}
                              className="flex-1 flex justify-between items-center cursor-pointer"
                            >
                              <span>{protein.name}</span>
                              {protein.upcharge > 0 && (
                                <Badge variant="secondary">+${protein.upcharge}</Badge>
                              )}
                            </Label>
                          </div>
                        ))}
                      </div>
                      {guest.proteins.length === 2 && (
                        <p className="text-sm text-green-600">✓ Two proteins selected</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Special Requests / Allergies</Label>
                      <Textarea
                        value={guest.specialRequests}
                        onChange={(e) => updateGuest(guest.id, 'specialRequests', e.target.value)}
                        placeholder="Any dietary restrictions, allergies, or special requests..."
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Gratuity */}
          <div className="space-y-2">
            <Label htmlFor="gratuity">Gratuity (%)</Label>
            <Input
              id="gratuity"
              type="number"
              min="0"
              max="100"
              value={gratuity}
              onChange={(e) => setGratuity(Number(e.target.value) || 0)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quote Summary */}
      {guests.length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Event Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Adult Guests ({totals.adultCount})</span>
                <span>${totals.adultTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Children Guests ({totals.childCount})</span>
                <span>${totals.childTotal.toLocaleString()}</span>
              </div>
              {totals.guestUpcharges > 0 && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Protein upcharges</span>
                  <span>+${totals.guestUpcharges.toLocaleString()}</span>
                </div>
              )}
              <div className="border-t pt-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${totals.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Gratuity ({gratuity}%)</span>
                  <span>${totals.gratuityAmount.toLocaleString()}</span>
                </div>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>${totals.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <Button className="w-full" size="lg">
              Generate Formal Quote
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default EventInfo