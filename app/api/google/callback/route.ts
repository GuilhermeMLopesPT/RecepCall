import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { google } from "googleapis"
import { getOAuth2Client } from "@/lib/google"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const businessId = searchParams.get("state")
  const error = searchParams.get("error")

  if (error || !code || !businessId) {
    return NextResponse.redirect(
      `${origin}/dashboard/profile?integration=error`
    )
  }

  try {
    const oauth2Client = getOAuth2Client()
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)

    // Get the user's Google email
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client })
    const { data: profile } = await oauth2.userinfo.get()

    // Store tokens in Supabase using the service role key to bypass RLS
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => [], setAll: () => {} } },
    )

    const { error: dbError } = await supabase.from("integrations").upsert(
      {
        business_id: businessId,
        provider: "google_calendar",
        access_token: tokens.access_token!,
        refresh_token: tokens.refresh_token ?? null,
        token_expires_at: tokens.expiry_date
          ? new Date(tokens.expiry_date).toISOString()
          : null,
        account_email: profile.email ?? null,
      },
      { onConflict: "business_id,provider" },
    )

    if (dbError) {
      console.error("[Google Callback] DB error:", dbError)
      return NextResponse.redirect(
        `${origin}/dashboard/profile?integration=error`
      )
    }

    return NextResponse.redirect(
      `${origin}/dashboard/profile?integration=success`
    )
  } catch (err) {
    console.error("[Google Callback] Token exchange error:", err)
    return NextResponse.redirect(
      `${origin}/dashboard/profile?integration=error`
    )
  }
}
