import { SupabaseClient } from "@supabase/ssr"

export type Business = {
  id: string
  name: string
  phone_number: string | null
  timezone: string
  greeting_message: string | null
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
