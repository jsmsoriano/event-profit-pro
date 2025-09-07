export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_settings: {
        Row: {
          created_at: string
          expense_types: string[] | null
          food_cost_types: string[] | null
          id: string
          labor_revenue_percentage: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expense_types?: string[] | null
          food_cost_types?: string[] | null
          id?: string
          labor_revenue_percentage?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expense_types?: string[] | null
          food_cost_types?: string[] | null
          id?: string
          labor_revenue_percentage?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          created_at: string
          endpoint: string
          id: string
          organization_id: string | null
          payload_hash: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          endpoint: string
          id?: string
          organization_id?: string | null
          payload_hash?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          endpoint?: string
          id?: string
          organization_id?: string | null
          payload_hash?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_performance: {
        Row: {
          approved_claims: number
          average_days_to_payment: number | null
          client_id: string
          collection_rate: number | null
          created_at: string
          denial_rate: number | null
          denied_claims: number
          id: string
          month_year: string
          pending_claims: number
          total_claims: number
          total_revenue: number
          updated_at: string
        }
        Insert: {
          approved_claims?: number
          average_days_to_payment?: number | null
          client_id: string
          collection_rate?: number | null
          created_at?: string
          denial_rate?: number | null
          denied_claims?: number
          id?: string
          month_year: string
          pending_claims?: number
          total_claims?: number
          total_revenue?: number
          updated_at?: string
        }
        Update: {
          approved_claims?: number
          average_days_to_payment?: number | null
          client_id?: string
          collection_rate?: number | null
          created_at?: string
          denial_rate?: number | null
          denied_claims?: number
          id?: string
          month_year?: string
          pending_claims?: number
          total_claims?: number
          total_revenue?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_performance_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_profiles: {
        Row: {
          created_at: string
          food_percent: number
          id: string
          is_default: boolean | null
          labor_percent: number
          name: string
          profit_percent: number
          taxes_percent: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          food_percent?: number
          id?: string
          is_default?: boolean | null
          labor_percent?: number
          name: string
          profit_percent?: number
          taxes_percent?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          food_percent?: number
          id?: string
          is_default?: boolean | null
          labor_percent?: number
          name?: string
          profit_percent?: number
          taxes_percent?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      claims: {
        Row: {
          aging_bucket: string | null
          amount: number
          balance_due: number | null
          claim_number: string
          client_id: string
          created_at: string
          days_outstanding: number | null
          denial_reason: string | null
          follow_up_required: boolean | null
          id: string
          insurance_company: string
          notes: string | null
          patient_name: string
          payment_amount: number | null
          payment_date: string | null
          service_date: string
          status: string
          submission_date: string
          updated_at: string
        }
        Insert: {
          aging_bucket?: string | null
          amount: number
          balance_due?: number | null
          claim_number: string
          client_id: string
          created_at?: string
          days_outstanding?: number | null
          denial_reason?: string | null
          follow_up_required?: boolean | null
          id?: string
          insurance_company: string
          notes?: string | null
          patient_name: string
          payment_amount?: number | null
          payment_date?: string | null
          service_date: string
          status?: string
          submission_date: string
          updated_at?: string
        }
        Update: {
          aging_bucket?: string | null
          amount?: number
          balance_due?: number | null
          claim_number?: string
          client_id?: string
          created_at?: string
          days_outstanding?: number | null
          denial_reason?: string | null
          follow_up_required?: boolean | null
          id?: string
          insurance_company?: string
          notes?: string | null
          patient_name?: string
          payment_amount?: number | null
          payment_date?: string | null
          service_date?: string
          status?: string
          submission_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "claims_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_assignments: {
        Row: {
          client_id: string
          created_at: string
          id: string
          role: string | null
          team_member_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          role?: string | null
          team_member_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          role?: string | null
          team_member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_assignments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_assignments_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      client_payments: {
        Row: {
          amount: number
          client_id: string | null
          created_at: string
          event_id: string | null
          id: string
          notes: string | null
          payment_date: string
          payment_method: string | null
          payment_type: string | null
          reference_number: string | null
        }
        Insert: {
          amount: number
          client_id?: string | null
          created_at?: string
          event_id?: string | null
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string | null
          payment_type?: string | null
          reference_number?: string | null
        }
        Update: {
          amount?: number
          client_id?: string | null
          created_at?: string
          event_id?: string | null
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string | null
          payment_type?: string | null
          reference_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_payments_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_payments_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "v_event_profit"
            referencedColumns: ["event_id"]
          },
        ]
      }
      client_preferences: {
        Row: {
          client_id: string | null
          created_at: string
          dietary_restrictions: string[] | null
          favorite_menu_items: string[] | null
          id: string
          loyalty_points: number | null
          preferred_event_types: string[] | null
          referral_count: number | null
          special_requests: string | null
          total_events: number | null
          total_spent: number | null
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          dietary_restrictions?: string[] | null
          favorite_menu_items?: string[] | null
          id?: string
          loyalty_points?: number | null
          preferred_event_types?: string[] | null
          referral_count?: number | null
          special_requests?: string | null
          total_events?: number | null
          total_spent?: number | null
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          dietary_restrictions?: string[] | null
          favorite_menu_items?: string[] | null
          id?: string
          loyalty_points?: number | null
          preferred_event_types?: string[] | null
          referral_count?: number | null
          special_requests?: string | null
          total_events?: number | null
          total_spent?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_preferences_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          billing_cycle_start_date: string | null
          city: string | null
          contract_percentage: number | null
          contract_start_date: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          monthly_revenue: number | null
          name: string
          notes: string | null
          office_contact_name: string | null
          organization_id: string | null
          phone: string | null
          practice_type: string | null
          state: string | null
          status: string
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          billing_cycle_start_date?: string | null
          city?: string | null
          contract_percentage?: number | null
          contract_start_date?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          monthly_revenue?: number | null
          name: string
          notes?: string | null
          office_contact_name?: string | null
          organization_id?: string | null
          phone?: string | null
          practice_type?: string | null
          state?: string | null
          status?: string
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          billing_cycle_start_date?: string | null
          city?: string | null
          contract_percentage?: number | null
          contract_start_date?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          monthly_revenue?: number | null
          name?: string
          notes?: string | null
          office_contact_name?: string | null
          organization_id?: string | null
          phone?: string | null
          practice_type?: string | null
          state?: string | null
          status?: string
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      credentialing_applications: {
        Row: {
          application_date: string
          application_type: string
          approval_date: string | null
          created_at: string
          doctor_id: string
          estimated_completion_days: number | null
          expiry_date: string | null
          id: string
          insurance_company: string
          notes: string | null
          priority: string
          status: string
          submission_date: string | null
          updated_at: string
        }
        Insert: {
          application_date?: string
          application_type?: string
          approval_date?: string | null
          created_at?: string
          doctor_id: string
          estimated_completion_days?: number | null
          expiry_date?: string | null
          id?: string
          insurance_company: string
          notes?: string | null
          priority?: string
          status?: string
          submission_date?: string | null
          updated_at?: string
        }
        Update: {
          application_date?: string
          application_type?: string
          approval_date?: string | null
          created_at?: string
          doctor_id?: string
          estimated_completion_days?: number | null
          expiry_date?: string | null
          id?: string
          insurance_company?: string
          notes?: string | null
          priority?: string
          status?: string
          submission_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "credentialing_applications_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "credentialing_doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      credentialing_doctors: {
        Row: {
          address: string
          board_certification: string | null
          board_expiry: string | null
          city: string
          created_at: string
          dea_expiry: string | null
          dea_number: string | null
          email: string
          first_name: string
          id: string
          last_name: string
          license_expiry: string
          license_number: string
          license_state: string
          npi_number: string
          phone: string
          specialty: string
          state: string
          updated_at: string
          zip_code: string
        }
        Insert: {
          address: string
          board_certification?: string | null
          board_expiry?: string | null
          city: string
          created_at?: string
          dea_expiry?: string | null
          dea_number?: string | null
          email: string
          first_name: string
          id?: string
          last_name: string
          license_expiry: string
          license_number: string
          license_state: string
          npi_number: string
          phone: string
          specialty: string
          state: string
          updated_at?: string
          zip_code: string
        }
        Update: {
          address?: string
          board_certification?: string | null
          board_expiry?: string | null
          city?: string
          created_at?: string
          dea_expiry?: string | null
          dea_number?: string | null
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          license_expiry?: string
          license_number?: string
          license_state?: string
          npi_number?: string
          phone?: string
          specialty?: string
          state?: string
          updated_at?: string
          zip_code?: string
        }
        Relationships: []
      }
      credentialing_documents: {
        Row: {
          application_id: string
          created_at: string
          document_name: string
          document_type: string
          expiry_date: string | null
          id: string
          notes: string | null
          received: boolean
          received_date: string | null
          required: boolean
          updated_at: string
        }
        Insert: {
          application_id: string
          created_at?: string
          document_name: string
          document_type: string
          expiry_date?: string | null
          id?: string
          notes?: string | null
          received?: boolean
          received_date?: string | null
          required?: boolean
          updated_at?: string
        }
        Update: {
          application_id?: string
          created_at?: string
          document_name?: string
          document_type?: string
          expiry_date?: string | null
          id?: string
          notes?: string | null
          received?: boolean
          received_date?: string | null
          required?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "credentialing_documents_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "credentialing_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      credentialing_timeline: {
        Row: {
          application_id: string
          created_at: string
          created_by: string
          id: string
          notes: string | null
          status: string
        }
        Insert: {
          application_id: string
          created_at?: string
          created_by?: string
          id?: string
          notes?: string | null
          status: string
        }
        Update: {
          application_id?: string
          created_at?: string
          created_by?: string
          id?: string
          notes?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "credentialing_timeline_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "credentialing_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      data_sources: {
        Row: {
          configuration: Json
          created_at: string
          created_by: string
          id: string
          is_active: boolean
          name: string
          source_type: string
          updated_at: string
        }
        Insert: {
          configuration?: Json
          created_at?: string
          created_by?: string
          id?: string
          is_active?: boolean
          name: string
          source_type: string
          updated_at?: string
        }
        Update: {
          configuration?: Json
          created_at?: string
          created_by?: string
          id?: string
          is_active?: boolean
          name?: string
          source_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      dishes: {
        Row: {
          base_price_per_guest: number | null
          category: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          is_gluten_free: boolean | null
          is_vegan: boolean | null
          is_vegetarian: boolean | null
          name: string
          organization_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          base_price_per_guest?: number | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_gluten_free?: boolean | null
          is_vegan?: boolean | null
          is_vegetarian?: boolean | null
          name: string
          organization_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          base_price_per_guest?: number | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_gluten_free?: boolean | null
          is_vegan?: boolean | null
          is_vegetarian?: boolean | null
          name?: string
          organization_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dishes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      event_guests: {
        Row: {
          created_at: string
          event_id: string
          id: string
          name: string | null
          proteins: string[] | null
          special_requests: string | null
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          name?: string | null
          proteins?: string[] | null
          special_requests?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          name?: string | null
          proteins?: string[] | null
          special_requests?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_guests_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_guests_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "v_event_profit"
            referencedColumns: ["event_id"]
          },
        ]
      }
      event_menu_items: {
        Row: {
          created_at: string
          dish_id: string | null
          event_id: string | null
          id: string
          package_id: string | null
          per_guest_overrides: Json | null
        }
        Insert: {
          created_at?: string
          dish_id?: string | null
          event_id?: string | null
          id?: string
          package_id?: string | null
          per_guest_overrides?: Json | null
        }
        Update: {
          created_at?: string
          dish_id?: string | null
          event_id?: string | null
          id?: string
          package_id?: string | null
          per_guest_overrides?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "event_menu_items_dish_id_fkey"
            columns: ["dish_id"]
            isOneToOne: false
            referencedRelation: "dishes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_menu_items_dish_id_fkey"
            columns: ["dish_id"]
            isOneToOne: false
            referencedRelation: "v_popular_dishes"
            referencedColumns: ["dish_id"]
          },
          {
            foreignKeyName: "event_menu_items_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_menu_items_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "v_event_profit"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "event_menu_items_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      event_milestones: {
        Row: {
          assigned_staff: string | null
          completed_at: string | null
          created_at: string
          event_id: string | null
          id: string
          milestone_name: string
          milestone_type: string | null
          notes: string | null
          scheduled_time: string
        }
        Insert: {
          assigned_staff?: string | null
          completed_at?: string | null
          created_at?: string
          event_id?: string | null
          id?: string
          milestone_name: string
          milestone_type?: string | null
          notes?: string | null
          scheduled_time: string
        }
        Update: {
          assigned_staff?: string | null
          completed_at?: string | null
          created_at?: string
          event_id?: string | null
          id?: string
          milestone_name?: string
          milestone_type?: string | null
          notes?: string | null
          scheduled_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_milestones_assigned_staff_fkey"
            columns: ["assigned_staff"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_milestones_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_milestones_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "v_event_profit"
            referencedColumns: ["event_id"]
          },
        ]
      }
      event_staff: {
        Row: {
          created_at: string
          end_time: string | null
          event_id: string | null
          flat_fee: number | null
          id: string
          notes: string | null
          staff_id: string | null
          start_time: string | null
        }
        Insert: {
          created_at?: string
          end_time?: string | null
          event_id?: string | null
          flat_fee?: number | null
          id?: string
          notes?: string | null
          staff_id?: string | null
          start_time?: string | null
        }
        Update: {
          created_at?: string
          end_time?: string | null
          event_id?: string | null
          flat_fee?: number | null
          id?: string
          notes?: string | null
          staff_id?: string | null
          start_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_staff_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_staff_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "v_event_profit"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "event_staff_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      event_tasks: {
        Row: {
          assigned_staff: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          due_time: string | null
          estimated_duration: number | null
          event_id: string | null
          id: string
          priority: string | null
          task_category: string | null
          task_name: string
          updated_at: string
        }
        Insert: {
          assigned_staff?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_time?: string | null
          estimated_duration?: number | null
          event_id?: string | null
          id?: string
          priority?: string | null
          task_category?: string | null
          task_name: string
          updated_at?: string
        }
        Update: {
          assigned_staff?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_time?: string | null
          estimated_duration?: number | null
          event_id?: string | null
          id?: string
          priority?: string | null
          task_category?: string | null
          task_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_tasks_assigned_staff_fkey"
            columns: ["assigned_staff"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_tasks_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_tasks_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "v_event_profit"
            referencedColumns: ["event_id"]
          },
        ]
      }
      events: {
        Row: {
          address: string | null
          client_name: string
          created_at: string
          deposit_amount: number | null
          deposit_due_on: string | null
          deposit_paid: boolean | null
          event_date: string | null
          event_time: string | null
          final_count_due_on: string | null
          food_cost: number | null
          gratuity: number | null
          id: string
          labor_cost: number | null
          number_of_guests: number | null
          organization_id: string | null
          special_requests: string | null
          status: string
          title: string | null
          total_revenue: number | null
          updated_at: string
          user_id: string
          venue_id: string | null
        }
        Insert: {
          address?: string | null
          client_name: string
          created_at?: string
          deposit_amount?: number | null
          deposit_due_on?: string | null
          deposit_paid?: boolean | null
          event_date?: string | null
          event_time?: string | null
          final_count_due_on?: string | null
          food_cost?: number | null
          gratuity?: number | null
          id?: string
          labor_cost?: number | null
          number_of_guests?: number | null
          organization_id?: string | null
          special_requests?: string | null
          status?: string
          title?: string | null
          total_revenue?: number | null
          updated_at?: string
          user_id: string
          venue_id?: string | null
        }
        Update: {
          address?: string | null
          client_name?: string
          created_at?: string
          deposit_amount?: number | null
          deposit_due_on?: string | null
          deposit_paid?: boolean | null
          event_date?: string | null
          event_time?: string | null
          final_count_due_on?: string | null
          food_cost?: number | null
          gratuity?: number | null
          id?: string
          labor_cost?: number | null
          number_of_guests?: number | null
          organization_id?: string | null
          special_requests?: string | null
          status?: string
          title?: string | null
          total_revenue?: number | null
          updated_at?: string
          user_id?: string
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      file_vault: {
        Row: {
          client_id: string
          created_at: string
          description: string | null
          file_size: number | null
          file_type: string
          filename: string
          folder_path: string | null
          id: string
          is_confidential: boolean | null
          original_filename: string
          updated_at: string
          uploaded_by: string
        }
        Insert: {
          client_id: string
          created_at?: string
          description?: string | null
          file_size?: number | null
          file_type: string
          filename: string
          folder_path?: string | null
          id?: string
          is_confidential?: boolean | null
          original_filename: string
          updated_at?: string
          uploaded_by: string
        }
        Update: {
          client_id?: string
          created_at?: string
          description?: string | null
          file_size?: number | null
          file_type?: string
          filename?: string
          folder_path?: string | null
          id?: string
          is_confidential?: boolean | null
          original_filename?: string
          updated_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "file_vault_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          category: string | null
          cost_per_unit: number | null
          created_at: string
          current_quantity: number | null
          expiry_date: string | null
          id: string
          minimum_stock: number | null
          name: string
          storage_location: string | null
          supplier_id: string | null
          unit_type: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          category?: string | null
          cost_per_unit?: number | null
          created_at?: string
          current_quantity?: number | null
          expiry_date?: string | null
          id?: string
          minimum_stock?: number | null
          name: string
          storage_location?: string | null
          supplier_id?: string | null
          unit_type?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          category?: string | null
          cost_per_unit?: number | null
          created_at?: string
          current_quantity?: number | null
          expiry_date?: string | null
          id?: string
          minimum_stock?: number | null
          name?: string
          storage_location?: string | null
          supplier_id?: string | null
          unit_type?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_inventory_supplier"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          invoice_id: string
          notes: string | null
          payment_date: string
          payment_method: string | null
          reference_number: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          invoice_id: string
          notes?: string | null
          payment_date?: string
          payment_method?: string | null
          reference_number?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          invoice_id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string | null
          reference_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          billing_period_end: string
          billing_period_start: string
          client_id: string
          created_at: string
          due_date: string | null
          event_id: string | null
          fee_percentage: number
          id: string
          invoice_amount: number
          invoice_number: string
          issued_at: string | null
          notes: string | null
          organization_id: string | null
          paid_date: string | null
          sent_date: string | null
          status: string
          subtotal: number | null
          tax: number | null
          total_collections: number
          updated_at: string
        }
        Insert: {
          billing_period_end: string
          billing_period_start: string
          client_id: string
          created_at?: string
          due_date?: string | null
          event_id?: string | null
          fee_percentage: number
          id?: string
          invoice_amount: number
          invoice_number: string
          issued_at?: string | null
          notes?: string | null
          organization_id?: string | null
          paid_date?: string | null
          sent_date?: string | null
          status?: string
          subtotal?: number | null
          tax?: number | null
          total_collections?: number
          updated_at?: string
        }
        Update: {
          billing_period_end?: string
          billing_period_start?: string
          client_id?: string
          created_at?: string
          due_date?: string | null
          event_id?: string | null
          fee_percentage?: number
          id?: string
          invoice_amount?: number
          invoice_number?: string
          issued_at?: string | null
          notes?: string | null
          organization_id?: string | null
          paid_date?: string | null
          sent_date?: string | null
          status?: string
          subtotal?: number | null
          tax?: number | null
          total_collections?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "v_event_profit"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "invoices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      labor_roles: {
        Row: {
          created_at: string
          id: string
          labor_percentage: number
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          labor_percentage?: number
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          labor_percentage?: number
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          base_price: number | null
          category: string | null
          cooking_time: number | null
          cost_per_serving: number | null
          created_at: string
          description: string | null
          dietary_info: string[] | null
          id: string
          is_active: boolean | null
          name: string
          popularity_score: number | null
          prep_time: number | null
          serves: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          base_price?: number | null
          category?: string | null
          cooking_time?: number | null
          cost_per_serving?: number | null
          created_at?: string
          description?: string | null
          dietary_info?: string[] | null
          id?: string
          is_active?: boolean | null
          name: string
          popularity_score?: number | null
          prep_time?: number | null
          serves?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          base_price?: number | null
          category?: string | null
          cooking_time?: number | null
          cost_per_serving?: number | null
          created_at?: string
          description?: string | null
          dietary_info?: string[] | null
          id?: string
          is_active?: boolean | null
          name?: string
          popularity_score?: number | null
          prep_time?: number | null
          serves?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean
          recipient_id: string
          sender_id: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          recipient_id: string
          sender_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          recipient_id?: string
          sender_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      month_end_audit_log: {
        Row: {
          action_type: string
          changed_at: string
          changed_by: string
          id: string
          new_values: Json | null
          old_values: Json | null
          period_id: string
          reason: string | null
          record_id: string
          table_name: string
        }
        Insert: {
          action_type: string
          changed_at?: string
          changed_by: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          period_id: string
          reason?: string | null
          record_id: string
          table_name: string
        }
        Update: {
          action_type?: string
          changed_at?: string
          changed_by?: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          period_id?: string
          reason?: string | null
          record_id?: string
          table_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "month_end_audit_log_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "month_end_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      month_end_checklist_items: {
        Row: {
          completed_at: string | null
          completed_by: string | null
          created_at: string
          description: string | null
          id: string
          is_auto_checkable: boolean
          is_completed: boolean
          item_name: string
          period_id: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_auto_checkable?: boolean
          is_completed?: boolean
          item_name: string
          period_id: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_auto_checkable?: boolean
          is_completed?: boolean
          item_name?: string
          period_id?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "month_end_checklist_items_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "month_end_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      month_end_periods: {
        Row: {
          close_date: string | null
          closed_by: string | null
          created_at: string
          id: string
          month: number
          status: string
          updated_at: string
          year: number
        }
        Insert: {
          close_date?: string | null
          closed_by?: string | null
          created_at?: string
          id?: string
          month: number
          status?: string
          updated_at?: string
          year: number
        }
        Update: {
          close_date?: string | null
          closed_by?: string | null
          created_at?: string
          id?: string
          month?: number
          status?: string
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      month_end_sign_offs: {
        Row: {
          id: string
          ip_address: string | null
          notes: string | null
          period_id: string
          signature_type: string
          signed_at: string
          signed_by: string
        }
        Insert: {
          id?: string
          ip_address?: string | null
          notes?: string | null
          period_id: string
          signature_type?: string
          signed_at?: string
          signed_by: string
        }
        Update: {
          id?: string
          ip_address?: string | null
          notes?: string | null
          period_id?: string
          signature_type?: string
          signed_at?: string
          signed_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "month_end_sign_offs_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "month_end_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          is_sent: boolean | null
          message: string
          notification_type: string | null
          related_id: string | null
          scheduled_for: string | null
          sent_at: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          is_sent?: boolean | null
          message: string
          notification_type?: string | null
          related_id?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          is_sent?: boolean | null
          message?: string
          notification_type?: string | null
          related_id?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      order_line_items: {
        Row: {
          created_at: string
          id: string
          inventory_item_id: string | null
          order_id: string | null
          quantity: number
          received_quantity: number | null
          total_cost: number | null
          unit_cost: number
        }
        Insert: {
          created_at?: string
          id?: string
          inventory_item_id?: string | null
          order_id?: string | null
          quantity: number
          received_quantity?: number | null
          total_cost?: number | null
          unit_cost: number
        }
        Update: {
          created_at?: string
          id?: string
          inventory_item_id?: string | null
          order_id?: string | null
          quantity?: number
          received_quantity?: number | null
          total_cost?: number | null
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_line_items_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_line_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "supplier_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          tax_rate: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          tax_rate?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          tax_rate?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      package_items: {
        Row: {
          created_at: string
          dish_id: string | null
          id: string
          package_id: string | null
          qty_per_guest: number | null
        }
        Insert: {
          created_at?: string
          dish_id?: string | null
          id?: string
          package_id?: string | null
          qty_per_guest?: number | null
        }
        Update: {
          created_at?: string
          dish_id?: string | null
          id?: string
          package_id?: string | null
          qty_per_guest?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "package_items_dish_id_fkey"
            columns: ["dish_id"]
            isOneToOne: false
            referencedRelation: "dishes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "package_items_dish_id_fkey"
            columns: ["dish_id"]
            isOneToOne: false
            referencedRelation: "v_popular_dishes"
            referencedColumns: ["dish_id"]
          },
          {
            foreignKeyName: "package_items_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      packages: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          min_guests: number | null
          name: string
          organization_id: string | null
          price_per_guest: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          min_guests?: number | null
          name: string
          organization_id?: string | null
          price_per_guest?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          min_guests?: number | null
          name?: string
          organization_id?: string | null
          price_per_guest?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "packages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          claim_id: string
          created_at: string
          id: string
          notes: string | null
          payment_amount: number
          payment_date: string
          payment_method: string | null
          reference_number: string | null
          updated_at: string
        }
        Insert: {
          claim_id: string
          created_at?: string
          id?: string
          notes?: string | null
          payment_amount: number
          payment_date: string
          payment_method?: string | null
          reference_number?: string | null
          updated_at?: string
        }
        Update: {
          claim_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          payment_amount?: number
          payment_date?: string
          payment_method?: string | null
          reference_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "claims"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_prospects: {
        Row: {
          assigned_to: string | null
          created_at: string
          email: string | null
          estimated_monthly_revenue: number | null
          id: string
          last_contact_date: string | null
          name: string
          next_follow_up_date: string | null
          notes: string | null
          phone: string | null
          practice_type: string | null
          priority: string
          probability: number | null
          source: string | null
          stage: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          email?: string | null
          estimated_monthly_revenue?: number | null
          id?: string
          last_contact_date?: string | null
          name: string
          next_follow_up_date?: string | null
          notes?: string | null
          phone?: string | null
          practice_type?: string | null
          priority?: string
          probability?: number | null
          source?: string | null
          stage?: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          email?: string | null
          estimated_monthly_revenue?: number | null
          id?: string
          last_contact_date?: string | null
          name?: string
          next_follow_up_date?: string | null
          notes?: string | null
          phone?: string | null
          practice_type?: string | null
          priority?: string
          probability?: number | null
          source?: string | null
          stage?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          business_name: string | null
          created_at: string
          first_name: string | null
          id: string
          is_active: boolean | null
          last_name: string | null
          role: Database["public"]["Enums"]["app_role"]
          subscription_end_date: string | null
          subscription_start_date: string | null
          subscription_tier:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          updated_at: string
        }
        Insert: {
          business_name?: string | null
          created_at?: string
          first_name?: string | null
          id: string
          is_active?: boolean | null
          last_name?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          subscription_tier?:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          updated_at?: string
        }
        Update: {
          business_name?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          subscription_tier?:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          updated_at?: string
        }
        Relationships: []
      }
      recipe_ingredients: {
        Row: {
          created_at: string
          id: string
          inventory_item_id: string | null
          menu_item_id: string | null
          quantity_needed: number
          unit: string
        }
        Insert: {
          created_at?: string
          id?: string
          inventory_item_id?: string | null
          menu_item_id?: string | null
          quantity_needed: number
          unit: string
        }
        Update: {
          created_at?: string
          id?: string
          inventory_item_id?: string | null
          menu_item_id?: string | null
          quantity_needed?: number
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredients_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      revenue_records: {
        Row: {
          client_id: string | null
          created_at: string
          event_id: string | null
          food_costs: number | null
          gross_revenue: number
          id: string
          labor_costs: number | null
          net_profit: number | null
          other_expenses: number | null
          payment_method: string | null
          revenue_date: string
          tax_amount: number | null
          user_id: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          event_id?: string | null
          food_costs?: number | null
          gross_revenue?: number
          id?: string
          labor_costs?: number | null
          net_profit?: number | null
          other_expenses?: number | null
          payment_method?: string | null
          revenue_date?: string
          tax_amount?: number | null
          user_id?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string
          event_id?: string | null
          food_costs?: number | null
          gross_revenue?: number
          id?: string
          labor_costs?: number | null
          net_profit?: number | null
          other_expenses?: number | null
          payment_method?: string | null
          revenue_date?: string
          tax_amount?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "revenue_records_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revenue_records_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revenue_records_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "v_event_profit"
            referencedColumns: ["event_id"]
          },
        ]
      }
      saved_reports: {
        Row: {
          created_at: string
          id: string
          report_data: Json
          report_name: string
          report_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          report_data: Json
          report_name: string
          report_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          report_data?: Json
          report_name?: string
          report_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      spreadsheet_imports: {
        Row: {
          created_at: string
          file_size: number | null
          filename: string
          id: string
          import_date: string
          imported_by_username: string
          notes: string | null
          records_imported: number
          status: string
        }
        Insert: {
          created_at?: string
          file_size?: number | null
          filename: string
          id?: string
          import_date?: string
          imported_by_username: string
          notes?: string | null
          records_imported?: number
          status?: string
        }
        Update: {
          created_at?: string
          file_size?: number | null
          filename?: string
          id?: string
          import_date?: string
          imported_by_username?: string
          notes?: string | null
          records_imported?: number
          status?: string
        }
        Relationships: []
      }
      staff: {
        Row: {
          created_at: string
          email: string
          hourly_rate: number | null
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
          role: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
          role?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
          role?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      staff_assignments: {
        Row: {
          created_at: string
          end_time: string | null
          event_id: string | null
          hourly_rate: number | null
          id: string
          role_for_event: string
          staff_id: string | null
          start_time: string | null
        }
        Insert: {
          created_at?: string
          end_time?: string | null
          event_id?: string | null
          hourly_rate?: number | null
          id?: string
          role_for_event: string
          staff_id?: string | null
          start_time?: string | null
        }
        Update: {
          created_at?: string
          end_time?: string | null
          event_id?: string | null
          hourly_rate?: number | null
          id?: string
          role_for_event?: string
          staff_id?: string | null
          start_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_assignments_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_assignments_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "v_event_profit"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "staff_assignments_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_features: {
        Row: {
          created_at: string | null
          feature_limit: number | null
          feature_name: string
          id: string
          tier: Database["public"]["Enums"]["subscription_tier"]
        }
        Insert: {
          created_at?: string | null
          feature_limit?: number | null
          feature_name: string
          id?: string
          tier: Database["public"]["Enums"]["subscription_tier"]
        }
        Update: {
          created_at?: string | null
          feature_limit?: number | null
          feature_name?: string
          id?: string
          tier?: Database["public"]["Enums"]["subscription_tier"]
        }
        Relationships: []
      }
      supplier_orders: {
        Row: {
          created_at: string
          delivery_date: string | null
          id: string
          notes: string | null
          order_date: string
          status: string | null
          supplier_id: string | null
          total_amount: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          delivery_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          status?: string | null
          supplier_id?: string | null
          total_amount?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          delivery_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          status?: string | null
          supplier_id?: string | null
          total_amount?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          contact_person: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          payment_terms: string | null
          phone: string | null
          rating: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          payment_terms?: string | null
          phone?: string | null
          rating?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          payment_terms?: string | null
          phone?: string | null
          rating?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      task_history: {
        Row: {
          action_type: string
          changed_by: string
          created_at: string
          field_name: string | null
          id: string
          new_value: string | null
          notes: string | null
          old_value: string | null
          task_id: string
        }
        Insert: {
          action_type: string
          changed_by: string
          created_at?: string
          field_name?: string | null
          id?: string
          new_value?: string | null
          notes?: string | null
          old_value?: string | null
          task_id: string
        }
        Update: {
          action_type?: string
          changed_by?: string
          created_at?: string
          field_name?: string | null
          id?: string
          new_value?: string | null
          notes?: string | null
          old_value?: string | null
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_history_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_to: string | null
          attachment_ids: string[] | null
          client_id: string | null
          completed_at: string | null
          completed_by: string | null
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          id: string
          is_recurring: boolean | null
          priority: string
          recurrence_pattern: string | null
          related_claim_id: string | null
          status: string
          task_type: string | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          attachment_ids?: string[] | null
          client_id?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_recurring?: boolean | null
          priority?: string
          recurrence_pattern?: string | null
          related_claim_id?: string | null
          status?: string
          task_type?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          attachment_ids?: string[] | null
          client_id?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_recurring?: boolean | null
          priority?: string
          recurrence_pattern?: string | null
          related_claim_id?: string | null
          status?: string
          task_type?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_related_claim_id_fkey"
            columns: ["related_claim_id"]
            isOneToOne: false
            referencedRelation: "claims"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean | null
          name: string
          role: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_active?: boolean | null
          name: string
          role?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean | null
          name?: string
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          granted_at: string
          granted_by: string | null
          id: string
          organization_id: string | null
          permissions: string[] | null
          role: string
          user_id: string | null
        }
        Insert: {
          granted_at?: string
          granted_by?: string | null
          id?: string
          organization_id?: string | null
          permissions?: string[] | null
          role?: string
          user_id?: string | null
        }
        Update: {
          granted_at?: string
          granted_by?: string | null
          id?: string
          organization_id?: string | null
          permissions?: string[] | null
          role?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      venues: {
        Row: {
          address: string | null
          city: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          id: string
          name: string
          organization_id: string | null
          postal_code: string | null
          state: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          name: string
          organization_id?: string | null
          postal_code?: string | null
          state?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          name?: string
          organization_id?: string | null
          postal_code?: string | null
          state?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "venues_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      wiki_articles: {
        Row: {
          category: string | null
          content: string
          created_at: string
          created_by: string
          excerpt: string | null
          featured: boolean | null
          id: string
          is_published: boolean | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
          updated_by: string
          user_id: string | null
          view_count: number | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string
          created_by?: string
          excerpt?: string | null
          featured?: boolean | null
          id?: string
          is_published?: boolean | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
          updated_by?: string
          user_id?: string | null
          view_count?: number | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string
          created_by?: string
          excerpt?: string | null
          featured?: boolean | null
          id?: string
          is_published?: boolean | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          updated_by?: string
          user_id?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      wiki_categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          sort_order: number | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          sort_order?: number | null
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      v_event_profit: {
        Row: {
          event_date: string | null
          event_id: string | null
          food_cost: number | null
          gross_profit: number | null
          guest_count: number | null
          labor_cost: number | null
          revenue_menu: number | null
          status: string | null
          subtotal_revenue: number | null
          title: string | null
        }
        Relationships: []
      }
      v_popular_dishes: {
        Row: {
          dish_id: string | null
          name: string | null
          times_selected: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_month_end_auto_items: {
        Args: { period_month: number; period_year: number }
        Returns: undefined
      }
      create_standard_checklist: {
        Args: { period_id: string }
        Returns: undefined
      }
      generate_slug: {
        Args: { title: string }
        Returns: string
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_user_subscription_limit: {
        Args: { feature_name: string; user_id: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "customer" | "admin"
      subscription_tier: "starter" | "professional" | "growth"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["customer", "admin"],
      subscription_tier: ["starter", "professional", "growth"],
    },
  },
} as const
