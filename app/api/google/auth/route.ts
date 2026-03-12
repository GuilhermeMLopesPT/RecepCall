import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getUserBusiness } from "@/lib/supabase/get-business"
import { getOAuth2Client, SCOPES } from "@/lib/google"

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL("/auth/login", process.env.GOOGLE_REDIRECT_URI))
  }

  const ub = await getUserBusiness(supabase)
  if (!ub) {
    return NextResponse.json({ error: "No business found" }, { status: 400 })
  }

  const oauth2Client = getOAuth2Client()

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
    state: ub.business_id,
  })

  return NextResponse.redirect(authUrl)
}
