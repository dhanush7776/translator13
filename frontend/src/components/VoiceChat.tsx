"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ── Web Speech API — local types only (no global Window augmentation to avoid
//    conflicts with SpeechToText.tsx which already augments Window globally) ──
interface SpeechRecognitionResultEvt extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}
// Reuse the global SpeechRecognitionErrorEvent (has both .error and .message)
interface SpeechRecognitionErrorEvt extends Event {
  error: string;
  message?: string;
}
interface SpeechRecognitionInst extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: SpeechRecognitionResultEvt) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEvt) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionInst;

// ── Types ──
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

type VoiceState = "idle" | "listening" | "thinking" | "speaking";

const LANG_OPTIONS = [
  { code: "en-US", label: "English" },
  { code: "te-IN", label: "Telugu" },
  { code: "hi-IN", label: "Hindi" },
];

// ── Animated Orb ──
function JarvisOrb({ state }: { state: VoiceState }) {
  const colors: Record<VoiceState, string> = {
    idle:      "radial-gradient(circle at 40% 35%, #6366f1, #1e1b4b)",
    listening: "radial-gradient(circle at 40% 35%, #ef4444, #7f1d1d)",
    thinking:  "radial-gradient(circle at 40% 35%, #f59e0b, #78350f)",
    speaking:  "radial-gradient(circle at 40% 35%, #14b8a6, #134e4a)",
  };
  const glows: Record<VoiceState, string> = {
    idle:      "rgba(99,102,241,0.35)",
    listening: "rgba(239,68,68,0.5)",
    thinking:  "rgba(245,158,11,0.45)",
    speaking:  "rgba(20,184,166,0.5)",
  };

  return (
    <div className="relative flex items-center justify-center" style={{ width: 160, height: 160 }}>
      {/* Outer pulse rings */}
      {(state === "listening" || state === "speaking") && (
        <>
          <div style={{
            position: "absolute", width: 160, height: 160, borderRadius: "50%",
            border: `2px solid ${glows[state]}`,
            animation: "pulse-ring 1.4s cubic-bezier(0.215,0.61,0.355,1) infinite",
          }} />
          <div style={{
            position: "absolute", width: 160, height: 160, borderRadius: "50%",
            border: `2px solid ${glows[state]}`,
            animation: "pulse-ring 1.4s cubic-bezier(0.215,0.61,0.355,1) 0.5s infinite",
          }} />
        </>
      )}
      {/* Thinking spinner ring */}
      {state === "thinking" && (
        <div style={{
          position: "absolute", width: 152, height: 152, borderRadius: "50%",
          border: "3px solid transparent",
          borderTopColor: "#f59e0b",
          borderRightColor: "#f59e0b66",
          animation: "spin 0.9s linear infinite",
        }} />
      )}
      {/* Core orb */}
      <div
        style={{
          width: 130, height: 130, borderRadius: "50%",
          background: colors[state],
          boxShadow: `0 0 40px ${glows[state]}, 0 0 80px ${glows[state]}44, inset 0 0 30px rgba(255,255,255,0.08)`,
          transition: "background 0.6s ease, box-shadow 0.6s ease",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Inner icon */}
        {state === "idle" && (
          <svg width="48" height="48" fill="none" stroke="rgba(255,255,255,0.7)" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 016 0v6a3 3 0 01-3 3z" />
          </svg>
        )}
        {state === "listening" && (
          <div className="flex gap-1 items-end" style={{ height: 32 }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} style={{
                width: 5, background: "rgba(255,255,255,0.85)", borderRadius: 3,
                animation: `sound-bar 0.6s ease ${i * 0.1}s infinite alternate`,
                minHeight: 6,
              }} />
            ))}
          </div>
        )}
        {state === "thinking" && (
          <svg width="40" height="40" fill="none" stroke="rgba(255,255,255,0.8)" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        )}
        {state === "speaking" && (
          <svg width="44" height="44" fill="none" stroke="rgba(255,255,255,0.85)" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M15.536 8.464a5 5 0 010 7.072M12 6v12M9.5 8.5a5 5 0 000 7M6.343 6.343a8 8 0 000 11.314" />
          </svg>
        )}
      </div>

      {/* State label */}
      <div style={{
        position: "absolute", bottom: -28, left: "50%", transform: "translateX(-50%)",
        whiteSpace: "nowrap",
      }}>
        <span style={{
          fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
          color: state === "idle" ? "rgba(226,232,240,0.4)" :
                 state === "listening" ? "#f87171" :
                 state === "thinking" ? "#fbbf24" : "#2dd4bf",
        }}>
          {state === "idle" ? "Tap to speak" :
           state === "listening" ? "● Listening…" :
           state === "thinking" ? "◆ Thinking…" : "▶ Speaking"}
        </span>
      </div>
    </div>
  );
}

// ── Message Bubble ──
function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"} fade-in`}>
      {/* Avatar */}
      <div style={{
        width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: isUser
          ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
          : "linear-gradient(135deg, #14b8a6, #0d9488)",
        fontSize: "0.7rem", fontWeight: 700, color: "white",
        boxShadow: isUser ? "0 0 10px rgba(99,102,241,0.4)" : "0 0 10px rgba(20,184,166,0.4)",
      }}>
        {isUser ? "You" : "AI"}
      </div>
      {/* Bubble */}
      <div style={{
        maxWidth: "78%",
        background: isUser
          ? "rgba(60,62,130,0.82)"
          : "rgba(10,60,55,0.82)",
        border: isUser
          ? "1px solid rgba(99,102,241,0.55)"
          : "1px solid rgba(20,184,166,0.5)",
        borderRadius: isUser ? "1.25rem 0.4rem 1.25rem 1.25rem" : "0.4rem 1.25rem 1.25rem 1.25rem",
        padding: "0.75rem 1.1rem",
        backdropFilter: "blur(12px)",
        boxShadow: isUser
          ? "0 2px 16px rgba(99,102,241,0.15)"
          : "0 2px 16px rgba(20,184,166,0.12)",
      }}>
        <p style={{ fontSize: "0.93rem", lineHeight: 1.7, color: "#f1f5f9", margin: 0, whiteSpace: "pre-wrap" }}>
          {msg.content}
        </p>
        <p style={{ fontSize: "0.67rem", color: "rgba(226,232,240,0.5)", marginTop: "0.35rem", textAlign: isUser ? "right" : "left" }}>
          {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
}

// ── Main VoiceChat Component ──
export default function VoiceChat() {
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hello! I'm JARVIS, your AI voice assistant. Tap the orb and speak to me — I'm ready to help.",
      timestamp: new Date(),
    },
  ]);
  const [interimText, setInterimText] = useState("");
  const [error, setError] = useState("");
  const [supported, setSupported] = useState(true);
  const [selectedLang, setSelectedLang] = useState("en-US");
  const [dbEnabled, setDbEnabled] = useState(false); // true when Supabase is configured
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stable session ID per browser tab (persisted in sessionStorage)
  const sessionId = useRef<string>(
    typeof window !== "undefined"
      ? (sessionStorage.getItem("jarvis_session") ||
          (() => {
            const id = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
            sessionStorage.setItem("jarvis_session", id);
            return id;
          })())
      : `sess_${Date.now()}`
  );

  const recognitionRef = useRef<SpeechRecognitionInst | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  // Keep a ref to messages so async callbacks always have fresh data
  const messagesRef = useRef<ChatMessage[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const ok = "SpeechRecognition" in window || "webkitSpeechRecognition" in window;
      setSupported(ok && "speechSynthesis" in window);
    }
    // Load chat history from Supabase on mount
    const loadHistory = async () => {
      try {
        const res = await fetch(`/api/history?sessionId=${sessionId.current}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.messages && data.messages.length > 0) {
          setDbEnabled(true);
          const loaded: ChatMessage[] = data.messages.map(
            (m: { role: "user" | "assistant"; content: string; created_at: string }) => ({
              role: m.role,
              content: m.content,
              timestamp: new Date(m.created_at),
            })
          );
          setMessages(loaded);
        } else if (!data.error) {
          // DB responded OK but no messages — Supabase is configured
          setDbEnabled(true);
        }
      } catch {
        // Supabase not configured — silent, app works without DB
      } finally {
        setHistoryLoaded(true);
      }
    };
    loadHistory();
    return () => {
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    };
  }, []);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, interimText]);

  // voice lang prefix map
  const VOICE_LANG_MAP: Record<string, string[]> = {
    "en-US": ["en-US", "en-GB", "en-IN", "en"],
    "te-IN": ["te-IN", "te"],
    "hi-IN": ["hi-IN", "hi"],
  };

  const speak = useCallback((text: string, langCode: string = "en-US") => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.95;
    utter.pitch = 1.0;
    utter.volume = 1.0;
    utter.lang = langCode; // always set lang so browser uses correct pronunciation

    const doSpeak = (voices: SpeechSynthesisVoice[]) => {
      // Try exact lang match first, then prefix matches
      const prefixes = VOICE_LANG_MAP[langCode] ?? [langCode];
      let preferred: SpeechSynthesisVoice | null = null;
      for (const prefix of prefixes) {
        preferred = voices.find(
          (v) => v.lang.startsWith(prefix) && (v.name.includes("Google") || v.name.includes("Microsoft"))
        ) || voices.find((v) => v.lang.startsWith(prefix)) || null;
        if (preferred) break;
      }
      // Fallback: set lang on utterance so browser still attempts correct pronunciation
      if (preferred) utter.voice = preferred;
      utter.onstart = () => setVoiceState("speaking");
      utter.onend = () => setVoiceState("idle");
      utter.onerror = () => setVoiceState("idle");
      utteranceRef.current = utter;
      window.speechSynthesis.speak(utter);
    };

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      doSpeak(voices);
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        doSpeak(window.speechSynthesis.getVoices());
      };
    }
  }, []);

  // Fire-and-forget: save a message to DB (never blocks UI)
  const saveMessageToDB = useCallback(async (role: "user" | "assistant", content: string, lang: string) => {
    try {
      await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save",
          sessionId: sessionId.current,
          role,
          content,
          language: lang,
        }),
      });
      setDbEnabled(true);
    } catch { /* silent */ }
  }, []);

  const sendToAI = useCallback(async (userText: string, history: ChatMessage[], langCode: string = "en-US") => {
    setVoiceState("thinking");
    setError("");

    const historyForAPI = history
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map(({ role, content }) => ({ role, content }));

    // Map browser lang code to API language name for AI prompt
    const langLabel = langCode === "te-IN" ? "telugu" : langCode === "hi-IN" ? "hindi" : "english";

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "chat",
          text: userText,
          history: historyForAPI,
          chatLang: langLabel, // tells AI which language to reply in
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "AI error.");
        setVoiceState("idle");
        return;
      }
      const reply = data.result as string;
      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      // Persist both messages to DB (fire-and-forget, langLabel already declared above)
      saveMessageToDB("user", userText, langLabel);
      saveMessageToDB("assistant", reply, langLabel);
      // Log usage
      fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "log", tool: "jarvis", language: langLabel }),
      }).catch(() => {});
      speak(reply, langCode); // ← pass langCode so TTS picks correct voice
    } catch {
      setError("Network error. Please check your connection.");
      setVoiceState("idle");
    }
  }, [speak]);

  const startListening = useCallback(() => {
    if (!supported) return;
    setError("");

    window.speechSynthesis?.cancel();
    setVoiceState("listening");

    const w = window as unknown as { SpeechRecognition?: SpeechRecognitionCtor; webkitSpeechRecognition?: SpeechRecognitionCtor };
    const SpeechRecognitionClass = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SpeechRecognitionClass) { setVoiceState("idle"); return; }
    const recognition = new SpeechRecognitionClass();
    recognition.lang = selectedLang;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    let finalText = "";

    recognition.onresult = (e: SpeechRecognitionResultEvt) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalText += e.results[i][0].transcript + " ";
        else interim += e.results[i][0].transcript;
      }
      setInterimText(interim);
    };

    recognition.onerror = (e: SpeechRecognitionErrorEvt) => {
      if (e.error !== "no-speech") setError(`Mic error: ${e.error}`);
      setVoiceState("idle");
      setInterimText("");
    };

    recognition.onend = () => {
      setInterimText("");
      const trimmed = finalText.trim();
      if (!trimmed) {
        setVoiceState("idle");
        return;
      }
      const userMsg: ChatMessage = {
        role: "user",
        content: trimmed,
        timestamp: new Date(),
      };
      // Build updated list from ref (always fresh, no stale closure)
      const updatedMessages = [...messagesRef.current, userMsg];
      setMessages(updatedMessages);
      // Call AI AFTER state update, pass current selectedLang
      sendToAI(trimmed, updatedMessages, selectedLang);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [supported, selectedLang, sendToAI]);

  /** Handle file upload → extract text → JARVIS summarises and speaks */
  const handleFileUpload = useCallback(async (file: File) => {
    const allowed = ["text/plain", "text/markdown", "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword"];
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!allowed.includes(file.type) && !["txt", "md", "pdf", "docx", "doc"].includes(ext)) {
      setError("Unsupported file. Please upload a .txt, .pdf, or .docx file.");
      return;
    }

    setFileUploading(true);
    setError("");
    window.speechSynthesis?.cancel();

    // Show a user message in chat
    const uploadMsg: ChatMessage = {
      role: "user",
      content: `📎 Uploaded: ${file.name} (${(file.size / 1024).toFixed(1)} KB) — summarising…`,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, uploadMsg]);

    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/summarize-file", { method: "POST", body: form });
      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Failed to summarise the file.");
        setFileUploading(false);
        return;
      }

      const summaryMsg: ChatMessage = {
        role: "assistant",
        content: `📄 Summary of "${data.fileName}":\n\n${data.summary}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, summaryMsg]);
      // Speak the summary
      speak(data.summary, selectedLang);
      // Persist to DB
      const langLabel = selectedLang === "te-IN" ? "telugu" : selectedLang === "hi-IN" ? "hindi" : "english";
      saveMessageToDB("assistant", summaryMsg.content, langLabel);
    } catch {
      setError("Network error while uploading the file.");
    } finally {
      setFileUploading(false);
    }
  }, [selectedLang, speak, saveMessageToDB]);

  const handleOrbClick = () => {
    if (voiceState === "listening") {
      recognitionRef.current?.stop();
      return;
    }
    if (voiceState === "speaking") {
      window.speechSynthesis?.cancel();
      setVoiceState("idle");
      return;
    }
    if (voiceState === "idle") {
      startListening();
    }
  };

  const handleClearChat = () => {
    window.speechSynthesis?.cancel();
    recognitionRef.current?.abort();
    setVoiceState("idle");
    setInterimText("");
    setError("");
    // Clear from Supabase DB
    fetch(`/api/history?sessionId=${sessionId.current}`, { method: "DELETE" }).catch(() => {});
    // New session ID so history starts fresh
    const newId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    sessionStorage.setItem("jarvis_session", newId);
    sessionId.current = newId;
    setMessages([{
      role: "assistant",
      content: "Chat cleared. I'm ready to start fresh — tap the orb and speak!",
      timestamp: new Date(),
    }]);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-white">JARVIS</h3>
            <span className="badge badge-teal">Voice AI</span>
            <span className="badge badge-indigo">NVIDIA NIM</span>
            {historyLoaded && (
              <span className={`badge ${dbEnabled ? "badge-teal" : ""}`}
                style={!dbEnabled ? { background: "rgba(255,255,255,0.06)", color: "rgba(226,232,240,0.4)" } : {}}>
                {dbEnabled ? "🗄️ DB" : "No DB"}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Speak naturally — JARVIS listens and responds with voice</p>
        </div>
        <button className="btn-ghost text-xs px-3 py-1.5" onClick={handleClearChat} id="jarvis-clear-btn">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Clear
        </button>
      </div>

      {/* Not supported warning */}
      {!supported && (
        <div className="flex items-start gap-3 p-4 rounded-xl"
          style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.25)" }}
          role="alert">
          <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-yellow-400 text-sm">
            Voice chat requires <strong>Chrome</strong> or <strong>Edge</strong> with mic permission.
          </p>
        </div>
      )}

      {/* Chat messages */}
      <div
        className="flex flex-col gap-4 overflow-y-auto"
        style={{
          minHeight: 220, maxHeight: 320,
          padding: "1rem",
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "1rem",
        }}
        role="log"
        aria-label="JARVIS conversation"
        aria-live="polite"
        id="jarvis-chat-log"
      >
        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} />
        ))}

        {/* Interim text preview */}
        {interimText && (
          <div className="flex gap-3 flex-row-reverse opacity-60">
            <div style={{
              width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              fontSize: "0.7rem", fontWeight: 700, color: "white",
            }}>You</div>
            <div style={{
              maxWidth: "75%",
              background: "rgba(99,102,241,0.08)",
              border: "1px dashed rgba(99,102,241,0.3)",
              borderRadius: "1.25rem 0.4rem 1.25rem 1.25rem",
              padding: "0.7rem 1rem",
            }}>
              <p style={{ fontSize: "0.88rem", color: "#94a3b8", fontStyle: "italic", margin: 0 }}>
                {interimText}…
              </p>
            </div>
          </div>
        )}

        {/* Thinking dots */}
        {voiceState === "thinking" && (
          <div className="flex gap-3 fade-in">
            <div style={{
              width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "linear-gradient(135deg, #14b8a6, #0d9488)",
              fontSize: "0.7rem", fontWeight: 700, color: "white",
            }}>AI</div>
            <div style={{
              background: "rgba(20,184,166,0.1)",
              border: "1px solid rgba(20,184,166,0.2)",
              borderRadius: "0.4rem 1.25rem 1.25rem 1.25rem",
              padding: "0.85rem 1.2rem",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              {[0, 1, 2].map((i) => (
                <span key={i} style={{
                  width: 7, height: 7, borderRadius: "50%", background: "#14b8a6",
                  animation: `bounce-dot 1s ease ${i * 0.15}s infinite`,
                  display: "inline-block",
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* File Upload Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files[0];
          if (f) handleFileUpload(f);
        }}
        onClick={() => !fileUploading && fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Upload a file for JARVIS to summarise"
        onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? "rgba(45,212,191,1)" : "rgba(45,212,191,0.45)"}`,
          borderRadius: "1rem",
          padding: "1rem 1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          cursor: fileUploading ? "wait" : "pointer",
          background: dragOver ? "rgba(20,184,166,0.15)" : "rgba(8,20,28,0.65)",
          backdropFilter: "blur(12px)",
          transition: "all 0.2s",
          userSelect: "none",
          boxShadow: dragOver ? "0 0 20px rgba(20,184,166,0.3)" : "0 0 0 1px rgba(20,184,166,0.15)",
        }}
        id="jarvis-file-upload"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md,.pdf,.docx,.doc"
          style={{ display: "none" }}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); e.target.value = ""; }}
          id="jarvis-file-input"
        />
        {fileUploading ? (
          <>
            <svg style={{ width: 22, height: 22, color: "#2dd4bf", animation: "spin 1s linear infinite", flexShrink: 0 }}
              fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="50" strokeDashoffset="10" />
            </svg>
            <span style={{ fontSize: "0.88rem", color: "#2dd4bf", fontWeight: 600 }}>JARVIS is reading your file…</span>
          </>
        ) : (
          <>
            <div style={{
              width: 38, height: 38, borderRadius: "0.6rem", flexShrink: 0,
              background: "linear-gradient(135deg, rgba(20,184,166,0.3), rgba(99,102,241,0.2))",
              border: "1px solid rgba(20,184,166,0.5)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg style={{ width: 20, height: 20, color: dragOver ? "#2dd4bf" : "#5eead4" }}
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: "0.88rem", color: dragOver ? "#2dd4bf" : "#e2e8f0", margin: 0, fontWeight: 600 }}>
                {dragOver ? "↓ Drop to summarise" : "📎 Upload a file for JARVIS to summarise"}
              </p>
              <p style={{ fontSize: "0.73rem", color: "rgba(148,163,184,0.8)", margin: "0.15rem 0 0" }}>
                Supports .txt · .pdf · .docx — up to 10 MB
              </p>
            </div>
          </>
        )}
      </div>

      {/* Orb + language */}
      <div className="flex flex-col items-center gap-10 py-2">
        <button
          onClick={handleOrbClick}
          disabled={!supported || voiceState === "thinking"}
          id="jarvis-orb-btn"
          aria-label={
            voiceState === "idle" ? "Start talking to JARVIS" :
            voiceState === "listening" ? "Stop listening" :
            voiceState === "speaking" ? "Stop speaking" : "JARVIS is thinking"
          }
          style={{ background: "none", border: "none", padding: 0, cursor: supported && voiceState !== "thinking" ? "pointer" : "default" }}
        >
          <JarvisOrb state={voiceState} />
        </button>

        {/* Language selector */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">Voice language:</span>
          <div className="flex gap-1.5 p-1 rounded-lg"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            {LANG_OPTIONS.map((l) => (
              <button
                key={l.code}
                className={`tab-btn py-1 px-3 text-xs ${selectedLang === l.code ? "active" : ""}`}
                onClick={() => setSelectedLang(l.code)}
                disabled={voiceState !== "idle"}
                id={`jarvis-lang-${l.code.replace("-", "")}`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)" }}
          role="alert">
          <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Tip */}
      <p className="text-center text-xs text-slate-600">
        Tap orb to speak · Upload a file to summarise · JARVIS replies by voice
      </p>

      {/* Inline keyframes */}
      <style>{`
        @keyframes sound-bar {
          from { height: 6px; }
          to   { height: 28px; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes bounce-dot {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
          40%            { transform: scale(1.1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
