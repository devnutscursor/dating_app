# MemberDate (monorepo layout)

- **Frontend:** `app/` — Vite + React + TypeScript (`app/README.md`).
- **Backend:** `server/` — Express + MongoDB (`dating_app` on `mongodb://127.0.0.1:27017`) — see `server/README.md`.
- **Backend plan & API mapping:** [`BACKEND_PLAN.md`](./BACKEND_PLAN.md).

### Quick start (local)

1. Start MongoDB on port **27017**.
2. `cd server && cp .env.example .env && npm install && npm run seed && npm run dev`
3. `cd app && npm install && npm run dev` — the app proxies `/api` to `http://localhost:5001`.

Sign in with seeded accounts (see `server/README.md`), e.g. `kevin@memberdate.com` / `password123` (male) or `ariana@memberdate.com` / `password123` (female).
