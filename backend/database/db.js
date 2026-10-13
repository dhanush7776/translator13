// ─────────────────────────────────────────────────────────────
//  Database operations — SERVER-SIDE ONLY
//  All Supabase queries are centralised here.
// ─────────────────────────────────────────────────────────────

import { supabase, isSupabaseConfigured } from "./supabase.js";

/**
 * Save a single chat message to the database.
 * Returns { success: true } or { success: false, error }
 */
export async function saveChatMessage(msg) {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Database not configured." };
  }

  const { error } = await supabase.from("chat_history").insert([msg]);

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
export async function loadChatHistory(sessionId, limit = 50) {
  if (!isSupabaseConfigured()) {
    return { messages: [], error: "Database not configured." };
  }

  const { data, error } = await supabase
    .from("chat_history")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("[DB] loadChatHistory error:", error.message);
    return { messages: [], error: error.message };
  }
  return { messages: data ?? [] };
}

/**
 * Delete all messages for a session (clear chat).
 */
export async function clearChatHistory(sessionId) {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Database not configured." };
  }

  const { error } = await supabase
    .from("chat_history")
    .delete()
    .eq("session_id", sessionId);

  if (error) {
    console.error("[DB] clearChatHistory error:", error.message);
    return { success: false, error: error.message };
  }
  return { success: true };
}

/**
 * Log a tool usage event (fire-and-forget — errors are silent).
 */
export async function logUsage(tool, language) {
  if (!isSupabaseConfigured()) return;

  const { error } = await supabase
    .from("usage_stats")
    .insert([{ tool, language: language ?? null }]);

  if (error) {
    console.error("[DB] logUsage error:", error.message);
  }
}

/**
 * Get usage counts per tool.
 * Returns an array of { tool, count } objects.
 */
export async function getUsageStats() {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from("usage_stats")
    .select("tool");

  if (error || !data) return [];

  // Count per tool
  const counts = {};
  for (const row of data) {
    counts[row.tool] = (counts[row.tool] ?? 0) + 1;
  }
  return Object.entries(counts).map(([tool, count]) => ({ tool, count }));
}
