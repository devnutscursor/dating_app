# MemberDate — Backend implementation plan

This document maps the **existing React frontend** (`app/`) to an **Express + Node.js + MongoDB** API, defines **models**, **controllers**, **routes**, and **auth strategy**, and lists implementation phases. The MongoDB database name is **`dating_app`** (connection: `mongodb://127.0.0.1:27017/dating_app`).

---

## 1. Frontend inventory (what the API must support)

### 1.1 Domain types (`app/src/types/index.ts`)

| Domain | Purpose in UI |
|--------|----------------|
| **User** | Discover, swipes, profiles, chats participant, wallet coins, verification flags, photos/videos |
| **Chat** + **Message** | Man/Woman chat list + `ChatDetail` (`/man/chats/:chatId`, `/woman/chats/:chatId`) |
| **Notification** | Header / activity (can be phase 2) |
| **Transaction** | Admin transactions, user wallet history |
| **Report** | Admin + moderator reports |
| **ContentModerationItem** | Admin content + moderator content review |
| **CoinPack** | Landing + wallet (static JSON acceptable; optional `SiteSettings` later) |
| **Verification** (moderator) | Video verification flow (moderator `Verifications` page) |

### 1.2 Routes (`app/src/App.tsx`)

| Area | Path prefix | Access |
|------|----------------|--------|
| Public | `/`, `/login`, `/register`, `/verify-email`, `/profile-setup`, legal pages | Public |
| Man app | `/man/*` | Authenticated **male** users |
| Woman app | `/woman/*` | Authenticated **female** users |
| Admin | `/admin/*` | Authenticated **admin** |
| Moderator | `/moderator/*` | Authenticated **moderator** |

### 1.3 Auth fields (from `LoginPage` / `RegisterPage`)

- **Register**: `name`, `email`, `password`, `gender` (`male` \| `female`), `birthDate` (derive `age` or store and compute).
- **Login**: `email`, `password`.

---

## 2. Security model

| Measure | Implementation |
|---------|----------------|
| Password storage | **bcrypt** (cost factor 12) |
| Session / API auth | **JWT** access token (HS256), returned in JSON; client stores in `localStorage` key `dating_app_token` (MVP). |
| Transport | **Helmet** + HTTPS in production (documented). |
| Abuse | **express-rate-limit** on `/api/auth/*` |
| CORS | Allow frontend origin + `credentials` if cookies are added later |
| Input | Validate email (validator), password min length 8, required fields on register |

**Future (document only):** httpOnly refresh cookie, email OTP, 2FA, rotate JWT, Redis for sessions.

---

## 3. MongoDB collections (Mongoose models)

### 3.1 `User` (single collection for credentials + profile)

- **Auth**: `email` (unique, lowercase), `password` (select: false), `role`: `male` \| `female` \| `admin` \| `moderator`, `emailVerified` (boolean), `profileSetupComplete` (boolean).
- **Profile** (aligns with `User` interface): `name`, `age`, `gender`, `country`, `city`, `datingGoal`, `aboutMe`, `lookingFor`, `interests[]`, `profilePicture`, `photos[]`, `videos[]`, `coins`, `isVerified`, `isOnline`, `lastActive`.
- **Indexes**: `email`, `gender` + `isOnline` (discover), `role`.

### 3.2 `Chat`

- `participants`: two `ObjectId` refs to `User` (unique pair enforced in app layer for MVP).
- `messages[]`: subdocuments `{ senderId, content, type, isRead, createdAt, mediaUrl?, giftAmount? }`.
- `lastMessage`, `unreadCountByUser`: map `userId -> count` OR derive from messages (MVP: store `unreadCount` on chat for participant other than sender).
- Simpler MVP: `messages` embedded; `lastMessageAt`; unread computed on read.

### 3.3 `Transaction`

- `userId`, `type`, `amount`, `currency`, `description`, `status`, `relatedUserId?`, `createdAt`.

### 3.4 `Report`

- `reporterId`, `reportedId`, `type`, `topic`, `comment`, `status`, `createdAt`, optional moderator fields.

### 3.5 `ContentItem` (moderation queue)

- `userId`, `type` (`photo` \| `video`), `url`, `status`, `submittedAt`, reviewer fields optional.

### 3.6 `VerificationRequest`

- `userId`, `status`, `challengeNumbers`, `videoUrl`, `profilePhotoUrl`, `submittedAt`, reviewer decision.

---

## 4. API surface (REST)

Base URL: **`/api`** (Vite dev proxy forwards `/api` → Express).

### 4.1 Auth (`/api/auth`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/register` | Create user (role from gender); returns `{ user, accessToken }` |
| POST | `/login` | Returns `{ user, accessToken }` |
| GET | `/me` | Current user (Bearer JWT) |
| POST | `/logout` | No-op server-side for JWT MVP (client clears token); placeholder for refresh blacklist |

### 4.2 Users (`/api/users`) — authenticated

| Method | Path | Description |
|--------|------|-------------|
| GET | `/discover` | Opposite-gender users for Discover grid (exclude self) |
| GET | `/:id` | Public-safe profile by id |
| PATCH | `/me` | Update own profile (partial) |

### 4.3 Chats (`/api/chats`) — authenticated

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List chats for current user |
| GET | `/:chatId` | Chat + messages |
| POST | `/` | Body `{ participantId }` — get or create 1:1 chat |
| POST | `/:chatId/messages` | Body `{ content, type? }` — append message |

### 4.4 Admin (`/api/admin`) — `role === 'admin'`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/users` | List users (paging optional) |
| GET | `/transactions` | List transactions |
| GET | `/settings` | Key-value or stub |
| PATCH | `/settings` | Stub accept body (persist later) |

### 4.5 Moderator (`/api/moderator`) — `role === 'moderator'`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/content` | Pending content items |
| GET | `/reports` | Reports list |
| GET | `/verifications` | Verification queue |

---

## 5. Express project layout

```
server/
  package.json
  .env.example
  README.md
  src/
    index.js              # listen()
    app.js                  # express(), middleware, mount routes
    config/db.js
    models/
      User.model.js
      Chat.model.js
      Transaction.model.js
      Report.model.js
      ContentItem.model.js
      VerificationRequest.model.js
    middleware/
      authenticate.js
      authorize.js
    utils/
      jwt.js
      asyncHandler.js
      serializeUser.js
    controllers/
      auth.controller.js
      users.controller.js
      chats.controller.js
      admin.controller.js
      moderator.controller.js
    routes/
      index.js
      auth.routes.js
      users.routes.js
      chats.routes.js
      admin.routes.js
      moderator.routes.js
    scripts/
      seed.js
```

---

## 6. Frontend integration plan

| Task | Files |
|------|--------|
| API base + fetch helper | `app/src/lib/api.ts` |
| Auth state | `app/src/contexts/AuthContext.tsx` |
| Route guards | `app/src/components/ProtectedRoute.tsx` |
| Wire router | `app/src/App.tsx` — wrap routes with `ProtectedRoute` + roles |
| Login / Register | `LoginPage.tsx`, `RegisterPage.tsx` — call API, `navigate` by `user.role` |
| Vite proxy | `app/vite.config.ts` — `server.proxy['/api']` → `http://localhost:5001` |
| Env | `app/.env.example` — `VITE_API_URL=/api` |

---

## 7. Phases (execution order)

1. **Plan** — This file (`BACKEND_PLAN.md`).
2. **Server scaffold** — `package.json`, `app.js`, `index.js`, `.env.example`, connect Mongoose to `dating_app`.
3. **User model + auth** — register, login, JWT, `GET /me`, middleware.
4. **Users + chats** — discover, profile, chat CRUD for real chat IDs.
5. **Admin + moderator** — role-gated list endpoints + seed admin/moderator users.
6. **Seed script** — sample male/female users + chats matching frontend expectations.
7. **Frontend** — AuthContext, ProtectedRoute, API calls, Vite proxy, adjust `App` chat redirect to use first chat from API when logged in (optional: keep mock fallback if no token).

---

## 8. Environment variables (server)

| Variable | Example | Purpose |
|----------|---------|---------|
| `PORT` | `5001` | HTTP port (avoid 5000 on macOS — AirPlay uses it) |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/dating_app` | MongoDB |
| `JWT_SECRET` | long random string | Sign access tokens |
| `JWT_EXPIRES_IN` | `7d` | Access token TTL |
| `CLIENT_ORIGIN` | `http://localhost:5173` | CORS |

---

## 9. Done criteria

- [x] Plan committed as `BACKEND_PLAN.md`
- [x] `npm install` in `server/` and `npm run dev` starts API on `5001` by default (see `server/README.md`)
- [x] MongoDB `dating_app` receives collections on first write / `npm run seed`
- [x] Register + login return JWT; `GET /api/auth/me` works with `Authorization: Bearer <token>`
- [x] Role-based routes enforced on server (`authenticate` + `authorize`)
- [x] Frontend: `AuthProvider`, `ProtectedRoute`, Vite `/api` proxy, login/register, chat detail + default chat redirect wired to API

### Implemented code locations

| Layer | Path |
|-------|------|
| API entry | `server/src/index.js`, `server/src/app.js` |
| Models | `server/src/models/*.model.js` |
| Routes | `server/src/routes/*.routes.js` |
| Controllers | `server/src/controllers/*.controller.js` |
| Frontend API | `app/src/lib/api.ts` |
| Frontend auth | `app/src/contexts/AuthContext.tsx`, `app/src/components/ProtectedRoute.tsx` |
| Chat wiring | `app/src/pages/man/ChatDetail.tsx`, `app/src/pages/woman/ChatDetail.tsx`, `app/src/components/DefaultChatRedirect.tsx` |
