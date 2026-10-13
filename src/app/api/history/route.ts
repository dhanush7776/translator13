import { NextResponse } from "next/server";
import {
  saveChatMessage,
  loadChatHistory,
  clearChatHistory,
  logUsage,
  getUsageStats,
} from "@/backend/lib/db";

// ── GET /api/history?sessionId=xxx  →  load chat history ──
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");
  const type = searchParams.get("type"); // "history" | "stats"

  if (type === "stats") {
    const stats = await getUsageStats();
    return NextResponse.json({ stats });
  }

  if (!sessionId) {
    return NextResponse.json(
      { error: "Missing sessionId query parameter." },
      { status: 400 }
    );
  }

  const { messages, error } = await loadChatHistory(sessionId);
  if (error && messages.length === 0) {
    return NextResponse.json({ error }, { status: 503 });
  }
  return NextResponse.json({ messages });
}

// ── POST /api/history  →  save message or log usage ──
export async function POST(req: Request) {
  let body: {
    action: "save" | "log";
    sessionId?: string;
    role?: "user" | "assistant";
    content?: string;
    language?: string;
    tool?: "simplify" | "translate" | "stt" | "tts" | "jarvis";
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (body.action === "save") {
    if (!body.sessionId || !body.role || !body.content) {
      return NextResponse.json(
        { error: "Missing sessionId, role, or content." },
        { status: 400 }
      );
    }
    const { success, error } = await saveChatMessage({
      session_id: body.sessionId,
      role: body.role,
      content: body.content,
      language: body.language ?? "english",
    });
    if (!success) {
      return NextResponse.json({ error }, { status: 503 });
    }
    return NextResponse.json({ success: true });
  }

  if (body.action === "log") {
    if (!body.tool) {
      return NextResponse.json({ error: "Missing tool." }, { status: 400 });
    }
    await logUsage(body.tool, body.language);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action." }, { status: 400 });
}

// ── DELETE /api/history?sessionId=xxx  →  clear session ──
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json(
      { error: "Missing sessionId query parameter." },
      { status: 400 }
    );
  }

  const { success, error } = await clearChatHistory(sessionId);
  if (!success) {
    return NextResponse.json({ error }, { status: 503 });
  }
  return NextResponse.json({ success: true });
}
