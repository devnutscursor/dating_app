# MemberDate API (Express + MongoDB)

## Prerequisites

- Node.js 18+
- MongoDB running locally on **port 27017** (database name: `dating_app`)

## Setup

```bash
cd server
cp .env.example .env
# Edit .env if needed — set JWT_SECRET to a long random string
npm install
npm run seed   # optional: creates admin, moderator, and sample users
npm run dev    # development with nodemon
```

API listens on **http://localhost:5001** by default (port **5000** is often taken by macOS AirPlay). Set `PORT` in `.env` to change it. All REST routes are under **`/api`**.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start with file watch |
| `npm start` | Production start |
| `npm run seed` | Seed database (users, chats, sample moderation data) |

## Default seeded logins (after `npm run seed`)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@memberdate.com | password123 |
| Moderator | moderator@memberdate.com | password123 |
| Male user | kevin@memberdate.com | password123 |
| Female user | ariana@memberdate.com | password123 |

## Frontend

From `app/`, set `VITE_API_URL=/api` and use the Vite proxy (see `app/vite.config.ts`) so the browser calls the same origin and Vite forwards `/api` to this server.
