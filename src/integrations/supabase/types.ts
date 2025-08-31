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
      assets: {
        Row: {
          asset_id: string
          asset_name: string
          asset_type: string
          check_in_time: string | null
          check_out_time: string | null
          created_at: string
          defects_damage: string | null
          id: string
          notes: string | null
          status: string | null
          taken_by: string | null
          updated_at: string
        }
        Insert: {
          asset_id: string
          asset_name: string
          asset_type: string
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string
          defects_damage?: string | null
          id?: string
          notes?: string | null
          status?: string | null
          taken_by?: string | null
          updated_at?: string
        }
        Update: {
          asset_id?: string
          asset_name?: string
          asset_type?: string
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string
          defects_damage?: string | null
          id?: string
          notes?: string | null
          status?: string | null
          taken_by?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      attendance: {
        Row: {
          check_in_time: string | null
          check_out_time: string | null
          created_at: string | null
          date: string
          department: string
          employee_id: string
          employee_name: string
          id: number
          position: string
          status: string
          total_hours: number | null
        }
        Insert: {
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string | null
          date: string
          department: string
          employee_id: string
          employee_name: string
          id?: never
          position: string
          status: string
          total_hours?: number | null
        }
        Update: {
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string | null
          date?: string
          department?: string
          employee_id?: string
          employee_name?: string
          id?: never
          position?: string
          status?: string
          total_hours?: number | null
        }
        Relationships: []
      }
      booking_points: {
        Row: {
          booking_id: string | null
          created_at: string | null
          id: string
          points_earned: number | null
          user_id: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string | null
          id?: string
          points_earned?: number | null
          user_id: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string | null
          id?: string
          points_earned?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_points_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          address: string
          booking_date: string
          booking_time: string
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string | null
          id: string
          notes: string | null
          revenue_processed: boolean | null
          service_id: string | null
          service_name: string
          status: string | null
          total_amount: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address: string
          booking_date: string
          booking_time: string
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          id?: string
          notes?: string | null
          revenue_processed?: boolean | null
          service_id?: string | null
          service_name: string
          status?: string | null
          total_amount?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string
          booking_date?: string
          booking_time?: string
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          id?: string
          notes?: string | null
          revenue_processed?: boolean | null
          service_id?: string | null
          service_name?: string
          status?: string | null
          total_amount?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      branches: {
        Row: {
          created_at: string
          id: string
          location: string | null
          manager_id: string | null
          name: string
          revenue: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          location?: string | null
          manager_id?: string | null
          name: string
          revenue?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          location?: string | null
          manager_id?: string | null
          name?: string
          revenue?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      customer_points: {
        Row: {
          created_at: string | null
          id: string
          points_earned: number | null
          points_redeemed: number | null
          total_points: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          points_earned?: number | null
          points_redeemed?: number | null
          total_points?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          points_earned?: number | null
          points_redeemed?: number | null
          total_points?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      customer_records: {
        Row: {
          address: string
          amount: number
          amount_paid: number | null
          booking_date: string
          created_at: string
          customer_notes: string | null
          customer_rating: string | null
          discount_points: number | null
          email: string | null
          id: string
          name: string
          payment_status: string | null
          phone: string
          source: string
          task_completed: boolean | null
          task_done_by: string[] | null
          task_type: string
          updated_at: string
        }
        Insert: {
          address: string
          amount?: number
          amount_paid?: number | null
          booking_date: string
          created_at?: string
          customer_notes?: string | null
          customer_rating?: string | null
          discount_points?: number | null
          email?: string | null
          id?: string
          name: string
          payment_status?: string | null
          phone: string
          source: string
          task_completed?: boolean | null
          task_done_by?: string[] | null
          task_type: string
          updated_at?: string
        }
        Update: {
          address?: string
          amount?: number
          amount_paid?: number | null
          booking_date?: string
          created_at?: string
          customer_notes?: string | null
          customer_rating?: string | null
          discount_points?: number | null
          email?: string | null
          id?: string
          name?: string
          payment_status?: string | null
          phone?: string
          source?: string
          task_completed?: boolean | null
          task_done_by?: string[] | null
          task_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      daily_salary_records: {
        Row: {
          allowances: number | null
          created_at: string
          daily_salary: number
          date: string
          deductions: number | null
          employee_id: string
          hours_worked: number | null
          id: string
          notes: string | null
          overtime_hours: number | null
          overtime_rate: number | null
          status: string | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          allowances?: number | null
          created_at?: string
          daily_salary?: number
          date: string
          deductions?: number | null
          employee_id: string
          hours_worked?: number | null
          id?: string
          notes?: string | null
          overtime_hours?: number | null
          overtime_rate?: number | null
          status?: string | null
          total_amount?: number
          updated_at?: string
        }
        Update: {
          allowances?: number | null
          created_at?: string
          daily_salary?: number
          date?: string
          deductions?: number | null
          employee_id?: string
          hours_worked?: number | null
          id?: string
          notes?: string | null
          overtime_hours?: number | null
          overtime_rate?: number | null
          status?: string | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_salary_records_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          aadhar_card_url: string | null
          address: string | null
          advance: number | null
          age: number | null
          blood_group: string | null
          created_at: string
          department: string
          driving_license_url: string | null
          email: string | null
          employment_type: string | null
          hire_date: string | null
          id: string
          name: string
          phone: string | null
          phone_number: string | null
          position: string
          salary: number | null
          status: string | null
          updated_at: string
        }
        Insert: {
          aadhar_card_url?: string | null
          address?: string | null
          advance?: number | null
          age?: number | null
          blood_group?: string | null
          created_at?: string
          department: string
          driving_license_url?: string | null
          email?: string | null
          employment_type?: string | null
          hire_date?: string | null
          id: string
          name: string
          phone?: string | null
          phone_number?: string | null
          position: string
          salary?: number | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          aadhar_card_url?: string | null
          address?: string | null
          advance?: number | null
          age?: number | null
          blood_group?: string | null
          created_at?: string
          department?: string
          driving_license_url?: string | null
          email?: string | null
          employment_type?: string | null
          hire_date?: string | null
          id?: string
          name?: string
          phone?: string | null
          phone_number?: string | null
          position?: string
          salary?: number | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          comment: string | null
          created_at: string
          customer_email: string
          customer_name: string
          id: string
          rating: number | null
          service_name: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string
          customer_email: string
          customer_name: string
          id?: string
          rating?: number | null
          service_name?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string
          customer_email?: string
          customer_name?: string
          id?: string
          rating?: number | null
          service_name?: string | null
        }
        Relationships: []
      }
      manager_revenue: {
        Row: {
          created_at: string
          date: string
          expenses: number | null
          id: string
          manager_id: string
          profit: number
          revenue_generated: number
          task_amounts: number | null
          tasks_received: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          expenses?: number | null
          id?: string
          manager_id: string
          profit?: number
          revenue_generated?: number
          task_amounts?: number | null
          tasks_received?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          expenses?: number | null
          id?: string
          manager_id?: string
          profit?: number
          revenue_generated?: number
          task_amounts?: number | null
          tasks_received?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "manager_revenue_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      manpower_hiring: {
        Row: {
          address: string | null
          age: number | null
          created_at: string
          employee_type: string | null
          id: string
          interview_date: string | null
          joining_date: string | null
          name: string
          phone_number: string
          position: string | null
          source: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          age?: number | null
          created_at?: string
          employee_type?: string | null
          id?: string
          interview_date?: string | null
          joining_date?: string | null
          name: string
          phone_number: string
          position?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          age?: number | null
          created_at?: string
          employee_type?: string | null
          id?: string
          interview_date?: string | null
          joining_date?: string | null
          name?: string
          phone_number?: string
          position?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      monthly_expenses: {
        Row: {
          created_at: string
          deposits: number | null
          direct_expenses: Json | null
          id: string
          month: string
          repair_maintenance: Json | null
          salary_expenses: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          deposits?: number | null
          direct_expenses?: Json | null
          id?: string
          month: string
          repair_maintenance?: Json | null
          salary_expenses?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          deposits?: number | null
          direct_expenses?: Json | null
          id?: string
          month?: string
          repair_maintenance?: Json | null
          salary_expenses?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      potential_customers: {
        Row: {
          created_at: string
          customer_name: string
          follow_up_date: string | null
          follow_up_status: string | null
          id: string
          mobile_number: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_name: string
          follow_up_date?: string | null
          follow_up_status?: string | null
          id?: string
          mobile_number?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_name?: string
          follow_up_date?: string | null
          follow_up_status?: string | null
          id?: string
          mobile_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string
          description: string | null
          duration_hours: number | null
          id: string
          name: string
          price: number
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_hours?: number | null
          id?: string
          name: string
          price: number
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_hours?: number | null
          id?: string
          name?: string
          price?: number
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      stocks: {
        Row: {
          category: string
          cost_per_unit: number | null
          created_at: string
          id: string
          item_name: string
          last_updated: string
          minimum_stock: number | null
          quantity: number
          supplier: string | null
          total_value: number | null
          unit: string
        }
        Insert: {
          category: string
          cost_per_unit?: number | null
          created_at?: string
          id?: string
          item_name: string
          last_updated?: string
          minimum_stock?: number | null
          quantity?: number
          supplier?: string | null
          total_value?: number | null
          unit?: string
        }
        Update: {
          category?: string
          cost_per_unit?: number | null
          created_at?: string
          id?: string
          item_name?: string
          last_updated?: string
          minimum_stock?: number | null
          quantity?: number
          supplier?: string | null
          total_value?: number | null
          unit?: string
        }
        Relationships: []
      }
      sub_contractors: {
        Row: {
          address: string | null
          availability_status: string | null
          contact_person: string | null
          created_at: string
          email: string | null
          hourly_rate: number | null
          id: string
          name: string
          phone_number: string | null
          rating: number | null
          specialization: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          availability_status?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          hourly_rate?: number | null
          id?: string
          name: string
          phone_number?: string | null
          rating?: number | null
          specialization?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          availability_status?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          hourly_rate?: number | null
          id?: string
          name?: string
          phone_number?: string | null
          rating?: number | null
          specialization?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      task_assignments: {
        Row: {
          assigned_date: string | null
          booking_id: string | null
          created_at: string
          employee_id: string | null
          id: string
          notes: string | null
          revenue_amount: number | null
          status: string | null
          updated_at: string
        }
        Insert: {
          assigned_date?: string | null
          booking_id?: string | null
          created_at?: string
          employee_id?: string | null
          id?: string
          notes?: string | null
          revenue_amount?: number | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          assigned_date?: string | null
          booking_id?: string | null
          created_at?: string
          employee_id?: string | null
          id?: string
          notes?: string | null
          revenue_amount?: number | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_assignments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_assignments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string
          email_verified: boolean | null
          first_name: string | null
          id: string
          last_name: string | null
          phone_number: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email_verified?: boolean | null
          first_name?: string | null
          id: string
          last_name?: string | null
          phone_number?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email_verified?: boolean | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone_number?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          email: string | null
          first_name: string | null
          id: number
          last_name: string | null
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: never
          last_name?: string | null
          role: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: never
          last_name?: string | null
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      vendors: {
        Row: {
          address: string | null
          contact_person: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone_number: string | null
          rating: number | null
          services_provided: string[] | null
          status: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone_number?: string | null
          rating?: number | null
          services_provided?: string[] | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone_number?: string | null
          rating?: number | null
          services_provided?: string[] | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_booking_points: {
        Args: { booking_amount: number }
        Returns: number
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      update_user_role: {
        Args: { new_role: string; target_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "customer"
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
      app_role: ["admin", "customer"],
    },
  },
} as const
