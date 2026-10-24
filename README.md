# 🏥 MedInfo — Frontend

The client for the [MedInfo microservices backend](https://github.com/Naren-18/MedInfo-Backend-Microservices) — an emergency medical information platform. Register (with email verification), build a medical profile, add emergency contacts, upload medical reports for an **AI summary** and a **medical timeline**, then get a QR code that lets anyone — no login required — see your critical medical information in an emergency.

**Live:** https://www.medinfo.org.in

> 📐 Deep-dive documentation: **[Architecture.md](Architecture.md)** — design decisions, the no-CORS strategy, the AI and email-verification screens, real issues hit, and verification results.

---

## ✨ Features

- **Accounts with email verification** — register → "check your inbox" → one-time link → log in; resend with a 60 s cooldown
- **Medical profile** — blood group, allergies, conditions, medications, organ donor
- **Emergency contacts** — create, edit, delete
- **Medical reports → AI summary** — upload PDFs (typed or phone photos, ≤ 20 MB); a combined AI Medical Summary appears a few minutes later
- **Medical timeline** — dated events extracted from the reports; "Upcoming" follow-ups; "From photo, verify" labels on events read from photographed pages
- **Emergency Card** — QR code, print/download/copy link
- **Public emergency page** (no login) — patient + blood group, allergies/conditions/medications, a snake-style timeline on wide screens (vertical on phones), the AI summary in a collapsible section, tap-to-call contacts
- **Installable PWA** — app shell cached, medical data never cached
- **Privacy & control** — Privacy Policy and Terms pages, recorded consent at sign-up, a Gemini notice before each upload session, "who can see this" notices, and self-service account deletion

---

## ⚙️ Tech Stack

- React 19 + TypeScript + Vite
- Tailwind CSS + shadcn/ui (Radix primitives)
- React Router v7
- TanStack Query (server state, caching, invalidation)
- react-hook-form + zod (validation mirrors the backend DTOs)
- axios
- qrcode.react
- vite-plugin-pwa
- Hosted on **Vercel**

---

## 🚀 Running Locally

The backend needs to be running first — see the [backend README](https://github.com/Naren-18/MedInfo-Backend-Microservices).

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`. Every `/api/*` request is proxied by Vite to `http://localhost:8080` (the Gateway).

To point the dev proxy elsewhere, copy `.env.example` to `.env.local` and set `VITE_GATEWAY_URL`; restart `npm run dev` afterwards. `.env.local` is gitignored.

> Testing email verification locally? Set `FRONTEND_BASE_URL=http://localhost:5173` in the **backend's** `.env`, so the link in the email opens your dev server.

### Why there's no CORS configuration anywhere

The browser only ever calls its own origin (`/api/...`). In development, Vite's proxy forwards those requests **server-side**; in production, Vercel's rewrite does the same:

```json
// vercel.json
{ "source": "/api/:path*", "destination": "https://api.medinfo.org.in/api/:path*" }
```

No cross-origin request ever happens, so the backend never needs CORS headers.

---

## 📦 Production

Merging into `main` deploys to **Vercel** automatically. `vercel.json` has two rewrites:

1. `/api/*` → `https://api.medinfo.org.in/api/*` (the backend, behind Caddy on the VPS)
2. every other path → `/index.html`, so direct links like `/emergency/<id>` (from a QR code) or `/verify-email?token=…` (from an email) load the app instead of a 404

```bash
npm run build   # outputs to dist/
```

> The `Dockerfile` + `nginx.conf` (nginx reverse-proxying `/api/*`) date from the earlier Railway deployment and aren't used in production.

---

## 🔀 Workflow

`main` is the base branch. Each feature gets its own branch from `main`, is pushed, and is merged through a pull request. Remember: **merging into `main` deploys to production** — when a change depends on new backend endpoints, deploy the backend first.

---

## 📲 Install as an App

MedInfo is installable — the address bar shows an install icon on desktop Chrome, and "Add to Home Screen" launches a standalone app on mobile. Only the static app shell is cached; every `/api/*` request is `NetworkOnly`, so medical data is always live. The service worker is disabled under `npm run dev`.

---

## 📂 Project Structure

```
src/
├── api/          # axios client + one module per backend resource, TS types matching the DTOs
├── components/
│   ├── ui/         # shadcn primitives
│   ├── layout/       # Navbar, route guards, page shell
│   ├── auth/           # ResendVerificationButton
│   ├── profile/          # profile form/summary, AI summary card, timelines (vertical + snake)
│   └── contacts/           # emergency contact form
├── context/       # AuthContext (JWT storage, login/logout, session-expiry handling)
├── hooks/         # React Query hooks, useMediaQuery
├── lib/           # validation, errors, server-time + timeline formatting, utils, publicProfileId cache
└── pages/         # one file per route (incl. CheckEmailPage, VerifyEmailPage)
```

---

## ✅ Verified End-to-End

Register → verification email → verify → login → create profile → upload a report (typed and photographed PDFs) → AI summary and timeline appear → emergency card → open the public `/emergency/:publicProfileId` link in a fresh, logged-out browser (desktop and phone layouts) → hard refresh on deep links → logout. Run against the real backend locally and in production. Details in [Architecture.md](Architecture.md).
