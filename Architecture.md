# 🖥️ MedInfo — Frontend Architecture

The client for the [MedInfo microservices backend](../MedInfo-Backend-Microservices) — a single-page app covering the full product: register, build a medical profile, manage emergency contacts, generate a QR code, and the public no-login page a first responder actually scans.

This document is the deep dive — what was built, why each decision was made, and the real issues hit while building and verifying it against the live backend. For the short version, see [Readme.md](Readme.md).

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
| React 18 + TypeScript + Vite | Pure SPA calling a REST API — no SSR/SEO need, so Next.js would only add complexity. Vite gives a fast dev loop and a static build any host can serve. |
| Tailwind CSS + shadcn/ui | Accessible Radix primitives (dialog, form, dropdown, toast), fully restyled — a distinct medical/emergency identity instead of a generic component-library look. |
| React Router v6 | Client-side routing, public vs protected route trees. |
| TanStack Query | Server state for profile/contacts — caching, invalidation on mutation, loading/error states, mirrors the backend's own cache-then-invalidate philosophy. |
| react-hook-form + zod | Validation schemas mirror the backend's `@NotBlank`/`@Min`/`@Max`/`@Pattern` annotations exactly, so client errors and server 400s never disagree. |
| axios | HTTP client with request/response interceptors for auth headers and centralized error handling. |
| qrcode.react | Client-side QR generation for the Emergency Card. |

---

## 🏗️ Architecture

```
                          Browser
                             │
                    same-origin requests only
                             │
        ┌────────────────────┴────────────────────┐
        ▼ dev (npm run dev)             ▼ prod (Docker)
   Vite Dev Server (:5173)         nginx (:80)
   server.proxy /api/* ──┐         location /api/ ──┐
                         │         proxy_pass         │
                         └──────────┬──────────────────┘
                                    ▼
                          API Gateway (:8080, or Railway)
                                    │
                     Eureka → { Auth, Medical, Audit } Services
```

The frontend never calls the Gateway directly from the browser. In dev, Vite's `server.proxy` forwards `/api/*` to the Gateway **inside Vite's Node process**. In a Docker build, nginx does the equivalent as a reverse proxy. Either way, the browser only ever sees `fetch('/api/...')` — same-origin, every time. That's the entire CORS strategy: there isn't a CORS problem to solve, because there's never a cross-origin request in the first place.

### Why This, Not CORS Headers

The backend has zero CORS configuration in any service (confirmed by searching all of `auth-service`, `medical-service`, `gateway-service` for `CrossOrigin`/`CorsConfig`/`allowedOrigins` — zero matches). Adding CORS headers there was the obvious fix, but the backend was explicitly off-limits for this project. A same-origin reverse proxy achieves the identical practical outcome — the frontend can call the API from any environment — without touching a single backend file.

---

## 📂 Project Structure

```
src/
├── api/
│   ├── client.ts          # axios instance, interceptors, SESSION_EXPIRED_EVENT
│   ├── auth.ts             # register(), login()
│   ├── profile.ts           # getProfile/createProfile/updateProfile/deleteProfile
│   ├── contacts.ts           # list/create/update/delete
│   ├── emergency.ts           # getEmergencyProfile(publicProfileId) — public, no auth header ever
│   └── types.ts                # TS interfaces matching every backend DTO field-for-field
├── components/
│   ├── ui/                # shadcn primitives (button, input, dialog, alert-dialog, form, select, ...)
│   ├── layout/              # Navbar, ProtectedRoute, PublicOnlyRoute, AppLayout, PageLoader
│   ├── profile/               # ProfileForm, ProfileSummaryCard
│   └── contacts/                # ContactForm
├── context/
│   └── AuthContext.tsx     # token state, login/logout, session-expiry listener
├── hooks/
│   ├── useMedicalProfile.ts   # React Query hooks for profile
│   └── useEmergencyContacts.ts # React Query hooks for contacts
├── lib/
│   ├── validation.ts       # zod schemas mirroring backend DTOs
│   ├── errors.ts             # normalizes backend ErrorResponse → toast message
│   ├── token-store.ts          # JWT persistence + decode + expiry check
│   └── public-profile-cache.ts  # localStorage cache for publicProfileId (see below)
├── pages/                  # one file per route
├── App.tsx                 # route tree, lazy-loaded pages
└── main.tsx                 # providers: QueryClient, BrowserRouter, AuthProvider, Toaster
```

---

## 🔐 Auth Flow

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

## 🗄️ Two Backend Limitations, Not Frontend Bugs

Both were discovered by reading the actual backend source directly (not assumed) after a real end-to-end test surfaced unexpected behavior.

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

---

## 🐳 Docker & Deployment

```dockerfile
# Build stage: node:20-alpine → npm run build
# Serve stage: nginx:1.27-alpine
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
ENV GATEWAY_URL=http://gateway-service:8080
```

`nginx.conf` is templated, not static — nginx's official image auto-runs `envsubst` over `/etc/nginx/templates/*.template` at container **start**, substituting only variables that actually exist in the container's environment (so `${GATEWAY_URL}` gets replaced, while nginx's own runtime variables like `$host`, `$remote_addr`, `$scheme` are left untouched, since those aren't environment variable names). That means the backend target is a `docker run` flag, not a rebuild:

```bash
docker build -t medinfo-frontend .
docker run -p 8081:80 -e GATEWAY_URL=https://gateway-service-production-2453.up.railway.app medinfo-frontend
```

### Local Dev — Switching Backend Target

`vite.config.ts` uses Vite's `loadEnv()` so `.env.local` (gitignored) controls the dev proxy target without exporting a shell variable every time:

```bash
# .env.local
VITE_GATEWAY_URL=https://gateway-service-production-2453.up.railway.app
```

Falls back to `http://localhost:8080` if the file or variable is absent. Verified live: a request through the dev proxy with intentionally wrong credentials returned a real `401 Invalid Credentials` from the Railway-hosted Gateway, confirming the proxy target was actually reaching Railway and not a local instance.

---

## ✅ Progress

- [x] Landing, Register, Login pages with validation matching backend rules exactly
- [x] JWT auth — storage, header injection, session-expiry handling (no refresh endpoint exists, so expiry means a clean logout, not a silent failure)
- [x] Route protection — `ProtectedRoute` / `PublicOnlyRoute`
- [x] Medical Profile — create / view / edit / delete, with confirm dialog on delete
- [x] Emergency Contacts — create / list; edit / delete built and wired, blocked on the backend `id` gap
- [x] Emergency Card — QR code generation, print/download/copy-link
- [x] Public Emergency page — no-auth, alert-styled, `tel:` links, handles 404/503 gracefully
- [x] Centralized error normalization from the backend's `{status, error, message}` shape
- [x] Loading skeletons, empty states, and confirm dialogs throughout
- [x] Route-level code splitting (bundle size warning resolved)
- [x] Dockerfile + nginx reverse proxy for production, no backend CORS required
- [x] `.env.local` + `loadEnv()` for switching the dev proxy target (local ↔ Railway) without code changes
- [x] Verified end-to-end against the live backend, not just a build check

### 🚧 Next

- [ ] Backend: add `id` to `EContactsDTO` — unblocks contact edit/delete with zero frontend changes
- [ ] Automated tests (the Playwright script used for verification was ad hoc, not committed as a test suite)
- [ ] Typed API responses for the plain-string mutation endpoints (`POST/PUT/DELETE /api/contacts*`, `DELETE /api/profile`) currently typed as `Promise<void>`
- [ ] Production CORS fallback path (rewrite rules) if the frontend is ever deployed to a static host without a server-side proxy (e.g. plain Vercel/Netlify without rewrites)
