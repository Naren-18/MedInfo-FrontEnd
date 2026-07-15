# 🏥 MedInfo — Frontend

The client for the [MedInfo microservices backend](https://github.com/Naren-18/MedInfo-Backend-Microservices) — an emergency medical information platform. Register, build a medical profile, add emergency contacts, then get a QR code that lets anyone — no login required — see your critical medical information in an emergency.

> 📐 Deep-dive documentation: **[Architecture.md](Architecture.md)** — design decisions, the CORS-avoidance strategy, real issues hit, and end-to-end verification results.

---

## ⚙️ Tech Stack

- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui (Radix primitives)
- React Router v6
- TanStack Query (server state, caching, invalidation)
- react-hook-form + zod (validation mirrors the backend DTOs exactly)
- axios
- qrcode.react

---

## 🚀 Running Locally

The backend needs to be running first — see [`TESTING.md`](../MedInfo-Backend-Microservices/TESTING.md) in the backend repo.

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`.

### Pointing at a different backend (local vs. Railway)

Copy `.env.example` to `.env.local` and set the Gateway URL:

```bash
cp .env.example .env.local
```

```bash
# .env.local
VITE_GATEWAY_URL=https://gateway-service-production-2453.up.railway.app
# or, for local backend:
# VITE_GATEWAY_URL=http://localhost:8080
```

Restart `npm run dev` after changing it — env vars are only read at startup. `.env.local` is gitignored, so this never gets committed. If the file or variable is absent, it defaults to `http://localhost:8080`.

### Why there's no CORS configuration anywhere

The backend has no CORS setup, and this project is built to never need one. `vite.config.ts` proxies every `/api/*` request to the Gateway **server-side**, inside Vite's Node process — the browser only ever talks to `localhost:5173`, so no CORS preflight is ever triggered, regardless of which backend `VITE_GATEWAY_URL` points at.

---

## 📦 Production Build

```bash
npm run build   # outputs to dist/
```

### 🐳 Docker

```bash
docker build -t medinfo-frontend .
docker run -p 8081:80 -e GATEWAY_URL=https://gateway-service-production-2453.up.railway.app medinfo-frontend
```

The image serves the built app via nginx, which reverse-proxies `/api/*` to `GATEWAY_URL` the same way the Vite dev proxy does — same-origin from the browser's perspective, so the backend still never needs CORS. `GATEWAY_URL` is read at **container start** (not baked into the image), so switching backends doesn't require a rebuild. Defaults to `http://gateway-service:8080`, matching the service name Docker Compose would assign if this container joins the backend's `infrastructure/docker-compose.yml` network.

---

## ⚠️ A Known Backend Limitation (Not a Frontend Bug)

`GET /api/contacts` currently returns each contact as `{name, relationship, phoneNumber}` — **no `id`** (verified directly against `EmergencyContactsService.java`). `PUT /api/contacts/{id}` and `DELETE /api/contacts/{id}` both require that id, so there is currently no way to actually edit or delete a specific contact. This frontend is written *assuming* `id` will be added to `EContactsDTO` — edit/delete fail gracefully with a toast (not a crash) until that backend change lands, with no frontend changes needed once it does.

Also worth knowing: `GET /api/profile` never returns `publicProfileId` (only `POST`/`PUT` do), so the Emergency Card's QR code is cached in `localStorage` per-user the moment it's created or updated. On a new device or after clearing browser data, the Emergency Card page explains this and points back to the medical profile page. Full detail in [Architecture.md](Architecture.md).

---

## 📂 Project Structure

```
src/
├── api/          # axios client + one module per backend resource, TS types matching every DTO
├── components/
│   ├── ui/         # shadcn primitives
│   ├── layout/       # Navbar, route guards, page shell
│   ├── profile/        # medical profile form + summary card
│   └── contacts/         # emergency contact form
├── context/       # AuthContext (JWT storage, login/logout, session-expiry handling)
├── hooks/         # React Query hooks per resource
├── lib/           # validation schemas, error normalization, utils, publicProfileId cache
└── pages/         # one file per route
```

---

## ✅ Verified End-to-End

Register → login → create medical profile → view/edit profile → add emergency contact → generate & view QR code → open the public `/emergency/:publicProfileId` link in a fresh unauthenticated browser context → confirm live data renders, including a cache-hit reload → logout → confirm protected routes redirect. Run against the real, live backend — zero console errors outside the documented contact-id gap above. Full verification log in [Architecture.md](Architecture.md).
