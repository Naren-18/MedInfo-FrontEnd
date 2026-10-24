# 🖥️ MedInfo — Frontend Architecture

The client for the [MedInfo microservices backend](../MedInfo-Backend-Microservices) — a single-page app covering the full product: register, build a medical profile, manage emergency contacts, generate a QR code, and the public no-login page a first responder actually scans.

This document is the deep dive — what was built, why each decision was made, and the real issues hit while building and verifying it against the live backend. For the short version, see [README.md](README.md).

**Live:** https://www.medinfo.org.in (Vercel) · API: https://api.medinfo.org.in (Caddy → Gateway on a VPS)

---

## 🧠 Design Goals

- **Match the backend's actual contract exactly** — DTO shapes, validation rules, error format — verified against the real service source (`medical-service`, `auth-service`), not assumed from docs.
- **Never require a backend change to run.** No CORS config exists anywhere in the backend, and it stays that way — the frontend routes around it entirely.
- **No bugs, full functionality, production-shaped code** — real loading/empty/error states, route protection, session-expiry handling, not just a happy-path demo.
- **Verify against the real system**, not just `npm run build` — see 🧪 Verification below.

---

## ⚙️ Tech Stack

| Choice | Why |
|---|---|
| React 19 + TypeScript + Vite | Pure SPA calling a REST API — no SSR/SEO need, so Next.js would only add complexity. Vite gives a fast dev loop and a static build any host can serve. |
| Tailwind CSS + shadcn/ui | Accessible Radix primitives (dialog, form, dropdown, toast), fully restyled — a distinct medical/emergency identity instead of a generic component-library look. |
| React Router v7 | Client-side routing, public vs protected route trees. |
| TanStack Query | Server state for profile/contacts — caching, invalidation on mutation, loading/error states, mirrors the backend's own cache-then-invalidate philosophy. |
| react-hook-form + zod | Validation schemas mirror the backend's `@NotBlank`/`@Min`/`@Max`/`@Pattern` annotations exactly, so client errors and server 400s never disagree. |
| axios | HTTP client with request/response interceptors for auth headers and centralized error handling. |
| qrcode.react | Client-side QR generation for the Emergency Card. |
| vite-plugin-pwa | Generates the web app manifest + Workbox service worker for "Add to Home Screen" installability — see 📲 below. |

---

## 🏗️ Architecture

```
                          Browser
                             │
                    same-origin requests only
                             │
        ┌────────────────────┴─────────────────────────┐
        ▼ dev (npm run dev)                  ▼ production (Vercel)
   Vite Dev Server (:5173)              www.medinfo.org.in
   server.proxy /api/* ──┐              vercel.json rewrite /api/* ──┐
                         ▼                                            ▼
              localhost:8080 Gateway        api.medinfo.org.in → Caddy → 127.0.0.1:8080 Gateway (VPS)
                                    │
                     Eureka → { Auth, Medical, Audit } Services
```

The frontend never calls the Gateway directly from the browser. In dev, Vite's `server.proxy` forwards `/api/*` to the Gateway **inside Vite's Node process**. In production, Vercel's rewrite proxies `/api/*` to the API domain **server-side**. Either way, the browser only ever sees `fetch('/api/...')` — same-origin, every time. (An earlier Docker + nginx setup did the same on Railway; it's no longer used.) That's the entire CORS strategy: there isn't a CORS problem to solve, because there's never a cross-origin request in the first place.

### Why This, Not CORS Headers

The backend has zero CORS configuration in any service (confirmed by searching all of `auth-service`, `medical-service`, `gateway-service` for `CrossOrigin`/`CorsConfig`/`allowedOrigins` — zero matches). Adding CORS headers there was the obvious fix, but the backend was explicitly off-limits for this project. A same-origin reverse proxy achieves the identical practical outcome — the frontend can call the API from any environment — without touching a single backend file.

---

## 📂 Project Structure

```
src/
├── api/
│   ├── client.ts          # axios instance, interceptors, SESSION_EXPIRED_EVENT
│   ├── auth.ts             # register(), login(), verifyEmail(), resendVerification()
│   ├── profile.ts           # getProfile/createProfile/updateProfile/deleteProfile, uploadReport()
│   ├── contacts.ts           # list/create/update/delete
│   ├── emergency.ts           # getEmergencyProfile(publicProfileId) — public, no auth header ever
│   └── types.ts                # TS interfaces matching every backend DTO field-for-field
├── components/
│   ├── ui/                # shadcn primitives (button, input, dialog, alert-dialog, form, select, ...)
│   ├── layout/              # Navbar, ProtectedRoute, PublicOnlyRoute, AppLayout, PageLoader
│   ├── auth/                  # ResendVerificationButton (60 s cooldown)
│   ├── profile/               # ProfileForm, ProfileSummaryCard, AiSummaryCard (upload + summary),
│   │                          # AiSummaryText, MedicalTimeline (vertical), SnakeTimeline, TimelineEventMeta
│   └── contacts/                # ContactForm
├── context/
│   └── AuthContext.tsx     # token state, login/logout, session-expiry listener
├── hooks/
│   ├── useMedicalProfile.ts   # React Query hooks for profile
│   ├── useEmergencyContacts.ts # React Query hooks for contacts
│   └── useMediaQuery.ts       # responsive layout switch (snake vs vertical timeline)
├── lib/
│   ├── validation.ts       # zod schemas mirroring backend DTOs
│   ├── errors.ts             # normalizes backend ErrorResponse → toast message
│   ├── token-store.ts          # JWT persistence + decode + expiry check
│   ├── server-time.ts          # server LocalDateTime (UTC, no zone) → local display
│   ├── timeline.ts             # event type labels/icons, date formatting by precision, "upcoming"
│   └── public-profile-cache.ts  # localStorage fallback for publicProfileId (see below)
├── pages/                  # one file per route (incl. CheckEmailPage, VerifyEmailPage)
├── App.tsx                 # route tree, lazy-loaded pages
└── main.tsx                 # providers: QueryClient, BrowserRouter, AuthProvider, Toaster
```

---

## 🔐 Auth Flow

```
Register → 200 → /check-email ("we sent a link to …", resend button)
Email link → /verify-email?token=… → POST /api/auth/verify-email → "Email verified" → Log in
Login before verifying → 403 → inline "Please verify your email" box with a resend button
```

```
Login → JWT returned (raw string) → stored in localStorage + decoded client-side
      → axios request interceptor attaches Authorization: Bearer <token> to every authed call
      → axios response interceptor watches for 401 ON A REQUEST THAT HAD AN AUTH HEADER
      → clears token, dispatches SESSION_EXPIRED_EVENT
      → AuthContext listens, clears React state, shows "session expired" toast
      → ProtectedRoute sees isAuthenticated=false → redirects to /login
```

**Why gate the 401-handling on "did this request have an auth header"?** `login()` itself returns 401 on bad credentials — that's a normal, expected error the login form handles inline, not a session expiry. Only a 401 on a request that *was* carrying a token means a previously-valid session went bad (expired — the JWT lives 15 minutes and there's no refresh endpoint).

The public emergency endpoint (`api/emergency.ts`) uses a **separate axios instance** (`publicHttp`) with no interceptor at all — it must never attach a token, even if the visitor happens to be logged in in another tab.

### JWT Storage

`localStorage`, decoded with `jwt-decode` purely for **display** (username in the navbar, `userId` for cache-key scoping) — the backend remains the sole source of truth for whether a token is actually valid; the frontend never tries to validate a signature itself.

---

## 🧾 Forms & Validation

Every zod schema in `lib/validation.ts` mirrors a backend DTO's Bean Validation annotations one-to-one:

| Backend DTO | Rule | Frontend schema |
|---|---|---|
| `RegisterRequestDTO` | `@NotBlank`, `@Email`, `@Size(min=8)` | `registerSchema` |
| `CreateMedicalProfileDTO` | `age`: `@Min(1) @Max(120)`; `height`/`weight`: `@Positive` | `medicalProfileSchema` |
| `EContactsDTO` | `phoneNumber`: `@Pattern(regexp="^[0-9]{10}$")` | `emergencyContactSchema` |

### ⚠️ Real Issue Hit — zod Coercion Typing

`z.coerce.number()` (used for `age`/`height`/`weight`, since HTML number inputs hand back strings) has a different **input** type (`unknown`, pre-coercion) than **output** type (`number`, post-coercion). `useForm<MedicalProfileFormValues>` — typed with the output shape — made TypeScript reject the resolver, since react-hook-form manages the *input* shape internally.

**Fix:** split the schema's inferred types explicitly:
```ts
export type MedicalProfileFormInput = z.input<typeof medicalProfileSchema>
export type MedicalProfileFormValues = z.output<typeof medicalProfileSchema>
```
```ts
const form = useForm<MedicalProfileFormInput, unknown, MedicalProfileFormValues>({
  resolver: zodResolver(medicalProfileSchema),
})
```
The three-generic form tells react-hook-form: manage this input shape, validate through the resolver, hand `onSubmit` the coerced output shape.

---

## 🗄️ Two Backend Limitations, Not Frontend Bugs — ✅ Both Since Fixed in the Backend

Both were discovered by reading the actual backend source directly (not assumed) after a real end-to-end test surfaced unexpected behavior. **Both have since been fixed backend-side:** `EContactsDTO` now carries `id` (contact edit/delete work, with no frontend change needed — exactly as designed), and `GET /api/profile` now returns `publicProfileId` (the Emergency Card reads it from the profile; the `localStorage` cache below remains only as a fallback). The history is kept because the approach — build against the intended contract, degrade gracefully until it lands — paid off.

### 1. `GET /api/contacts` Never Returns `id`

Verified directly against `EmergencyContactsService.java`:

```java
return emergencyContacts.stream()
    .map(contact -> EContactsDTO.builder()
        .name(contact.getName())
        .relationship(contact.getRelationship())
        .phoneNumber(contact.getPhoneNumber())
        .build())
    .toList();
```

`EContactsDTO` has no `id` field at all. But `PUT /api/contacts/{id}` and `DELETE /api/contacts/{id}` both require one — meaning there is currently no way, anywhere in the API, to learn a contact's id. Edit and delete are structurally impossible against the backend as it exists today.

**Decision (made with the backend owner):** build the frontend *assuming* `id` gets added to `EContactsDTO` — `ContactsPage` correctly sends `contact.id` on every edit/delete call. Until that lands, those calls fail server-side with a clean, non-crashing error toast (confirmed live — see 🧪 Verification). No frontend change will be needed once the backend adds the field.

**Defensive fix applied regardless:** the contact list's React `key` falls back to a composite of stable fields when `id` is `undefined`, so a missing id degrades to "edit/delete don't work yet," not a React key-collision warning:
```tsx
key={contact.id ?? `${contact.phoneNumber}-${contact.name}-${index}`}
```

### 2. `GET /api/profile` Never Returns `publicProfileId`

`MedicalProfileResponseDTO` deliberately excludes it (confirmed against the DTO source) — only the `POST`/`PUT` responses (the full JPA entity) include `publicProfileId`. That means after a page reload, there is no endpoint that returns your own QR code's identifier.

**Fix:** cache it in `localStorage`, scoped per `userId`, the instant it's returned by create/update:
```ts
// src/lib/public-profile-cache.ts
cachePublicProfileId(userId, publicProfileId)   // called in useCreateProfile/useUpdateProfile onSuccess
getCachedPublicProfileId(userId)                // read by EmergencyCardPage, DashboardPage
```
On a new device or cleared browser storage, the Emergency Card page explains this plainly and points back to the profile page rather than showing a broken QR silently.

---

## 🔧 Real Issues Hit — Building Against a Live Backend

Once the backend happened to already be running locally, a real Playwright-driven end-to-end pass (register → login → profile CRUD → contacts → QR → public lookup in a fresh unauthenticated context → logout) caught two genuine frontend bugs neither `npm run build` nor manual review had surfaced.

### 1. Missing React `key` on the Contacts List

```
Each child in a list should have a unique "key" prop.
Check the render method of `ContactsPage`.
```
Root cause: `key={contact.id}` where `contact.id` was `undefined` for every item (the backend gap above). Fixed with the composite-key fallback shown above — the console warning is gone regardless of whether the backend has shipped the `id` field yet.

### 2. Logout Landed on `/login` Instead of `/`

```tsx
// Before
function handleLogout() {
  logout()
  navigate("/")
}
```
Logging out from a page nested under `<ProtectedRoute>` (e.g. `/contacts`) creates a race: `logout()` flips `isAuthenticated` to `false`, which makes `ProtectedRoute` immediately redirect the *current* route to `/login` — and that can win against the explicit `navigate("/")` call, depending on React's batching. The result was non-deterministic: sometimes `/`, sometimes `/login`.

**Fix:** stop fighting the race — target `/login` explicitly, since that's exactly where the redirect was already heading:
```tsx
function handleLogout() {
  logout()
  navigate("/login")
}
```

### 3. Quote Escaping in JSX Attributes

```tsx
// Invalid — \" inside a double-quoted JSX attribute isn't a real escape
<Textarea placeholder="e.g. Penicillin, peanuts — or \"None\"" />
```
TypeScript's JSX parser rejected this outright (`TS1127: Invalid character`). Fixed by switching the outer quotes:
```tsx
<Textarea placeholder='e.g. Penicillin, peanuts — or "None"' />
```

### 4. Initial Bundle Size Warning

The first production build warned about a single 667 KB JS chunk. Fixed by lazy-loading every route:
```tsx
const ProfilePage = lazy(() => import("@/pages/ProfilePage"))
// ...
<Suspense fallback={<PageLoader />}>
  <Routes>...</Routes>
</Suspense>
```
Result: no chunk over ~320 KB, and pages the user never visits (e.g. the Emergency Card page, which pulls in `qrcode.react`) never get downloaded at all.

### 5. Vite Deprecation — `tsconfig.app.json`'s `baseUrl`

```
error TS5101: Option 'baseUrl' is deprecated and will stop functioning in TypeScript 7.0.
```
With `"moduleResolution": "bundler"` (the current Vite template default), `paths` aliases (`@/*` → `./src/*`) don't need `baseUrl` at all — removed it, the alias kept working.

### 6. ⚠️ Real Issue Hit — Railway Deploy: Requests Hung Then Failed With a Generic Error

Everything worked locally (`npm run dev` proxying to the Railway backend directly — see the CORS section above), but after deploying the frontend itself to Railway, register/login took a long time and then failed with the generic "Something went wrong" fallback message.

**Root cause — wrong `Host` header sent upstream.** The original `nginx.conf` had:
```nginx
proxy_set_header Host $host;
```
`$host` in nginx is the **incoming request's** Host header — i.e. the frontend's own domain (`medinfo-frontend-production.up.railway.app`). That got forwarded to the Gateway as-is. Railway's edge network routes every request to the correct internal service by Host header / TLS SNI — since the Gateway's edge received a request claiming to be for the *frontend's* domain, it had nowhere correct to route it, and the connection just sat there until nginx's default 60s `proxy_read_timeout` gave up. That matches the symptom exactly: a long hang, then a failure with no specific error message (nginx's own timeout response isn't JSON, so it doesn't carry a `{message: ...}` the frontend's error normalizer can surface — it falls through to the generic fallback).

**Fix:**
```nginx
proxy_set_header Host $proxy_host;   # the Gateway's own host, not the frontend's
proxy_ssl_server_name on;             # correct TLS SNI for the upstream HTTPS host
proxy_ssl_name $proxy_host;
```
`$proxy_host` is nginx's built-in variable for "the host portion of the current `proxy_pass` target" — exactly what needed to be sent.

**A second, related fix applied at the same time:** the original config used `proxy_pass ${GATEWAY_URL}/api/;` with the URL substituted directly into a literal string. For a literal (non-variable) proxy target, nginx resolves the hostname **once, at startup**, and caches that IP for the life of the worker process. Railway's public hostnames sit behind a load balancer whose backing IPs can rotate — a stale cached IP would reproduce the exact same "hangs, then fails" symptom even with the Host header fixed. Forcing dynamic re-resolution requires a `resolver` directive plus routing the proxy target through an nginx variable:
```nginx
resolver 1.1.1.1 8.8.8.8 valid=30s ipv6=off;
# ...
location /api/ {
    set $upstream_gateway ${GATEWAY_URL};
    proxy_pass $upstream_gateway/api/;
```
Also added explicit, short timeouts (`proxy_connect_timeout 10s`, `proxy_read_timeout 15s`) so a genuinely unreachable Gateway fails fast and visibly instead of leaving the user staring at a spinner for a full minute.

---

## 🤖 AI Medical Summary & Timeline

The backend reads uploaded PDF reports with Gemini and returns three extra fields on both `GET /api/profile` and `GET /api/emergency/{publicProfileId}`: `aiSummary`, `summaryGeneratedAt` and `timeline` (oldest first; each event has `date` + `datePrecision`, `type`, `title`, `details`, `fromPhoto`).

### Uploading — `AiSummaryCard` (Profile page)

- PDF only, ≤ 20 MB, checked client-side before sending (the server checks again).
- Upload progress bar; once the bytes are sent the button shows "Reading your PDF…" until the server answers.
- On `202 Accepted`: "Report uploaded. Your AI summary will update in a few minutes." The new summary appears on the next profile load.

**Design decision — no polling.** An earlier version polled `GET /api/profile` every 5 s until `summaryGeneratedAt` changed. It was removed: React Query pauses intervals in background tabs and the app has refetch-on-focus off, so a slow scanned-PDF upload could leave the card "Analyzing…" forever; a second upload during analysis could also report the first one's result as its own. A plain "it will update in a few minutes" message is honest and can't get stuck.

### ⚠️ Real Issue Hit — FormData Sent as JSON

The shared axios instance sets `Content-Type: application/json` by default — and axios **serializes FormData to JSON** when that header is present, so the PDF would never arrive as a file. `uploadReport()` overrides the header with `multipart/form-data`; in the browser axios then drops it so the browser can add the multipart boundary itself.

### Showing It

- **Summary** — `AiSummaryText` renders plain text with `white-space: pre-line` (never as HTML), "Last updated" converted from the server's zone-less UTC timestamp (`lib/server-time.ts`), and an "AI-generated, verify with a medical professional" note.
- **Timeline** — `lib/timeline.ts` maps each type (admission, test, diagnosis, procedure, chemotherapy, radiation, medication, discharge, follow-up) to a label and icon; dates are formatted only as precisely as the report gave them ("21 Mar 2026", "Mar 2026", "2026") and built as **local** dates, so a `2026-03-21` event never shows as the 20th west of UTC. Follow-ups still ahead get an **Upcoming** badge; events read from photographed pages get **"From photo, verify"**.
- **Profile page** — vertical `MedicalTimeline` under the summary card.
- **Emergency page** — patient card (with blood group) beside allergies/conditions/medications; on tablets/desktops a `SnakeTimeline` (2 / 4 events per row, alternating direction, arrows, the row-to-row turn routed around the outside so it never crosses text); on phones the vertical list (`useMediaQuery`); the AI summary in a **closed-by-default dropdown** so the critical data stays on screen.

---

## ✉️ Email Verification Screens

| Route | What it does |
|---|---|
| `/check-email` | Shown after registering: "We sent a link to …", resend button, back to login. Works without registration state too (asks for the email). |
| `/verify-email?token=…` | Opened from the email; calls `POST /api/auth/verify-email` once → "Email verified" → Log in, or "invalid/expired" → enter email → resend. |
| `/login` | A `403` (correct password, unverified email) shows an inline "Please verify your email" box with a resend button; `401` stays a password error. |

`ResendVerificationButton` is shared by all three and disables itself for 60 s after each send (matching the server's limit). Its message is deliberately generic — the backend answers the same way for every email, so the UI never claims an account exists.

Both routes are public and **not** wrapped in `PublicOnlyRoute`: a verification link must work even if someone is logged in on that browser.

### ⚠️ Real Issue Hit — One-Time Tokens vs StrictMode

React's StrictMode runs effects twice in development. `VerifyEmailPage` sends the token on mount — the second call would hit an already-used token and show "invalid link" right after a successful verification. A `useRef` guard makes sure the request is sent exactly once.

---

## 🔏 Privacy Policy, Consent & Account Deletion

| Where | What |
|---|---|
| `/privacy`, `/terms` | Plain-English Privacy Policy and Terms of Service (`pages/PrivacyPolicyPage.tsx`, `TermsPage.tsx`, layout in `components/legal/LegalPage.tsx`). Shared facts — operator, contact email, version, retention days — live in `lib/legal.ts`. Linked from the footer, the registration form, the upload notice and the public emergency page. |
| Register | Required checkbox (18+, Terms, Privacy, health-data processing, public emergency page). Sent as `acceptedTerms`; the server rejects `false` and records the date and version. |
| Upload card | A required "sent to Google's Gemini AI (free tier)" acknowledgement before the upload button enables. |
| Profile, Emergency Card, Contacts | `PublicVisibilityNotice`: exactly what anyone with the QR/link can see; contacts must agree to appear. |
| Dashboard | `DeleteAccountCard`: password-confirmed deletion of the account and all its data; on success clears the session and the cached QR id. A wrong password is a 400, so the 401 session-expiry handler never fires. |
| Public emergency page | Adds `<meta name="robots" content="noindex, nofollow">` while mounted, so search engines don't index personal health pages. |

When either document changes in substance, bump `LEGAL_VERSION` / `LEGAL_LAST_UPDATED` here and `AuthService.TERMS_VERSION` in auth-service together.

---

## ▲ Hosting on Vercel

Production runs on Vercel at `www.medinfo.org.in`; merging into `main` deploys. `vercel.json`:

```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://api.medinfo.org.in/api/:path*" },
    { "source": "/((?!api/).*)", "destination": "/index.html" }
  ]
}
```

1. `/api/*` is proxied server-side to the backend (Caddy → Gateway on the VPS), keeping every browser request same-origin.
2. Every other path serves `index.html` so React Router can render it. Vercel checks real files first, so JS, CSS, icons, `sw.js` and the manifest are still served normally; `/api/` is excluded so a mistyped API path can't silently return HTML.

### ⚠️ Real Issue Hit — 404 on Direct Links, Hidden by the Service Worker

With only the `/api/*` rewrite, opening `/emergency/<id>` directly returned Vercel's 404 — but only for **first-time visitors**. Returning users never saw it: the PWA service worker answers navigations itself with the cached `index.html` (vite-plugin-pwa's navigate fallback). Ctrl+Shift+R (which bypasses the service worker) and a friend opening a shared link both exposed it. For an app whose core flow is "a stranger scans a QR code", that's the worst possible case. The SPA fallback rewrite fixed it; deep links are now verified in a fresh incognito window after deploys.

---

## 🧪 Verification

`npm run build` (TypeScript + Vite) passes clean — but that only proves the code compiles, not that it works. The real verification was a Playwright-driven pass against the **actual running backend** (Gateway healthy, all four services registered with Eureka), not a mocked or offline test:

```
Register → redirect to /login with email prefilled
Login → redirect to /dashboard
Create medical profile → redirect to Emergency Card, real QR code, real publicProfileId
View profile summary → correct data
Edit profile → change persists, visible immediately
Add emergency contact → appears in list
Edit/Delete contact → fails gracefully with a clear toast (expected — backend id gap above)
Open /emergency/:publicProfileId in a FRESH unauthenticated browser context
  → full data renders: name, blood group, allergies, conditions, medications, contacts
  → reload → cache-hit path also renders correctly
Logout → lands on /login deterministically
Visit /dashboard while logged out → redirected to /login
```

Zero console errors or crashes throughout, outside the two expected error-toast messages tied to the documented backend gap. Screenshots were captured at every step during development to visually confirm rendering, not just assert on text content.

**Later passes (AI, email verification, production):**

```
Register → /check-email → link from the real email → /verify-email → "Email verified" → login
Login before verifying → 403 → inline resend box (60 s cooldown)
Upload a typed PDF and a photographed PDF → "uploaded" message → summary + timeline after a few minutes
Emergency page at phone, tablet and desktop widths → vertical / 2-per-row / 4-per-row timeline
Hard refresh and direct links (/emergency/<id>, /verify-email?token=…) on Vercel in a fresh incognito window
```

---

## 🐳 Docker + nginx (Earlier Railway Deployment — No Longer Used)

Before Vercel, the frontend ran on Railway as a Docker image: `node:20-alpine` builds `dist/`, `nginx:1.27-alpine` serves it, and a templated `nginx.conf` (envsubst at container start) reverse-proxies `/api/*` to `${GATEWAY_URL}` — same-origin, so still no CORS. The `Dockerfile` and `nginx.conf` remain in the repo for reference; production now uses `vercel.json` (see ▲ Hosting on Vercel).

### Local Dev — Switching Backend Target

`vite.config.ts` uses Vite's `loadEnv()` so `.env.local` (gitignored) controls the dev proxy target without exporting a shell variable every time:

```bash
# .env.local
VITE_GATEWAY_URL=http://localhost:8080
```

Falls back to `http://localhost:8080` if the file or variable is absent. Restart `npm run dev` after changing it.

---

## 📲 Installable as an App (PWA)

MedInfo is installable — "Add to Home Screen" on mobile, an install icon in the address bar on desktop Chrome — launching in its own standalone window instead of a browser tab. Built with `vite-plugin-pwa`, which generates the web app manifest and a Workbox-based service worker at build time, rather than hand-writing either.

### Why a Plugin, Not Hand-Rolled

A working install prompt needs three things simultaneously: a valid web app manifest (`name`, icons at 192px+512px, `display: standalone`, `start_url`), a **registered service worker with an active fetch handler**, and the site served over HTTPS (or `localhost`, which counts as a secure context for this purpose). Getting all three right by hand is easy to get subtly wrong — `vite-plugin-pwa` generates all of it from one config block in `vite.config.ts` and re-generates it on every build, so the manifest and service worker can never drift out of sync with what actually shipped.

### The One Rule That Mattered Most: Never Cache `/api/*`

```ts
workbox: {
  globPatterns: ['**/*.{js,css,html,svg,png,ico}'],   // app shell only
  runtimeCaching: [
    {
      urlPattern: /^\/api\//,
      handler: 'NetworkOnly',   // explicitly never served from cache
    },
  ],
},
```

A service worker's whole job is serving things without the network — which is exactly the wrong default for this app. A first responder reading a **stale, cached** emergency profile (old allergies, an outdated medication list) is a correctness failure this product cannot tolerate, unlike a typical PWA where a slightly-stale cached page is a minor inconvenience. `/api/*` is explicitly `NetworkOnly`, so only the static app shell (JS/CSS/HTML/icons) is ever precached — every medical data request always hits the network, same as if there were no service worker at all.

### Icons

Generated from a single hand-authored source SVG (the same heart-pulse mark as the favicon, on a solid brand-color rounded square) rasterized to every required size with `sharp`:

| File | Size | Purpose |
|---|---|---|
| `pwa-64x64.png` | 64×64 | Manifest |
| `pwa-192x192.png` | 192×192 | Manifest (Chrome's minimum for installability) |
| `pwa-512x512.png` | 512×512 | Manifest, splash screen |
| `maskable-icon-512x512.png` | 512×512 | Manifest, `purpose: "maskable"` — extra padding so Android's adaptive-icon masking (circle, squircle, etc.) never clips the heart-pulse mark |
| `apple-touch-icon.png` | 180×180 | iOS home-screen icon (not part of the manifest spec at all — iOS ignores it) |

### iOS Needs Different Meta Tags Entirely

Safari doesn't support `beforeinstallprompt` or manifest-driven install prompts the way Chrome/Android does — "Add to Home Screen" only becomes a real, standalone-launching app if these are present in `index.html`, independent of the manifest:
```html
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="MedInfo" />
```
Without `apple-mobile-web-app-capable`, iOS still lets you "Add to Home Screen," but it just opens Safari with URL bar and all — a bookmark, not an app.

### ⚠️ Verification Limits, Stated Honestly

The manifest was verified valid (served correctly, all required fields present, parses as JSON) and the service worker was confirmed reaching an `active` registration state, via a real headless-browser check against a production build (`vite preview`). What could **not** be verified from this environment: the actual `beforeinstallprompt` browser event, and Lighthouse's PWA installability audit (the `pwa` category has been removed from recent Lighthouse versions entirely — Google moved that check into Chrome DevTools' Application panel instead). Neither is a gap in the implementation — `beforeinstallprompt` is deliberately unreliable in headless/automated Chrome by design, not something any config can force. **To confirm the live install prompt yourself:** open the deployed site in real Chrome (desktop or Android) and look for the install icon in the address bar, or on iOS Safari use Share → Add to Home Screen. Chrome DevTools → Application → Manifest also lists any installability errors directly if something's actually wrong.

### Design Principles Applied

Precache the shell, never the data · Network-first (in this case, network-*only*) for anything where staleness is a safety issue, not a UX inconvenience · Platform-specific install paths (Chrome/Android via manifest, iOS via meta tags) treated as genuinely different mechanisms, not one abstraction papering over both

---

## ✅ Progress

- [x] Landing, Register, Login pages with validation matching backend rules exactly
- [x] JWT auth — storage, header injection, session-expiry handling (no refresh endpoint exists, so expiry means a clean logout, not a silent failure)
- [x] Route protection — `ProtectedRoute` / `PublicOnlyRoute`
- [x] Medical Profile — create / view / edit / delete, with confirm dialog on delete
- [x] Emergency Contacts — create / list / edit / delete (unblocked once the backend added `id`)
- [x] Emergency Card — QR code generation, print/download/copy-link
- [x] Public Emergency page — no-auth, alert-styled, `tel:` links, handles 404/503 gracefully
- [x] Centralized error normalization from the backend's `{status, error, message}` shape
- [x] Loading skeletons, empty states, and confirm dialogs throughout
- [x] Route-level code splitting (bundle size warning resolved)
- [x] Dockerfile + nginx reverse proxy (used for the earlier Railway deployment), no backend CORS required
- [x] `.env.local` + `loadEnv()` for switching the dev proxy target without code changes
- [x] Verified end-to-end against the live backend, not just a build check
- [x] Installable PWA — manifest + service worker via `vite-plugin-pwa`, app-shell-only precaching, `/api/*` explicitly `NetworkOnly`, iOS meta tags, maskable + standard icons generated from one source SVG
- [x] AI Medical Summary — PDF upload with progress, "updates in a few minutes" message, summary with last-updated time
- [x] Medical timeline — vertical list (profile, phones) and snake layout (emergency page, 2 / 4 per row), Upcoming and "From photo, verify" labels
- [x] Emergency page redesign — patient + blood group beside the critical lists, AI summary in a collapsible section
- [x] Email verification — check-email, verify-email, 403 handling on login, resend with cooldown
- [x] Hosted on Vercel with `/api/*` rewrite and SPA fallback (deep links work for first-time visitors)
- [x] Privacy Policy & Terms pages, recorded consent, Gemini upload notice, public-visibility notices, self-service account deletion, noindex on emergency pages

### 🚧 Next

- [ ] Automated tests (the Playwright script used for verification was ad hoc, not committed as a test suite)
- [ ] Typed API responses for the plain-string mutation endpoints (`POST/PUT/DELETE /api/contacts*`, `DELETE /api/profile`) currently typed as `Promise<void>`
- [ ] Confirm the live install prompt in a real (non-headless) browser — see the PWA section's verification-limits note
- [ ] Report list / status (show uploaded reports and any that failed analysis) — needs a backend endpoint
- [ ] Remove the unused Docker/nginx files, or keep them documented as an alternative host
