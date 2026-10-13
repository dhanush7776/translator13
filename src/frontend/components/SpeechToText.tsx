"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

const LANGUAGES = [
  { code: "en-US", label: "English (US)" },
  { code: "te-IN", label: "Telugu (India)" },
  { code: "hi-IN", label: "Hindi (India)" },
  { code: "en-IN", label: "English (India)" },
];

export default function SpeechToText() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState("");
  const [supported, setSupported] = useState(true);
  const [selectedLang, setSelectedLang] = useState("en-US");
  const [copied, setCopied] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasSpeechRecognition =
        "SpeechRecognition" in window || "webkitSpeechRecognition" in window;
      setSupported(hasSpeechRecognition);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
    setInterimTranscript("");
  }, []);

  const startRecording = useCallback(() => {
    setError("");
    if (!supported) {
      setError("Speech recognition is not supported in your browser. Please use Chrome or Edge.");
      return;
    }

    const SpeechRecognitionClass =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    const recognition = new SpeechRecognitionClass();
    recognition.lang = selectedLang;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsRecording(true);
      setError("");
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalText = "";
      let interimText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript + " ";
        } else {
          interimText += result[0].transcript;
        }
      }
      if (finalText) {
        setTranscript((prev) => prev + finalText);
      }
      setInterimTranscript(interimText);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "not-allowed") {
        setError("Microphone access denied. Please allow microphone permission and try again.");
      } else if (event.error === "no-speech") {
        setError("No speech detected. Please speak clearly into the microphone.");
      } else if (event.error === "network") {
        setError("Network error during speech recognition. Please check your connection.");
      } else {
        setError(`Speech recognition error: ${event.error}`);
      }
      setIsRecording(false);
      setInterimTranscript("");
    };

    recognition.onend = () => {
      setIsRecording(false);
      setInterimTranscript("");
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [supported, selectedLang]);

  const handleToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleClear = () => {
    stopRecording();
    setTranscript("");
    setInterimTranscript("");
    setError("");
  };

  const handleCopy = async () => {
    const fullText = transcript + interimTranscript;
    if (!fullText.trim()) return;
    await navigator.clipboard.writeText(fullText.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fullText = transcript + (interimTranscript ? `[${interimTranscript}]` : "");

  return (
    <div className="flex flex-col gap-5">
      {!supported && (
        <div
          className="flex items-start gap-3 p-4 rounded-xl"
          style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.25)" }}
          role="alert"
        >
          <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-yellow-400 text-sm leading-relaxed">
            Speech recognition is not supported in this browser. Please use <strong>Google Chrome</strong> or <strong>Microsoft Edge</strong> for this feature.
          </p>
        </div>
      )}

      {/* Language selector */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-300">Recognition Language</label>
        <select
          className="input-field"
          value={selectedLang}
          onChange={(e) => setSelectedLang(e.target.value)}
          disabled={isRecording}
          id="stt-language-select"
          aria-label="Speech recognition language"
          style={{ cursor: "pointer" }}
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code} style={{ background: "#1e293b" }}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>

      {/* Mic button */}
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="relative flex items-center justify-center">
          {isRecording && <div className="recording-ring" style={{ width: "80px", height: "80px" }} />}
          {isRecording && (
            <div
              className="recording-ring"
              style={{ width: "80px", height: "80px", animationDelay: "0.4s" }}
            />
          )}
          <button
            onClick={handleToggle}
            disabled={!supported}
            id="stt-toggle-btn"
            aria-label={isRecording ? "Stop recording" : "Start recording"}
            aria-pressed={isRecording}
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              border: "none",
              cursor: supported ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              zIndex: 1,
              transition: "all 0.25s ease",
              background: isRecording
                ? "linear-gradient(135deg, #ef4444, #dc2626)"
                : "linear-gradient(135deg, #6366f1, #14b8a6)",
              boxShadow: isRecording
                ? "0 0 30px rgba(239,68,68,0.4)"
                : "0 0 20px rgba(99,102,241,0.3)",
            }}
          >
            {isRecording ? (
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 016 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
          </button>
        </div>

        <div className="text-center">
          {isRecording ? (
            <div className="flex items-center gap-2">
              <span className="badge badge-red">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                Recording
              </span>
              <span className="text-sm text-slate-400">Speak now…</span>
            </div>
          ) : (
            <p className="text-sm text-slate-400">
              {transcript ? "Recording paused — tap to continue" : "Tap the microphone to start"}
            </p>
          )}
        </div>
      </div>

      {/* Action buttons */}
      {(transcript || interimTranscript) && (
        <div className="flex gap-3">
          <button className="btn-ghost flex-1 justify-center" onClick={handleCopy} id="stt-copy-btn">
            {copied ? (
              <>
                <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Text
              </>
            )}
          </button>
          <button className="btn-danger flex-1 justify-center" onClick={handleClear} id="stt-clear-btn">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear All
          </button>
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

      {/* Transcript */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-300">Transcript</label>
          {transcript && (
            <span className="text-xs text-slate-500">
              {transcript.trim().split(/\s+/).length} words
            </span>
          )}
        </div>
        <div
          className="result-box"
          style={{ minHeight: "120px" }}
          role="region"
          aria-label="Speech transcript"
          aria-live="polite"
          id="stt-transcript"
        >
          {!transcript && !interimTranscript ? (
            <span style={{ color: "rgba(226,232,240,0.3)" }}>
              Your speech will appear here in real time…
            </span>
          ) : (
            <>
              <span>{transcript}</span>
              {interimTranscript && (
                <span style={{ color: "rgba(99,102,241,0.7)", fontStyle: "italic" }}>
                  {interimTranscript}
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
