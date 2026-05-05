# Civic Accountability Platform — PRD

## Original Problem Statement
"Unzip the file and build the webapp for me." — user uploaded `Civic Accountability Platform.zip` (AP Civic Tracker — Andhra Pradesh civic accountability dashboard). Subsequent master prompt added Key Office Holders, Tag-a-Minister, and AI proxy fixes.

## Architecture
- **Frontend** — Vite 6 + React 18 + TypeScript + Tailwind v4 + Shadcn / Radix UI + react-router v7 + Recharts + Lucide. Served on port 3000 via `yarn start`.
- **Data backend** — Existing remote Supabase Edge Functions (`https://meptylhwvcjtaegmjzpr.supabase.co/functions/v1/make-server-83920fb2`). Untouched.
- **AI proxy backend** — Local FastAPI at `/app/backend/server.py`:
  - `POST /api/ai/chat`  → `{message, constituency?, history[]}` → `{reply, constituency, session_id}`
  - `POST /api/ai/tax-insight` → `{constituency}` → `{insight, constituency}`
  - Uses **OpenAI `gpt-4o-mini`** via **`emergentintegrations`** + `EMERGENT_LLM_KEY`.
  - Pulls constituency context from Supabase server-side and embeds it in the system prompt.

## Environment
```
/app/frontend/.env
  REACT_APP_BACKEND_URL=https://quick-extract-13.preview.emergentagent.com
  VITE_BACKEND_URL=https://quick-extract-13.preview.emergentagent.com

/app/backend/.env
  MONGO_URL=mongodb://localhost:27017
  DB_NAME=civic_platform
  EMERGENT_LLM_KEY=sk-emergent-2Df5f4eA1717256F71
```

## What's Implemented (May 2026)
- Vite dev server running with HMR on the preview URL (port 3000)
- All 16 pages route correctly
- **AI Chat** rewired to local FastAPI → OpenAI gpt-4o-mini (replaces broken Supabase OpenAI key)
- **TaxInArea** dropdown clipping fixed (overflow moved to inner decorative layer + z-50 + click-outside backdrop) and `aiInsight` overridden by local `/api/ai/tax-insight`
- **Key Office Holders** banner on the Dashboard — CM Naidu (TDP), DCM Pawan Kalyan (JSP), Home Min V. Anitha (TDP), Governor Abdul Nazeer
- **Tag a Minister** strip inside every Speak Up issue card — auto-tags ministers by category, WhatsApp share + Copy card actions
- All interactive elements carry `data-testid`s

## File Layout
```
/app/backend/
  server.py                     ← FastAPI AI proxy
  .env                          ← EMERGENT_LLM_KEY, MONGO_URL, DB_NAME

/app/frontend/
  vite.config.ts                ← host 0.0.0.0:3000, allowedHosts:true, hmr.protocol:wss
  package.json                  ← "start": "vite --host 0.0.0.0 --port 3000"
  src/app/
    components/
      KeyOfficeHolders.tsx      ← NEW
      TagMinister.tsx           ← NEW
    pages/
      Dashboard.tsx             ← imports + renders <KeyOfficeHolders/>
      AIChat.tsx                ← rewired to /api/ai/chat
      TaxInArea.tsx             ← dropdown z-fix + /api/ai/tax-insight wiring
      SpeakUp.tsx               ← imports + renders <TagMinister/> per issue
```

## Backlog / P1
- `/api/leadership` endpoint to back leader/minister maps (no redeploy on cabinet reshuffles)
- Click-through from leader cards → MLA detail page
- PNG accountability cards (canvas/html-to-image) for richer WhatsApp previews
- "View All Ministers" collapsible row under Key Office Holders
- "Tagged Count" leaderboard — weekly ranking of which ministers citizens tag most
- Auto-detect constituency from PIN code on Tax-in-My-Area
- Multi-language AI replies (Telugu/Hindi) by switching the system prompt based on `LanguageContext`
- Persistent conversations (MongoDB) + token streaming
