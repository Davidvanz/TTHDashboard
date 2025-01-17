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
      "Booking.com Data": {
        Row: {
          Avg_Book_Window: number | null
          Avg_Daily_Rate: string | null
          Avg_Length_of_Stay: number | null
          Avg_Rate_Growth_YTD: string | null
          Cancellation_Rate: string | null
          Country: string | null
          CR_Diff_YTD: string | null
          CR_Growth_YTD: string | null
          Currency: string | null
          Res_Difference_YTD: string | null
          Res_Growth_YTD: string | null
          Reservations: string | null
          Year: number | null
        }
        Insert: {
          Avg_Book_Window?: number | null
          Avg_Daily_Rate?: string | null
          Avg_Length_of_Stay?: number | null
          Avg_Rate_Growth_YTD?: string | null
          Cancellation_Rate?: string | null
          Country?: string | null
          CR_Diff_YTD?: string | null
          CR_Growth_YTD?: string | null
          Currency?: string | null
          Res_Difference_YTD?: string | null
          Res_Growth_YTD?: string | null
          Reservations?: string | null
          Year?: number | null
        }
        Update: {
          Avg_Book_Window?: number | null
          Avg_Daily_Rate?: string | null
          Avg_Length_of_Stay?: number | null
          Avg_Rate_Growth_YTD?: string | null
          Cancellation_Rate?: string | null
          Country?: string | null
          CR_Diff_YTD?: string | null
          CR_Growth_YTD?: string | null
          Currency?: string | null
          Res_Difference_YTD?: string | null
          Res_Growth_YTD?: string | null
          Reservations?: string | null
          Year?: number | null
        }
        Relationships: []
      }
      "RevenueData_2023-2025": {
        Row: {
          Arrival: string | null
          Arrival_Month: string | null
          Arrival_Month_Num: number | null
          Departure: string | null
          Guest: string | null
          Revenue: number | null
          Revenue_per_Night: string | null
          "Room _Code": number | null
          Room_Description: string | null
          Room_Nights: number | null
          Room_Type: string | null
          Season: string | null
        }
        Insert: {
          Arrival?: string | null
          Arrival_Month?: string | null
          Arrival_Month_Num?: number | null
          Departure?: string | null
          Guest?: string | null
          Revenue?: number | null
          Revenue_per_Night?: string | null
          "Room _Code"?: number | null
          Room_Description?: string | null
          Room_Nights?: number | null
          Room_Type?: string | null
          Season?: string | null
        }
        Update: {
          Arrival?: string | null
          Arrival_Month?: string | null
          Arrival_Month_Num?: number | null
          Departure?: string | null
          Guest?: string | null
          Revenue?: number | null
          Revenue_per_Night?: string | null
          "Room _Code"?: number | null
          Room_Description?: string | null
          Room_Nights?: number | null
          Room_Type?: string | null
          Season?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      booking_sources_by_year: {
        Row: {
          booking_com_total: number | null
          direct_bookings_total: number | null
          year: number | null
        }
        Relationships: []
      }
      monthly_statistics: {
        Row: {
          Arrival_Month: string | null
          Arrival_Month_Num: number | null
          avg_rate: number | null
          cancellations: number | null
          total_bookings: number | null
          total_revenue: number | null
          total_room_nights: number | null
          year: number | null
        }
        Relationships: []
      }
      room_yearly_statistics: {
        Row: {
          avg_daily_rate: number | null
          occupancy_rate: number | null
          room_description: string | null
          total_bookings: number | null
          total_revenue: number | null
          total_room_nights: number | null
          year: number | null
        }
        Relationships: []
      }
      yearly_statistics: {
        Row: {
          avg_rate: number | null
          cancellations: number | null
          total_bookings: number | null
          total_revenue: number | null
          total_room_nights: number | null
          year: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
