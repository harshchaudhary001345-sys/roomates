import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * ---------------------------------------------------------------------------
 *  SUPABASE CLIENT
 * ---------------------------------------------------------------------------
 *  Reads credentials from `.env.local`:
 *
 *      VITE_SUPABASE_URL=https://xxxx.supabase.co
 *      VITE_SUPABASE_ANON_KEY=eyJhbGci...
 *
 *  If they are missing, `supabase` stays `null` and the whole app transparently
 *  falls back to DEMO MODE (a localStorage backend in `src/lib/demoBackend.ts`).
 *  That guarantees `npm install && npm run dev` always produces a working app.
 * ---------------------------------------------------------------------------
 */

const url = (import.meta.env.VITE_SUPABASE_URL ?? "").trim();
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? "").trim();

export const isSupabaseConfigured =
  url.startsWith("http") &&
  anonKey.length > 20 &&
  !url.includes("YOUR-PROJECT-REF");

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/** Throws a readable error instead of a null-pointer crash. */
export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local",
    );
  }
  return supabase;
}
