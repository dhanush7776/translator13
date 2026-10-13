"use client";

import { useState, useRef } from "react";

interface AIResult {
  result?: string;
  error?: string;
}

export default function TextSimplifier() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const maxChars = 3000;

  const handleSimplify = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError("");
    setOutput("");

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "simplify", text: input }),
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
      {/* Input */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-300">
            Input Text
          </label>
          <span className={`char-counter ${input.length > maxChars * 0.9 ? "warn" : ""}`}>
            {input.length.toLocaleString()} / {maxChars.toLocaleString()}
          </span>
        </div>
        <textarea
          className="input-field"
          rows={5}
          placeholder="Paste complex text here — legal documents, medical reports, technical papers, academic writing..."
          value={input}
          onChange={(e) => setInput(e.target.value.slice(0, maxChars))}
          id="simplifier-input"
          aria-label="Text to simplify"
        />
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          className="btn-primary flex-1 min-w-[140px] justify-center"
          onClick={handleSimplify}
          disabled={loading || !input.trim()}
          id="simplify-btn"
          aria-busy={loading}
        >
          <span className="relative z-10 flex items-center gap-2">
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Simplifying…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Simplify Text
              </>
            )}
          </span>
        </button>
        <button
          className="btn-ghost"
          onClick={handleClear}
          disabled={!input && !output}
          id="simplifier-clear-btn"
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
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.25)",
          }}
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
              <label className="text-sm font-medium text-slate-300">Simplified Text</label>
              <span className="badge badge-teal">AI Output</span>
            </div>
            <div className="tooltip-wrapper">
              <button
                className="btn-ghost text-xs px-3 py-1.5"
                onClick={handleCopy}
                id="simplifier-copy-btn"
                aria-label="Copy simplified text"
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
          <div className="result-box" role="region" aria-label="Simplified text output" id="simplifier-output">
            {output}
          </div>
        </div>
      )}
    </div>
  );
}
