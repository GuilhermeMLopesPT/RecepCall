import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from routes.twilio_webhook import router as twilio_router

app = FastAPI(title="RecepCall Voice Service")

os.makedirs("audio", exist_ok=True)
app.mount("/audio", StaticFiles(directory="audio"), name="audio")

app.include_router(twilio_router, prefix="/twilio")


@app.get("/health")
async def health():
    return {"status": "ok"}
