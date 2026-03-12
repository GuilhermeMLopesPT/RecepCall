import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createServerClient } from "@supabase/ssr"
import { getUserBusiness } from "@/lib/supabase/get-business"

export async function DELETE() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const ub = await getUserBusiness(supabase)
  if (!ub) {
    return NextResponse.json({ error: "No business" }, { status: 400 })
  }

  const adminClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  )

  await adminClient
    .from("integrations")
    .delete()
    .eq("business_id", ub.business_id)
    .eq("provider", "google_calendar")

  return NextResponse.json({ success: true })
}
