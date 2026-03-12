from openai import AsyncOpenAI
from config import OPENAI_API_KEY

_client = AsyncOpenAI(api_key=OPENAI_API_KEY)

_DAY_NAMES = {
    "monday": "Segunda-feira",
    "tuesday": "Terça-feira",
    "wednesday": "Quarta-feira",
    "thursday": "Quinta-feira",
    "friday": "Sexta-feira",
    "saturday": "Sábado",
    "sunday": "Domingo",
}


def build_system_prompt(business: dict | None) -> str:
    """Build a system prompt enriched with the business context."""
    if not business:
        return (
            "És uma recepcionista telefónica simpática e profissional.\n"
            "Respondes sempre em Português de Portugal (PT-PT).\n"
            "Sê breve e útil. Mantém as respostas curtas e naturais para uma conversa telefónica."
        )

    name = business.get("name", "a empresa")
    parts = [
        f"És a recepcionista telefónica virtual da empresa \"{name}\".",
        "Respondes sempre em Português de Portugal (PT-PT).",
        "Sê breve, simpática e profissional. Mantém as respostas curtas e naturais para uma chamada telefónica.",
    ]

    # Business hours
    bh = business.get("business_hours")
    if bh and isinstance(bh, dict):
        lines = []
        for key, label in _DAY_NAMES.items():
            day = bh.get(key)
            if not day:
                continue
            if day.get("open"):
                lines.append(f"  {label}: {day['start']} – {day['end']}")
            else:
                lines.append(f"  {label}: Encerrado")
        if lines:
            parts.append("\nHorário de funcionamento:")
            parts.extend(lines)
            parts.append(
                "Se o cliente perguntar sobre horários, usa esta informação. "
                "Não marques nada fora deste horário."
            )

    # Services
    services = business.get("services", [])
    if services:
        svc_lines = []
        for s in services:
            price = s.get("price")
            dur = s.get("duration_minutes")
            desc = s["name"]
            if dur:
                desc += f" ({dur} min"
                if price:
                    desc += f", {float(price):.2f}€"
                desc += ")"
            elif price:
                desc += f" ({float(price):.2f}€)"
            svc_lines.append(f"  - {desc}")
        parts.append("\nServiços disponíveis:")
        parts.extend(svc_lines)

    parts.append(
        "\nSe o cliente quiser marcar uma consulta ou serviço, confirma o serviço, "
        "a data e hora pretendida, e diz que vais registar o pedido. "
        "Não inventes informação que não tenhas."
    )

    return "\n".join(parts)


async def get_ai_response(user_text: str, business: dict | None = None) -> str:
    """Send the caller transcript to GPT-4o-mini and get a short reply."""
    system_prompt = build_system_prompt(business)

    response = await _client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
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
