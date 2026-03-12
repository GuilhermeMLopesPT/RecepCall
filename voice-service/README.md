# RecepCall — Voice Pipeline MVP

Proof-of-concept voice call flow: Twilio → Whisper STT → GPT-4o-mini → ElevenLabs TTS (PT-PT) → Twilio.

## Architecture

```
Caller ──► Twilio ──► POST /twilio/voice (greeting + record)
                              │
                    caller speaks...
                              │
                      POST /twilio/voice/respond
                              │
                  ┌───────────┼───────────┐
                  ▼           ▼           ▼
             Download    Whisper STT   GPT-4o-mini
             recording   (OpenAI)      (OpenAI)
                  │           │           │
                  └───────────┼───────────┘
                              ▼
                   ElevenLabs TTS (PT-PT)
                              │
                      <Play> audio back
                      <Record> next turn
```

## Prerequisites

| Service | What you need |
|---------|--------------|
| **Twilio** | Account SID, Auth Token, a phone number |
| **OpenAI** | API key (for Whisper + GPT-4o-mini) |
| **ElevenLabs** | API key (free tier, sign up at elevenlabs.io) |
| **ngrok** | For exposing localhost to Twilio during development |

## Setup

```bash
cd voice-service

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Create .env from template and fill in your keys
copy .env.example .env
```

## Running

```bash
# Start the FastAPI server
uvicorn main:app --reload --port 8000

# In another terminal, start ngrok
ngrok http 8000
```

Copy the ngrok HTTPS URL (e.g. `https://abc123.ngrok-free.app`) and:

1. Set it as `BASE_URL` in your `.env` file
2. Restart the FastAPI server so it picks up the new `BASE_URL`

## Configure Twilio Webhook

1. Go to [Twilio Console → Phone Numbers](https://console.twilio.com/us1/develop/phone-numbers/manage/incoming)
2. Click your phone number
3. Under **Voice Configuration**:
   - Set **"A call comes in"** to **Webhook**
   - URL: `https://your-ngrok-url.ngrok-free.app/twilio/voice`
   - Method: **HTTP POST**
4. Save

Now call your Twilio number — the AI will answer in Portuguese (PT-PT).

## TTS — ElevenLabs with PT-PT

Uses **ElevenLabs** `eleven_multilingual_v2` model which speaks PT-PT natively
when given Portuguese text. Default voice is "Rachel" — you can browse and swap
voices at https://elevenlabs.io/voice-library.

To change the voice, update `VOICE_ID` in `services/text_to_speech_service.py`.

## Project Structure

```
voice-service/
├── main.py                              # FastAPI entry point
├── config.py                            # Environment variables
├── requirements.txt
├── .env.example
├── routes/
│   └── twilio_webhook.py                # POST /twilio/voice endpoints
├── services/
│   ├── speech_to_text_service.py        # OpenAI Whisper
│   ├── ai_service.py                    # GPT-4o-mini
│   ├── text_to_speech_service.py        # ElevenLabs TTS (PT-PT)
│   └── voice_flow_service.py            # Orchestrator
└── audio/                               # Temporary TTS audio files
```
