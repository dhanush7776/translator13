import { NextResponse } from "next/server";
import { extractText } from "@/backend/lib/fileParser";
import { callNvidiaAI } from "@/backend/lib/nvidia";

// Max upload size: 10 MB (enforced below in code)

export async function POST(req: Request) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  // 10 MB hard limit
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json(
      { error: "File too large. Maximum size is 10 MB." },
      { status: 413 }
    );
  }

  // Convert File to Buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Extract text from file
  const { text, fileType, error: parseError, charCount } = await extractText(buffer, file.name);

  if (parseError || !text.trim()) {
    return NextResponse.json(
      { error: parseError ?? "Could not extract any text from this file." },
      { status: 422 }
    );
  }

  // Send to NVIDIA AI for summarisation
  const { result, error: aiError, status } = await callNvidiaAI({
    mode: "summarize",
    text,
  });

  if (aiError) {
    return NextResponse.json({ error: aiError }, { status: status ?? 500 });
  }

  return NextResponse.json({
    summary: result,
    fileName: file.name,
    fileType,
    charCount,
  });
}
