// ─────────────────────────────────────────────────────────────
//  Supabase client — SERVER-SIDE ONLY
//  Never import this file in any "use client" component.
//  The service-role key (if used) must NEVER reach the browser.
// ─────────────────────────────────────────────────────────────

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY ?? "";

/** Returns true only when both env vars are real, non-placeholder values */
function isValidConfig(url: string, key: string): boolean {
  if (!url || !key) return false;
  if (url.includes("your_supabase") || key.includes("your_supabase")) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

const configured = isValidConfig(supabaseUrl, supabaseAnonKey);

if (!configured) {
  console.log(
    "[Supabase] Missing or invalid SUPABASE_URL / SUPABASE_ANON_KEY — DB features disabled."
  );
}

// Singleton pattern — avoids creating multiple clients in dev hot-reload
const globalForSupabase = global as unknown as {
  _supabaseClient?: ReturnType<typeof createClient>;
};

export const supabase = configured
  ? (globalForSupabase._supabaseClient ??
      createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false }, // server-side: no session storage
      }))
  : null;

if (process.env.NODE_ENV !== "production" && supabase) {
  globalForSupabase._supabaseClient = supabase;
}

export function isSupabaseConfigured(): boolean {
  return configured && supabase !== null;
}
