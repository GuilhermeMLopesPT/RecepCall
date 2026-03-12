import io
from openai import AsyncOpenAI
from config import OPENAI_API_KEY

_client = AsyncOpenAI(api_key=OPENAI_API_KEY)


async def transcribe_audio(audio_bytes: bytes) -> str:
    """Send WAV audio bytes to OpenAI Whisper and return the transcript."""
    buf = io.BytesIO(audio_bytes)
    buf.name = "recording.wav"

    result = await _client.audio.transcriptions.create(
        model="whisper-1",
        file=buf,
        language="pt",
    )
    return result.text
