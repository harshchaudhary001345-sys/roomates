import { isSupabaseConfigured, supabase } from "./supabaseClient";
import {
  demoAuth,
  demoBookings,
  demoListings,
  demoMessages,
  demoProperties,
  demoSteps,
  seedDemoData,
  uid,
} from "./demoBackend";
import type {
  ApiResult,
  Booking,
  BookingStatus,
  Conversation,
  Listing,
  Message,
  NewProperty,
  Profile,
  Property,
  StepRecord,
  VerificationStep,
} from "./types";

/**
 * ---------------------------------------------------------------------------
 *  ONE API FOR THE WHOLE APP
 * ---------------------------------------------------------------------------
 *  Every component imports from here and never touches Supabase directly.
 *  Each function picks its backend at runtime:
 *
 *      keys in .env.local  →  real Supabase (auth + postgres + storage)
 *      no keys             →  localStorage demo backend
 *
 *  Every function returns `{ data, error }` — no try/catch needed in the UI.
 * ---------------------------------------------------------------------------
 */

export const DEMO_MODE = !isSupabaseConfigured;

if (DEMO_MODE && typeof window !== "undefined") seedDemoData();

const ok = <T>(data: T): ApiResult<T> => ({ data, error: null });
const fail = <T>(error: unknown): ApiResult<T> => ({
  data: null,
  error: error instanceof Error ? error.message : String(error),
});

/* ==========================================================================
 *  IMAGE HELPERS
 * ========================================================================== */

/** Downscale + re-encode to JPEG so uploads are fast and demo mode fits in localStorage. */
export function compressImage(
  file: File,
  maxSize = 1400,
  quality = 0.82,
): Promise<{ blob: Blob; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("That file is not a valid image."));
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);

        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas not supported."));
        ctx.drawImage(img, 0, 0, w, h);

        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        canvas.toBlob(
          (blob) =>
            blob
              ? resolve({ blob, dataUrl })
              : reject(new Error("Could not process that image.")),
          "image/jpeg",
          quality,
        );
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/* ==========================================================================
 *  AUTH
 * ========================================================================== */

export const auth = {
  async signUp(
    name: string,
    email: string,
    password: string,
    role: Profile["role"] = "tenant",
  ): Promise<ApiResult<Profile>> {
    try {
      if (DEMO_MODE) return ok(demoAuth.signUp(name, email, password, role));

      const { data, error } = await supabase!.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { name: name.trim(), role } },
      });
      if (error) throw error;
      if (!data.user) throw new Error("Signup failed. Please try again.");

      // Trigger `handle_new_user` creates the profile row; make sure it exists
      // even if the trigger has not been installed yet.
      await supabase!
        .from("users")
        .upsert(
          { id: data.user.id, name: name.trim(), email: email.trim(), role },
          { onConflict: "id" },
        );

      return ok({
        id: data.user.id,
        name: name.trim(),
        email: email.trim(),
        role,
        created_at: data.user.created_at ?? new Date().toISOString(),
      });
    } catch (e) {
      return fail(e);
    }
  },

  async signIn(email: string, password: string): Promise<ApiResult<Profile>> {
    try {
      if (DEMO_MODE) return ok(demoAuth.signIn(email, password));

      const { data, error } = await supabase!.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;

      const profile = await auth.getProfile(data.user.id);
      return ok(
        profile.data ?? {
          id: data.user.id,
          name: (data.user.user_metadata?.name as string) ?? email.split("@")[0],
          email: data.user.email ?? email,
          role: ((data.user.user_metadata?.role as Profile["role"] | undefined) ?? "tenant"),
          created_at: data.user.created_at ?? new Date().toISOString(),
        },
      );
    } catch (e) {
      return fail(e);
    }
  },

  async signOut(): Promise<ApiResult<true>> {
    try {
      if (DEMO_MODE) demoAuth.signOut();
      else await supabase!.auth.signOut();
      return ok(true as const);
    } catch (e) {
      return fail(e);
    }
  },

  async getSession(): Promise<Profile | null> {
    if (DEMO_MODE) return demoAuth.currentUser();

    const { data } = await supabase!.auth.getSession();
    const user = data.session?.user;
    if (!user) return null;

    const profile = await auth.getProfile(user.id);
    return (
      profile.data ?? {
        id: user.id,
        name: (user.user_metadata?.name as string) ?? user.email?.split("@")[0] ?? "User",
        email: user.email ?? "",
        role: ((user.user_metadata?.role as Profile["role"] | undefined) ?? "tenant"),
        created_at: user.created_at ?? new Date().toISOString(),
      }
    );
  },

  async getProfile(id: string): Promise<ApiResult<Profile>> {
    try {
      if (DEMO_MODE) return ok(demoAuth.currentUser() as Profile);
      const { data, error } = await supabase!
        .from("users")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return ok(data as Profile);
    } catch (e) {
      return fail(e);
    }
  },

  /** Fires whenever the Supabase session changes (login in another tab, refresh, logout). */
  onChange(cb: () => void): () => void {
    if (DEMO_MODE) {
      const handler = () => cb();
      window.addEventListener("storage", handler);
      return () => window.removeEventListener("storage", handler);
    }
    const { data } = supabase!.auth.onAuthStateChange(() => cb());
    return () => data.subscription.unsubscribe();
  },
};

/* ==========================================================================
 *  STORAGE
 * ========================================================================== */

export const storage = {
  /** Uploads to the `property-images` bucket and returns a public URL. */
  async uploadPropertyImage(
    file: File,
    userId: string,
  ): Promise<ApiResult<string>> {
    try {
      const { blob, dataUrl } = await compressImage(file);

      // Demo mode: keep the base64 string, no server needed.
      if (DEMO_MODE) return ok(dataUrl);

      const path = `${userId}/${uid()}.jpg`;
      const { error } = await supabase!.storage
        .from("property-images")
        .upload(path, blob, { contentType: "image/jpeg", upsert: false });
      if (error) throw error;

      const { data } = supabase!.storage
        .from("property-images")
        .getPublicUrl(path);
      return ok(data.publicUrl);
    } catch (e) {
      return fail(e);
    }
  },
};

/* ==========================================================================
 *  PROPERTIES
 * ========================================================================== */

export const properties = {
  async list(): Promise<ApiResult<Property[]>> {
    try {
      if (DEMO_MODE) return ok(demoProperties.all());

      const { data, error } = await supabase!
        .from("properties")
        .select("*, users:user_id (name, email)")
        .order("created_at", { ascending: false });
      if (error) throw error;

      return ok(
        (data ?? []).map((row: Record<string, unknown>) => {
          const u = row.users as { name?: string; email?: string } | null;
          const { users: _drop, ...rest } = row;
          return {
            ...(rest as Property),
            owner_name: u?.name ?? null,
            owner_email: u?.email ?? null,
          };
        }),
      );
    } catch (e) {
      return fail(e);
    }
  },

  async byId(id: string): Promise<ApiResult<Property>> {
    try {
      if (DEMO_MODE) {
        const p = demoProperties.byId(id);
        if (!p) throw new Error("Property not found.");
        return ok(p);
      }

      const { data, error } = await supabase!
        .from("properties")
        .select("*, users:user_id (name, email)")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error("Property not found.");

      const u = (data as Record<string, unknown>).users as
        | { name?: string; email?: string }
        | null;
      const { users: _drop, ...rest } = data as Record<string, unknown>;
      return ok({
        ...(rest as Property),
        owner_name: u?.name ?? null,
        owner_email: u?.email ?? null,
      });
    } catch (e) {
      return fail(e);
    }
  },

  async byUser(userId: string): Promise<ApiResult<Property[]>> {
    try {
      if (DEMO_MODE) return ok(demoProperties.byUser(userId));

      const { data, error } = await supabase!
        .from("properties")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return ok((data ?? []) as Property[]);
    } catch (e) {
      return fail(e);
    }
  },

  async create(
    input: NewProperty,
    user: Profile,
  ): Promise<ApiResult<Property>> {
    try {
      let imageUrl: string | null = null;

      if (input.imageFile) {
        const up = await storage.uploadPropertyImage(input.imageFile, user.id);
        if (up.error) throw new Error(up.error);
        imageUrl = up.data;
      }

      const row = {
        title: input.title.trim(),
        price: Number(input.price),
        location: input.location.trim(),
        image: imageUrl,
        description: input.description.trim() || null,
        bedrooms: Number(input.bedrooms),
        bathrooms: Number(input.bathrooms),
        area: input.area ? Number(input.area) : null,
        property_type: input.property_type,
        furnishing: input.furnishing,
        available: true,
        verified: false,
        user_id: user.id,
      };

      if (DEMO_MODE) {
        return ok(
          demoProperties.create({
            ...row,
            owner_name: user.name,
            owner_email: user.email,
          }),
        );
      }

      const { data, error } = await supabase!
        .from("properties")
        .insert(row)
        .select()
        .single();
      if (error) throw error;
      return ok(data as Property);
    } catch (e) {
      return fail(e);
    }
  },

  async update(id: string, patch: Partial<Property>): Promise<ApiResult<Property>> {
    try {
      if (DEMO_MODE) {
        const p = demoProperties.update(id, patch);
        if (!p) throw new Error("Property not found.");
        return ok(p);
      }
      const { data, error } = await supabase!
        .from("properties")
        .update(patch)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return ok(data as Property);
    } catch (e) {
      return fail(e);
    }
  },

  async remove(id: string): Promise<ApiResult<true>> {
    try {
      if (DEMO_MODE) demoProperties.remove(id);
      else {
        const { error } = await supabase!.from("properties").delete().eq("id", id);
        if (error) throw error;
      }
      return ok(true as const);
    } catch (e) {
      return fail(e);
    }
  },
};

/* ==========================================================================
 *  BOOKINGS
 * ========================================================================== */

export const bookings = {
  async create(input: {
    property_id: string;
    user_id: string;
    date: string;
    message?: string;
  }): Promise<ApiResult<Booking>> {
    try {
      const row = {
        property_id: input.property_id,
        user_id: input.user_id,
        date: input.date,
        message: input.message?.trim() || null,
        status: "pending" as BookingStatus,
      };

      if (DEMO_MODE) return ok(demoBookings.create(row));

      const { data, error } = await supabase!
        .from("bookings")
        .insert(row)
        .select()
        .single();
      if (error) throw error;
      return ok(data as Booking);
    } catch (e) {
      return fail(e);
    }
  },

  async byUser(userId: string): Promise<ApiResult<Booking[]>> {
    try {
      if (DEMO_MODE) return ok(demoBookings.byUser(userId));

      const { data, error } = await supabase!
        .from("bookings")
        .select("*, property:property_id (*)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return ok((data ?? []) as Booking[]);
    } catch (e) {
      return fail(e);
    }
  },

  /** Visit requests received on properties the user owns. */
  async forOwner(userId: string): Promise<ApiResult<Booking[]>> {
    try {
      if (DEMO_MODE) return ok(demoBookings.forOwner(userId));

      const mine = await properties.byUser(userId);
      const ids = (mine.data ?? []).map((p) => p.id);
      if (ids.length === 0) return ok([]);

      const { data, error } = await supabase!
        .from("bookings")
        .select("*, property:property_id (*)")
        .in("property_id", ids)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return ok((data ?? []) as Booking[]);
    } catch (e) {
      return fail(e);
    }
  },

  async setStatus(id: string, status: BookingStatus): Promise<ApiResult<true>> {
    try {
      if (DEMO_MODE) demoBookings.updateStatus(id, status);
      else {
        const { error } = await supabase!
          .from("bookings")
          .update({ status })
          .eq("id", id);
        if (error) throw error;
      }
      return ok(true as const);
    } catch (e) {
      return fail(e);
    }
  },

  async remove(id: string): Promise<ApiResult<true>> {
    try {
      if (DEMO_MODE) demoBookings.remove(id);
      else {
        const { error } = await supabase!.from("bookings").delete().eq("id", id);
        if (error) throw error;
      }
      return ok(true as const);
    } catch (e) {
      return fail(e);
    }
  },
};

/* ==========================================================================
 *  LISTINGS + VERIFICATION WORKFLOW
 * ========================================================================== */

const STEP_ORDER: VerificationStep[] = ["step1", "step2", "step3", "step4", "step5", "step6"];

function canAdvance(current: VerificationStep, next: VerificationStep) {
  return STEP_ORDER.indexOf(next) === STEP_ORDER.indexOf(current) + 1;
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read file."));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

async function uploadVerificationFile(
  file: File,
  userId: string,
  listingId: string,
  kind: "id" | "face" | "ownership" | "video",
): Promise<ApiResult<string>> {
  try {
    if (DEMO_MODE) return ok(await fileToDataUrl(file));

    const ext = file.name.split(".").pop() || (kind === "video" ? "mp4" : "jpg");
    const path = `${userId}/${listingId}/${kind}-${uid()}.${ext}`;
    const { error } = await supabase!.storage
      .from("verification-docs")
      .upload(path, file, { contentType: file.type || "application/octet-stream" });
    if (error) throw error;

    // Private bucket: return a signed URL valid for 7 days for UI preview.
    const signed = await supabase!.storage
      .from("verification-docs")
      .createSignedUrl(path, 60 * 60 * 24 * 7);
    if (signed.error) throw signed.error;
    return ok(signed.data.signedUrl);
  } catch (e) {
    return fail(e);
  }
}

export const listings = {
  async listApproved(): Promise<ApiResult<Listing[]>> {
    try {
      if (DEMO_MODE) return ok(demoListings.all().filter((l) => l.status === "approved"));
      const { data, error } = await supabase!
        .from("listings")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return ok((data ?? []) as Listing[]);
    } catch (e) {
      return fail(e);
    }
  },

  async byId(id: string): Promise<ApiResult<Listing>> {
    try {
      if (DEMO_MODE) {
        const listing = demoListings.byId(id);
        if (!listing) throw new Error("Listing not found.");
        return ok(listing);
      }
      const { data, error } = await supabase!
        .from("listings")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error("Listing not found.");
      return ok(data as Listing);
    } catch (e) {
      return fail(e);
    }
  },

  async byUser(userId: string): Promise<ApiResult<Listing[]>> {
    try {
      if (DEMO_MODE) return ok(demoListings.byUser(userId));
      const { data, error } = await supabase!
        .from("listings")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return ok((data ?? []) as Listing[]);
    } catch (e) {
      return fail(e);
    }
  },

  async create(input: NewProperty, user: Profile): Promise<ApiResult<Listing>> {
    try {
      let imageUrl: string | null = null;
      if (input.imageFile) {
        const up = await storage.uploadPropertyImage(input.imageFile, user.id);
        if (up.error) throw new Error(up.error);
        imageUrl = up.data;
      }
      const row = {
        user_id: user.id,
        owner_id: user.id,
        title: input.title.trim(),
        location: input.location.trim(),
        price: Number(input.price),
        image: imageUrl,
        description: input.description.trim() || null,
        bedrooms: Number(input.bedrooms),
        bathrooms: Number(input.bathrooms),
        area: input.area ? Number(input.area) : null,
        property_type: input.property_type,
        furnishing: input.furnishing,
        status: "draft" as const,
        payment_status: "unpaid" as const,
        tier: "basic" as const,
        transaction_id: null,
        verification_status: "step1" as VerificationStep,
        id_doc_url: null,
        ownership_doc_url: null,
        video_url: null,
        face_match_url: null,
        face_match_passed: false,
        review_note: null,
      };

      if (DEMO_MODE) return ok(demoListings.create(row));

      const { data, error } = await supabase!
        .from("listings")
        .insert(row)
        .select()
        .single();
      if (error) throw error;
      await supabase!.from("verification_steps").insert({
        listing_id: (data as Listing).id,
        step: "step1",
        status: "completed",
        actor: "system",
      });
      return ok(data as Listing);
    } catch (e) {
      return fail(e);
    }
  },
};

export const verification = {
  async advance(input: {
    listing: Listing;
    nextStep: VerificationStep;
    idFile?: File | null;
    selfieFile?: File | null;
    ownershipFile?: File | null;
    videoFile?: File | null;
  }): Promise<ApiResult<Listing>> {
    try {
      const { listing, nextStep } = input;
      if (!canAdvance(listing.verification_status, nextStep)) {
        throw new Error("You must complete the previous step first.");
      }

      const patch: Partial<Listing> = {};

      if (nextStep === "step2") {
        if (!input.idFile || !input.selfieFile) throw new Error("Upload both Govt ID and selfie.");
        const id = await uploadVerificationFile(input.idFile, listing.user_id, listing.id, "id");
        if (id.error) throw new Error(id.error);
        const face = await uploadVerificationFile(input.selfieFile, listing.user_id, listing.id, "face");
        if (face.error) throw new Error(face.error);
        patch.id_doc_url = id.data;
        patch.face_match_url = face.data;
        patch.face_match_passed = true; // fake AI pass flag
      }

      if (nextStep === "step3") {
        if (!input.ownershipFile) throw new Error("Upload ownership document.");
        const doc = await uploadVerificationFile(input.ownershipFile, listing.user_id, listing.id, "ownership");
        if (doc.error) throw new Error(doc.error);
        patch.ownership_doc_url = doc.data;
      }

      if (nextStep === "step4") {
        if (!input.videoFile) throw new Error("Upload the 90s walkthrough video.");
        const video = await uploadVerificationFile(input.videoFile, listing.user_id, listing.id, "video");
        if (video.error) throw new Error(video.error);
        patch.video_url = video.data;
      }

      if (nextStep === "step5") patch.status = "pending_review";

      if (DEMO_MODE) {
        const advanced = demoListings.advance(listing.id, nextStep, patch);
        if (!advanced) throw new Error("Could not advance listing.");
        return ok(advanced);
      }

      const { data, error } = await supabase!
        .from("listings")
        .update({ ...patch, verification_status: nextStep })
        .eq("id", listing.id)
        .select()
        .single();
      if (error) throw error;
      await supabase!.from("verification_steps").insert({
        listing_id: listing.id,
        step: nextStep,
        status: "completed",
        actor: nextStep === "step5" ? "system" : "owner",
      });
      return ok(data as Listing);
    } catch (e) {
      return fail(e);
    }
  },

  /** Full audit trail for a listing — who advanced which step, and when. */
  async history(listingId: string): Promise<ApiResult<StepRecord[]>> {
    try {
      if (DEMO_MODE) return ok(demoSteps.forListing(listingId));
      const { data, error } = await supabase!
        .from("verification_steps")
        .select("*")
        .eq("listing_id", listingId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return ok((data ?? []) as StepRecord[]);
    } catch (e) {
      return fail(e);
    }
  },

  async adminReview(listing: Listing, approved = true, note = "Approved by simulated admin."): Promise<ApiResult<Listing>> {
    try {
      if (listing.verification_status !== "step5") throw new Error("Listing must be under review first.");
      if (DEMO_MODE) {
        const reviewed = demoListings.review(listing.id, approved, note);
        if (!reviewed) throw new Error("Review failed.");
        return ok(reviewed);
      }
      const patch = approved
        ? { status: "approved", verification_status: "step6", review_note: note }
        : { status: "rejected", review_note: note };
      const { data, error } = await supabase!
        .from("listings")
        .update(patch)
        .eq("id", listing.id)
        .select()
        .single();
      if (error) throw error;
      await supabase!.from("verification_steps").insert({
        listing_id: listing.id,
        step: approved ? "step6" : "step5",
        status: approved ? "completed" : "failed",
        actor: "admin",
        note,
      });
      return ok(data as Listing);
    } catch (e) {
      return fail(e);
    }
  },
};

/* ==========================================================================
 *  REAL-TIME CHAT
 * ========================================================================== */

export const messages = {
  async list(userA: string, userB: string, listingId?: string | null): Promise<ApiResult<Message[]>> {
    try {
      if (DEMO_MODE) return ok(demoMessages.listForUsers(userA, userB, listingId));
      let query = supabase!
        .from("messages")
        .select("*")
        .or(`and(sender_id.eq.${userA},receiver_id.eq.${userB}),and(sender_id.eq.${userB},receiver_id.eq.${userA})`)
        .order("created_at", { ascending: true });
      if (listingId) query = query.eq("listing_id", listingId);
      const { data, error } = await query;
      if (error) throw error;
      return ok((data ?? []) as Message[]);
    } catch (e) {
      return fail(e);
    }
  },

  async send(
    input: Omit<Message, "id" | "created_at" | "read_at">,
  ): Promise<ApiResult<Message>> {
    try {
      if (!input.text.trim()) throw new Error("Message cannot be empty.");
      if (DEMO_MODE) return ok(demoMessages.send({ ...input, text: input.text.trim() }));
      const { data, error } = await supabase!
        .from("messages")
        .insert({ ...input, text: input.text.trim() })
        .select()
        .single();
      if (error) throw error;
      return ok(data as Message);
    } catch (e) {
      return fail(e);
    }
  },

  /** Conversation threads for the inbox list. */
  async inbox(userId: string): Promise<ApiResult<Conversation[]>> {
    try {
      if (DEMO_MODE) return ok(demoMessages.inbox(userId));

      const { data, error } = await supabase!
        .from("messages")
        .select("*, listing:listing_id (title), sender:sender_id (name), receiver:receiver_id (name)")
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order("created_at", { ascending: false });
      if (error) throw error;

      const threads = new Map<string, Conversation>();
      for (const row of (data ?? []) as Record<string, unknown>[]) {
        const m = row as unknown as Message;
        const peerId = m.sender_id === userId ? m.receiver_id : m.sender_id;
        const key = `${peerId}::${m.listing_id ?? "none"}`;
        const peerRec = (m.sender_id === userId ? row.receiver : row.sender) as
          | { name?: string }
          | null;
        const unreadHit = m.receiver_id === userId && !m.read_at ? 1 : 0;
        const prev = threads.get(key);

        if (!prev) {
          threads.set(key, {
            peerId,
            peerName: peerRec?.name ?? "Keyless user",
            listingId: m.listing_id,
            listingTitle:
              (row.listing as { title?: string } | null)?.title ?? "Direct message",
            lastText: m.text,
            lastAt: m.created_at,
            unread: unreadHit,
          });
        } else {
          // Rows arrive newest-first, so only the unread tally accumulates.
          threads.set(key, { ...prev, unread: prev.unread + unreadHit });
        }
      }
      return ok([...threads.values()]);
    } catch (e) {
      return fail(e);
    }
  },

  async unreadCount(userId: string): Promise<ApiResult<number>> {
    try {
      if (DEMO_MODE) return ok(demoMessages.unreadCount(userId));
      const { count, error } = await supabase!
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("receiver_id", userId)
        .is("read_at", null);
      if (error) throw error;
      return ok(count ?? 0);
    } catch (e) {
      return fail(e);
    }
  },

  async markRead(
    userId: string,
    peerId: string,
    listingId?: string | null,
  ): Promise<ApiResult<true>> {
    try {
      if (DEMO_MODE) {
        demoMessages.markRead(userId, peerId, listingId);
        return ok(true as const);
      }
      let q = supabase!
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .eq("receiver_id", userId)
        .eq("sender_id", peerId)
        .is("read_at", null);
      if (listingId) q = q.eq("listing_id", listingId);
      const { error } = await q;
      if (error) throw error;
      return ok(true as const);
    } catch (e) {
      return fail(e);
    }
  },

  /** Fires for every message addressed to `userId`, across all threads. */
  subscribeInbox(userId: string, cb: (msg: Message) => void) {
    if (DEMO_MODE) {
      const handler = (e: Event) => {
        const msg = (e as CustomEvent<Message>).detail;
        if (msg.receiver_id === userId) cb(msg);
      };
      window.addEventListener("demo-message", handler);
      return () => window.removeEventListener("demo-message", handler);
    }
    const channel = supabase!
      .channel(`inbox:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${userId}`,
        },
        (payload) => cb(payload.new as Message),
      )
      .subscribe();
    return () => void supabase!.removeChannel(channel);
  },

  subscribe(listingId: string | null, cb: (msg: Message) => void) {
    if (DEMO_MODE) {
      const handler = (e: Event) => cb((e as CustomEvent<Message>).detail);
      window.addEventListener("demo-message", handler);
      return () => window.removeEventListener("demo-message", handler);
    }
    const channel = supabase!
      .channel(`messages:${listingId ?? "all"}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => cb(payload.new as Message),
      )
      .subscribe();
    return () => void supabase!.removeChannel(channel);
  },
};
