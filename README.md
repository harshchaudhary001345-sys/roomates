# Keyless / Nishu OS — Zero-Brokerage Rental SaaS

A complete, working rental SaaS: 3D marketing landing page **plus** a real product
(auth, database, storage, dashboard) behind it.

> **It runs with zero configuration.** If you don't add Supabase keys, the app boots into
> **Demo Mode** — a full localStorage backend with seeded properties, working signup/login,
> image upload and bookings. Add keys later and every call transparently switches to Supabase.

---

## 1. Quick start (60 seconds)

```bash
npm install
npm run dev
```

Open the URL Vite prints. That's it — you have a working product.

**Demo account** (pre-seeded, Demo Mode only):

| Email                | Password      |
| -------------------- | ------------- |
| `owner@keyless.demo` | `password123` |

Or just click **Sign up** and create your own.

---

## 2. Routes

| Route              | Access    | What it does                                                |
| ------------------ | --------- | ----------------------------------------------------------- |
| `/`                | Public    | 3D landing page — every CTA is wired to the product          |
| `/signup`          | Public    | Email + password registration                                |
| `/login`           | Public    | Email + password login                                       |
| `/properties`      | Public    | All listings + live search, price slider, bedrooms, sort     |
| `/properties/:id`  | Public    | Detail page + **book a visit** form                          |
| `/dashboard`       | Protected | My properties · My bookings · Visit requests (accept/decline)|
| `/add-property`    | Protected | Create listing + drag-and-drop image upload                  |

Unauthenticated visits to a protected route bounce to `/login` and return you to
where you were after signing in.

---

## 3. Folder structure

```
.
├─ index.html
├─ .env.example                  ← copy to .env.local
├─ supabase/
│  └─ schema.sql                 ← run once in the Supabase SQL editor
├─ docs/
│  └─ NEXTJS-PORT.md             ← full Next.js App Router version, copy-paste ready
└─ src/
   ├─ App.tsx                    ← router + AuthProvider
   ├─ main.tsx
   ├─ index.css                  ← Tailwind v4 theme, glassmorphism, keyframes
   │
   ├─ lib/
   │  ├─ types.ts                ← Profile, Property, Booking
   │  ├─ supabaseClient.ts       ← creates the client (null if unconfigured)
   │  ├─ demoBackend.ts          ← localStorage backend + seed data
   │  └─ api.ts                  ← ONE API the whole app uses (auth/properties/bookings/storage)
   │
   ├─ context/
   │  └─ AuthContext.tsx         ← session state, signUp / signIn / signOut
   │
   ├─ components/
   │  ├─ app/
   │  │  ├─ Shell.tsx            ← AppLayout, Protected route, Alert, Field, SubmitButton
   │  │  └─ PropertyCard.tsx
   │  ├─ Nav.tsx  Hero.tsx  StickyCTA.tsx  ui.tsx
   │
   ├─ pages/
   │  ├─ Landing.tsx  Auth.tsx  Properties.tsx
   │  ├─ PropertyDetail.tsx  AddProperty.tsx  Dashboard.tsx
   │
   ├─ sections/                  ← landing page sections
   └─ three/
      ├─ HeroScene.tsx           ← Three.js: floating tower, glowing map pins, listing cards
      └─ SceneBoundary.tsx       ← CSS fallback if WebGL is unavailable
```

---

## 4. Going live with Supabase

### Step 1 — Create the project

1. Go to [supabase.com](https://supabase.com) → **New project**.
2. Wait for it to finish provisioning (~2 min).

### Step 2 — Create the database

Run **both** SQL files, in this order:

1. Open **SQL Editor** → **New query**.
2. Paste all of [`supabase/schema.sql`](./supabase/schema.sql) → **Run**.
3. New query again → paste all of [`supabase/verification.sql`](./supabase/verification.sql) → **Run**.

`schema.sql` creates:

- `users` (with `role`: owner / tenant), `properties`, `bookings`
- Row Level Security policies on all three
- A trigger that auto-creates a profile row on signup (carries `role` across)
- The public `property-images` storage bucket + policies

`verification.sql` creates:

- `listings` — the real listing table with `verification_status` (step1…step6) and `status` (draft / pending_review / approved / rejected)
- `verification_steps` — an audit trail of every pipeline transition
- `messages` — owner ↔ tenant chat, with Realtime enabled
- The private `verification-docs` bucket (ID, selfie, ownership doc, video) + policies

### Step 3 — Add your keys

```bash
cp .env.example .env.local
```

Fill in from **Project Settings → API**:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

### Step 4 — Turn off email confirmation (for local dev)

**Authentication → Providers → Email** → disable *Confirm email*.
Otherwise new users must click a link before they can log in.

### Step 5 — Restart

```bash
npm run dev
```

The amber "Demo Mode" banner disappears. You're on real Postgres.

---

## 5. Database schema

**users**

| column       | type          | notes                            |
| ------------ | ------------- | -------------------------------- |
| `id`         | `uuid` PK     | FK → `auth.users.id`             |
| `name`       | `text`        |                                  |
| `email`      | `text` unique |                                  |
| `avatar_url` | `text`        |                                  |
| `created_at` | `timestamptz` |                                  |

**properties**

| column                       | type          | notes                |
| ---------------------------- | ------------- | -------------------- |
| `id`                         | `uuid` PK     |                      |
| `title`, `location`          | `text`        | required             |
| `price`                      | `numeric`     | monthly rent         |
| `image`                      | `text`        | Storage public URL   |
| `description`                | `text`        |                      |
| `bedrooms`, `bathrooms`      | `int`         |                      |
| `area`                       | `int`         | sq ft                |
| `property_type`, `furnishing`| `text`        |                      |
| `available`, `verified`      | `boolean`     |                      |
| `user_id`                    | `uuid`        | FK → `users.id`      |

**bookings**

| column        | type      | notes                                  |
| ------------- | --------- | -------------------------------------- |
| `id`          | `uuid` PK |                                        |
| `property_id` | `uuid`    | FK → `properties.id`                   |
| `user_id`     | `uuid`    | FK → `users.id`                        |
| `date`        | `date`    | requested visit date                   |
| `message`     | `text`    |                                        |
| `status`      | `text`    | `pending` / `confirmed` / `cancelled`  |

### Security model (RLS)

- Anyone can **read** profiles and properties.
- You can only **insert / update / delete** a property where `user_id = auth.uid()`.
- A booking is readable by the **tenant who made it** *and* by the **owner of that property**.
- Storage uploads must land in a folder named after your own user id.

---

## 6. How the API layer works

Every component imports from `src/lib/api.ts` and never touches Supabase directly:

```ts
import { auth, properties, bookings, storage, DEMO_MODE } from "./lib/api";

const { data, error } = await properties.list();
const { data, error } = await properties.create(form, user);   // uploads image too
const { data, error } = await bookings.create({ property_id, user_id, date });
await bookings.setStatus(id, "confirmed");
```

Every function returns `{ data, error }`, so components never need `try/catch`.
Internally each one branches once:

```ts
if (DEMO_MODE) return ok(demoProperties.all());
// …otherwise hit Supabase
```

That single pattern is why the app works with **and** without a backend.

**Image handling:** `compressImage()` downscales to max 1400px and re-encodes to JPEG
before upload — faster uploads on Supabase, and small enough to fit in localStorage
in Demo Mode.

---

## 7. Build

```bash
npm run build     # outputs a single self-contained dist/index.html
npm run preview
```

> The production build inlines everything into one HTML file. Because there's no server,
> deep links like `/dashboard` only resolve on hosts configured with an SPA rewrite
> (Netlify `_redirects`, Vercel `rewrites`, or `try_files $uri /index.html` on nginx).
> In-app navigation always works.

---

## 8. Want Next.js instead?

The full **Next.js 15 App Router** version — server components, `@supabase/ssr`,
cookie-based sessions, middleware route protection and server actions — is in
[`docs/NEXTJS-PORT.md`](./docs/NEXTJS-PORT.md), copy-paste ready.

---

## 9. Tech stack

| Layer      | Choice                                              |
| ---------- | --------------------------------------------------- |
| UI         | React 19 + TypeScript + Tailwind CSS v4             |
| 3D         | Three.js via `@react-three/fiber` + `drei`          |
| Animation  | `motion` (Framer Motion) — scroll, layout, springs  |
| Routing    | React Router v7                                     |
| Backend    | Supabase — Auth, Postgres, Storage                  |
| Fallback   | localStorage demo backend (zero setup)              |
| Icons      | `lucide-react`                                      |
