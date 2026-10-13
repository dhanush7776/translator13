// ─────────────────────────────────────────────────────────────
//  Supabase client — SERVER-SIDE ONLY
//  Never exposed to the client browser.
// ─────────────────────────────────────────────────────────────

import { createClient } from "@supabase/supabase-js";
import ws from "ws";

if (typeof globalThis.WebSocket === "undefined") {
  globalThis.WebSocket = ws;
}

const supabaseUrl = process.env.SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY ?? "";

/** Returns true only when both env vars are real, non-placeholder values */
function isValidConfig(url, key) {
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

export const supabase = configured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    })
  : null;

export function isSupabaseConfigured() {
  return configured && supabase !== null;
}
