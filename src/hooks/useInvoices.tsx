import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from './use-toast';

export interface Invoice {
  id: string;
  invoice_number: string;
  event_id?: string;
  client_id: string;
  billing_period_start: string;
  billing_period_end: string;
  total_collections: number;
  fee_percentage: number;
  subtotal?: number;
  tax?: number;
  invoice_amount: number;
  deposit_amount?: number;
  balance_due?: number;
  status: string;
  issued_at?: string;
  sent_date?: string;
  due_date?: string;
  paid_date?: string;
  payment_terms?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  event?: {
    id: string;
    title: string;
    event_date: string;
    client_name: string;
  };
}

export interface InvoicePayment {
  id: string;
  invoice_id: string;
  amount: number;
  payment_method: string;
  payment_date: string;
  reference_number?: string;
  notes?: string;
  created_at: string;
}

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchInvoices = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          event:events(id, title, event_date, client_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching invoices",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createInvoice = async (invoiceData: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .insert([invoiceData])
        .select(`
          *,
          event:events(id, title, event_date, client_name)
        `)
        .single();

      if (error) throw error;

      setInvoices(prev => [data, ...prev]);
      toast({
        title: "Invoice created",
        description: `Invoice ${data.invoice_number} has been created`,
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error creating invoice",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const updateInvoice = async (id: string, updates: Partial<Invoice>) => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          event:events(id, title, event_date, client_name)
        `)
        .single();

      if (error) throw error;

      setInvoices(prev => prev.map(invoice => 
        invoice.id === id ? data : invoice
      ));
      toast({
        title: "Invoice updated",
        description: "Invoice has been updated successfully",
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error updating invoice",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const addPayment = async (paymentData: Omit<InvoicePayment, 'id' | 'created_at'>) => {
    try {
      const { data: payment, error: paymentError } = await supabase
        .from('invoice_payments')
        .insert([paymentData])
        .select()
        .single();

      if (paymentError) throw paymentError;

      // Update invoice balance
      const invoice = invoices.find(inv => inv.id === paymentData.invoice_id);
      if (invoice) {
        const newBalance = (invoice.balance_due || invoice.invoice_amount) - paymentData.amount;
        const newStatus = newBalance <= 0 ? 'paid' : invoice.status;
        
        await updateInvoice(invoice.id, {
          balance_due: Math.max(0, newBalance),
          status: newStatus,
          paid_date: newBalance <= 0 ? paymentData.payment_date : undefined
        });
      }

      toast({
        title: "Payment recorded",
        description: `Payment of $${paymentData.amount} has been recorded`,
      });
      return payment;
    } catch (error: any) {
      toast({
        title: "Error recording payment",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const getInvoicePayments = async (invoiceId: string) => {
    try {
      const { data, error } = await supabase
        .from('invoice_payments')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      toast({
        title: "Error fetching payments",
        description: error.message,
        variant: "destructive",
      });
      return [];
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [user]);

  return {
    invoices,
    loading,
    createInvoice,
    updateInvoice,
    addPayment,
    getInvoicePayments,
    refetch: fetchInvoices
  };
}