import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

let cached: SupabaseClient | null = null;

/**
 * Returns the browser Supabase client when env vars exist.
 * In local/mock mode this returns null so the navigable prototype keeps working.
 *
 * Uses createBrowserClient (from @supabase/ssr) instead of the plain
 * supabase-js client so the session is stored in cookies, not just
 * localStorage — that's what lets middleware.ts read the same session
 * server-side before any page renders.
 */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;

  if (!cached) {
    cached = createBrowserClient(url as string, anonKey as string);
  }

  return cached;
}
