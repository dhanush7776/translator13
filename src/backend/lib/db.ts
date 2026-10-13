// ─────────────────────────────────────────────────────────────
//  Database operations — SERVER-SIDE ONLY
//  All Supabase queries are centralised here.
//  Import only from API routes / server components.
// ─────────────────────────────────────────────────────────────

import { supabase, isSupabaseConfigured } from "./supabase";

// ── Types ──────────────────────────────────────────────────

export interface ChatMessageRow {
  id?: string;
  session_id: string;
  role: "user" | "assistant";
  content: string;
  language: string;
  created_at?: string;
}

export interface UsageStatRow {
  id?: string;
  tool: "simplify" | "translate" | "stt" | "tts" | "jarvis";
  language?: string;
  created_at?: string;
}

// ── Chat History ────────────────────────────────────────────

/**
 * Save a single chat message to the database.
 * Returns { success: true } or { success: false, error }
 */
export async function saveChatMessage(
  msg: Omit<ChatMessageRow, "id" | "created_at">
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Database not configured." };
  }

  // Without generated Supabase types, insert requires 'never[]'. Double-cast to satisfy TS.
  const { error } = await supabase!.from("chat_history").insert([msg] as unknown as never[]);

  if (error) {
    console.error("[DB] saveChatMessage error:", error.message);
    return { success: false, error: error.message };
  }
  return { success: true };
}

/**
 * Load chat history for a session, ordered oldest-first.
 * Returns up to `limit` messages (default 50).
 */
export async function loadChatHistory(
  sessionId: string,
  limit = 50
): Promise<{ messages: ChatMessageRow[]; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { messages: [], error: "Database not configured." };
  }

  const { data, error } = await supabase!
    .from("chat_history")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("[DB] loadChatHistory error:", error.message);
    return { messages: [], error: error.message };
  }
  return { messages: (data as ChatMessageRow[]) ?? [] };
}

/**
 * Delete all messages for a session (clear chat).
 */
export async function clearChatHistory(
  sessionId: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Database not configured." };
  }

  const { error } = await supabase!
    .from("chat_history")
    .delete()
    .eq("session_id", sessionId);

  if (error) {
    console.error("[DB] clearChatHistory error:", error.message);
    return { success: false, error: error.message };
  }
  return { success: true };
}

// ── Usage Stats ─────────────────────────────────────────────

/**
 * Log a tool usage event (fire-and-forget — errors are silent).
 */
export async function logUsage(
  tool: UsageStatRow["tool"],
  language?: string
): Promise<void> {
  if (!isSupabaseConfigured()) return;

  // Without generated Supabase types, insert requires 'never[]'. Double-cast to satisfy TS.
  const { error } = await supabase!
    .from("usage_stats")
    .insert([{ tool, language: language ?? null }] as unknown as never[]);

  if (error) {
    console.error("[DB] logUsage error:", error.message);
  }
}

/**
 * Get usage counts per tool.
 * Returns an array of { tool, count } objects.
 */
export async function getUsageStats(): Promise<
  { tool: string; count: number }[]
> {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase!
    .from("usage_stats")
    .select("tool");

  if (error || !data) return [];

  // Count per tool
  const counts: Record<string, number> = {};
  for (const row of data as { tool: string }[]) {
    counts[row.tool] = (counts[row.tool] ?? 0) + 1;
  }
  return Object.entries(counts).map(([tool, count]) => ({ tool, count }));
}
