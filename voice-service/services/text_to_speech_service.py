import httpx
from config import ELEVENLABS_API_KEY

# ElevenLabs multilingual v2 supports PT-PT natively — just send Portuguese text.
# Default voice: "Rachel" (clear, professional female).
# Browse more at https://elevenlabs.io/voice-library
VOICE_ID = "21m00Tcm4TlvDq8ikWAM"

_TTS_URL = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}"


async def synthesize_speech(text: str, output_path: str) -> None:
    """Convert text to an MP3 file using ElevenLabs with multilingual v2."""
    headers = {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
    }

    payload = {
        "text": text,
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.75,
        },
    }

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            _TTS_URL,
            headers=headers,
            json=payload,
            timeout=15.0,
        )
        resp.raise_for_status()

        with open(output_path, "wb") as f:
            f.write(resp.content)
