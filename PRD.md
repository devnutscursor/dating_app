# Dating Platform PRD

## Document Info

- Project: Coin-based dating platform
- Backend requirement: Node.js
- Frontend requirement: Must follow client-provided Canva designs
- Design inputs: Client has shared Canva files for main pages, male flow, female flow, admin panel, moderator panel, and mobile layouts
- Primary goal of this document: Give an AI coding agent enough detail to plan, implement, and validate the full product without relying on scattered chat history

## 1. Product Summary

Build a dating platform with separate experiences for men and women, an internal coin economy, crypto payments via Cryptomus, paid premium content, paid 1:1 video chat, free chat by default, and an admin/moderation system with full oversight over users, chats, media, transactions, and payout activity.

The frontend must closely follow the provided Canva designs for:

- Main/register flow
- Male user web app
- Female user web app
- Admin panel
- Moderator panel
- Mobile responsive layouts

This platform is not a generic social network. It is a role-based dating product with monetization centered around:

- coin deposits by male users
- premium media unlocks
- tips/gifts
- paid video calls
- optional paid messaging that can be enabled later by admin

## 2. Core Product Vision

The platform should:

- allow men to discover women and engage quickly with low friction
- allow women to message first and attract men into chat
- monetize premium interactions instead of forcing paid messaging at launch
- give admins and moderators strong visibility into user behavior, chats, media, payouts, fraud, and abuse
- support future scaling and operational control

## 3. In-Scope Features

### 3.1 Public / Guest Experience

- Landing page / registration page
- Multi-step registration
- Login
- Site rules page
- Basic marketing presentation
- Hover and animation behavior that matches design intent

### 3.2 Authenticated User Experience

- Role-based experience for men and women
- Home/feed/dashboard
- Search and filtering
- Profiles
- Likes and match flow
- Real-time chat
- Notifications
- Wallet / coins / transactions
- Media gallery
- Paid content unlocks
- Tips/gifts
- Support chat
- Video call flow

### 3.3 Admin / Moderator Experience

- Admin panel
- Moderator panel
- User management
- Profile moderation
- Media moderation
- Chat review / monitoring
- Transaction review
- Withdrawal request review
- Refund request handling
- Abuse / block / report management
- Monetization and feature configuration

### 3.4 Platform Systems

- Coin ledger
- Payment integration with Cryptomus
- Real-time chat infrastructure
- Real-time notifications
- Video call infrastructure
- Security and anti-fraud features
- Audit logs
- Mobile responsive implementation

## 4. Out of Scope For Initial Build Unless Explicitly Added Later

- Native iOS/Android apps
- Multi-party group video
- Live streaming to audiences
- AI matchmaking/recommendation engine
- Advanced BI warehouse / heavy analytics platform
- Multi-language localization beyond English unless later requested

## 5. User Roles

## 5.1 Guest

- Can view landing/register/login/rules pages
- Cannot access user content, chat, or member-only areas

## 5.2 Male User

- Registers and completes profile
- Browses women profiles
- Uses search and filters
- Chats with women
- Sends likes
- Receives matches
- Buys coins through Cryptomus
- Unlocks paid photos/videos
- Sends tips/gifts
- Initiates video calls
- Pays per-minute during video calls
- Views wallet, transactions, and usage history

## 5.3 Female User

- Registers and completes profile
- Can message men first
- Can receive chats and video calls
- Cannot initiate video call to a man
- Manages own profile and gallery
- Uploads free and paid media
- Sends chat media for moderation before it becomes purchasable in chat
- Earns coins from eligible paid actions by men
- Views earnings, transactions, wallet address, referral link, and withdrawal requests
- Can edit media pricing where applicable

## 5.4 Moderator

- Reviews reported users/content
- Reviews media moderation queue
- Reviews chat conversations for policy violations
- Can block/suspend/hide content based on permissions
- Has narrower permissions than admin

## 5.5 Admin

- Full system visibility and control
- Can view all chats and content
- Can manage users, moderators, and platform configuration
- Can review payments, coin transfers, withdrawals, refunds, and fraud flags
- Can configure monetization switches such as paid messaging
- Can review operational dashboards and logs

## 5.6 Support Agent

This can be a separate role or a restricted admin/moderator permission set.

- Handles support conversations
- Reviews refund requests
- Assists users with payment or account issues

## 6. Business Model

The monetization model is hybrid:

- chat messages are free by default at launch
- paid messaging must still exist in the system as an admin-configurable feature toggle
- premium photos/videos cost coins
- video calls cost coins per minute
- tips/gifts cost coins
- men buy coins using crypto only through Cryptomus

### 6.1 Important Rule About Trial Coins

The platform may grant free trial/promotional coins to male users.

Critical rule:

- if a male user spends trial coins, those coins must **not** become withdrawable earnings for the female user
- trial coin usage may unlock content or actions for the male user, but it must be tracked as promotional platform spend, not real female earnings

This rule must be enforced at ledger/accounting level, not just UI level.

## 7. Coin and Ledger Model

The system should not rely on one simple balance number. It should track balances by source and destination so accounting is correct.

Recommended wallet model:

- `paid_coins_balance`: coins purchased by the user
- `trial_coins_balance`: free/promotional coins
- `earned_coins_balance`: coins earned by a female user from eligible paid actions
- `pending_earned_coins_balance`: optional holding bucket before withdrawal approval or fraud review

Every balance change must create an immutable ledger entry.

Each ledger entry should store:

- unique id
- user id
- related counterparty user id if applicable
- transaction type
- amount
- source bucket
- destination bucket
- source event id
- payment provider reference if applicable
- status
- metadata JSON
- created at

Suggested transaction types:

- signup_bonus
- trial_coin_grant
- deposit_pending
- deposit_confirmed
- deposit_failed
- content_unlock
- chat_media_unlock
- paid_message_charge
- video_call_charge
- video_call_earning
- tip_sent
- tip_received
- refund
- admin_adjustment
- withdrawal_requested
- withdrawal_approved
- withdrawal_rejected
- withdrawal_paid

### 7.1 Spend Priority

Use a configurable spend strategy. Recommended default:

- spend `trial_coins_balance` before `paid_coins_balance`

Reason:

- promotional coins are consumed first
- the system can cleanly prevent trial-origin spend from becoming female earnings

### 7.2 Female Earnings Rule

Female users only receive earnings from eligible male spend that originates from real paid coins, not from trial coins.

Examples:

- If a male unlocks paid media using paid coins, the female receives earnings.
- If a male unlocks paid media using only trial coins, the female does not receive withdrawable earnings.
- If a transaction uses mixed sources, the system must split the accounting proportionally or by bucket order.

## 8. Primary User Flows

## 8.1 Guest to Registered User

1. Guest lands on the main page.
2. User starts registration.
3. User completes multi-step onboarding fields.
4. UI enables the next step only when required inputs are valid.
5. User selects role/profile intent according to design.
6. Account is created.
7. User lands in the authenticated app.

## 8.2 Male Discovery to Monetization Flow

1. Male logs in.
2. Male browses home/feed/search.
3. Male opens female profile.
4. Male can:
   - like profile
   - start chat
   - unlock premium media
   - send tip
   - initiate video call
5. If balance is insufficient, system routes him to coin purchase page.
6. Purchase completes through Cryptomus.
7. Coins are credited after payment confirmation.

## 8.3 Female Attraction Flow

1. Female logs in.
2. Female browses or receives incoming chats.
3. Female can message men first.
4. Female can upload or manage content.
5. Female can send paid media into chat via moderation flow.
6. Female receives earnings from eligible paid actions.
7. Female requests withdrawal when allowed.

## 8.4 Like and Match Flow

1. A user likes another user.
2. Notification appears in the right-side activity area.
3. If both users like each other, create a match.
4. A chat thread becomes available immediately.

## 8.5 Paid Content Unlock Flow

1. Male opens a female profile or chat media item.
2. Paid content shows price.
3. Male chooses unlock.
4. System checks balance.
5. Coins are deducted.
6. Content is unlocked for that male user.
7. Female earnings are created only from eligible paid-coin spend.

## 8.6 Video Call Flow

1. Male opens chat/profile and chooses video call.
2. System shows warning that coins will be deducted.
3. Male confirms start.
4. Female receives incoming call screen with accept/reject actions.
5. If accepted, call starts.
6. Coins are charged per minute or by time slice.
7. During call:
   - show connection quality indicators
   - allow tip/gift actions if designed
   - allow pin profile
   - allow mute/unmute mic
   - allow camera on/off
   - allow report action
8. Call ends.
9. System shows post-call summary with coins spent/earned and gifts sent.

Important role restriction:

- women cannot initiate the video call to men

## 8.7 Support / Refund Flow

1. User contacts support.
2. Support/admin receives conversation or notification.
3. If refund is requested, create refund request record.
4. Admin/support reviews payment, usage, and abuse signals.
5. Admin approves or rejects refund.
6. User is notified.

## 9. Functional Requirements

## 9.1 Authentication and Accounts

- Email/password auth is minimum requirement
- Social auth is optional and not required unless later requested
- Registration must support male and female role selection
- Secure login, logout, password reset, email verification if used
- Session management with secure tokens/cookies
- Admin and moderator accounts must be separate roles with stricter access control

## 9.2 Onboarding / Registration UI Rules

Based on design notes:

- buttons such as "Next Step" turn active/green only when required fields are completed
- selected options like "I am" and "I am looking for" must be visibly highlighted
- hobbies/interests must be selected from predefined categories, not free text creation
- registration must support design-driven multi-step flow

## 9.3 Landing Page / Main Page Behaviors

- hover states on buttons
- recently verified photo row should have dimmed sides
- photos in that row should rotate like a carousel
- interactions should remain close to design intent while keeping performance reasonable

## 9.4 Home / Feed

- user lands here after auth
- clicking site logo/name returns to this page
- global topbar includes notifications and profile entry
- search by name or ID
- right sidebar shows activity and likes
- activity items can link to relevant profile/content
- profile cards may cycle cover photos on hover with a delay
- country flag should reflect selected country in profile

## 9.5 Left Sidebar Navigation

- most sidebar icons are collapsed by default
- label text appears on hover only
- support/assistant icon opens support chat

## 9.6 Notifications

- notification center available from top bell/dropdown
- unread/new notifications show distinct marker
- notification click opens relevant detail
- support transactional, social, moderation, and refund-related notifications

Suggested notification types:

- like_received
- match_created
- message_received
- paid_content_unlocked
- tip_received
- deposit_confirmed
- withdrawal_status_changed
- support_reply
- refund_update
- moderation_update

## 9.7 Search and Filters

- search by name or ID
- filter panel must match design
- dating goal filter exists where applicable
- filter criteria should be configurable and extensible

Potential search/filter fields:

- age range
- country
- city/region if applicable
- online status
- interests/hobbies
- dating goal
- profile verification/status if applicable

## 9.8 Profiles

### Female Profile Viewed by Male

- profile hero and gallery
- free and paid media
- unlock flow for paid media
- like button
- message/chat entry
- video call entry
- send coins/tip entry

### Male Profile Viewed by Female

- male gallery should be free for women
- profile info and gallery
- like and chat actions where applicable

### Self Profile Editing

- users can edit bio, interests, hobbies, gallery, country, and other profile fields
- female users can add free and paid photos/videos
- female gallery management includes editing prices for eligible media

## 9.9 Media and Gallery Rules

There are multiple media contexts and they should be modeled separately.

### A. Profile Gallery Media

- Female can upload media to profile gallery
- Media visibility types:
  - free
  - paid
- For paid profile media, female can set price
- Male can unlock paid items with coins

### B. Chat Media

- Female can attach photo/video to chat
- Before becoming purchasable chat media, it goes through moderation workflow
- Male unlock price for chat media is fixed:
  - photo: 10 coins
  - video: 50 coins

### C. Media Management

- Female can later manage gallery content and adjust price where design allows
- System should keep moderation status on every media item

Recommended media statuses:

- draft
- pending_moderation
- approved
- rejected
- archived

## 9.10 Chat

- Real-time 1:1 chat
- Left column lists conversations
- Pinned profiles appear at the top
- Show unread state
- Main pane shows active conversation
- Input supports:
  - text
  - emoji
  - photo/video attachment
- Enter key can send message
- Send arrow can send message
- Top conversation bar includes:
  - profile photo
  - name
  - age
  - pin action
  - go to profile
  - video chat
  - block account

### Paid Messaging Requirement

Messages are free at launch.

However, the system must support paid messaging as a configurable admin feature:

- admin can enable/disable paid messaging globally
- admin can set pricing/rules later
- UI and backend should be architected so this can be switched on without major refactor

At launch:

- default setting: free text chat

## 9.11 Likes and Matches

- Standard swipe/like style interaction is acceptable where represented by design
- If both users like each other, create match and unlock chat
- Notifications appear in activity area/sidebar

## 9.12 Tips / Gifts

- Men can send coins to women as gifts/tips
- This action must be available from:
  - chat
  - female profile
  - video call flow if designed
- Gift modal should support:
  - quick select preset amounts
  - manual amount entry
  - optional short message

Accounting rule:

- Tips funded by paid coins create female earnings
- Tips funded by trial coins do not create withdrawable female earnings

## 9.13 Wallet and Payments

### Male Wallet

- Displays current balance
- Shows transaction history
- Can buy coin packages
- Coin packages are shown as three predefined options in design
- Payment provider is Cryptomus only

### Payment Flow

1. Male selects package.
2. System creates payment intent/order with Cryptomus.
3. User is redirected or shown payment details per Cryptomus flow.
4. Payment webhook/status callback confirms payment.
5. Coins are credited after successful confirmation.
6. Transaction appears in wallet history.

Requirements:

- idempotent webhook handling
- pending/confirmed/failed payment states
- anti-duplicate crediting protection

## 9.14 Female Earnings, Wallet, and Withdrawals

Female dashboard must support:

- display of earnings summary
- wallet address display/edit if permitted
- withdrawal request entry point
- referral link copy action
- transaction filter

Top informational cards in design may be display-only except for specific actions identified by the client.

Withdrawal flow:

1. Female enters or confirms payout wallet address.
2. Female requests withdrawal.
3. System validates minimum threshold and available eligible balance.
4. Admin reviews request.
5. Admin approves/rejects/marks paid.
6. Female receives status notification.

Open business detail to confirm with client:

- exact payout conversion model between platform coins and crypto payout value

Until confirmed, implement admin-configurable payout rules.

## 9.15 Video Chat

This is a core paid feature and must be treated as production-grade.

Requirements:

- 1:1 video calling only
- male initiates call
- female receives incoming call modal
- female can accept/reject
- coin charging by minute or smaller billing interval
- live call controls:
  - camera on/off
  - microphone on/off
  - report/block path
  - end call
  - pin profile
- disabled mic/video buttons should turn red and show crossed/disabled state
- show connection quality indicators for both participants
- show post-call earnings/spend summary

UI rule from client:

- women should not be able to resize their own video image

Operational requirements:

- track call start/end timestamps
- track billable duration
- handle insufficient balance during active call
- define policy for call auto-end when balance runs out
- log call records for admin review

Recommended default behavior:

- pre-check minimum balance before call
- charge in small intervals
- auto-end call gracefully when funds are depleted

## 9.16 Block and Report

- User can block another user
- User can report another user
- UI allows selecting one or both in some flows
- Some report flows require selecting report type and entering comment
- "Next Step" button is enabled only after valid selection/input per design

Admin/moderator side must support:

- viewing reports
- reviewing evidence
- applying action
- tracking resolution status

## 9.17 Support Chat

- Users can open support chat from assistant/help icon
- Support/admin can reply
- Support chat should persist history
- Refund issues can be initiated from here or related notifications

## 9.18 Rules Page

- Dedicated page for site rules/policies
- Accessible pre-login and/or post-login depending on design/navigation

## 9.19 Referral Link

Design shows a referral link copy action in female area.

Minimum implementation:

- unique referral link per eligible user
- copy button
- track referred signups

Open business rule to confirm:

- whether referrals produce coin bonuses, earnings, or only statistics

Implement referral tracking foundation even if payout rules are delayed.

## 10. Admin Panel Requirements

The admin panel is included in core scope.

Admin capabilities should include:

- dashboard overview
- user list with filters
- male/female/admin/moderator role management
- profile approval/suspension/block
- chat visibility across users
- transaction history review
- payment/deposit review
- withdrawal request review
- refund request review
- media moderation
- reports/abuse review
- support conversation oversight
- feature flag / monetization configuration

Suggested admin modules:

- Dashboard
- Users
- Profiles
- Chats
- Media Moderation
- Transactions
- Deposits
- Withdrawals
- Refunds
- Reports
- Support
- Settings
- Audit Logs

## 11. Moderator Panel Requirements

The moderator panel is a reduced operational interface.

Moderator permissions may include:

- review profiles/media
- review reports
- review chats for violations
- warn/block/suspend users within limits
- escalate serious issues to admin

Moderator should not have unrestricted access to financial configuration unless explicitly granted.

## 12. Security and Anti-Fraud Requirements

Security is part of the requested scope.

## 12.1 Baseline Security

- secure password hashing
- secure auth/session handling
- CSRF/XSS/SQL injection protections
- rate limiting
- file upload validation
- role-based access control
- audit logs for admin actions
- secret management for API keys and webhook secrets
- HTTPS in production

## 12.2 Payment and Ledger Security

- idempotent Cryptomus webhook processing
- signed webhook verification
- duplicate transaction detection
- immutable ledger records
- admin-only manual adjustments with audit trail

## 12.3 Anti-Fraud / Abuse

- unusual deposit/use pattern monitoring
- unusual withdrawal pattern monitoring
- suspicious tipping or self-dealing detection
- multi-account / abuse signal tracking where possible
- support for temporary holds on earnings or withdrawals
- media moderation queue
- report/block system
- admin visibility into chats

## 12.4 Video / Chat Safety

- call/session logging metadata
- abuse report actions during or after interaction
- ability for admin to inspect conversation history

## 13. Non-Functional Requirements

## 13.1 Performance

- app should feel responsive on desktop and mobile
- chat and notification delivery should be near real-time
- image/media loading should be optimized

## 13.2 Scalability

The product should be architected to scale to thousands of users over time even if initial launch traffic is lower.

Minimum scalability expectations:

- stateless app servers where possible
- background job processing
- websocket/event infrastructure that can scale
- cache layer where useful
- object storage for media instead of local disk

## 13.3 Reliability

- webhook retry safety
- retryable background jobs
- graceful handling of failed uploads/payments/calls
- transactional consistency for coin deductions and earnings

## 13.4 Auditability

- important state changes should be traceable
- admin actions should be logged
- financial movements should be reconstructable from ledger

## 14. Design Implementation Rules

The Canva designs are the source of truth for frontend layout and visual structure.

The coding agent should:

- implement screens to closely match design
- use the mobile Canva design as the responsive target, not just generic CSS guesses
- preserve interaction details explicitly mentioned by client
- ignore placeholder/mockup purple guides or annotation outlines
- treat model/profile photos in design as placeholders only

Specific UI details explicitly requested by client:

- button hover glow/light-up states
- registration/action buttons activate only when required input is valid
- selected categories/options are visibly highlighted
- left nav labels appear on hover
- home/profile cover media can rotate/change on hover with a delay
- notification unread state indicated visually
- disabled mic/camera buttons in call UI become red/crossed

## 15. Suggested Data Domains / Entities

At minimum, the system will likely need:

- User
- Role
- Profile
- Hobby
- Interest
- Like
- Match
- ChatThread
- ChatParticipant
- Message
- MessageAttachment
- MediaAsset
- MediaUnlock
- Wallet
- LedgerEntry
- CoinPackage
- PaymentOrder
- PaymentWebhookEvent
- VideoCallSession
- VideoCallCharge
- Tip
- Notification
- Report
- Block
- SupportConversation
- SupportMessage
- WithdrawalRequest
- RefundRequest
- Referral
- AuditLog
- FeatureFlag
- AdminSetting

## 16. Suggested Feature Flags / Admin Settings

The system should support configurable settings without code changes where practical.

Examples:

- paid messaging enabled/disabled
- paid message price
- video call price per minute
- photo unlock price default
- video unlock price default
- chat media fixed photo price
- chat media fixed video price
- trial coin grant enabled/disabled
- signup bonus amount
- minimum withdrawal amount
- payout conversion rate
- moderation required for profile media
- moderation required for chat media

## 17. Recommended Technical Direction For Cursor Agent

This section is guidance, not a strict requirement, but it is recommended for execution quality.

### Suggested Stack

- Frontend: Next.js
- Backend API: Node.js with NestJS or Express/Fastify
- Database: PostgreSQL
- ORM: Prisma or TypeORM
- Realtime: WebSocket or Socket.IO
- Video: WebRTC with a suitable signaling/service layer
- Queue/Jobs: BullMQ or similar
- Cache: Redis
- Media storage: S3-compatible object storage
- Auth: secure cookie or token-based session architecture

### Suggested Architecture Principles

- separate financial ledger logic from UI/business components
- use service boundaries for auth, wallet, payments, chat, media, moderation, video, and admin
- make financial operations transactional
- make uploads asynchronous when possible
- use background jobs for payment reconciliation, media processing, notifications, and moderation workflows

## 18. Delivery Phasing Recommendation

If the AI agent needs implementation phases, use this order:

### Phase 1

- project setup
- auth and roles
- database schema
- design system/layout shell
- landing/register/login
- basic profiles
- admin auth shell

### Phase 2

- wallet/ledger
- Cryptomus integration
- coin packages
- notifications foundation
- search and feed

### Phase 3

- chat
- likes/matches
- support chat
- block/report

### Phase 4

- media upload/management
- paid content unlocks
- moderation queue
- female earnings and withdrawals

### Phase 5

- video call
- per-minute billing
- post-call summaries
- advanced admin review tools

### Phase 6

- security hardening
- anti-fraud rules
- performance/scalability improvements
- QA and polish

## 19. Acceptance Criteria Summary

The product should be considered functionally aligned when:

- men and women have separate role-based experiences matching design
- registration/login/profile flows work
- men can buy coins via Cryptomus
- trial coins are tracked separately and do not generate female earnings
- chats work in real time
- messages are free by default
- paid messaging can be enabled later by admin
- women can message men first
- men can unlock paid content and send tips
- women can manage free/paid media
- chat media moderation flow works
- 1:1 video calls work and bill correctly
- women cannot initiate video calls
- admin can view chats, users, transactions, withdrawals, reports, and moderation queues
- moderator has restricted operational tools
- support/refund workflows exist
- desktop and mobile UI follow provided designs

## 20. Open Questions / Business Decisions To Confirm

The AI agent may proceed with sensible defaults, but these should be flagged for confirmation:

- exact payout conversion rule from coins to crypto withdrawals
- exact paid messaging price and whether it is per sent message or per delivered message when enabled later
- whether male users receive trial coins only at signup or also via promotions
- whether signup requires email verification before full access
- whether referral program pays coins, cash-equivalent earnings, or only tracks invites
- whether women can upload unlimited media or should have limits by plan/status
- whether admin wants manual approval for female profiles before going live
- exact retention policy for chat/video metadata
- refund rules and eligibility criteria

## 21. Direct Instructions For The AI Coding Agent

When implementing from this PRD:

1. Use the Canva designs as the frontend source of truth.
2. Preserve all explicit interaction notes provided by the client.
3. Model the wallet/ledger carefully before building monetized features.
4. Treat trial coins and paid coins as separate accounting sources.
5. Implement free chat as launch default, but architect for future paid messaging toggle.
6. Do not let female users initiate video calls.
7. Put moderation and auditability into the schema early.
8. Keep financial logic, support flows, and admin visibility production-oriented from the start.
9. Create tasks/epics from this PRD before large-scale coding.
10. If design and PRD conflict, prefer design for layout and PRD for business logic, then flag the conflict.

