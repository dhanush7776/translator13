"use client";

import { useState } from "react";

type Language = "telugu" | "hindi";

interface AIResult {
  result?: string;
  error?: string;
}

const LANGUAGES: { id: Language; label: string; native: string; flag: string }[] = [
  { id: "telugu", label: "Telugu", native: "తెలుగు", flag: "🇮🇳" },
  { id: "hindi", label: "Hindi", native: "हिन्दी", flag: "🇮🇳" },
];

export default function Translator() {
  const [input, setInput] = useState("");
  const [targetLang, setTargetLang] = useState<Language>("telugu");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const maxChars = 3000;

  const handleTranslate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError("");
    setOutput("");

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "translate", text: input, language: targetLang }),
      });
      const data: AIResult = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "An unexpected error occurred.");
      } else {
        setOutput(data.result || "");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setError("");
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Language selector */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-300">Translate To</label>
        <div className="flex gap-2 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          {LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              className={`tab-btn flex-1 flex items-center justify-center gap-2 ${targetLang === lang.id ? "active" : ""}`}
              onClick={() => {
                setTargetLang(lang.id);
                setOutput("");
                setError("");
              }}
              id={`lang-${lang.id}`}
              aria-pressed={targetLang === lang.id}
            >
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
              <span className="text-xs opacity-60 hidden sm:inline">({lang.native})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-300">Source Text (English)</label>
          <span className={`char-counter ${input.length > maxChars * 0.9 ? "warn" : ""}`}>
            {input.length.toLocaleString()} / {maxChars.toLocaleString()}
          </span>
        </div>
        <textarea
          className="input-field"
          rows={5}
          placeholder="Enter English text to translate to Telugu or Hindi..."
          value={input}
          onChange={(e) => setInput(e.target.value.slice(0, maxChars))}
          id="translator-input"
          aria-label="Text to translate"
        />
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          className="btn-primary flex-1 min-w-[140px] justify-center"
          onClick={handleTranslate}
          disabled={loading || !input.trim()}
          id="translate-btn"
          aria-busy={loading}
        >
          <span className="relative z-10 flex items-center gap-2">
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Translating…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                Translate to {LANGUAGES.find((l) => l.id === targetLang)?.label}
              </>
            )}
          </span>
        </button>
        <button
          className="btn-ghost"
          onClick={handleClear}
          disabled={!input && !output}
          id="translator-clear-btn"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Clear
        </button>
      </div>

      {/* Loading progress */}
      {loading && (
        <div className="progress-bar">
          <div className="fill" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          className="flex items-start gap-3 p-4 rounded-xl"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)" }}
          role="alert"
        >
          <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-red-400 text-sm leading-relaxed">{error}</p>
        </div>
      )}

      {/* Output */}
      {output && !loading && (
        <div className="flex flex-col gap-2 fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-slate-300">
                {LANGUAGES.find((l) => l.id === targetLang)?.label} Translation
              </label>
              <span className="badge badge-indigo">
                {LANGUAGES.find((l) => l.id === targetLang)?.native}
              </span>
            </div>
            <div className="tooltip-wrapper">
              <button
                className="btn-ghost text-xs px-3 py-1.5"
                onClick={handleCopy}
                id="translator-copy-btn"
                aria-label="Copy translated text"
              >
                {copied ? (
                  <>
                    <svg className="w-3.5 h-3.5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </>
                )}
              </button>
              <span className="tooltip">Copy to clipboard</span>
            </div>
          </div>
          <div
            className="result-box"
            style={{ fontFamily: "'Noto Sans', 'Noto Sans Telugu', 'Noto Sans Devanagari', system-ui, sans-serif", fontSize: "1.05rem", lineHeight: "1.9" }}
            role="region"
            aria-label="Translated text output"
            id="translator-output"
            lang={targetLang === "telugu" ? "te" : "hi"}
          >
            {output}
          </div>
        </div>
      )}
    </div>
  );
}
