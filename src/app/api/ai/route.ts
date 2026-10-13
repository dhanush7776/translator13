import { NextResponse } from "next/server";
import { callNvidiaAI, type AIMode, type Language, type ChatMessage } from "@/backend/lib/nvidia";

export async function POST(req: Request) {
  let body: { mode: AIMode; text: string; language?: Language; history?: ChatMessage[]; chatLang?: "english" | "telugu" | "hindi" };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { mode, text, language, history, chatLang } = body;

  if (!mode || !text || typeof text !== "string") {
    return NextResponse.json(
      { error: "Missing required fields: mode and text." },
      { status: 400 }
    );
  }

  if (!(["simplify", "translate", "chat", "summarize"] as string[]).includes(mode)) {
    return NextResponse.json(
      { error: "Invalid mode. Use 'simplify', 'translate', 'chat', or 'summarize'." },
      { status: 400 }
    );
  }

  const { result, error, status } = await callNvidiaAI({ mode, text, language, history, chatLang });

  if (error) {
    return NextResponse.json({ error }, { status: status ?? 500 });
  }

  return NextResponse.json({ result });
}
