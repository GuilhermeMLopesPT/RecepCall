from openai import AsyncOpenAI
from config import OPENAI_API_KEY

_client = AsyncOpenAI(api_key=OPENAI_API_KEY)

SYSTEM_PROMPT = (
    "És uma recepcionista telefónica simpática e profissional de um negócio.\n"
    "Respondes sempre em Português de Portugal (PT-PT).\n"
    "Sê breve e útil. Mantém as respostas curtas e naturais para uma conversa telefónica.\n"
    "Se o cliente quiser marcar uma consulta, diz que de momento não é possível "
    "agendar automaticamente mas que alguém vai retornar a chamada."
)


async def get_ai_response(user_text: str) -> str:
    """Send the caller transcript to GPT-4o-mini and get a short reply."""
    response = await _client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_text},
        ],
        max_tokens=150,
        temperature=0.7,
    )
    return response.choices[0].message.content or "Desculpe, não consegui compreender."


async def generate_summary(transcript: str) -> str:
    """Generate a short PT-PT summary of the full call transcript."""
    response = await _client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": (
                    "Faz um resumo muito breve (2-3 frases) desta chamada telefónica. "
                    "Escreve em Português de Portugal. "
                    "Inclui: o que o cliente queria e o resultado da chamada."
                ),
            },
            {"role": "user", "content": transcript},
        ],
        max_tokens=100,
        temperature=0.3,
    )
    return response.choices[0].message.content or ""
