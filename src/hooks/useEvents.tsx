import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
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
  status: 'booked' | 'cancelled' | 'completed'
  guests: EventGuest[]
}

export const useEvents = () => {
  const [loading, setLoading] = useState(false)
  const [events, setEvents] = useState<EventData[]>([])

  const saveEvent = async (eventData: EventData) => {
    setLoading(true)
    try {
      const { data: eventResult, error: eventError } = await supabase
        .from('events')
        .upsert({
          id: eventData.id,
          user_id: 'default-user', // Placeholder since auth is disabled
          client_name: eventData.clientName,
          event_date: eventData.eventDate || null,
          address: eventData.address,
          event_time: eventData.eventTime || null,
          number_of_guests: eventData.numberOfGuests,
          gratuity: 20,
          status: eventData.status
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
    setLoading(true)
    try {
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
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
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('events')
        .select('id, client_name, event_date, status, number_of_guests')
        .order('created_at', { ascending: false })

      if (error) throw error

      setEvents(data.map(event => {
        const status = event.status as string
        const validStatus = ['booked', 'cancelled', 'completed'].includes(status) 
          ? status as 'booked' | 'cancelled' | 'completed'
          : 'booked'
        
        return {
          id: event.id,
          clientName: event.client_name,
          eventDate: event.event_date || '',
          address: '',
          eventTime: '',
          numberOfGuests: event.number_of_guests,
          status: validStatus,
          guests: []
        }
      }))
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