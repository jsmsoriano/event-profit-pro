import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from './use-toast';

export interface EventProfit {
  event_id: string;
  title: string;
  event_date: string;
  guest_count: number;
  status: string;
  revenue_menu: number;
  food_cost: number;
  labor_cost: number;
  gross_profit: number;
  profit_margin_percent?: number;
}

export interface PopularDish {
  dish_id: string;
  name: string;
  times_selected: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  events_count: number;
}

export function useAnalytics() {
  const [eventProfits, setEventProfits] = useState<EventProfit[]>([]);
  const [popularDishes, setPopularDishes] = useState<PopularDish[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEventProfits = async (eventId?: string) => {
    try {
      let query = supabase
        .from('v_event_profit')
        .select('*')
        .order('event_date', { ascending: false });

      if (eventId) {
        query = query.eq('event_id', eventId);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      if (eventId) {
        return data?.[0] || null;
      } else {
        setEventProfits(data || []);
        return data || [];
      }
    } catch (error: any) {
      toast({
        title: "Error fetching profit data",
        description: error.message,
        variant: "destructive",
      });
      return eventId ? null : [];
    }
  };

  const fetchPopularDishes = async (days: number = 180) => {
    try {
      const { data, error } = await supabase
        .from('v_popular_dishes')
        .select('*')
        .limit(10);

      if (error) throw error;
      setPopularDishes(data || []);
      return data || [];
    } catch (error: any) {
      toast({
        title: "Error fetching popular dishes",
        description: error.message,
        variant: "destructive",
      });
      return [];
    }
  };

  const fetchMonthlyRevenue = async () => {    
    try {
      const { data, error } = await supabase
        .from('events')
        .select('event_date, total_revenue, status')
        .in('status', ['confirmed', 'in_progress', 'completed'])
        .not('event_date', 'is', null)
        .not('total_revenue', 'is', null)
        .order('event_date');

      if (error) throw error;

      // Group by month
      const monthlyData = (data || []).reduce((acc: any, event) => {
        const date = new Date(event.event_date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!acc[monthKey]) {
          acc[monthKey] = {
            month: monthKey,
            revenue: 0,
            events_count: 0
          };
        }
        
        acc[monthKey].revenue += event.total_revenue || 0;
        acc[monthKey].events_count += 1;
        
        return acc;
      }, {});

      const result = Object.values(monthlyData) as MonthlyRevenue[];
      setMonthlyRevenue(result);
      return result;
    } catch (error: any) {
      toast({
        title: "Error fetching monthly revenue",
        description: error.message,
        variant: "destructive",
      });
      return [];
    }
  };

  const calculateTotalStats = () => {
    const totalRevenue = monthlyRevenue.reduce((sum, month) => sum + month.revenue, 0);
    const totalEvents = monthlyRevenue.reduce((sum, month) => sum + month.events_count, 0);
    const avgProfitMargin = eventProfits.length > 0 
      ? eventProfits.reduce((sum, event) => sum + (event.profit_margin_percent || 0), 0) / eventProfits.length
      : 0;

    return {
      totalRevenue,
      totalEvents,
      avgProfitMargin,
      totalProfit: eventProfits.reduce((sum, event) => sum + event.gross_profit, 0)
    };
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      await Promise.all([
        fetchEventProfits(),
        fetchPopularDishes(),
        fetchMonthlyRevenue()
      ]);
      setLoading(false);
    };

    fetchAllData();
  }, []);

  return {
    eventProfits,
    popularDishes,
    monthlyRevenue,
    loading,
    fetchEventProfits,
    fetchPopularDishes,
    fetchMonthlyRevenue,
    calculateTotalStats,
    refetch: async () => {
      setLoading(true);
      await Promise.all([
        fetchEventProfits(),
        fetchPopularDishes(),
        fetchMonthlyRevenue()
      ]);
      setLoading(false);
    }
  };
}