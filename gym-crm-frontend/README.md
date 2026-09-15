# PeakForm — Gym CRM Frontend

A React + Vite frontend for the Gym Management CRM backend. Redux Toolkit
(RTK Query) handles every API call; Tailwind CSS drives a custom, distinct
visual identity — not a default component-library look.

---

## 1. Design system

- **Colors** — `ink` (deep navy-charcoal text/chrome), `paper` (warm neutral
  background), `brand` (vivid coral-orange — primary actions, CTAs),
  `mint` (positive/active), `amber` (warning/expiring), `rose` (danger/expired).
- **Type** — "Sora" for headings and stat numbers (distinct, geometric
  character), "Inter" for body/UI text (reads well at small sizes in tables).
- **Layout** — dark navy sidebar on desktop (`lg:` breakpoint and up); a
  bottom tab bar + "More" sheet on mobile. Stat cards use a colored left
  border instead of the generic all-cards-identical-shadow treatment.

All tokens live in `tailwind.config.js` — change the palette or fonts there.

---

## 2. Tech stack

- **React 18 + Vite 5**
- **Redux Toolkit + RTK Query** — one `apiSlice` with `injectEndpoints` per
  module (`src/api/*.js`), auto re-fetching via cache tags
- **React Router v6** — role-aware routing (`ProtectedRoute`, `RoleRoute`)
- **Tailwind CSS**
- **Headless UI** — accessible Modal/Menu primitives
- **Recharts** — revenue & attendance trend charts
- **lucide-react** — icons
- **react-hot-toast** — notifications

---

## 3. Setup

```bash
cd gym-crm-frontend
npm install
cp .env.example .env      # point VITE_API_URL at your backend
npm run dev                # http://localhost:5173
```

Make sure the backend is running (see the backend's own README) and that
its `CLIENT_URL` includes this app's origin for CORS.

```bash
npm run build     # production build -> dist/
npm run preview   # serve the production build locally
```

---

## 4. Project structure

```
src/
├── api/                 # RTK Query endpoints, one file per backend module
│   ├── apiSlice.js       # base createApi + auth header + auto-logout on 401
│   ├── authApi.js  memberApi.js  packageApi.js  membershipApi.js
│   ├── attendanceApi.js  trainerApi.js  paymentApi.js  leadApi.js
│   ├── reportApi.js  whatsappApi.js  settingsApi.js  dashboardApi.js
├── app/                 # Redux store + typed-ish hooks
├── features/auth/       # authSlice (token/user, persisted to localStorage)
├── hooks/                # useAuth (role helpers), useWhatsApp (wa.me links)
├── components/
│   ├── ui/                # Button, Input, Select, Modal, Badge, StatCard, …
│   ├── layout/             # Sidebar, Topbar, BottomNav, MoreSheet, AppLayout
│   ├── members/            # Member-specific modals (add/edit, renew, pay, trainer)
│   ├── leads/               # Lead form modal
│   └── shared/               # SendMessageModal (WhatsApp), reused across pages
├── pages/                # One file per route
└── utils/                # cn() classnames helper, date/currency formatting
```

---

## 5. How RTK Query is wired

Every backend module gets its own file that calls `apiSlice.injectEndpoints`,
so the bundle only pulls in what's used and cache invalidation stays scoped
per feature. Example:

```js
// api/memberApi.js
export const memberApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMembers: builder.query({ query: (params) => ({ url: '/members', params }) }),
    createMember: builder.mutation({
      query: (body) => ({ url: '/members', method: 'POST', body }),
      invalidatesTags: [{ type: 'Member', id: 'LIST' }, 'Dashboard']
    })
  })
});
export const { useGetMembersQuery, useCreateMemberMutation } = memberApi;
```

Components just call the generated hooks (`useGetMembersQuery()`,
`useCreateMemberMutation()`) — no manual loading/error state plumbing.

The base query (`apiSlice.js`) attaches the JWT from Redux state to every
request and automatically logs the user out on a `401`, so an expired
session never leaves the UI stuck.

---

## 6. Roles & navigation

The sidebar/bottom-nav and route guards (`RoleRoute`) both read from the
single `navConfig.js` source of truth:

| Role | Lands on | Sees |
|---|---|---|
| Owner | Dashboard | Everything, incl. Settings & Staff |
| Manager | Dashboard | Everything except Settings |
| Receptionist | Members | Members, Attendance, Memberships, Payments, Leads |
| Trainer | My dashboard | My dashboard, Members (their own, enforced by the backend), Attendance |

A gym with **no trainers** works exactly the same — the "Assign trainer"
control just stays on "No trainer", and every other screen is unaffected.

---

## 7. WhatsApp follow-ups

`useWhatsApp()` calls the backend's `/whatsapp/generate` endpoint (which logs
the follow-up) and opens the returned `wa.me` link in a new tab — a real
WhatsApp Business API is never required. This one hook powers the WhatsApp
buttons on the Dashboard, Member detail, Payments, and Leads pages.

---

## 8. Mobile vs desktop

- **< 1024px (mobile/tablet)** — bottom tab bar with the 4 most-used sections
  for that role, plus a "More" sheet for the rest. Tables become stacked
  cards; modals become bottom sheets.
- **≥ 1024px (desktop)** — persistent dark sidebar, full data tables, and
  wider grid layouts (up to 4 stat cards per row).

Everything was built mobile-first and verified with a full production build.
