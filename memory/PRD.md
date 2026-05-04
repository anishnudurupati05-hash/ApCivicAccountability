# Civic Accountability Platform — PRD

## Original Problem Statement
"Unzip the file and build the webapp for me." — User uploaded `Civic Accountability Platform.zip` (AP Civic Tracker — Andhra Pradesh civic accountability dashboard).

## Architecture
- **Frontend**: Vite 6 + React 18 + TypeScript + Tailwind v4 + MUI + Radix UI + react-router v7. Served on port 3000 via `yarn start` → `vite --host 0.0.0.0 --port 3000`.
- **Data Backend**: Existing remote Supabase Edge Functions (project `meptylhwvcjtaegmjzpr`) — used **as-is** for MLAs, projects, news, promises, budgets, speak-up, compare, tax-area, etc.
- **AI Backend**: Local FastAPI at `/api/ai/chat` — proxies AIChat conversation to **Claude Sonnet 4.5** (`claude-sonnet-4-5-20250929`) via `emergentintegrations` + `EMERGENT_LLM_KEY`. Constituency context (MLA, projects, budget, news, promises) is built client-side and passed as `system_context`.

## What's Implemented (April 2026)
- Vite dev server running with HMR on preview URL
- All 16 pages route correctly (Dashboard, MLA Directory/Detail, Rankings, Promises, Budget, Projects, News, Reports, Compare, SpeakUp, AI Chat, Tax in My Area, Data Sources, Attendance, Assets)
- AI Chat upgraded from OpenAI (server-side, Supabase) → **Claude Sonnet 4.5 (local FastAPI)**
- Backend `/api/ai/chat` and `/api/health` verified working

## Core Requirements (static)
- Real-time civic dashboard for AP's 175 MLAs
- Constituency-aware AI assistant
- Live data from Supabase (preserved untouched)

## Backlog / P1
- Replace remote Supabase with local FastAPI + MongoDB if user wants full self-hosting
- Add `VITE_BACKEND_URL` env handling for cross-origin deployments
- Persist AI chat history in MongoDB
