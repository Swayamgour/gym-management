# Gym Management CRM — Backend

Production-ready **Node.js + Express + MongoDB** backend for a Gym Management CRM.
Built to match the exact module spec: Dashboard, Members, Memberships/Packages,
Attendance, Trainers (optional), Payments, Leads, WhatsApp follow-ups, Reports,
Roles, and Settings.

Works for a solo gym owner with no trainers, and scales cleanly to a gym with
owner + manager + trainers + receptionist — nothing breaks either way, since
`trainer` on a member is always optional.

---

## 1. Tech Stack

- **Node.js + Express 4** — REST API
- **MongoDB + Mongoose 8** — database & ODM
- **JWT** — stateless authentication
- **bcryptjs** — password hashing
- **express-validator** — request validation
- **helmet, cors, express-mongo-sanitize, express-rate-limit** — security
- **node-cron** — daily membership-expiry job
- **axios** — optional WhatsApp Cloud API integration

Multi-tenant by design: every collection is scoped by `gym`, so the same
backend can run one gym or (later) many gyms without a schema change.

---

## 2. Project Structure

```
gym-crm-backend/
├── server.js                  # App entry point
├── package.json
├── .env.example
└── src/
    ├── config/db.js           # Mongo connection
    ├── models/                # Mongoose schemas
    │   ├── Gym.js  User.js  Member.js  Package.js  Membership.js
    │   ├── Attendance.js  Payment.js  Lead.js  FollowUp.js  MessageTemplate.js
    ├── controllers/           # Business logic, one file per module
    ├── routes/                # Route definitions + role guards
    ├── middleware/            # auth (JWT), role (RBAC), validate, errorHandler
    ├── utils/                 # dateUtils, whatsapp, pagination, apiResponse, etc.
    ├── jobs/expiryCheckJob.js # Daily cron: flips expired memberships
    └── seed/seed.js           # Creates a demo gym + owner + packages
```

---

## 3. Setup

```bash
cd gym-crm-backend
npm install
cp .env.example .env      # edit MONGO_URI, JWT_SECRET etc.
npm run seed               # optional: creates a demo login
npm run dev                 # nodemon, or `npm start` for production
```

Demo login after seeding: **owner@demogym.com / password123**

Health check: `GET /api/v1/health`

---

## 4. Data Model (how the modules connect)

- **Gym** — one per tenant. Holds `settings` (currency, absent-day threshold, WhatsApp country code).
- **User** — staff login. `role`: `owner | manager | trainer | receptionist`.
- **Member** — the gym member. Has an optional `trainer` (User) and a `currentMembership`
  pointer for O(1) lookups; full history lives in `Membership`.
- **Package** — Monthly / 3 Months / 6 Months / 1 Year etc., each with `durationInDays` + `price`.
- **Membership** — one row per purchase/renewal (`isRenewal` flag). `status` is
  `active | expired`, kept correct by the daily cron **and** recalculated on the fly
  for the "expiry bucket" (Expired / Today / 1-3 / 4-7 / 8-15 / 16-30 days) used on
  dashboards and lists.
- **Payment** — linked to a `Membership`; `paidAmount` on the membership is kept in
  sync so `pendingAmount = amount - paidAmount` is always accurate.
- **Attendance** — one row per visit; `checkOut: null` means "currently inside the gym".
- **Lead** — enquiry pipeline (`new → follow-up → trial → converted / not-interested`),
  with one-click `convert` into a real Member.
- **FollowUp** — a log of every WhatsApp/call message generated, for history/audit.
- **MessageTemplate** — gym-specific overrides of the default WhatsApp templates.

---

## 5. Roles & Permissions (exactly per spec)

| Role | Access |
|---|---|
| **Owner** | Everything, incl. staff management & settings |
| **Manager** | Members, Attendance, Payments, Memberships |
| **Trainer** | Only their own assigned members, attendance, member details |
| **Receptionist** | Members, Attendance, Memberships, Payments |

If a gym has no trainers, the owner/manager simply never assigns one —
`member.trainer` stays `null` and every other module works unaffected.

---

## 6. API Overview (all under `/api/v1`)

### Auth
- `POST /auth/register` — creates the **Gym + Owner** in one call
- `POST /auth/login`
- `GET /auth/me`
- `PUT /auth/change-password`
- `POST /auth/staff` (owner/manager) — add manager/trainer/receptionist
- `GET /auth/staff`, `PUT /auth/staff/:id`

### Dashboard
- `GET /dashboard` — total/active members, today's attendance, currently inside,
  expiring soon, expired, pending payments, this month's revenue
- `GET /dashboard/action-required` — expired list, expiring-in-7-days list,
  pending-payment list, lapsed/inactive members list — each with the member
  populated so the UI can show `View / Call / WhatsApp / Renew` buttons directly

### Members
- `POST /members`, `GET /members` (search, `trainer`, `membershipStatus` filters,
  pagination), `GET /members/:id` (full profile: overview + membership history +
  attendance + payments + trainer + activity feed), `PUT /members/:id`,
  `DELETE /members/:id` (soft), `PUT /members/:id/trainer`, `GET /members/:id/activity`

### Packages
- Full CRUD: `POST /packages`, `GET /packages`, `GET/PUT/DELETE /packages/:id`

### Memberships
- `POST /memberships` — assign a package or renew (auto-detected), optional
  initial payment, auto-generates a welcome/renewal WhatsApp message
- `GET /memberships` — filter by `status` (`active|expired`) or `withinDays=7`
- `GET /memberships/:id`

### Attendance
- `POST /attendance/check-in`, `POST /attendance/check-out`
- `GET /attendance/currently-inside`, `GET /attendance/today`
- `GET /attendance/member/:memberId?from=&to=`

### Trainers
- `GET /trainers` — list with live member counts
- `GET /trainers/dashboard` (self) / `GET /trainers/:trainerId/dashboard` (owner/manager)
- `GET /trainers/:trainerId/members`

### Payments
- `POST /payments` — validated against the membership's pending balance
- `GET /payments` (filters: `memberId`, `method`, `from`, `to`)
- `GET /payments/pending`, `GET /payments/member/:memberId`

### Leads
- Full CRUD + `POST /leads/:id/convert` → creates a Member from the lead

### Reports
- `GET /reports/members`, `/attendance`, `/memberships`, `/revenue`, `/trainers`

### WhatsApp / Follow-up
- `POST /whatsapp/generate` — body: `{ memberId | leadId, messageType, customMessage?, autoSend? }`.
  Types: `expiry | payment_pending | welcome | absent | renewal | custom`.
  Always returns a ready `whatsappLink` (`wa.me/...`) for one-click send from
  the UI — no external API required. If `WHATSAPP_*` env vars are set **and**
  `autoSend: true` is passed, it also sends automatically via the Meta Cloud API.
- `GET /whatsapp/templates`, `PUT /whatsapp/templates/:type` — owner/manager can
  customize any default message
- `GET /whatsapp/history` — follow-up log for a member/lead

### Settings (owner only)
- `GET /settings`, `PUT /settings` — gym profile, currency, absent-day threshold,
  WhatsApp country code

---

## 7. Business Logic Notes

- **Expiry buckets** (`expired / expires_today / 1-3_days / 4-7_days / 8-15_days /
  16-30_days / safe`) are computed live from `expiryDate` — no stale data.
- **A daily cron (00:05)** flips memberships from `active` → `expired` in bulk so
  dashboard counts stay fast (`status` is indexed), and also runs once on server
  startup so a delayed restart doesn't leave stale statuses.
- **"Active member"** = account enabled AND current membership status is `active`.
  **"Inactive/lapsed member"** (used in Action Required) = account enabled but
  membership expired or never assigned — the exact list a gym owner wants to win back.
- **Attendance** enforces one open session per member (can't check in twice
  without checking out first) and computes visit duration on check-out.
- **Payments** can never exceed a membership's pending balance, keeping
  `paidAmount`/`pendingAmount` always consistent.
- **WhatsApp** never requires a paid API to function — every action returns a
  `wa.me` link that opens WhatsApp with the message pre-filled, matching the
  "📱 Send WhatsApp" button pattern in the spec. The Cloud API path is there for
  gyms that later want fully automatic sending.

---

## 8. Security

- JWT auth on every protected route, role-based access control (RBAC) per route
- Passwords hashed with bcrypt (never returned in any response)
- `helmet`, `cors`, `express-mongo-sanitize` (NoSQL-injection guard), and a global
  rate limiter (500 req / 15 min per IP) on all `/api` routes
- Centralized error handler normalizes Mongoose `CastError`, duplicate-key (11000),
  and `ValidationError` into clean JSON responses

---

## 9. Extending This

- Add QR/RFID/biometric check-in by simply calling the existing
  `POST /attendance/check-in` from that hardware's integration layer — no schema change needed.
- Add SMS/email as another `FollowUp.channel` alongside `whatsapp`.
- The `Membership.status` enum already includes `upcoming` for a future feature
  where a renewal is purchased before the current package expires.
