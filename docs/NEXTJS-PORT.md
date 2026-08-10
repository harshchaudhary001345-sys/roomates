# Next.js 15 (App Router) + Supabase — complete port

Every file below is copy-paste ready. Create the files at the exact paths shown.

---

## Folder structure

```
keyless-next/
├─ .env.local
├─ next.config.ts
├─ package.json
├─ postcss.config.mjs
├─ tsconfig.json
├─ middleware.ts                     ← refreshes session + guards routes
├─ supabase/schema.sql               ← same file as the Vite repo
└─ src/
   ├─ app/
   │  ├─ layout.tsx                  ← root layout
   │  ├─ globals.css
   │  ├─ page.tsx                    ← landing page (paste your 3D sections here)
   │  ├─ login/page.tsx
   │  ├─ signup/page.tsx
   │  ├─ properties/
   │  │  ├─ page.tsx                 ← server component, lists all properties
   │  │  └─ [id]/page.tsx            ← detail + booking form
   │  ├─ add-property/page.tsx       ← protected
   │  └─ dashboard/page.tsx          ← protected
   ├─ actions/
   │  ├─ auth.ts                     ← server actions: signup / login / logout
   │  ├─ properties.ts               ← server action: create property + upload
   │  └─ bookings.ts                 ← server actions: create / set status
   ├─ components/
   │  ├─ AuthForm.tsx
   │  ├─ PropertyCard.tsx
   │  ├─ BookingForm.tsx
   │  ├─ AddPropertyForm.tsx
   │  └─ Header.tsx
   ├─ lib/
   │  ├─ supabase/client.ts          ← browser client
   │  ├─ supabase/server.ts          ← server client (cookies)
   │  └─ types.ts
   └─ utils/cn.ts
```

---

## 1. Install

```bash
npx create-next-app@latest keyless-next --typescript --tailwind --app --src-dir
cd keyless-next
npm install @supabase/supabase-js @supabase/ssr motion lucide-react clsx tailwind-merge
npm install three @react-three/fiber @react-three/drei
npm install -D @types/three
```

## 2. `.env.local`

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

## 3. `next.config.ts`

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "images.pexels.com" },
    ],
  },
};

export default nextConfig;
```

---

## 4. `src/lib/types.ts`

```ts
export type Profile = {
  id: string;
  name: string;
  email: string;
  avatar_url?: string | null;
  created_at: string;
};

export type Property = {
  id: string;
  title: string;
  price: number;
  location: string;
  image: string | null;
  description: string | null;
  bedrooms: number;
  bathrooms: number;
  area: number | null;
  property_type: string;
  furnishing: string;
  available: boolean;
  verified: boolean;
  user_id: string;
  created_at: string;
  users?: { name: string; email: string } | null;
};

export type Booking = {
  id: string;
  property_id: string;
  user_id: string;
  date: string;
  message: string | null;
  status: "pending" | "confirmed" | "cancelled";
  created_at: string;
  property?: Property | null;
};
```

---

## 5. `src/lib/supabase/client.ts` — browser client

```ts
"use client";

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
```

## 6. `src/lib/supabase/server.ts` — server client

```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // called from a Server Component — middleware refreshes the session instead
          }
        },
      },
    },
  );
}

/** Returns the logged-in user's profile, or null. */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return (
    profile ?? {
      id: user.id,
      name: (user.user_metadata?.name as string) ?? user.email!.split("@")[0],
      email: user.email!,
      created_at: user.created_at,
    }
  );
}
```

---

## 7. `middleware.ts` — session refresh + route protection

```ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED = ["/dashboard", "/add-property"];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: this refreshes the auth token. Do not remove.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (!user && PROTECTED.some((p) => pathname.startsWith(p))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (user && (pathname === "/login" || pathname === "/signup")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
```

---

## 8. `src/actions/auth.ts` — server actions

```ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type ActionState = { error: string | null };

export async function signUpAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!name || !email || password.length < 6)
    return { error: "Please fill every field. Password needs 6+ characters." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });

  if (error) return { error: error.message };

  if (data.user) {
    await supabase
      .from("users")
      .upsert({ id: data.user.id, name, email }, { onConflict: "id" });
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signInAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/dashboard");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect(next);
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
```

---

## 9. `src/actions/properties.ts`

```ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, getCurrentUser } from "@/lib/supabase/server";

export type ActionState = { error: string | null };

export async function createPropertyAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "You must be logged in." };

  const supabase = await createClient();

  // ---- 1. optional image upload -------------------------------------------
  let imageUrl: string | null = null;
  const file = formData.get("image") as File | null;

  if (file && file.size > 0) {
    if (!file.type.startsWith("image/")) return { error: "That is not an image." };
    if (file.size > 8 * 1024 * 1024) return { error: "Image must be under 8 MB." };

    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from("property-images")
      .upload(path, file, { contentType: file.type, upsert: false });

    if (upErr) return { error: upErr.message };

    imageUrl = supabase.storage.from("property-images").getPublicUrl(path)
      .data.publicUrl;
  }

  // ---- 2. insert the row ---------------------------------------------------
  const { data, error } = await supabase
    .from("properties")
    .insert({
      title: String(formData.get("title") ?? "").trim(),
      price: Number(formData.get("price")),
      location: String(formData.get("location") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim() || null,
      bedrooms: Number(formData.get("bedrooms") ?? 1),
      bathrooms: Number(formData.get("bathrooms") ?? 1),
      area: formData.get("area") ? Number(formData.get("area")) : null,
      property_type: String(formData.get("property_type") ?? "Apartment"),
      furnishing: String(formData.get("furnishing") ?? "Semi-furnished"),
      image: imageUrl,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/properties");
  revalidatePath("/dashboard");
  redirect(`/properties/${data.id}`);
}

export async function deletePropertyAction(id: string) {
  const supabase = await createClient();
  await supabase.from("properties").delete().eq("id", id);
  revalidatePath("/dashboard");
  revalidatePath("/properties");
}
```

---

## 10. `src/actions/bookings.ts`

```ts
"use server";

import { revalidatePath } from "next/cache";
import { createClient, getCurrentUser } from "@/lib/supabase/server";

export type ActionState = { error: string | null; success?: boolean };

export async function createBookingAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please log in to book a visit." };

  const supabase = await createClient();
  const { error } = await supabase.from("bookings").insert({
    property_id: String(formData.get("property_id")),
    user_id: user.id,
    date: String(formData.get("date")),
    message: String(formData.get("message") ?? "").trim() || null,
    status: "pending",
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return { error: null, success: true };
}

export async function setBookingStatusAction(
  id: string,
  status: "pending" | "confirmed" | "cancelled",
) {
  const supabase = await createClient();
  await supabase.from("bookings").update({ status }).eq("id", id);
  revalidatePath("/dashboard");
}
```

---

## 11. `src/app/layout.tsx`

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Keyless — Zero Brokerage Rentals. Verified Homes. Real Owners.",
  description:
    "Video-verified homes, direct owner contact, move in 3× faster. Stop paying brokers ₹85,000 to unlock a door.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-[#04050a] text-slate-200 antialiased">
        {children}
      </body>
    </html>
  );
}
```

---

## 12. `src/components/AuthForm.tsx` — shared login/signup client component

```tsx
"use client";

import { useActionState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { AlertCircle, Loader2 } from "lucide-react";
import { signInAction, signUpAction, type ActionState } from "@/actions/auth";

const input =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-violet-400/50 focus:outline-none focus:ring-2 focus:ring-violet-500/25";

export default function AuthForm({
  mode,
  next = "/dashboard",
}: {
  mode: "login" | "signup";
  next?: string;
}) {
  const action = mode === "login" ? signInAction : signUpAction;
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    action,
    { error: null },
  );

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      action={formAction}
      className="flex w-full max-w-md flex-col gap-4"
    >
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          {mode === "login" ? "Welcome back" : "Create your free account"}
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          {mode === "login"
            ? "Log in to manage your listings and bookings."
            : "Free forever for tenants. No card, no brokerage."}
        </p>
      </div>

      {state.error && (
        <p className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-[13px] text-rose-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {state.error}
        </p>
      )}

      <input type="hidden" name="next" value={next} />

      {mode === "signup" && (
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-slate-300">Full name</span>
          <input name="name" required placeholder="Ananya Rao" className={input} />
        </label>
      )}

      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-slate-300">Email</span>
        <input type="email" name="email" required placeholder="you@email.com" className={input} />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-slate-300">Password</span>
        <input type="password" name="password" required minLength={6} placeholder="••••••••" className={input} />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-[linear-gradient(100deg,#7c3aed,#4f46e5_45%,#0891b2)] px-5 py-3 text-sm font-semibold text-white ring-1 ring-white/20 disabled:opacity-60"
      >
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {mode === "login" ? "Log in" : "Create free account"}
      </button>

      <p className="text-center text-sm text-slate-500">
        {mode === "login" ? (
          <>
            New here?{" "}
            <Link href="/signup" className="font-semibold text-violet-300">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already registered?{" "}
            <Link href="/login" className="font-semibold text-violet-300">
              Log in
            </Link>
          </>
        )}
      </p>
    </motion.form>
  );
}
```

## 13. `src/app/login/page.tsx` and `src/app/signup/page.tsx`

```tsx
// src/app/login/page.tsx
import AuthForm from "@/components/AuthForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center px-5">
      <AuthForm mode="login" next={next ?? "/dashboard"} />
    </main>
  );
}
```

```tsx
// src/app/signup/page.tsx
import AuthForm from "@/components/AuthForm";

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5">
      <AuthForm mode="signup" />
    </main>
  );
}
```

---

## 14. `src/app/properties/page.tsx` — server component

```tsx
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PropertyCard from "@/components/PropertyCard";
import type { Property } from "@/lib/types";

export const revalidate = 0; // always fresh

export default async function PropertiesPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*, users:user_id (name, email)")
    .order("created_at", { ascending: false });

  const properties = (data ?? []) as Property[];

  return (
    <main className="mx-auto max-w-7xl px-5 py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-white">
            Verified homes
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            {properties.length} homes · zero brokerage on every one.
          </p>
        </div>
        <Link
          href="/add-property"
          className="rounded-full bg-[linear-gradient(100deg,#7c3aed,#0891b2)] px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-white/20"
        >
          List your property
        </Link>
      </div>

      {error && <p className="mt-6 text-sm text-rose-300">{error.message}</p>}

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {properties.map((p) => (
          <PropertyCard key={p.id} property={p} />
        ))}
      </div>
    </main>
  );
}
```

## 15. `src/components/PropertyCard.tsx`

```tsx
import Image from "next/image";
import Link from "next/link";
import { Bath, BedDouble, MapPin, Ruler } from "lucide-react";
import type { Property } from "@/lib/types";

export default function PropertyCard({ property }: { property: Property }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur transition hover:-translate-y-1.5 hover:shadow-[0_30px_70px_-35px_rgba(99,102,241,0.9)]">
      <Link href={`/properties/${property.id}`} className="relative block aspect-[16/10]">
        {property.image ? (
          <Image
            src={property.image}
            alt={property.title}
            fill
            sizes="(max-width:768px) 100vw, 33vw"
            className="object-cover transition duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-[#0d1020] to-[#141a2e]" />
        )}
        <span className="absolute top-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur">
          0% BROKERAGE
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <Link href={`/properties/${property.id}`}>
          <h3 className="line-clamp-1 font-semibold text-white">{property.title}</h3>
        </Link>
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-400">
          <MapPin className="h-3.5 w-3.5" /> {property.location}
        </p>

        <div className="mt-4 flex gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1.5"><BedDouble className="h-4 w-4" /> {property.bedrooms}</span>
          <span className="flex items-center gap-1.5"><Bath className="h-4 w-4" /> {property.bathrooms}</span>
          {property.area && (
            <span className="flex items-center gap-1.5"><Ruler className="h-4 w-4" /> {property.area} sqft</span>
          )}
        </div>

        <div className="mt-auto flex items-end justify-between pt-5">
          <p className="text-xl font-semibold text-white">
            ₹{property.price.toLocaleString("en-IN")}
            <span className="text-xs font-normal text-slate-500">/mo</span>
          </p>
          <Link
            href={`/properties/${property.id}`}
            className="rounded-lg bg-white/8 px-3.5 py-2 text-xs font-semibold text-white ring-1 ring-white/12"
          >
            View & book
          </Link>
        </div>
      </div>
    </article>
  );
}
```

---

## 16. `src/app/properties/[id]/page.tsx` — detail + booking

```tsx
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import BookingForm from "@/components/BookingForm";
import type { Property } from "@/lib/types";

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("properties")
    .select("*, users:user_id (name, email)")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();
  const property = data as Property;
  const user = await getCurrentUser();

  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-5 py-10 lg:grid-cols-[1.55fr_1fr]">
      <div>
        <div className="relative aspect-[16/10] overflow-hidden rounded-3xl">
          {property.image && (
            <Image src={property.image} alt={property.title} fill className="object-cover" />
          )}
        </div>
        <h1 className="mt-7 text-4xl font-semibold tracking-tight text-white">
          {property.title}
        </h1>
        <p className="mt-2 text-slate-400">{property.location}</p>
        <p className="mt-6 whitespace-pre-line leading-relaxed text-slate-400">
          {property.description}
        </p>
        <p className="mt-6 text-sm text-slate-400">
          Owner: <span className="text-white">{property.users?.name}</span> ·{" "}
          {property.users?.email}
        </p>
      </div>

      <aside className="lg:sticky lg:top-8 lg:self-start">
        <div className="rounded-3xl border border-white/12 bg-white/6 p-6 backdrop-blur">
          <p className="text-3xl font-semibold text-white">
            ₹{property.price.toLocaleString("en-IN")}
            <span className="text-sm text-slate-500"> / month</span>
          </p>
          <p className="mt-2 text-xs text-emerald-300">+ ₹0 brokerage</p>
          <div className="my-5 h-px bg-white/10" />
          <BookingForm propertyId={property.id} loggedIn={!!user} />
        </div>
      </aside>
    </main>
  );
}
```

## 17. `src/components/BookingForm.tsx`

```tsx
"use client";

import { useActionState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";
import { createBookingAction, type ActionState } from "@/actions/bookings";

const input =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-violet-400/50 focus:outline-none";

export default function BookingForm({
  propertyId,
  loggedIn,
}: {
  propertyId: string;
  loggedIn: boolean;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createBookingAction,
    { error: null },
  );

  if (!loggedIn)
    return (
      <Link
        href={`/login?next=/properties/${propertyId}`}
        className="block rounded-xl bg-[linear-gradient(100deg,#7c3aed,#0891b2)] px-5 py-3 text-center text-sm font-semibold text-white"
      >
        Log in to book a visit
      </Link>
    );

  if (state.success)
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <CheckCircle2 className="h-10 w-10 text-emerald-400" />
        <p className="font-semibold text-white">Visit requested</p>
        <Link href="/dashboard" className="text-sm text-violet-300">
          View in dashboard →
        </Link>
      </div>
    );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="property_id" value={propertyId} />

      {state.error && <p className="text-sm text-rose-300">{state.error}</p>}

      <label className="block">
        <span className="mb-1.5 block text-xs text-slate-300">Preferred date</span>
        <input
          type="date"
          name="date"
          required
          min={new Date().toISOString().slice(0, 10)}
          className={input}
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs text-slate-300">Message (optional)</span>
        <textarea name="message" rows={3} className={`${input} resize-none`} />
      </label>

      <button
        disabled={pending}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[linear-gradient(100deg,#7c3aed,#0891b2)] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        Request visit
      </button>
    </form>
  );
}
```

---

## 18. `src/app/add-property/page.tsx` + form

```tsx
// src/app/add-property/page.tsx  (protected by middleware)
import AddPropertyForm from "@/components/AddPropertyForm";

export default function AddPropertyPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <h1 className="text-4xl font-semibold tracking-tight text-white">
        List your property
      </h1>
      <p className="mt-2 text-sm text-slate-400">
        Takes about 9 minutes. One flat fee — never a cut of your rent.
      </p>
      <AddPropertyForm />
    </main>
  );
}
```

```tsx
// src/components/AddPropertyForm.tsx
"use client";

import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";
import { createPropertyAction, type ActionState } from "@/actions/properties";

const input =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-violet-400/50 focus:outline-none";

export default function AddPropertyForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createPropertyAction,
    { error: null },
  );
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-5">
      {state.error && <p className="text-sm text-rose-300">{state.error}</p>}

      <label className="block">
        <span className="mb-1.5 block text-xs text-slate-300">Cover photo</span>
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={(e) => {
            const f = e.target.files?.[0];
            setPreview(f ? URL.createObjectURL(f) : null);
          }}
          className="w-full rounded-xl border border-dashed border-white/15 px-4 py-6 text-sm text-slate-400 file:mr-4 file:rounded-lg file:border-0 file:bg-violet-600 file:px-4 file:py-2 file:text-white"
        />
        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="preview" className="mt-3 aspect-video w-full rounded-xl object-cover" />
        )}
      </label>

      <input name="title" required placeholder="Light-filled 2BHK with open kitchen" className={input} />

      <div className="grid gap-4 sm:grid-cols-2">
        <input name="price" type="number" required min={1000} placeholder="Monthly rent ₹" className={input} />
        <input name="location" required placeholder="Koramangala, Bengaluru" className={input} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <input name="bedrooms" type="number" defaultValue={2} min={1} className={input} />
        <input name="bathrooms" type="number" defaultValue={2} min={1} className={input} />
        <input name="area" type="number" placeholder="Area sqft" className={input} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <select name="property_type" className={input} defaultValue="Apartment">
          {["Apartment", "Independent House", "Villa", "Studio", "PG / Shared"].map((t) => (
            <option key={t} className="bg-[#0b0d18]">{t}</option>
          ))}
        </select>
        <select name="furnishing" className={input} defaultValue="Semi-furnished">
          {["Unfurnished", "Semi-furnished", "Fully furnished"].map((t) => (
            <option key={t} className="bg-[#0b0d18]">{t}</option>
          ))}
        </select>
      </div>

      <textarea name="description" rows={5} placeholder="Describe the home…" className={`${input} resize-none`} />

      <button
        disabled={pending}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[linear-gradient(100deg,#7c3aed,#0891b2)] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        Publish listing
      </button>
    </form>
  );
}
```

---

## 19. `src/app/dashboard/page.tsx` — server component

```tsx
import Link from "next/link";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import PropertyCard from "@/components/PropertyCard";
import type { Booking, Property } from "@/lib/types";

export const revalidate = 0;

export default async function DashboardPage() {
  const user = await getCurrentUser();           // middleware guarantees this exists
  const supabase = await createClient();

  const [{ data: props }, { data: myBookings }] = await Promise.all([
    supabase.from("properties").select("*").eq("user_id", user!.id)
      .order("created_at", { ascending: false }),
    supabase.from("bookings").select("*, property:property_id (*)")
      .eq("user_id", user!.id).order("created_at", { ascending: false }),
  ]);

  const properties = (props ?? []) as Property[];
  const bookings = (myBookings ?? []) as Booking[];

  const ids = properties.map((p) => p.id);
  const { data: reqs } = ids.length
    ? await supabase.from("bookings").select("*, property:property_id (*)").in("property_id", ids)
    : { data: [] };
  const requests = (reqs ?? []) as Booking[];

  const income = properties.reduce((s, p) => s + Number(p.price), 0);

  const stats = [
    { v: properties.length, l: "Properties listed" },
    { v: bookings.length, l: "Visits you booked" },
    { v: requests.length, l: "Requests received" },
    { v: `₹${income.toLocaleString("en-IN")}`, l: "Potential monthly income" },
  ];

  return (
    <main className="mx-auto max-w-7xl px-5 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-white">
            Welcome back, {user!.name.split(" ")[0]}.
          </h1>
          <p className="mt-2 text-sm text-slate-400">{user!.email}</p>
        </div>
        <Link
          href="/add-property"
          className="rounded-full bg-[linear-gradient(100deg,#7c3aed,#0891b2)] px-5 py-2.5 text-sm font-semibold text-white"
        >
          Add property
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.l} className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-3xl font-semibold text-white">{s.v}</p>
            <p className="mt-2 text-xs text-slate-500">{s.l}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-12 text-xl font-semibold text-white">My properties</h2>
      {properties.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">
          Nothing listed yet.{" "}
          <Link href="/add-property" className="text-violet-300">List your first property →</Link>
        </p>
      ) : (
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((p) => <PropertyCard key={p.id} property={p} />)}
        </div>
      )}

      <h2 className="mt-12 text-xl font-semibold text-white">My bookings</h2>
      <div className="mt-5 flex flex-col gap-3">
        {bookings.length === 0 && (
          <p className="text-sm text-slate-500">
            No visits booked.{" "}
            <Link href="/properties" className="text-violet-300">Browse homes →</Link>
          </p>
        )}
        {bookings.map((b) => (
          <div key={b.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
            <div>
              <p className="font-medium text-white">{b.property?.title}</p>
              <p className="text-xs text-slate-500">
                Visit on {new Date(b.date).toLocaleDateString("en-IN")}
              </p>
            </div>
            <span className="rounded-full bg-white/8 px-3 py-1 text-[11px] font-bold uppercase text-slate-300">
              {b.status}
            </span>
          </div>
        ))}
      </div>
    </main>
  );
}
```

---

## 20. `src/app/page.tsx` — landing

Copy your existing landing sections in. The only changes needed:

1. Add `"use client"` to any component using hooks, `motion`, or `@react-three/fiber`.
2. Swap `<a href="/properties">` → `<Link href="/properties">` from `next/link`.
3. Load the 3D scene without SSR:

```tsx
"use client";

import dynamic from "next/dynamic";

const HeroScene = dynamic(() => import("@/components/three/HeroScene"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-[#04050a]" />,
});
```

---

## 21. Run it

```bash
npm run dev
```

| Route             | Behaviour                                        |
| ----------------- | ------------------------------------------------ |
| `/`               | Landing page                                     |
| `/signup`         | Creates auth user + profile row, redirects       |
| `/login`          | Sets the session cookie, redirects to `?next=`   |
| `/properties`     | Server-rendered from Postgres                    |
| `/properties/:id` | Detail + booking server action                   |
| `/dashboard`      | Middleware redirects to `/login` when signed out |
| `/add-property`   | Multipart upload → Storage → row insert          |

### Deploy to Vercel

```bash
vercel
```

Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in
**Project → Settings → Environment Variables**, then redeploy.
