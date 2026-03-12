import asyncio
import os
import uuid

import httpx
from twilio.twiml.voice_response import VoiceResponse

from config import BASE_URL, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN
from services.speech_to_text_service import transcribe_audio
from services.ai_service import get_ai_response, generate_summary
from services.text_to_speech_service import synthesize_speech
from services.call_storage_service import (
    get_business_context,
    insert_call,
    update_call,
)

# In-memory state per active call (keyed by Twilio CallSid)
_active_calls: dict[str, dict] = {}


async def _download_recording(recording_url: str, retries: int = 3) -> bytes:
    """Download the WAV recording from Twilio with retry for availability lag."""
    url = f"{recording_url}.wav"
    async with httpx.AsyncClient(follow_redirects=True) as client:
        for attempt in range(retries):
            resp = await client.get(
                url, auth=(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
            )
            if resp.status_code == 200 and len(resp.content) > 100:
                return resp.content
            await asyncio.sleep(1)

    raise RuntimeError(f"Could not download recording after {retries} attempts")


async def process_caller_speech(
    recording_url: str,
    call_sid: str,
    caller_phone: str,
    twilio_number: str,
) -> VoiceResponse:
    """
    Full voice pipeline:
      1. Download caller recording from Twilio
      2. Whisper STT  -> transcript
      3. GPT-4o-mini  -> AI reply text (with business context)
      4. ElevenLabs TTS -> MP3 audio
      5. Save transcript to Supabase
      6. Return TwiML that plays audio and records next turn
    """
    # --- Resolve business context (cached per call) ---
    business = await _get_or_load_business(call_sid, twilio_number)

    # --- 1. Download ---
    audio_data = await _download_recording(recording_url)

    # --- 2. Speech-to-Text ---
    transcript = await transcribe_audio(audio_data)
    print(f"[STT] Caller: {transcript}")

    # --- 3. LLM (with business context) ---
    ai_text = await get_ai_response(transcript, business=business)
    print(f"[LLM] AI: {ai_text}")

    # --- 4. Text-to-Speech ---
    filename = f"{uuid.uuid4()}.mp3"
    filepath = os.path.join("audio", filename)
    await synthesize_speech(ai_text, filepath)

    # --- 5. Save to Supabase ---
    await _save_turn(call_sid, caller_phone, twilio_number, transcript, ai_text)

    # --- 6. TwiML response ---
    audio_url = f"{BASE_URL.rstrip('/')}/audio/{filename}"

    resp = VoiceResponse()
    resp.play(audio_url)

    resp.record(
        action="/twilio/voice/respond",
        max_length=30,
        timeout=3,
        play_beep=False,
        trim="trim-silence",
    )

    resp.say(
        "Obrigado por ligar. Adeus!",
        language="pt-PT",
        voice="Polly.Ines",
    )

    return resp


async def _get_or_load_business(call_sid: str, twilio_number: str) -> dict | None:
    """Return cached business context for this call, or fetch it."""
    if call_sid in _active_calls and "business" in _active_calls[call_sid]:
        return _active_calls[call_sid]["business"]

    business = await get_business_context(twilio_number)
    if business:
        biz_name = business.get("name", "?")
        svc_count = len(business.get("services", []))
        print(f"[CTX] Business loaded: {biz_name} ({svc_count} services)")
    return business


async def _save_turn(
    call_sid: str,
    caller_phone: str,
    twilio_number: str,
    caller_text: str,
    ai_text: str,
) -> None:
    """Accumulate transcript and save/update the call in Supabase."""
    turn = f"Cliente: {caller_text}\nIA: {ai_text}"

    if call_sid not in _active_calls:
        business = await _get_or_load_business(call_sid, twilio_number)
        business_id = business["id"] if business else None

        if not business_id:
            print(f"[DB] Skipping save — no business for {twilio_number}")
            return

        _active_calls[call_sid] = {
            "transcript": turn,
            "db_id": None,
            "business_id": business_id,
            "business": business,
        }

        db_id = await insert_call(business_id, caller_phone, turn)
        _active_calls[call_sid]["db_id"] = db_id
        print(f"[DB] New call saved: {db_id}")
    else:
        _active_calls[call_sid]["transcript"] += f"\n\n{turn}"
        full_transcript = _active_calls[call_sid]["transcript"]
        db_id = _active_calls[call_sid]["db_id"]

        if db_id:
            summary = await generate_summary(full_transcript)
            await update_call(db_id, full_transcript, summary)
            print(f"[DB] Call updated with summary: {summary[:60]}...")


async def finalize_call(call_sid: str) -> None:
    """Generate final summary when call ends and clean up."""
    call_data = _active_calls.pop(call_sid, None)
    if not call_data or not call_data.get("db_id"):
        return

    summary = await generate_summary(call_data["transcript"])
    await update_call(call_data["db_id"], call_data["transcript"], summary)
    print(f"[DB] Call finalized: {summary}")
