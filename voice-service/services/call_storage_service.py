import httpx
from config import SUPABASE_URL, SUPABASE_SERVICE_KEY

_REST_URL = f"{SUPABASE_URL}/rest/v1"
_HEADERS = {
    "apikey": SUPABASE_SERVICE_KEY,
    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}

_BIZ_SELECT = "id,name,phone_number,timezone,greeting_message,business_hours"


def _normalize_phone(phone: str) -> str:
    """Strip everything except digits and leading +."""
    if not phone:
        return ""
    digits = "".join(c for c in phone if c.isdigit())
    return f"+{digits}" if phone.startswith("+") else digits


async def _find_business(client: httpx.AsyncClient, twilio_number: str, select: str):
    """Find a business by phone number, handling formatting differences."""
    normalized = _normalize_phone(twilio_number)

    resp = await client.get(
        f"{_REST_URL}/businesses",
        headers=_HEADERS,
        params={"phone_number": f"eq.{normalized}", "select": select},
    )
    if resp.status_code == 200 and resp.json():
        return resp.json()[0]

    resp = await client.get(
        f"{_REST_URL}/businesses",
        headers=_HEADERS,
        params={"select": select},
    )
    if resp.status_code == 200:
        for biz in resp.json():
            if _normalize_phone(biz.get("phone_number", "")) == normalized:
                return biz

    print(f"[DB] No business found for number: {twilio_number}")
    return None


async def get_business_by_phone(twilio_number: str) -> str | None:
    """Look up which business owns this Twilio phone number."""
    async with httpx.AsyncClient() as client:
        biz = await _find_business(client, twilio_number, "id")
        return biz["id"] if biz else None


async def get_business_context(twilio_number: str) -> dict | None:
    """Fetch full business details + services for AI context."""
    async with httpx.AsyncClient() as client:
        business = await _find_business(client, twilio_number, _BIZ_SELECT)
        if not business:
            return None

        svc_resp = await client.get(
            f"{_REST_URL}/services",
            headers=_HEADERS,
            params={
                "business_id": f"eq.{business['id']}",
                "select": "name,duration_minutes,price",
            },
        )
        services = svc_resp.json() if svc_resp.status_code == 200 else []

        business["services"] = services
        return business


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
