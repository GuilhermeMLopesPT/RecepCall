# RecepCall

Recepcionista telefónica com IA para negócios portugueses. Atende chamadas, fala em PT-PT, e agenda automaticamente.

## Stack

| Componente | Tecnologia |
|---|---|
| **Frontend** | Next.js 14, Tailwind CSS, Shadcn UI |
| **Auth + DB** | Supabase (PostgreSQL + Auth) |
| **Voice pipeline** | Python / FastAPI |
| **STT** | OpenAI Whisper |
| **LLM** | OpenAI GPT-4o-mini |
| **TTS** | ElevenLabs (eleven_multilingual_v2, PT-PT) |
| **Telefonia** | Twilio |
| **Calendar** | Google Calendar API |

## Pré-requisitos

- **Node.js** 18+ e **npm**
- **Python** 3.11+
- **ngrok** (para desenvolvimento — expõe o servidor local ao Twilio)
- Contas com API keys em: Twilio, OpenAI, ElevenLabs, Supabase, Google Cloud

## Setup completo

### 1. Clone do repositório

```bash
git clone https://github.com/GuilhermeMLopesPT/RecepCall.git
cd RecepCall
```

### 2. Frontend (Next.js)

```bash
npm install
```

Criar o ficheiro `.env.local` na raiz do projeto:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=<url do projeto Supabase>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key do Supabase>
SUPABASE_SERVICE_ROLE_KEY=<service role key do Supabase>

# Google Calendar OAuth
GOOGLE_CLIENT_ID=<client ID do Google Cloud>
GOOGLE_CLIENT_SECRET=<client secret do Google Cloud>
GOOGLE_REDIRECT_URI=http://localhost:3000/api/google/callback
```

**Onde encontrar:**
- **Supabase keys**: [supabase.com/dashboard](https://supabase.com/dashboard) → Settings → API
- **Google OAuth**: [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → Credentials → OAuth 2.0 Client IDs

Correr o frontend:

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

### 3. Base de dados (Supabase)

Correr os scripts SQL no Supabase SQL Editor, **por ordem**:

1. `scripts/001_create_profiles.sql` — tabelas base (businesses, users_business, services, appointments, calls, RLS, auto-create on signup)
2. `scripts/002_add_call_summary.sql` — coluna summary na tabela calls
3. `scripts/003_create_integrations.sql` — tabela integrations (Google Calendar tokens)
4. `scripts/004_add_business_hours.sql` — colunas email + business_hours na tabela businesses

### 4. Voice service (Python/FastAPI)

```bash
cd voice-service

# Criar ambiente virtual
python -m venv venv

# Ativar (Windows)
venv\Scripts\activate

# Ativar (macOS/Linux)
# source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt
```

Criar o ficheiro `.env` dentro de `voice-service/`:

```env
# Twilio
TWILIO_ACCOUNT_SID=<account SID do Twilio>
TWILIO_AUTH_TOKEN=<auth token do Twilio>

# OpenAI (Whisper STT + GPT-4o-mini)
OPENAI_API_KEY=<API key da OpenAI>

# ElevenLabs TTS
ELEVENLABS_API_KEY=<API key do ElevenLabs>

# Supabase (service role para bypass de RLS)
SUPABASE_URL=<url do projeto Supabase>
SUPABASE_SERVICE_KEY=<service role key do Supabase>

# URL pública (ngrok em dev)
BASE_URL=https://<teu-dominio>.ngrok-free.app
```

**Onde encontrar:**
- **Twilio**: [console.twilio.com](https://console.twilio.com) → Account Info (SID + Auth Token)
- **OpenAI**: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- **ElevenLabs**: [elevenlabs.io](https://elevenlabs.io) → Profile → API Key
- **Supabase**: mesmo que o frontend (URL + Service Role Key)

### 5. ngrok (desenvolvimento)

O ngrok é necessário para o Twilio conseguir comunicar com o servidor local.

```bash
# Instalar ngrok: https://ngrok.com/download
# Autenticar (só uma vez):
ngrok config add-authtoken <teu-authtoken>

# Lançar (numa free account, usar o domínio estático):
ngrok http --url=<teu-dominio>.ngrok-free.app 8000
```

O domínio estático pode ser obtido em [dashboard.ngrok.com/domains](https://dashboard.ngrok.com/domains).

### 6. Configurar Twilio Webhook

1. Ir a [Twilio Console → Phone Numbers](https://console.twilio.com/us1/develop/phone-numbers/manage/incoming)
2. Clicar no número de telefone
3. Em **Voice Configuration** → **"A call comes in"**:
   - Webhook: `https://<teu-dominio>.ngrok-free.app/twilio/voice`
   - Método: **HTTP POST**
4. Guardar

### 7. Google Calendar (OAuth consent)

1. [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → OAuth consent screen
2. Adicionar os emails de teste (em modo "Testing" só test users podem autorizar)
3. Ativar a **Google Calendar API** em Library

## Correr tudo

Precisas de **3 terminais**:

```bash
# Terminal 1 — Frontend
npm run dev

# Terminal 2 — Voice service
cd voice-service
venv\Scripts\activate
uvicorn main:app --reload --port 8000

# Terminal 3 — ngrok
ngrok http --url=<teu-dominio>.ngrok-free.app 8000
```

## Estrutura do projeto

```
RecepCall/
├── app/                          # Next.js pages
│   ├── auth/                     # Login, register, callback
│   ├── dashboard/
│   │   ├── page.tsx              # Visão geral
│   │   ├── calls/                # Chamadas
│   │   ├── calendar/             # Agenda (3 vistas)
│   │   ├── config/               # Configurações da empresa + horários
│   │   └── profile/              # Perfil pessoal + integrações
│   └── api/google/               # Google OAuth routes
├── components/
│   ├── ui/                       # Shadcn components
│   └── dashboard/
│       ├── app-sidebar.tsx       # Navegação lateral
│       └── calendar/             # Componentes do calendário
├── lib/
│   ├── supabase/                 # Supabase client + helpers
│   └── google.ts                 # Google OAuth helper
├── scripts/                      # SQL migrations (correr no Supabase)
├── voice-service/                # Python backend
│   ├── main.py                   # FastAPI entry point
│   ├── config.py                 # Environment variables
│   ├── routes/
│   │   └── twilio_webhook.py     # Twilio endpoints
│   └── services/
│       ├── ai_service.py         # GPT-4o-mini (com contexto da empresa)
│       ├── speech_to_text_service.py  # OpenAI Whisper
│       ├── text_to_speech_service.py  # ElevenLabs TTS (PT-PT)
│       ├── voice_flow_service.py      # Orquestrador do pipeline
│       └── call_storage_service.py    # Supabase CRUD
└── .env.local                    # (não commitado) keys do frontend
```

## Notas importantes

- Os ficheiros `.env` / `.env.local` **nunca** vão para o GitHub — pede as keys ao Guilherme
- O `venv/` é criado localmente, não é commitado
- Após qualquer alteração ao ngrok URL, atualizar o `BASE_URL` no `.env` do voice-service e reiniciar o servidor
- Os scripts SQL devem ser corridos por ordem no Supabase SQL Editor
