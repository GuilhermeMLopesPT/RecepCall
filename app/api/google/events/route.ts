import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createServerClient } from "@supabase/ssr"
import { getUserBusiness } from "@/lib/supabase/get-business"
import { google } from "googleapis"
import { getOAuth2Client } from "@/lib/google"

export async function GET() {
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

  // Use service role to read tokens (RLS doesn't allow service-level reads)
  const adminClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  )

  const { data: integration } = await adminClient
    .from("integrations")
    .select("*")
    .eq("business_id", ub.business_id)
    .eq("provider", "google_calendar")
    .single()

  if (!integration) {
    return NextResponse.json({ connected: false, events: [] })
  }

  try {
    const oauth2Client = getOAuth2Client()
    oauth2Client.setCredentials({
      access_token: integration.access_token,
      refresh_token: integration.refresh_token,
    })

    // Refresh token if expired
    const tokenExpiry = integration.token_expires_at
      ? new Date(integration.token_expires_at).getTime()
      : 0
    if (Date.now() > tokenExpiry - 60_000) {
      const { credentials } = await oauth2Client.refreshAccessToken()
      oauth2Client.setCredentials(credentials)

      await adminClient
        .from("integrations")
        .update({
          access_token: credentials.access_token!,
          token_expires_at: credentials.expiry_date
            ? new Date(credentials.expiry_date).toISOString()
            : null,
        })
        .eq("id", integration.id)
    }

    const calendar = google.calendar({ version: "v3", auth: oauth2Client })

    const now = new Date()
    const twoWeeksLater = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)

    const { data } = await calendar.events.list({
      calendarId: "primary",
      timeMin: now.toISOString(),
      timeMax: twoWeeksLater.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 50,
    })

    const events = (data.items ?? []).map((event) => ({
      id: event.id,
      title: event.summary ?? "(Sem título)",
      start: event.start?.dateTime ?? event.start?.date ?? "",
      end: event.end?.dateTime ?? event.end?.date ?? "",
      location: event.location ?? null,
      description: event.description ?? null,
      allDay: !event.start?.dateTime,
    }))

    return NextResponse.json({ connected: true, events })
  } catch (err) {
    console.error("[Google Events] Error:", err)
    return NextResponse.json(
      { connected: true, events: [], error: "Failed to fetch events" },
      { status: 200 },
    )
  }
}
