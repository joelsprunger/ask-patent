# Local Setup Guide

## Quick Start

### 1. Backend (ask-patent-api)

```bash
cd ask-patent-api
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Edit `.env` with your credentials (see below), then:

```bash
python -m app.main
```

API runs at [http://localhost:8000](http://localhost:8000). Health check: [http://localhost:8000/v1/patent-tools/health](http://localhost:8000/v1/patent-tools/health)

### 2. Frontend (ask-patent)

```bash
cd ask-patent
npm install
npm run dev
```

Frontend runs at [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

### Backend (ask-patent-api/.env)

| Variable         | Description                                      |
| ---------------- | ------------------------------------------------ |
| `SUPABASE_URL`   | Supabase project URL (e.g. `https://xxx.supabase.co`) |
| `SUPABASE_KEY`   | Supabase **service role** key                    |
| `OPENAI_API_KEY` | OpenAI API key                                   |
| `DB_USER`        | Postgres user (from Supabase: `postgres.[project-ref]`) |
| `DB_PASSWORD`     | Postgres password (Supabase Project Settings → Database) |

### Frontend (ask-patent/.env.local)

| Variable                        | Description                              |
| ------------------------------- | --------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL                     |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key                        |
| `OPENAI_API_KEY`                | OpenAI API key                           |
| `NEXT_PUBLIC_API_URL`           | Backend URL: `http://localhost:8000`     |
| `NEXT_PUBLIC_API_PREFIX`        | API prefix: `/v1/patent-tools`           |
| `NEXT_PUBLIC_BACKEND_API_URL`   | Same as `NEXT_PUBLIC_API_URL`            |

---

## Verification

1. Backend health: `curl http://localhost:8000/v1/patent-tools/health`
2. Open http://localhost:3000 and sign in
3. Try search, patent detail, summarize, and chat
