import type {
  Booking,
  Listing,
  Profile,
  Property,
  VerificationStep,
} from "./types";

/**
 * ---------------------------------------------------------------------------
 *  DEMO BACKEND (localStorage)
 * ---------------------------------------------------------------------------
 *  A tiny, dependency-free stand-in for Supabase so the product is fully
 *  usable the instant you run `npm run dev` — no account, no keys, no SQL.
 *
 *  The moment you add real Supabase keys to `.env.local`, `src/lib/api.ts`
 *  routes every call to Supabase instead and this file is never touched.
 * ---------------------------------------------------------------------------
 */

const K = {
  users: "nishu.users",
  session: "nishu.session",
  properties: "nishu.properties",
  bookings: "nishu.bookings",
  listings: "nishu.listings",
  steps: "nishu.verification_steps",
  transactions: "nishu.transactions",
  messages: "nishu.messages",
  seeded: "nishu.seeded.v1",
};

type DemoUser = Profile & { password: string };

/* --------------------------------- utils --------------------------------- */

export const uid = () =>
  "id_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota exceeded — ignore */
  }
}

/* Extremely small non-cryptographic hash. Demo mode only. */
function hash(s: string) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (h * 33) ^ s.charCodeAt(i);
  return (h >>> 0).toString(36);
}

/* --------------------------------- seed ---------------------------------- */

const DEMO_OWNER_ID = "demo_owner_001";

const SEED_PROPERTIES: Omit<Property, "created_at">[] = [
  {
    id: "seed_1",
    title: "Light-filled 2BHK with open kitchen",
    price: 38000,
    location: "Koramangala 5th Block, Bengaluru",
    image:
      "https://images.pexels.com/photos/8089172/pexels-photo-8089172.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    description:
      "Corner unit on the 7th floor with a wide balcony, modular kitchen and covered parking. 18 minutes to Embassy Tech Village. Cauvery + borewell water, zero power cuts in the last 30 days.",
    bedrooms: 2,
    bathrooms: 2,
    area: 1180,
    property_type: "Apartment",
    furnishing: "Semi-furnished",
    available: true,
    verified: true,
    user_id: DEMO_OWNER_ID,
    owner_name: "Ananya R.",
    owner_email: "ananya@keyless.demo",
  },
  {
    id: "seed_2",
    title: "Semi-furnished 3BHK, 11th floor",
    price: 72500,
    location: "Powai, Mumbai",
    image:
      "https://images.pexels.com/photos/7167073/pexels-photo-7167073.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    description:
      "Lake-facing tower with gym, pool and 24×7 security. Two covered parking slots. 24 minutes to BKC on a normal weekday morning.",
    bedrooms: 3,
    bathrooms: 3,
    area: 1460,
    property_type: "Apartment",
    furnishing: "Semi-furnished",
    available: true,
    verified: true,
    user_id: DEMO_OWNER_ID,
    owner_name: "Vikram S.",
    owner_email: "vikram@keyless.demo",
  },
  {
    id: "seed_3",
    title: "Corner 2BHK with balcony garden",
    price: 31000,
    location: "Baner, Pune",
    image:
      "https://images.pexels.com/photos/7173666/pexels-photo-7173666.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    description:
      "Quiet lane, plenty of natural light, pet-friendly society. 16 minutes to Hinjewadi Phase 1. Groceries and a clinic within a 5-minute walk.",
    bedrooms: 2,
    bathrooms: 2,
    area: 1020,
    property_type: "Apartment",
    furnishing: "Unfurnished",
    available: true,
    verified: true,
    user_id: DEMO_OWNER_ID,
    owner_name: "Meera J.",
    owner_email: "meera@keyless.demo",
  },
  {
    id: "seed_4",
    title: "Compact 1BHK, fully furnished",
    price: 24500,
    location: "Gachibowli, Hyderabad",
    image:
      "https://images.pexels.com/photos/19239905/pexels-photo-19239905.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    description:
      "Move-in ready with bed, wardrobe, fridge, washing machine and AC. 9 minutes to the Financial District. Ideal for a working professional.",
    bedrooms: 1,
    bathrooms: 1,
    area: 690,
    property_type: "Apartment",
    furnishing: "Fully furnished",
    available: true,
    verified: true,
    user_id: DEMO_OWNER_ID,
    owner_name: "Rahul T.",
    owner_email: "rahul@keyless.demo",
  },
  {
    id: "seed_5",
    title: "Quiet 2BHK in gated society",
    price: 46000,
    location: "Sector 54, Gurgaon",
    image:
      "https://images.pexels.com/photos/7587783/pexels-photo-7587783.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    description:
      "Low-rise gated community with landscaped gardens and a clubhouse. 21 minutes to Cyber Hub. Power backup for the full flat.",
    bedrooms: 2,
    bathrooms: 2,
    area: 1240,
    property_type: "Apartment",
    furnishing: "Semi-furnished",
    available: true,
    verified: true,
    user_id: DEMO_OWNER_ID,
    owner_name: "Priya K.",
    owner_email: "priya@keyless.demo",
  },
  {
    id: "seed_6",
    title: "Minimal studio, sea-breeze facing",
    price: 19800,
    location: "Besant Nagar, Chennai",
    image:
      "https://images.pexels.com/photos/6489096/pexels-photo-6489096.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    description:
      "Bright studio a 6-minute walk from Elliot's Beach. Built-in storage, independent entrance, quiet after 9 PM.",
    bedrooms: 1,
    bathrooms: 1,
    area: 540,
    property_type: "Studio",
    furnishing: "Semi-furnished",
    available: true,
    verified: false,
    user_id: DEMO_OWNER_ID,
    owner_name: "Karthik M.",
    owner_email: "karthik@keyless.demo",
  },
];

export function seedDemoData() {
  const now = Date.now();
  if (localStorage.getItem(K.seeded)) {
    // Lightweight migration for users who already ran an older demo build.
    const existingUsers = read<DemoUser[]>(K.users, []);
    if (existingUsers.some((u) => !u.role)) {
      write(
        K.users,
        existingUsers.map((u) => ({ ...u, role: u.role ?? "tenant" })),
      );
    }
    if (read<Listing[]>(K.listings, []).length === 0) {
      write(
        K.listings,
        SEED_PROPERTIES.map((p, i) => ({
          id: `listing_${p.id}`,
          user_id: DEMO_OWNER_ID,
          owner_id: DEMO_OWNER_ID,
          title: p.title,
          location: p.location,
          price: p.price,
          image: p.image,
          description: p.description,
          bedrooms: p.bedrooms,
          bathrooms: p.bathrooms,
          area: p.area,
          property_type: p.property_type,
          furnishing: p.furnishing,
          status: i < 5 ? "approved" : "pending_review",
          payment_status: i < 5 ? "paid" : "unpaid",
          tier: "basic",
          transaction_id: i < 5 ? `txn_seed_${p.id}` : null,
          verification_status: i < 5 ? "step6" : "step5",
          id_doc_url: null,
          ownership_doc_url: null,
          video_url: null,
          face_match_url: null,
          face_match_passed: i < 5,
          review_note: i < 5 ? "Approved in demo seed." : "Waiting for admin review.",
          created_at: new Date(now - i * 86_400_000).toISOString(),
          updated_at: new Date(now - i * 86_400_000).toISOString(),
        } satisfies Listing)),
      );
    }
    return;
  }
  const owner: DemoUser = {
    id: DEMO_OWNER_ID,
    name: "Keyless Demo Owner",
    email: "owner@keyless.demo",
    role: "owner",
    password: hash("password123"),
    avatar_url: null,
    phone: null,
    created_at: new Date(now).toISOString(),
  };

  write(K.users, [owner]);
  write(
    K.properties,
    SEED_PROPERTIES.map((p, i) => ({
      ...p,
      created_at: new Date(now - i * 86_400_000).toISOString(),
    })),
  );
  write(K.bookings, []);
  write(
    K.listings,
    SEED_PROPERTIES.map((p, i) => ({
      id: `listing_${p.id}`,
      user_id: DEMO_OWNER_ID,
      owner_id: DEMO_OWNER_ID,
      title: p.title,
      location: p.location,
      price: p.price,
      image: p.image,
      description: p.description,
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      area: p.area,
      property_type: p.property_type,
      furnishing: p.furnishing,
      status: i < 5 ? "approved" : "pending_review",
      payment_status: i < 5 ? "paid" : "unpaid",
      tier: "basic",
      transaction_id: i < 5 ? `txn_seed_${p.id}` : null,
      verification_status: i < 5 ? "step6" : "step5",
      id_doc_url: null,
      ownership_doc_url: null,
      video_url: null,
      face_match_url: null,
      face_match_passed: i < 5,
      review_note: i < 5 ? "Approved in demo seed." : "Waiting for admin review.",
      created_at: new Date(now - i * 86_400_000).toISOString(),
      updated_at: new Date(now - i * 86_400_000).toISOString(),
    } satisfies Listing)),
  );
  // Seed a realistic audit trail so the verification timeline is visible
  // immediately, without having to create a listing first.
  const seededSteps: StepRecord[] = [];
  SEED_PROPERTIES.forEach((p, i) => {
    const approved = i < 5;
    const upTo: VerificationStep[] = approved
      ? ["step1", "step2", "step3", "step4", "step5", "step6"]
      : ["step1", "step2", "step3", "step4", "step5"];
    const base = now - i * 86_400_000 - upTo.length * 3_600_000;
    upTo.forEach((step, s) => {
      seededSteps.push({
        id: `seedstep_${p.id}_${step}`,
        listing_id: `listing_${p.id}`,
        step,
        status: "completed",
        note:
          step === "step6"
            ? "Approved — Verified Badge issued."
            : step === "step5"
              ? approved
                ? "Reviewed by verification specialist."
                : "Awaiting specialist review."
              : null,
        actor: step === "step1" ? "system" : step === "step6" ? "admin" : "owner",
        created_at: new Date(base + s * 3_600_000).toISOString(),
      });
    });
  });
  write(K.steps, seededSteps);

  // A sample thread so the inbox + notification bell have something to show.
  const tenant: DemoUser = {
    id: "demo_tenant_001",
    name: "Aditi Sharma",
    email: "tenant@keyless.demo",
    role: "tenant",
    password: hash("password123"),
    avatar_url: null,
    phone: null,
    created_at: new Date(now).toISOString(),
  };
  write(K.users, [...read<DemoUser[]>(K.users, []), tenant]);
  write(K.messages, [
    {
      id: "seedmsg_1",
      sender_id: tenant.id,
      receiver_id: DEMO_OWNER_ID,
      listing_id: "listing_seed_1",
      text: "Hi! Is the 2BHK in Koramangala still available for an April move-in?",
      read_at: null,
      created_at: new Date(now - 5_400_000).toISOString(),
    },
    {
      id: "seedmsg_2",
      sender_id: tenant.id,
      receiver_id: DEMO_OWNER_ID,
      listing_id: "listing_seed_1",
      text: "Also — is covered parking included in the rent?",
      read_at: null,
      created_at: new Date(now - 3_600_000).toISOString(),
    },
  ] satisfies import("./types").Message[]);

  localStorage.setItem(K.seeded, "1");
}

/* --------------------------------- auth ---------------------------------- */

export const demoAuth = {
  currentUser(): Profile | null {
    const id = read<string | null>(K.session, null);
    if (!id) return null;
    const user = read<DemoUser[]>(K.users, []).find((u) => u.id === id);
    if (!user) return null;
    const { password: _pw, ...profile } = user;
    return { ...profile, role: profile.role ?? "tenant" };
  },

  signUp(name: string, email: string, password: string, role: Profile["role"] = "tenant"): Profile {
    const users = read<DemoUser[]>(K.users, []);
    const clean = email.trim().toLowerCase();

    if (users.some((u) => u.email.toLowerCase() === clean)) {
      throw new Error("An account with this email already exists. Try logging in.");
    }
    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters.");
    }

    const user: DemoUser = {
      id: uid(),
      name: name.trim() || clean.split("@")[0],
      email: clean,
      role,
      password: hash(password),
      avatar_url: null,
      phone: null,
      created_at: new Date().toISOString(),
    };

    write(K.users, [...users, user]);
    write(K.session, user.id);

    const { password: _pw, ...profile } = user;
    return profile;
  },

  signIn(email: string, password: string): Profile {
    const clean = email.trim().toLowerCase();
    const user = read<DemoUser[]>(K.users, []).find(
      (u) => u.email.toLowerCase() === clean,
    );
    if (!user || user.password !== hash(password)) {
      throw new Error("Invalid email or password.");
    }
    write(K.session, user.id);
    const { password: _pw, ...profile } = user;
    return { ...profile, role: profile.role ?? "tenant" };
  },

  signOut() {
    localStorage.removeItem(K.session);
  },
};

/* ------------------------------- properties ------------------------------- */

export const demoProperties = {
  all(): Property[] {
    return read<Property[]>(K.properties, []).sort((a, b) =>
      b.created_at.localeCompare(a.created_at),
    );
  },

  byId(id: string): Property | null {
    return read<Property[]>(K.properties, []).find((p) => p.id === id) ?? null;
  },

  byUser(userId: string): Property[] {
    return demoProperties.all().filter((p) => p.user_id === userId);
  },

  create(input: Omit<Property, "id" | "created_at">): Property {
    const property: Property = {
      ...input,
      id: uid(),
      created_at: new Date().toISOString(),
    };
    write(K.properties, [property, ...read<Property[]>(K.properties, [])]);
    return property;
  },

  update(id: string, patch: Partial<Property>): Property | null {
    const list = read<Property[]>(K.properties, []);
    const idx = list.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...patch };
    write(K.properties, list);
    return list[idx];
  },

  remove(id: string) {
    write(
      K.properties,
      read<Property[]>(K.properties, []).filter((p) => p.id !== id),
    );
    write(
      K.bookings,
      read<Booking[]>(K.bookings, []).filter((b) => b.property_id !== id),
    );
  },
};

/* -------------------------------- bookings -------------------------------- */

export const demoBookings = {
  create(input: Omit<Booking, "id" | "created_at" | "property">): Booking {
    const booking: Booking = {
      ...input,
      id: uid(),
      created_at: new Date().toISOString(),
    };
    write(K.bookings, [booking, ...read<Booking[]>(K.bookings, [])]);
    return booking;
  },

  byUser(userId: string): Booking[] {
    return read<Booking[]>(K.bookings, [])
      .filter((b) => b.user_id === userId)
      .map((b) => ({ ...b, property: demoProperties.byId(b.property_id) }))
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  },

  /** Requests received on properties this user owns. */
  forOwner(userId: string): Booking[] {
    const mine = new Set(demoProperties.byUser(userId).map((p) => p.id));
    return read<Booking[]>(K.bookings, [])
      .filter((b) => mine.has(b.property_id))
      .map((b) => ({ ...b, property: demoProperties.byId(b.property_id) }))
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  },

  updateStatus(id: string, status: Booking["status"]) {
    const list = read<Booking[]>(K.bookings, []);
    const idx = list.findIndex((b) => b.id === id);
    if (idx === -1) return;
    list[idx] = { ...list[idx], status };
    write(K.bookings, list);
  },

  remove(id: string) {
    write(
      K.bookings,
      read<Booking[]>(K.bookings, []).filter((b) => b.id !== id),
    );
  },
};

/* ----------------------------- verification ----------------------------- */

type StepRecord = import("./types").StepRecord;

function logStep(
  listing_id: string,
  step: VerificationStep,
  status: StepRecord["status"] = "completed",
  note: string | null = null,
  actor = "owner",
) {
  const steps = read<StepRecord[]>(K.steps, []);
  steps.push({
    id: uid(),
    listing_id,
    step,
    status,
    note,
    actor,
    created_at: new Date().toISOString(),
  });
  write(K.steps, steps);
}

export const demoListings = {
  all(): Listing[] {
    return read<Listing[]>(K.listings, []).sort((a, b) =>
      b.created_at.localeCompare(a.created_at),
    );
  },

  byId(id: string): Listing | null {
    return read<Listing[]>(K.listings, []).find((l) => l.id === id) ?? null;
  },

  byUser(userId: string): Listing[] {
    return demoListings.all().filter((l) => l.user_id === userId);
  },

  create(input: Omit<Listing, "id" | "created_at" | "updated_at" | "verification_status"> & {
    verification_status?: VerificationStep;
  }): Listing {
    const now = new Date().toISOString();
    const listing: Listing = {
      ...input,
      id: uid(),
      payment_status: "unpaid",
      tier: "basic",
      transaction_id: null,
      verification_status: input.verification_status ?? "step1",
      created_at: now,
      updated_at: now,
    };
    write(K.listings, [listing, ...read<Listing[]>(K.listings, [])]);
    // step1 (owner signed up) auto-logged
    logStep(listing.id, "step1", "completed", null, "system");
    return listing;
  },

  /** Advance a listing to a specific step (only if sequential). */
  advance(listingId: string, toStep: VerificationStep, paths: Partial<Listing> = {}): Listing | null {
    const list = read<Listing[]>(K.listings, []);
    const idx = list.findIndex((l) => l.id === listingId);
    if (idx === -1) return null;
    const order: VerificationStep[] = ["step1", "step2", "step3", "step4", "step5", "step6"];
    const currentIdx = order.indexOf(list[idx].verification_status);
    const targetIdx = order.indexOf(toStep);
    // can only move forward by one, and must not skip
    if (targetIdx !== currentIdx + 1) return null;
    list[idx] = {
      ...list[idx],
      ...paths,
      verification_status: toStep,
      updated_at: new Date().toISOString(),
    };
    write(K.listings, list);
    logStep(listingId, toStep, "completed", null, "owner");
    return list[idx];
  },

  /** Admin review: approve (→ step6) or reject (→ stay, with note). */
  review(listingId: string, approved: boolean, note?: string): Listing | null {
    const list = read<Listing[]>(K.listings, []);
    const idx = list.findIndex((l) => l.id === listingId);
    if (idx === -1) return null;
    if (approved) {
      list[idx] = {
        ...list[idx],
        status: "approved",
        verification_status: "step6",
        review_note: note ?? null,
        updated_at: new Date().toISOString(),
      };
      logStep(listingId, "step6", "completed", note ?? null, "admin");
    } else {
      list[idx] = {
        ...list[idx],
        status: "rejected",
        review_note: note ?? "Rejected by admin",
        updated_at: new Date().toISOString(),
      };
      logStep(listingId, "step5", "failed", note ?? "Rejected by admin", "admin");
    }
    write(K.listings, list);
    return list[idx];
  },

  remove(id: string) {
    write(
      K.listings,
      read<Listing[]>(K.listings, []).filter((l) => l.id !== id),
    );
    write(
      K.steps,
      read<StepRecord[]>(K.steps, []).filter((s) => s.listing_id !== id),
    );
  },
};

export const demoSteps = {
  forListing(listingId: string): StepRecord[] {
    return read<StepRecord[]>(K.steps, [])
      .filter((s) => s.listing_id === listingId)
      .sort((a, b) => a.created_at.localeCompare(b.created_at));
  },
};

/* -------------------------------- messages -------------------------------- */

export const demoMessages = {
  listForUsers(userA: string, userB: string, listingId?: string | null) {
    return read<import("./types").Message[]>(K.messages, [])
      .filter((m) => {
        const samePair =
          (m.sender_id === userA && m.receiver_id === userB) ||
          (m.sender_id === userB && m.receiver_id === userA);
        const sameListing = !listingId || m.listing_id === listingId;
        return samePair && sameListing;
      })
      .sort((a, b) => a.created_at.localeCompare(b.created_at));
  },

  send(input: Omit<import("./types").Message, "id" | "created_at" | "read_at">) {
    const msg: import("./types").Message = {
      ...input,
      id: uid(),
      read_at: null,
      created_at: new Date().toISOString(),
    };
    write(K.messages, [...read<import("./types").Message[]>(K.messages, []), msg]);
    window.dispatchEvent(new CustomEvent("demo-message", { detail: msg }));
    return msg;
  },

  /** All threads involving this user, newest activity first. */
  inbox(userId: string): import("./types").Conversation[] {
    const all = read<import("./types").Message[]>(K.messages, []).filter(
      (m) => m.sender_id === userId || m.receiver_id === userId,
    );
    const users = read<DemoUser[]>(K.users, []);
    const threads = new Map<string, import("./types").Conversation>();

    for (const m of all) {
      const peerId = m.sender_id === userId ? m.receiver_id : m.sender_id;
      const key = `${peerId}::${m.listing_id ?? "none"}`;
      const listing = m.listing_id ? demoListings.byId(m.listing_id) : null;
      const prev = threads.get(key);
      const unread =
        (prev?.unread ?? 0) + (m.receiver_id === userId && !m.read_at ? 1 : 0);

      if (!prev || m.created_at > prev.lastAt) {
        threads.set(key, {
          peerId,
          peerName:
            users.find((u) => u.id === peerId)?.name ??
            (listing ? "Property owner" : "Keyless user"),
          listingId: m.listing_id,
          listingTitle: listing?.title ?? "Direct message",
          lastText: m.text,
          lastAt: m.created_at,
          unread,
        });
      } else {
        threads.set(key, { ...prev, unread });
      }
    }

    return [...threads.values()].sort((a, b) => b.lastAt.localeCompare(a.lastAt));
  },

  unreadCount(userId: string): number {
    return read<import("./types").Message[]>(K.messages, []).filter(
      (m) => m.receiver_id === userId && !m.read_at,
    ).length;
  },

  markRead(userId: string, peerId: string, listingId?: string | null) {
    const all = read<import("./types").Message[]>(K.messages, []);
    let changed = false;
    const next = all.map((m) => {
      const match =
        m.receiver_id === userId &&
        m.sender_id === peerId &&
        !m.read_at &&
        (!listingId || m.listing_id === listingId);
      if (!match) return m;
      changed = true;
      return { ...m, read_at: new Date().toISOString() };
    });
    if (changed) {
      write(K.messages, next);
      window.dispatchEvent(new CustomEvent("demo-message-read"));
    }
  },
};
