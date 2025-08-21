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
      clients: {
        Row: {
          address: string | null
          billing_cycle_start_date: string | null
          city: string | null
          contract_percentage: number | null
          contract_start_date: string | null
          created_at: string
          email: string
          id: string
          monthly_revenue: number | null
          name: string
          notes: string | null
          office_contact_name: string | null
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
          id?: string
          monthly_revenue?: number | null
          name: string
          notes?: string | null
          office_contact_name?: string | null
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
          id?: string
          monthly_revenue?: number | null
          name?: string
          notes?: string | null
          office_contact_name?: string | null
          phone?: string | null
          practice_type?: string | null
          state?: string | null
          status?: string
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: []
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
        ]
      }
      events: {
        Row: {
          address: string | null
          client_name: string
          created_at: string
          event_date: string | null
          event_time: string | null
          gratuity: number | null
          id: string
          number_of_guests: number | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          client_name: string
          created_at?: string
          event_date?: string | null
          event_time?: string | null
          gratuity?: number | null
          id?: string
          number_of_guests?: number | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          client_name?: string
          created_at?: string
          event_date?: string | null
          event_time?: string | null
          gratuity?: number | null
          id?: string
          number_of_guests?: number | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      invoices: {
        Row: {
          billing_period_end: string
          billing_period_start: string
          client_id: string
          created_at: string
          due_date: string | null
          fee_percentage: number
          id: string
          invoice_amount: number
          invoice_number: string
          notes: string | null
          paid_date: string | null
          sent_date: string | null
          status: string
          total_collections: number
          updated_at: string
        }
        Insert: {
          billing_period_end: string
          billing_period_start: string
          client_id: string
          created_at?: string
          due_date?: string | null
          fee_percentage: number
          id?: string
          invoice_amount: number
          invoice_number: string
          notes?: string | null
          paid_date?: string | null
          sent_date?: string | null
          status?: string
          total_collections?: number
          updated_at?: string
        }
        Update: {
          billing_period_end?: string
          billing_period_start?: string
          client_id?: string
          created_at?: string
          due_date?: string | null
          fee_percentage?: number
          id?: string
          invoice_amount?: number
          invoice_number?: string
          notes?: string | null
          paid_date?: string | null
          sent_date?: string | null
          status?: string
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
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          subscription_tier?:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          updated_at?: string
        }
        Relationships: []
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
    }
    Views: {
      [_ in never]: never
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
      get_user_subscription_limit: {
        Args: { feature_name: string; user_id: string }
        Returns: number
      }
    }
    Enums: {
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
      subscription_tier: ["starter", "professional", "growth"],
    },
  },
} as const
