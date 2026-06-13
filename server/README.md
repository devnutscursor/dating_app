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

**Socket.IO** shares the same port at path **`/socket.io/`** (JWT in `handshake.auth.token`). In local dev, Vite proxies `/socket.io` to this server. Set **`CLIENT_ORIGIN`** in `.env` to your SPA URL (e.g. `http://localhost:5173`) so the socket CORS handshake succeeds.

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

## Email verification

Registration sets `emailVerified: false` and emails a 6-digit code (valid 15 minutes).

### Production (Render / Vercel) — Resend API (recommended)

Render **free** tier blocks outbound SMTP ports (`587`, `465`, `25`). Use **Resend** over HTTPS instead:

1. Create an API key at [resend.com/api-keys](https://resend.com/api-keys).
2. In `.env` / Render env vars:

```env
RESEND_API_KEY=re_your_real_key_here
RESEND_FROM="MemberDate <onboarding@resend.dev>"
```

Replace `re_xxxxxxxxx` with your real key. For quick tests, `onboarding@resend.dev` only delivers to the email on your Resend account. For real users, verify a domain at [resend.com/domains](https://resend.com/domains) and set `RESEND_FROM` to e.g. `MemberDate <noreply@yourdomain.com>`.

Resend is tried **first**; if it fails and `SMTP_*` is set, SMTP is used as fallback.

### Development (no Resend / SMTP)

With **no** `RESEND_API_KEY` or `SMTP_*`, the API uses **[Ethereal Email](https://ethereal.email/)** and prints a **preview URL** in the server terminal. Set `DISABLE_ETHEREAL_FALLBACK=true` to only log the code to the console.

### Optional SMTP (local / Mailtrap / Gmail)

- **[Mailtrap](https://mailtrap.io/)** — sandbox SMTP for local testing.
- **Gmail** — App Password; works locally; often **timeouts on Render** even when paid.

If sending fails, the error is **logged** and registration still succeeds.

### “Empty response” in the browser Network tab

That usually means the **browser never got JSON from this API** — for example the Vite dev server could not reach the backend (`ECONNREFUSED` on the proxy target). Confirm the API is running on **`http://localhost:5001`** (see terminal: `API listening on …`) and that `app/vite.config.ts` proxies `/api` to that port. A successful error still returns JSON like `{ "error": "…" }`.

## Images and videos

Profile pictures, photo gallery entries, and videos are stored as **URLs on the `User` document** in MongoDB (`profilePicture`, `photos[].url`, `videos[].url`, thumbnails). The seed script uses public placeholder URLs (for example Unsplash). There is **no file server in this repo** yet.

For production, upload files to **Cloudinary** (or another object store), then save the returned HTTPS URLs on the user record—or add an upload endpoint that returns those URLs after uploading to Cloudinary. See `CLOUDINARY_URL` in `.env.example` for a typical env hint.

With `CLOUDINARY_URL` set, authenticated clients can upload media via **`POST /api/uploads/image`** and **`POST /api/uploads/video`** (multipart field name **`file`**). Responses include `{ url, ... }` to store on the user with **`PATCH /api/users/me`** (`profilePicture`, `photos`, or `videos`).
