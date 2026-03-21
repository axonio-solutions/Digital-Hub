export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      areas: {
        Row: {
          base_price: number
          cafe_id: string
          capacity: number
          created_at: string | null
          id: string
          name_ar: string
          name_en: string
          updated_at: string | null
        }
        Insert: {
          base_price?: number
          cafe_id: string
          capacity?: number
          created_at?: string | null
          id?: string
          name_ar: string
          name_en?: string
          updated_at?: string | null
        }
        Update: {
          base_price?: number
          cafe_id?: string
          capacity?: number
          created_at?: string | null
          id?: string
          name_ar?: string
          name_en?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "areas_cafe_id_fkey"
            columns: ["cafe_id"]
            isOneToOne: false
            referencedRelation: "cafes"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_packages: {
        Row: {
          booking_id: string
          created_at: string | null
          package_id: string
          price_at_booking: number | null
          quantity: number
          updated_at: string | null
        }
        Insert: {
          booking_id: string
          created_at?: string | null
          package_id: string
          price_at_booking?: number | null
          quantity: number
          updated_at?: string | null
        }
        Update: {
          booking_id?: string
          created_at?: string | null
          package_id?: string
          price_at_booking?: number | null
          quantity?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_packages_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "event_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_packages_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      cafe_categories: {
        Row: {
          code: string
          created_at: string | null
          description_ar: string | null
          description_en: string | null
          id: string
          title_ar: string
          title_en: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          id?: string
          title_ar: string
          title_en: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          id?: string
          title_ar?: string
          title_en?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      cafe_images: {
        Row: {
          cafe_id: string
          created_at: string | null
          id: string
          image_url: string
          sort_order: number
          type: string
          updated_at: string | null
        }
        Insert: {
          cafe_id: string
          created_at?: string | null
          id?: string
          image_url: string
          sort_order?: number
          type: string
          updated_at?: string | null
        }
        Update: {
          cafe_id?: string
          created_at?: string | null
          id?: string
          image_url?: string
          sort_order?: number
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cafe_images_cafe_id_fkey"
            columns: ["cafe_id"]
            isOneToOne: false
            referencedRelation: "cafes"
            referencedColumns: ["id"]
          },
        ]
      }
      cafe_menu_images: {
        Row: {
          cafe_id: string
          created_at: string | null
          id: string
          image_url: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          cafe_id: string
          created_at?: string | null
          id?: string
          image_url: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          cafe_id?: string
          created_at?: string | null
          id?: string
          image_url?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cafe_menu_images_cafe_id_fkey"
            columns: ["cafe_id"]
            isOneToOne: false
            referencedRelation: "cafes"
            referencedColumns: ["id"]
          },
        ]
      }
      cafe_operating_hours: {
        Row: {
          cafe_id: string
          closing_time: string
          created_at: string | null
          day_of_week: number
          id: string
          is_closed: boolean | null
          opening_time: string
          updated_at: string | null
        }
        Insert: {
          cafe_id: string
          closing_time: string
          created_at?: string | null
          day_of_week: number
          id?: string
          is_closed?: boolean | null
          opening_time: string
          updated_at?: string | null
        }
        Update: {
          cafe_id?: string
          closing_time?: string
          created_at?: string | null
          day_of_week?: number
          id?: string
          is_closed?: boolean | null
          opening_time?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cafe_operating_hours_cafe_id_fkey"
            columns: ["cafe_id"]
            isOneToOne: false
            referencedRelation: "cafes"
            referencedColumns: ["id"]
          },
        ]
      }
      cafe_social_links: {
        Row: {
          cafe_id: string
          created_at: string | null
          display_order: number
          id: string
          platform: string
          updated_at: string | null
          url: string
        }
        Insert: {
          cafe_id: string
          created_at?: string | null
          display_order?: number
          id?: string
          platform: string
          updated_at?: string | null
          url: string
        }
        Update: {
          cafe_id?: string
          created_at?: string | null
          display_order?: number
          id?: string
          platform?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "cafe_social_links_cafe_id_fkey"
            columns: ["cafe_id"]
            isOneToOne: false
            referencedRelation: "cafes"
            referencedColumns: ["id"]
          },
        ]
      }
      cafe_special_hours: {
        Row: {
          cafe_id: string
          closing_time: string
          date: string
          id: string
          opening_time: string
          title: string
        }
        Insert: {
          cafe_id: string
          closing_time: string
          date: string
          id?: string
          opening_time: string
          title: string
        }
        Update: {
          cafe_id?: string
          closing_time?: string
          date?: string
          id?: string
          opening_time?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "cafe_special_hours_cafe_id_fkey"
            columns: ["cafe_id"]
            isOneToOne: false
            referencedRelation: "cafes"
            referencedColumns: ["id"]
          },
        ]
      }
      cafe_temporary_closures: {
        Row: {
          cafe_id: string
          created_at: string | null
          end_day: string
          id: string
          reason: string
          start_day: string
        }
        Insert: {
          cafe_id: string
          created_at?: string | null
          end_day: string
          id?: string
          reason: string
          start_day: string
        }
        Update: {
          cafe_id?: string
          created_at?: string | null
          end_day?: string
          id?: string
          reason?: string
          start_day?: string
        }
        Relationships: [
          {
            foreignKeyName: "cafe_temporary_closures_cafe_id_fkey"
            columns: ["cafe_id"]
            isOneToOne: false
            referencedRelation: "cafes"
            referencedColumns: ["id"]
          },
        ]
      }
      cafe_types: {
        Row: {
          code: string
          created_at: string | null
          description_ar: string | null
          description_en: string | null
          id: string
          title_ar: string
          title_en: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          id?: string
          title_ar: string
          title_en: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          id?: string
          title_ar?: string
          title_en?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      cafes: {
        Row: {
          address: string | null
          administrative_region: string | null
          advance_booking_window: number | null
          amenities: Json | null
          banner_image_url: string | null
          booking_duration: number | null
          business_email: string | null
          business_phone: string | null
          cancellation_policy: string | null
          created_at: string | null
          description: string | null
          governorate: string | null
          id: string
          max_capacity: number | null
          max_party_size: number | null
          name_ar: string | null
          name_en: string | null
          owner_id: string
          slug: string | null
          status: string
          street: string | null
          type_id: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          administrative_region?: string | null
          advance_booking_window?: number | null
          amenities?: Json | null
          banner_image_url?: string | null
          booking_duration?: number | null
          business_email?: string | null
          business_phone?: string | null
          cancellation_policy?: string | null
          created_at?: string | null
          description?: string | null
          governorate?: string | null
          id?: string
          max_capacity?: number | null
          max_party_size?: number | null
          name_ar?: string | null
          name_en?: string | null
          owner_id: string
          slug?: string | null
          status?: string
          street?: string | null
          type_id?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          administrative_region?: string | null
          advance_booking_window?: number | null
          amenities?: Json | null
          banner_image_url?: string | null
          booking_duration?: number | null
          business_email?: string | null
          business_phone?: string | null
          cancellation_policy?: string | null
          created_at?: string | null
          description?: string | null
          governorate?: string | null
          id?: string
          max_capacity?: number | null
          max_party_size?: number | null
          name_ar?: string | null
          name_en?: string | null
          owner_id?: string
          slug?: string | null
          status?: string
          street?: string | null
          type_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cafes_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "cafe_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_cafes_profiles"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cafes_categories: {
        Row: {
          cafe_id: string
          category_id: string
          created_at: string | null
          id: string
        }
        Insert: {
          cafe_id: string
          category_id: string
          created_at?: string | null
          id?: string
        }
        Update: {
          cafe_id?: string
          category_id?: string
          created_at?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cafes_categories_cafe_id_fkey"
            columns: ["cafe_id"]
            isOneToOne: false
            referencedRelation: "cafes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cafes_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "cafe_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      event_areas: {
        Row: {
          area_id: string
          created_at: string | null
          event_id: string
          updated_at: string | null
        }
        Insert: {
          area_id: string
          created_at?: string | null
          event_id: string
          updated_at?: string | null
        }
        Update: {
          area_id?: string
          created_at?: string | null
          event_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_areas_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_areas_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_bookings: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          payment_status: Database["public"]["Enums"]["payment_status"]
          quantity: number
          status: Database["public"]["Enums"]["booking_status"]
          total_price: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          quantity: number
          status?: Database["public"]["Enums"]["booking_status"]
          total_price: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          quantity?: number
          status?: Database["public"]["Enums"]["booking_status"]
          total_price?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_bookings_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_packages: {
        Row: {
          created_at: string | null
          event_id: string
          override_price: number | null
          package_id: string
          status: Database["public"]["Enums"]["package_status"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          event_id: string
          override_price?: number | null
          package_id: string
          status?: Database["public"]["Enums"]["package_status"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string
          override_price?: number | null
          package_id?: string
          status?: Database["public"]["Enums"]["package_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_packages_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_packages_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          banner_img: string | null
          base_price: number
          cafe_id: string
          cancellation_reason: string | null
          cancelled_at: string | null
          created_at: string | null
          end_time: string | null
          id: string
          name: string
          remaining_capacity: number
          start_time: string
          status: Database["public"]["Enums"]["event_status"]
          terms: string | null
          total_capacity: number
          type: Database["public"]["Enums"]["event_type"]
          updated_at: string | null
          version: number
        }
        Insert: {
          banner_img?: string | null
          base_price: number
          cafe_id: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          end_time?: string | null
          id?: string
          name: string
          remaining_capacity: number
          start_time: string
          status?: Database["public"]["Enums"]["event_status"]
          terms?: string | null
          total_capacity: number
          type: Database["public"]["Enums"]["event_type"]
          updated_at?: string | null
          version?: number
        }
        Update: {
          banner_img?: string | null
          base_price?: number
          cafe_id?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          end_time?: string | null
          id?: string
          name?: string
          remaining_capacity?: number
          start_time?: string
          status?: Database["public"]["Enums"]["event_status"]
          terms?: string | null
          total_capacity?: number
          type?: Database["public"]["Enums"]["event_type"]
          updated_at?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "events_cafe_id_fkey"
            columns: ["cafe_id"]
            isOneToOne: false
            referencedRelation: "cafes"
            referencedColumns: ["id"]
          },
        ]
      }
      football_matches: {
        Row: {
          id: string
          match_id: number
        }
        Insert: {
          id: string
          match_id: number
        }
        Update: {
          id?: string
          match_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "football_matches_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      package_items: {
        Row: {
          created_at: string | null
          id: string
          name: string
          package_id: string
          price: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          package_id: string
          price: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          package_id?: string
          price?: number
          updated_at?: string | null
        }
        Relationships: [
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
          cafe_id: string
          created_at: string | null
          id: string
          name: string
          status: Database["public"]["Enums"]["package_status"]
          updated_at: string | null
          version: number
        }
        Insert: {
          cafe_id: string
          created_at?: string | null
          id?: string
          name: string
          status?: Database["public"]["Enums"]["package_status"]
          updated_at?: string | null
          version?: number
        }
        Update: {
          cafe_id?: string
          created_at?: string | null
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["package_status"]
          updated_at?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "packages_cafe_id_fkey"
            columns: ["cafe_id"]
            isOneToOne: false
            referencedRelation: "cafes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          city: string | null
          country: string | null
          created_at: string | null
          date_of_birth: string | null
          full_name: string
          id: string
          phone_number: string
          postal_code: string | null
          profile_picture_url: string | null
          state: string | null
          status: string
          street_address: string | null
          updated_at: string | null
          user_type: string
          visibility: string
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          full_name: string
          id: string
          phone_number: string
          postal_code?: string | null
          profile_picture_url?: string | null
          state?: string | null
          status?: string
          street_address?: string | null
          updated_at?: string | null
          user_type: string
          visibility?: string
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          full_name?: string
          id?: string
          phone_number?: string
          postal_code?: string | null
          profile_picture_url?: string | null
          state?: string | null
          status?: string
          street_address?: string | null
          updated_at?: string | null
          user_type?: string
          visibility?: string
        }
        Relationships: []
      }
      reservations: {
        Row: {
          area_id: string | null
          cafe_id: string
          created_at: string | null
          created_by_id: string | null
          duration_minutes: number
          email: string | null
          full_name: string | null
          guest_count: number
          id: string
          phone: string | null
          reservation_date: string
          special_requests: string | null
          start_time: string
          status: string
          table_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          area_id?: string | null
          cafe_id: string
          created_at?: string | null
          created_by_id?: string | null
          duration_minutes?: number
          email?: string | null
          full_name?: string | null
          guest_count: number
          id?: string
          phone?: string | null
          reservation_date: string
          special_requests?: string | null
          start_time: string
          status?: string
          table_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          area_id?: string | null
          cafe_id?: string
          created_at?: string | null
          created_by_id?: string | null
          duration_minutes?: number
          email?: string | null
          full_name?: string | null
          guest_count?: number
          id?: string
          phone?: string | null
          reservation_date?: string
          special_requests?: string | null
          start_time?: string
          status?: string
          table_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reservations_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_cafe_id_fkey"
            columns: ["cafe_id"]
            isOneToOne: false
            referencedRelation: "cafes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "tables"
            referencedColumns: ["id"]
          },
        ]
      }
      tables: {
        Row: {
          area_id: string
          cafe_id: string | null
          capacity: number
          created_at: string | null
          id: string
          name: string
          position_x: number | null
          position_y: number | null
          shape: string
          status: string
          updated_at: string | null
        }
        Insert: {
          area_id: string
          cafe_id?: string | null
          capacity: number
          created_at?: string | null
          id?: string
          name: string
          position_x?: number | null
          position_y?: number | null
          shape: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          area_id?: string
          cafe_id?: string | null
          capacity?: number
          created_at?: string | null
          id?: string
          name?: string
          position_x?: number | null
          position_y?: number | null
          shape?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tables_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tables_cafe_id_fkey"
            columns: ["cafe_id"]
            isOneToOne: false
            referencedRelation: "cafes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notification_settings: {
        Row: {
          created_at: string | null
          email_enabled: boolean | null
          id: string
          notification_preferences: Json | null
          sms_enabled: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_enabled?: boolean | null
          id?: string
          notification_preferences?: Json | null
          sms_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_enabled?: boolean | null
          id?: string
          notification_preferences?: Json | null
          sms_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          additional_preferences: Json | null
          atmosphere_preferences: string[] | null
          created_at: string | null
          id: string
          power_outlet_required: boolean | null
          seating_preferences: string[] | null
          updated_at: string | null
          user_id: string
          wifi_priority: boolean | null
        }
        Insert: {
          additional_preferences?: Json | null
          atmosphere_preferences?: string[] | null
          created_at?: string | null
          id?: string
          power_outlet_required?: boolean | null
          seating_preferences?: string[] | null
          updated_at?: string | null
          user_id: string
          wifi_priority?: boolean | null
        }
        Update: {
          additional_preferences?: Json | null
          atmosphere_preferences?: string[] | null
          created_at?: string | null
          id?: string
          power_outlet_required?: boolean | null
          seating_preferences?: string[] | null
          updated_at?: string | null
          user_id?: string
          wifi_priority?: boolean | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          role: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      visit_history: {
        Row: {
          check_in_time: string | null
          check_out_time: string | null
          created_at: string | null
          feedback: Json | null
          id: string
          reservation_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string | null
          feedback?: Json | null
          id?: string
          reservation_id: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string | null
          feedback?: Json | null
          id?: string
          reservation_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      book_event:
        | {
            Args: {
              p_event_id: string
              p_user_id: string
              p_quantity: number
              p_package_selections: Json
              p_total_price: number
            }
            Returns: string
          }
        | {
            Args: {
              p_event_id: string
              p_user_id: string
              p_quantity: number
              p_total_price: number
            }
            Returns: string
          }
      changepassword: {
        Args: {
          current_plain_password: string
          new_plain_password: string
          current_id: string
        }
        Returns: string
      }
      complete_user_profile: {
        Args: {
          user_id: string
          user_type_val: string
        }
        Returns: boolean
      }
      custom_access_token_hook: {
        Args: {
          event: Json
        }
        Returns: Json
      }
      delete_user: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      gbt_bit_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_bool_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_bool_fetch: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_bpchar_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_bytea_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_cash_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_cash_fetch: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_date_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_date_fetch: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_decompress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_enum_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_enum_fetch: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_float4_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_float4_fetch: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_float8_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_float8_fetch: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_inet_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_int2_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_int2_fetch: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_int4_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_int4_fetch: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_int8_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_int8_fetch: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_intv_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_intv_decompress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_intv_fetch: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_macad_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_macad_fetch: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_macad8_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_macad8_fetch: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_numeric_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_oid_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_oid_fetch: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_text_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_time_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_time_fetch: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_timetz_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_ts_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_ts_fetch: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_tstz_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_uuid_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_uuid_fetch: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_var_decompress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_var_fetch: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbtreekey_var_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbtreekey_var_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbtreekey16_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbtreekey16_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbtreekey2_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbtreekey2_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbtreekey32_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbtreekey32_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbtreekey4_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbtreekey4_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbtreekey8_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbtreekey8_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      get_areas_with_tables: {
        Args: Record<PropertyKey, never>
        Returns: {
          area_id: string
          area_name: string
          table_count: number
        }[]
      }
      reservation_period: {
        Args: {
          reservation_date: string
          start_time: string
          duration_minutes: number
        }
        Returns: unknown
      }
    }
    Enums: {
      app_role: "admin" | "cafe_owner" | "customer"
      booking_status: "pending" | "confirmed" | "cancelled"
      event_status: "upcoming" | "ongoing" | "completed" | "cancelled"
      event_type: "football_match"
      package_status: "active" | "inactive"
      payment_status: "pending" | "paid" | "refunded"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
