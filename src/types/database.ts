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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      attorney_availability_rules: {
        Row: {
          attorney_id: string
          buffer_minutes: number
          daily_cap: number | null
          min_notice_hours: number
          timezone: string
          working_hours: Json
        }
        Insert: {
          attorney_id: string
          buffer_minutes?: number
          daily_cap?: number | null
          min_notice_hours?: number
          timezone: string
          working_hours: Json
        }
        Update: {
          attorney_id?: string
          buffer_minutes?: number
          daily_cap?: number | null
          min_notice_hours?: number
          timezone?: string
          working_hours?: Json
        }
        Relationships: [
          {
            foreignKeyName: "attorney_availability_rules_attorney_id_fkey"
            columns: ["attorney_id"]
            isOneToOne: true
            referencedRelation: "attorneys"
            referencedColumns: ["id"]
          },
        ]
      }
      attorney_calendar_connections: {
        Row: {
          attorney_id: string
          calendar_id: string | null
          connected_at: string
          id: string
          last_synced_at: string | null
          provider: string
          refresh_token_encrypted: string
        }
        Insert: {
          attorney_id: string
          calendar_id?: string | null
          connected_at?: string
          id?: string
          last_synced_at?: string | null
          provider: string
          refresh_token_encrypted: string
        }
        Update: {
          attorney_id?: string
          calendar_id?: string | null
          connected_at?: string
          id?: string
          last_synced_at?: string | null
          provider?: string
          refresh_token_encrypted?: string
        }
        Relationships: [
          {
            foreignKeyName: "attorney_calendar_connections_attorney_id_fkey"
            columns: ["attorney_id"]
            isOneToOne: false
            referencedRelation: "attorneys"
            referencedColumns: ["id"]
          },
        ]
      }
      attorneys: {
        Row: {
          available_slots: string[] | null
          bar_admission: string | null
          bar_card_document: string | null
          bar_number: string | null
          bar_state: string | null
          bilingual_staff: boolean | null
          bio: string | null
          board_cert_approved: boolean | null
          board_cert_body: string | null
          board_cert_document: string | null
          board_cert_specialty: string | null
          board_certified: boolean | null
          booking_page_published: boolean
          city: string | null
          consult_fee: number | null
          created_at: string
          distance: string | null
          education: string | null
          email: string | null
          firm_id: string | null
          id: string
          id_document: string | null
          interpreter_available: boolean | null
          languages: string[] | null
          languages_spoken: string[] | null
          location: string | null
          name: string
          office_location: string | null
          phone_number: string | null
          photo: string | null
          practice_area: string
          practice_areas: string[] | null
          profile_attestation: boolean | null
          profile_attestation_date: string | null
          rating: number | null
          review_count: number | null
          slug: string | null
          spanish_speaker: boolean | null
          specialties: string[] | null
          state: string | null
          translated_documents: boolean | null
          typical_retainer: number | null
          updated_at: string
          user_id: string | null
          verification_status: string
          verified: boolean | null
          verified_date: string | null
          years_experience: number | null
        }
        Insert: {
          available_slots?: string[] | null
          bar_admission?: string | null
          bar_card_document?: string | null
          bar_number?: string | null
          bar_state?: string | null
          bilingual_staff?: boolean | null
          bio?: string | null
          board_cert_approved?: boolean | null
          board_cert_body?: string | null
          board_cert_document?: string | null
          board_cert_specialty?: string | null
          board_certified?: boolean | null
          booking_page_published?: boolean
          city?: string | null
          consult_fee?: number | null
          created_at?: string
          distance?: string | null
          education?: string | null
          email?: string | null
          firm_id?: string | null
          id?: string
          id_document?: string | null
          interpreter_available?: boolean | null
          languages?: string[] | null
          languages_spoken?: string[] | null
          location?: string | null
          name: string
          office_location?: string | null
          phone_number?: string | null
          photo?: string | null
          practice_area: string
          practice_areas?: string[] | null
          profile_attestation?: boolean | null
          profile_attestation_date?: string | null
          rating?: number | null
          review_count?: number | null
          slug?: string | null
          spanish_speaker?: boolean | null
          specialties?: string[] | null
          state?: string | null
          translated_documents?: boolean | null
          typical_retainer?: number | null
          updated_at?: string
          user_id?: string | null
          verification_status?: string
          verified?: boolean | null
          verified_date?: string | null
          years_experience?: number | null
        }
        Update: {
          available_slots?: string[] | null
          bar_admission?: string | null
          bar_card_document?: string | null
          bar_number?: string | null
          bar_state?: string | null
          bilingual_staff?: boolean | null
          bio?: string | null
          board_cert_approved?: boolean | null
          board_cert_body?: string | null
          board_cert_document?: string | null
          board_cert_specialty?: string | null
          board_certified?: boolean | null
          booking_page_published?: boolean
          city?: string | null
          consult_fee?: number | null
          created_at?: string
          distance?: string | null
          education?: string | null
          email?: string | null
          firm_id?: string | null
          id?: string
          id_document?: string | null
          interpreter_available?: boolean | null
          languages?: string[] | null
          languages_spoken?: string[] | null
          location?: string | null
          name?: string
          office_location?: string | null
          phone_number?: string | null
          photo?: string | null
          practice_area?: string
          practice_areas?: string[] | null
          profile_attestation?: boolean | null
          profile_attestation_date?: string | null
          rating?: number | null
          review_count?: number | null
          slug?: string | null
          spanish_speaker?: boolean | null
          specialties?: string[] | null
          state?: string | null
          translated_documents?: boolean | null
          typical_retainer?: number | null
          updated_at?: string
          user_id?: string | null
          verification_status?: string
          verified?: boolean | null
          verified_date?: string | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "attorneys_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_action_tokens: {
        Row: {
          booking_id: string
          consumed_at: string | null
          expires_at: string
          purpose: string
          token_hash: string
        }
        Insert: {
          booking_id: string
          consumed_at?: string | null
          expires_at: string
          purpose: string
          token_hash: string
        }
        Update: {
          booking_id?: string
          consumed_at?: string | null
          expires_at?: string
          purpose?: string
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_action_tokens_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_staff_notes: {
        Row: {
          author_id: string
          body: string
          booking_id: string
          created_at: string
          id: string
          updated_at: string | null
        }
        Insert: {
          author_id: string
          body: string
          booking_id: string
          created_at?: string
          id?: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          body?: string
          booking_id?: string
          created_at?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_staff_notes_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_status_events: {
        Row: {
          actor_id: string | null
          actor_role: string
          booking_id: string
          created_at: string
          from_status: string | null
          id: string
          to_status: string
        }
        Insert: {
          actor_id?: string | null
          actor_role: string
          booking_id: string
          created_at?: string
          from_status?: string | null
          id?: string
          to_status: string
        }
        Update: {
          actor_id?: string | null
          actor_role?: string
          booking_id?: string
          created_at?: string
          from_status?: string | null
          id?: string
          to_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_status_events_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          attorney_id: string
          attorney_name: string | null
          case_summary: string | null
          client_email: string
          client_id: string | null
          client_name: string
          client_phone: string | null
          confirmed_at: string | null
          confirmed_by: string | null
          created_at: string
          declined_reason: string | null
          description_consent: boolean | null
          description_consent_date: string | null
          description_purged: boolean | null
          description_skipped: boolean | null
          id: string
          issue_description: string | null
          language_preference: string | null
          payment_method: string | null
          slot: string
          slot_end: string | null
          slot_start: string | null
          source: string | null
          status: string
          sub_area: string | null
          updated_at: string
          urgency: string | null
        }
        Insert: {
          attorney_id: string
          attorney_name?: string | null
          case_summary?: string | null
          client_email: string
          client_id?: string | null
          client_name: string
          client_phone?: string | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          declined_reason?: string | null
          description_consent?: boolean | null
          description_consent_date?: string | null
          description_purged?: boolean | null
          description_skipped?: boolean | null
          id?: string
          issue_description?: string | null
          language_preference?: string | null
          payment_method?: string | null
          slot: string
          slot_end?: string | null
          slot_start?: string | null
          source?: string | null
          status?: string
          sub_area?: string | null
          updated_at?: string
          urgency?: string | null
        }
        Update: {
          attorney_id?: string
          attorney_name?: string | null
          case_summary?: string | null
          client_email?: string
          client_id?: string | null
          client_name?: string
          client_phone?: string | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          declined_reason?: string | null
          description_consent?: boolean | null
          description_consent_date?: string | null
          description_purged?: boolean | null
          description_skipped?: boolean | null
          id?: string
          issue_description?: string | null
          language_preference?: string | null
          payment_method?: string | null
          slot?: string
          slot_end?: string | null
          slot_start?: string | null
          source?: string | null
          status?: string
          sub_area?: string | null
          updated_at?: string
          urgency?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_attorney_id_fkey"
            columns: ["attorney_id"]
            isOneToOne: false
            referencedRelation: "attorneys"
            referencedColumns: ["id"]
          },
        ]
      }
      case_summaries: {
        Row: {
          budget_range: string | null
          city: string | null
          conversation_id: string | null
          created_at: string
          created_by_id: string
          description: string
          id: string
          key_facts: string[] | null
          practice_area_primary: string
          practice_area_secondary: string | null
          preferred_language: string | null
          state: string | null
          updated_at: string
          urgency: string | null
        }
        Insert: {
          budget_range?: string | null
          city?: string | null
          conversation_id?: string | null
          created_at?: string
          created_by_id: string
          description: string
          id?: string
          key_facts?: string[] | null
          practice_area_primary: string
          practice_area_secondary?: string | null
          preferred_language?: string | null
          state?: string | null
          updated_at?: string
          urgency?: string | null
        }
        Update: {
          budget_range?: string | null
          city?: string | null
          conversation_id?: string | null
          created_at?: string
          created_by_id?: string
          description?: string
          id?: string
          key_facts?: string[] | null
          practice_area_primary?: string
          practice_area_secondary?: string | null
          preferred_language?: string | null
          state?: string | null
          updated_at?: string
          urgency?: string | null
        }
        Relationships: []
      }
      email_schedule: {
        Row: {
          booking_id: string
          cancelled_at: string | null
          id: string
          kind: string
          send_at: string
          sent_at: string | null
        }
        Insert: {
          booking_id: string
          cancelled_at?: string | null
          id?: string
          kind: string
          send_at: string
          sent_at?: string | null
        }
        Update: {
          booking_id?: string
          cancelled_at?: string | null
          id?: string
          kind?: string
          send_at?: string
          sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_schedule_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      firm_members: {
        Row: {
          created_at: string
          firm_id: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          firm_id: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          firm_id?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "firm_members_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
        ]
      }
      firms: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_type: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          preferred_language: string | null
          requires_spanish_attorney: boolean | null
          role: string
          updated_at: string
        }
        Insert: {
          account_type?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          preferred_language?: string | null
          requires_spanish_attorney?: boolean | null
          role?: string
          updated_at?: string
        }
        Update: {
          account_type?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          preferred_language?: string | null
          requires_spanish_attorney?: boolean | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          attorney_id: string
          created_at: string
          date: string | null
          id: string
          rating: number
          review_text: string | null
          reviewer_name: string
        }
        Insert: {
          attorney_id: string
          created_at?: string
          date?: string | null
          id?: string
          rating: number
          review_text?: string | null
          reviewer_name: string
        }
        Update: {
          attorney_id?: string
          created_at?: string
          date?: string | null
          id?: string
          rating?: number
          review_text?: string | null
          reviewer_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_attorney_id_fkey"
            columns: ["attorney_id"]
            isOneToOne: false
            referencedRelation: "attorneys"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist: {
        Row: {
          created_at: string
          email: string
          id: string
          notified: boolean | null
          state: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          notified?: boolean | null
          state: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          notified?: boolean | null
          state?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
