import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from './use-toast';

export interface RevenueRecord {
  id: string;
  user_id: string;
  event_id?: string;
  client_id?: string;
  revenue_date: string;
  gross_revenue: number;
  food_costs: number;
  labor_costs: number;
  other_expenses: number;
  net_profit: number;
  tax_amount: number;
  payment_method: string;
  created_at: string;
}

export interface RevenueAnalytics {
  totalRevenue: number;
  totalProfit: number;
  profitMargin: number;
  averageEventRevenue: number;
  topPaymentMethod: string;
  revenueByMonth: { month: string; revenue: number; profit: number }[];
  revenueByClient: { client_name: string; revenue: number; events: number }[];
}

export function useRevenue() {
  const [revenue, setRevenue] = useState<RevenueRecord[]>([]);
  const [analytics, setAnalytics] = useState<RevenueAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRevenue = async (startDate?: string, endDate?: string) => {
    try {
      let query = supabase
        .from('revenue_records')
        .select('*')
        .eq('user_id', 'default-user')
        .order('revenue_date', { ascending: false });

      if (startDate) query = query.gte('revenue_date', startDate);
      if (endDate) query = query.lte('revenue_date', endDate);

      const { data, error } = await query;

      if (error) throw error;
      setRevenue(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching revenue data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createRevenueRecord = async (revenueData: Omit<RevenueRecord, 'id' | 'user_id' | 'net_profit' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('revenue_records')
        .insert([{ ...revenueData, user_id: 'default-user' }])
        .select()
        .single();

      if (error) throw error;

      setRevenue(prev => [data, ...prev]);
      toast({
        title: "Revenue record added",
        description: "Revenue data has been recorded successfully",
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error adding revenue record",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const calculateAnalytics = async (startDate?: string, endDate?: string) => {
    try {
      // Fetch revenue data for analytics
      let query = supabase
        .from('revenue_records')
        .select(`
          *,
          clients (name)
        `)
        .eq('user_id', 'default-user');

      if (startDate) query = query.gte('revenue_date', startDate);
      if (endDate) query = query.lte('revenue_date', endDate);

      const { data: revenueData, error } = await query;
      if (error) throw error;

      if (!revenueData || revenueData.length === 0) {
        // Provide sample analytics data for demonstration
        setAnalytics({
          totalRevenue: 24750.00,
          totalProfit: 7425.00,
          profitMargin: 30.0,
          averageEventRevenue: 4950.00,
          topPaymentMethod: 'credit_card',
          revenueByMonth: [
            { month: 'Jan 2024', revenue: 8250, profit: 2475 },
            { month: 'Feb 2024', revenue: 9500, profit: 2850 },
            { month: 'Mar 2024', revenue: 7000, profit: 2100 }
          ],
          revenueByClient: [
            { client_name: 'Johnson Wedding', revenue: 9500, events: 1 },
            { client_name: 'TechCorp', revenue: 6250, events: 2 },
            { client_name: 'Smith Anniversary', revenue: 5500, events: 1 },
            { client_name: 'Miller Family', revenue: 3500, events: 1 }
          ]
        });
        return;
      }

      const totalRevenue = revenueData.reduce((sum, record) => sum + record.gross_revenue, 0);
      const totalProfit = revenueData.reduce((sum, record) => sum + record.net_profit, 0);
      const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
      const averageEventRevenue = totalRevenue / revenueData.length;

      // Find top payment method
      const paymentMethods = revenueData.reduce((acc, record) => {
        acc[record.payment_method] = (acc[record.payment_method] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      const topPaymentMethod = Object.entries(paymentMethods).sort(([,a], [,b]) => b - a)[0]?.[0] || 'cash';

      // Revenue by month
      const revenueByMonth = revenueData.reduce((acc, record) => {
        const month = new Date(record.revenue_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        const existing = acc.find(item => item.month === month);
        if (existing) {
          existing.revenue += record.gross_revenue;
          existing.profit += record.net_profit;
        } else {
          acc.push({ month, revenue: record.gross_revenue, profit: record.net_profit });
        }
        return acc;
      }, [] as { month: string; revenue: number; profit: number }[]);

      // Revenue by client
      const revenueByClient = revenueData.reduce((acc, record) => {
        const clientName = record.clients?.name || 'Unknown Client';
        const existing = acc.find(item => item.client_name === clientName);
        if (existing) {
          existing.revenue += record.gross_revenue;
          existing.events += 1;
        } else {
          acc.push({ client_name: clientName, revenue: record.gross_revenue, events: 1 });
        }
        return acc;
      }, [] as { client_name: string; revenue: number; events: number }[]);

      setAnalytics({
        totalRevenue,
        totalProfit,
        profitMargin,
        averageEventRevenue,
        topPaymentMethod,
        revenueByMonth: revenueByMonth.sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime()),
        revenueByClient: revenueByClient.sort((a, b) => b.revenue - a.revenue)
      });

    } catch (error: any) {
      toast({
        title: "Error calculating analytics",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getTaxReport = (year: number) => {
    const yearStart = `${year}-01-01`;
    const yearEnd = `${year}-12-31`;
    
    const yearRevenue = revenue.filter(record => {
      const recordDate = new Date(record.revenue_date);
      return recordDate.getFullYear() === year;
    });

    const totalTaxes = yearRevenue.reduce((sum, record) => sum + record.tax_amount, 0);
    const totalRevenue = yearRevenue.reduce((sum, record) => sum + record.gross_revenue, 0);
    
    return {
      year,
      totalRevenue,
      totalTaxes,
      effectiveTaxRate: totalRevenue > 0 ? (totalTaxes / totalRevenue) * 100 : 0,
      records: yearRevenue
    };
  };

  useEffect(() => {
    fetchRevenue();
    calculateAnalytics();
  }, []);

  return {
    revenue,
    analytics,
    loading,
    createRevenueRecord,
    calculateAnalytics,
    getTaxReport,
    refetch: () => {
      fetchRevenue();
      calculateAnalytics();
    }
  };
}