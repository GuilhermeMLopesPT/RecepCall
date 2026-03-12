import { SupabaseClient } from "@supabase/supabase-js"

export type DayHours = {
  open: boolean
  start: string
  end: string
}

export type BusinessHours = {
  monday: DayHours
  tuesday: DayHours
  wednesday: DayHours
  thursday: DayHours
  friday: DayHours
  saturday: DayHours
  sunday: DayHours
}

export type Business = {
  id: string
  name: string
  phone_number: string | null
  email: string | null
  timezone: string
  greeting_message: string | null
  business_hours: BusinessHours | null
  created_at: string
}

export type UserBusiness = {
  business_id: string
  role: string
  businesses: Business
}

export async function getUserBusiness(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("users_business")
    .select("business_id, role, businesses(*)")
    .limit(1)
    .single()

  if (error || !data) return null

  return data as unknown as UserBusiness
}
