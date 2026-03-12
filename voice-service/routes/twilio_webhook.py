from fastapi import APIRouter, Request, Response
from twilio.twiml.voice_response import VoiceResponse
from config import BASE_URL
from services.voice_flow_service import process_caller_speech, finalize_call
from services.call_storage_service import get_business_context

router = APIRouter()

DEFAULT_GREETING = "Olá. Obrigado por ligar. Como posso ajudar?"


@router.post("/voice")
async def incoming_call(request: Request):
    """Initial webhook: greet the caller with business-specific greeting."""
    form = await request.form()
    twilio_number = str(form.get("To", ""))

    greeting = DEFAULT_GREETING
    if twilio_number:
        business = await get_business_context(twilio_number)
        if business and business.get("greeting_message"):
            greeting = business["greeting_message"]

    status_url = f"{BASE_URL.rstrip('/')}/twilio/voice/status"

    resp = VoiceResponse()

    resp.say(
        greeting,
        language="pt-PT",
        voice="Polly.Ines",
        status_callback=status_url,
        status_callback_event="completed",
    )

    resp.record(
        action="/twilio/voice/respond",
        max_length=30,
        timeout=3,
        play_beep=False,
        trim="trim-silence",
    )

    resp.say(
        "Não consegui ouvir nada. Obrigado por ligar. Adeus.",
        language="pt-PT",
        voice="Polly.Ines",
    )

    return Response(content=str(resp), media_type="application/xml")


@router.post("/voice/respond")
async def handle_response(request: Request):
    """Process the recording: STT -> LLM -> TTS -> save -> play back."""
    form = await request.form()
    recording_url = str(form.get("RecordingUrl", ""))
    call_sid = str(form.get("CallSid", ""))
    caller_phone = str(form.get("From", ""))
    twilio_number = str(form.get("To", ""))

    twiml = await process_caller_speech(
        recording_url, call_sid, caller_phone, twilio_number
    )
    return Response(content=str(twiml), media_type="application/xml")


@router.post("/voice/status")
async def call_status(request: Request):
    """Called when the call ends — generate final summary."""
    form = await request.form()
    call_sid = str(form.get("CallSid", ""))
    status = str(form.get("CallStatus", ""))

    if status == "completed" and call_sid:
        await finalize_call(call_sid)
        print(f"[CALL] {call_sid} completed and finalized")

    return Response(content="", status_code=200)
