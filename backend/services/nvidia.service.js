// ─────────────────────────────────────────────
//  NVIDIA NIM API helper — server-side only
//  This file runs ONLY on the Node.js server.
//  The API key is never sent to the browser.
// ─────────────────────────────────────────────

const NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
// Current active free-endpoint model on NVIDIA NIM
const MODEL = "nvidia/nemotron-3.5-lightning-30b-a3b";

const JARVIS_SYSTEM_PROMPT = `You are JARVIS (Just A Rather Very Intelligent System), an advanced AI voice assistant — intelligent, helpful, and conversational.

Personality:
- Speak naturally and concisely, as if talking face-to-face
- Be warm, slightly witty, and respectful — like a brilliant personal assistant
- Address the user directly and personally
- Never use bullet points or markdown — speak in plain, flowing sentences
- Keep responses SHORT (2-4 sentences max) since they will be read aloud
- If asked something complex, give a clear, direct summary — not an essay
- Occasionally show personality with light humour when appropriate

Examples of your style:
- "Of course! Here's what I found..."
- "Great question. In short..."
- "Consider it done. Here's the summary..."
- "Interesting! Let me explain..."`;

/** Build system + user prompts based on mode */
function buildPrompts(mode, text, language, history, chatLang) {
  if (mode === "chat") {
    const messages = [
      ...(history ?? []).slice(-8), // last 8 messages for context window
      { role: "user", content: text },
    ];

    // Build language-specific instruction for JARVIS
    let langInstruction = "";
    if (chatLang === "telugu") {
      langInstruction = `\n\nIMPORTANT: The user is speaking in Telugu. You MUST reply entirely in Telugu (తెలుగు). Use natural, everyday Telugu that a native speaker would use in conversation. Do NOT reply in English.`;
    } else if (chatLang === "hindi") {
      langInstruction = `\n\nIMPORTANT: The user is speaking in Hindi. You MUST reply entirely in Hindi (हिन्दी). Use natural, everyday Hindi that a native speaker would use in conversation. Do NOT reply in English.`;
    }

    return {
      systemPrompt: JARVIS_SYSTEM_PROMPT + langInstruction,
      messages,
    };
  }

  if (mode === "simplify") {
    return {
      systemPrompt: `You are an expert at making complex text easy to understand for everyone, including people with cognitive disabilities, children, and non-native speakers.
Rules:
- Use simple, everyday words (avoid jargon)
- Write short, clear sentences (max 15 words each)
- Keep the same meaning as the original
- Use active voice
- Output ONLY the simplified text, no explanations or meta-commentary`,
      messages: [{ role: "user", content: `Please simplify this text:\n\n${text}` }],
    };
  }

  if (mode === "summarize") {
    return {
      systemPrompt: `You are JARVIS, an expert document analyst. Your task is to read the provided document content and produce a clear, concise summary that will be read aloud.
Rules:
- Identify the document type and main purpose in one sentence
- List the 4-5 most important points as short, spoken-friendly sentences (no markdown, no bullet symbols)
- End with one sentence on what action or conclusion the document calls for
- Keep total response under 200 words — it will be read aloud by a voice assistant
- Output plain text only, no headers, no bullet points, no markdown`,
      messages: [{ role: "user", content: `Please summarize this document for me:\n\n${text}` }],
    };
  }

  // translate
  const targetLang =
    language === "hindi" ? "Hindi (हिन्दी)" : "Telugu (తెలుగు)";
  return {
    systemPrompt: `You are a professional translator specializing in ${targetLang}.
Rules:
- Translate accurately, preserving the original meaning and tone
- Use natural, fluent ${targetLang} that native speakers use in everyday life
- Preserve formatting (paragraphs, line breaks)
- Output ONLY the translated text in ${targetLang}, no explanations, no original text, no notes`,
    messages: [{ role: "user", content: `Translate the following text to ${targetLang}:\n\n${text}` }],
  };
}

/** Call the NVIDIA NIM API and return { result } or { error, status } */
export async function callNvidiaAI(options) {
  const apiKey = process.env.NVIDIA_API_KEY;

  if (!apiKey || apiKey === "your_nvidia_api_key_here") {
    return {
      error:
        "NVIDIA API key is not configured. Please set NVIDIA_API_KEY in your .env file. Get your key at https://build.nvidia.com",
      status: 503,
    };
  }

  const trimmedText = options.text.trim().slice(0, 3000);
  const { systemPrompt, messages } = buildPrompts(
    options.mode,
    trimmedText,
    options.language,
    options.history,
    options.chatLang
  );

  try {
    const response = await fetch(NVIDIA_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        temperature: options.mode === "chat" ? 0.7 : 0.4,
        top_p: 0.9,
        max_tokens: options.mode === "chat" ? 300 : 1200,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("NVIDIA API error:", response.status, errText);

      if (response.status === 401) {
        return { error: "Invalid NVIDIA API key. Please check your .env file.", status: 401 };
      }
      if (response.status === 429) {
        return { error: "API rate limit reached. Please wait a moment and try again.", status: 429 };
      }
      return { error: `NVIDIA API error: ${response.status}`, status: response.status };
    }

    const data = await response.json();
    const result = data?.choices?.[0]?.message?.content?.trim();

    if (!result) {
      return { error: "No result returned from AI. Please try again.", status: 500 };
    }

    return { result };
  } catch (err) {
    console.error("NVIDIA service error:", err);
    return {
      error: "Failed to connect to AI service. Please check your internet connection.",
      status: 500,
    };
  }
}
