import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'

export interface EventGuest {
  id?: string
  name: string
  type: 'adult' | 'child'
  proteins: string[]
  specialRequests: string
}

export interface EventData {
  id?: string
  clientName: string
  eventDate: string
  address: string
  eventTime: string
  numberOfGuests: number
  status: 'booked' | 'cancelled' | 'completed' | 'confirmed' | 'pending'
  guests: EventGuest[]
  eventTypeId?: string
  guestCount?: number
  specialRequests?: string
}

export const useEvents = () => {
  const [loading, setLoading] = useState(false)
  const [events, setEvents] = useState<EventData[]>([])
  const { user } = useAuth()

  // Load user events on hook initialization
  useEffect(() => {
    if (user) {
      loadUserEvents()
    }
  }, [user])

  const saveEvent = async (eventData: EventData) => {
    if (!user) {
      toast.error('You must be logged in to save events')
      return null
    }

    setLoading(true)
    try {
      // Get user's organization
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

      const { data: eventResult, error: eventError } = await supabase
        .from('events')
        .upsert({
          id: eventData.id,
          user_id: user.id, // Use authenticated user ID
          organization_id: profile?.organization_id,
          client_name: eventData.clientName,
          event_date: eventData.eventDate || null,
          address: eventData.address,
          event_time: eventData.eventTime || null,
          number_of_guests: eventData.numberOfGuests,
          gratuity: 20,
          status: eventData.status,
          event_type_id: eventData.eventTypeId || null,
          special_requests: eventData.specialRequests || null
        })
        .select()
        .single()

      if (eventError) throw eventError

      // Delete existing guests for this event
      if (eventData.id) {
        await supabase
          .from('event_guests')
          .delete()
          .eq('event_id', eventData.id)
      }

      // Insert new guests
      if (eventData.guests.length > 0) {
        const { error: guestsError } = await supabase
          .from('event_guests')
          .insert(
            eventData.guests.map(guest => ({
              event_id: eventResult.id,
              name: guest.name,
              type: guest.type,
              proteins: guest.proteins,
              special_requests: guest.specialRequests
            }))
          )

        if (guestsError) throw guestsError
      }

      toast.success('Event saved successfully')
      return eventResult.id
    } catch (error) {
      console.error('Error saving event:', error)
      toast.error('Failed to save event')
      return null
    } finally {
      setLoading(false)
    }
  }

  const loadEvent = async (eventId: string): Promise<EventData | null> => {
    if (!user) {
      toast.error('You must be logged in to load events')
      return null
    }

    setLoading(true)
    try {
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select(`
          *,
          event_types(name)
        `)
        .eq('id', eventId)
        .eq('user_id', user.id)
        .single()

      if (eventError) throw eventError

      const { data: guestsData, error: guestsError } = await supabase
        .from('event_guests')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at')

      if (guestsError) throw guestsError

      const status = eventData.status as string
      const validStatus = ['booked', 'cancelled', 'completed'].includes(status)
        ? status as 'booked' | 'cancelled' | 'completed'
        : 'booked'

      return {
        id: eventData.id,
        clientName: eventData.client_name,
        eventDate: eventData.event_date || '',
        address: eventData.address || '',
        eventTime: eventData.event_time || '',
        numberOfGuests: eventData.number_of_guests,
        status: validStatus,
        guests: guestsData.map(guest => ({
          id: guest.id,
          name: guest.name || '',
          type: guest.type as 'adult' | 'child',
          proteins: guest.proteins || [],
          specialRequests: guest.special_requests || ''
        }))
      }
    } catch (error) {
      console.error('Error loading event:', error)
      toast.error('Failed to load event')
      return null
    } finally {
      setLoading(false)
    }
  }

  const loadUserEvents = async () => {
    if (!user) {
      setEvents([])
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          id, client_name, event_date, status, number_of_guests, event_time, created_at,
          event_types(name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      const eventsData = data.map(event => {
        const status = event.status as string
        const validStatus = ['booked', 'cancelled', 'completed', 'confirmed', 'pending'].includes(status) 
          ? status as EventData['status']
          : 'booked'
        
        return {
          id: event.id,
          clientName: event.client_name,
          eventDate: event.event_date || '',
          address: '',
          eventTime: event.event_time || '',
          numberOfGuests: event.number_of_guests,
          guestCount: event.number_of_guests,
          title: event.client_name,
          status: validStatus,
          guests: [],
          createdAt: event.created_at
        }
      })

      setEvents(eventsData)
    } catch (error) {
      console.error('Error loading events:', error)
      toast.error('Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  return {
    saveEvent,
    loadEvent,
    loadUserEvents,
    events,
    loading
  }
}