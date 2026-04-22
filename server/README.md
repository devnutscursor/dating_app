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

### Development (no SMTP account)

With **no** `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS`, the API uses **[Ethereal Email](https://ethereal.email/)** (built into Nodemailer): it sends a real test message and prints a **preview URL** in the server terminal — open that link in a browser to read the verification email. Set `DISABLE_ETHEREAL_FALLBACK=true` in `.env` if you prefer only logging the code to the console.

### Free / cheap SMTP for manual testing

You can instead point `.env` at a real provider, for example:

- **[Mailtrap](https://mailtrap.io/)** — under **Email Testing → Integrations → SMTP**, copy **host**, **port**, **user**, and **password**. Prefer **`2525`** or **`587`** with `SMTP_SECURE=false`. **Avoid port `25`** on home networks; many ISPs block it, which can cause long hangs or failed sends. The server sets `requireTLS` automatically for `*.mailtrap.io` hosts.
- **[Resend](https://resend.com/)** / **[Brevo](https://www.brevo.com/)** / **[SendGrid](https://sendgrid.com/)** — free tiers with SMTP relay (use their docs for host, port, and API key as password).
- **Gmail** — possible with an [App Password](https://support.google.com/accounts/answer/185833) on a Google account (stricter limits; not ideal for production).

If `SMTP_HOST`, `SMTP_USER`, and `SMTP_PASS` are set but sending fails, the error is **logged** and registration still succeeds; in **non-production** the code is also printed when SMTP send fails. Leave SMTP empty to use Ethereal in dev.

### “Empty response” in the browser Network tab

That usually means the **browser never got JSON from this API** — for example the Vite dev server could not reach the backend (`ECONNREFUSED` on the proxy target). Confirm the API is running on **`http://localhost:5001`** (see terminal: `API listening on …`) and that `app/vite.config.ts` proxies `/api` to that port. A successful error still returns JSON like `{ "error": "…" }`.

## Images and videos

Profile pictures, photo gallery entries, and videos are stored as **URLs on the `User` document** in MongoDB (`profilePicture`, `photos[].url`, `videos[].url`, thumbnails). The seed script uses public placeholder URLs (for example Unsplash). There is **no file server in this repo** yet.

For production, upload files to **Cloudinary** (or another object store), then save the returned HTTPS URLs on the user record—or add an upload endpoint that returns those URLs after uploading to Cloudinary. See `CLOUDINARY_URL` in `.env.example` for a typical env hint.

With `CLOUDINARY_URL` set, authenticated clients can upload media via **`POST /api/uploads/image`** and **`POST /api/uploads/video`** (multipart field name **`file`**). Responses include `{ url, ... }` to store on the user with **`PATCH /api/users/me`** (`profilePicture`, `photos`, or `videos`).
