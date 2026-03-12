import httpx
from config import SUPABASE_URL, SUPABASE_SERVICE_KEY

_REST_URL = f"{SUPABASE_URL}/rest/v1"
_HEADERS = {
    "apikey": SUPABASE_SERVICE_KEY,
    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}


async def get_business_by_phone(twilio_number: str) -> str | None:
    """Look up which business owns this Twilio phone number."""
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{_REST_URL}/businesses",
            headers=_HEADERS,
            params={"phone_number": f"eq.{twilio_number}", "select": "id"},
        )
        if resp.status_code == 200:
            data = resp.json()
            if data:
                return data[0]["id"]

    print(f"[DB] No business found for number: {twilio_number}")
    return None


async def insert_call(
    business_id: str, caller_phone: str, transcript: str
) -> str | None:
    """Create a new call record. Returns the call ID."""
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{_REST_URL}/calls",
            headers=_HEADERS,
            json={
                "business_id": business_id,
                "caller_phone": caller_phone,
                "transcript": transcript,
                "outcome": "question",
            },
        )
        if resp.status_code == 201:
            data = resp.json()
            return data[0]["id"] if data else None

        print(f"[DB] Insert error: {resp.status_code} {resp.text}")
        return None


async def update_call(
    call_id: str,
    transcript: str,
    summary: str | None = None,
) -> None:
    """Update an existing call record with new transcript and optional summary."""
    payload: dict = {"transcript": transcript}
    if summary:
        payload["summary"] = summary

    async with httpx.AsyncClient() as client:
        resp = await client.patch(
            f"{_REST_URL}/calls?id=eq.{call_id}",
            headers=_HEADERS,
            json=payload,
        )
        if resp.status_code not in (200, 204):
            print(f"[DB] Update error: {resp.status_code} {resp.text}")
