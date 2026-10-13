"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const VOICES_LANG_MAP: Record<string, string[]> = {
  "en-US": ["en-US", "en-GB", "en-AU", "en-IN", "en"],
  "te-IN": ["te-IN", "te"],
  "hi-IN": ["hi-IN", "hi"],
};

const LANGUAGES = [
  { code: "en-US", label: "English", emoji: "🇺🇸" },
  { code: "te-IN", label: "Telugu", emoji: "🇮🇳" },
  { code: "hi-IN", label: "Hindi", emoji: "🇮🇳" },
];

export default function TextToSpeech() {
  const [text, setText] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [supported, setSupported] = useState(true);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedLang, setSelectedLang] = useState("en-US");
  const [rate, setRate] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [volume, setVolume] = useState(1.0);
  const [progress, setProgress] = useState(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const maxChars = 5000;

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSupported(false);
      return;
    }

    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      setVoices(available);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.cancel();
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, []);

  const getBestVoice = useCallback(
    (langCode: string): SpeechSynthesisVoice | null => {
      const prefixes = VOICES_LANG_MAP[langCode] || [langCode];
      for (const prefix of prefixes) {
        const match = voices.find((v) => v.lang.startsWith(prefix));
        if (match) return match;
      }
      return null;
    },
    [voices]
  );

  const handleSpeak = useCallback(() => {
    if (!text.trim() || !supported) return;

    window.speechSynthesis.cancel();
    setProgress(0);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    const bestVoice = getBestVoice(selectedLang);
    if (bestVoice) utterance.voice = bestVoice;
    else utterance.lang = selectedLang;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
      progressInterval.current = setInterval(() => {
        setProgress((p) => Math.min(p + (100 / (text.length / rate / 4)), 99));
      }, 500);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setProgress(100);
      if (progressInterval.current) clearInterval(progressInterval.current);
      setTimeout(() => setProgress(0), 1500);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      if (progressInterval.current) clearInterval(progressInterval.current);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [text, rate, pitch, volume, selectedLang, supported, getBestVoice]);

  const handlePauseResume = () => {
    if (!supported) return;
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    setProgress(0);
    if (progressInterval.current) clearInterval(progressInterval.current);
  };

  const selectedLangVoice = getBestVoice(selectedLang);

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
          <p className="text-yellow-400 text-sm">Text-to-speech is not supported in this browser. Please use Chrome, Edge, or Firefox.</p>
        </div>
      )}

      {/* Language + Voice info */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-300">Voice Language</label>
        <div className="flex gap-2 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              className={`tab-btn flex-1 flex items-center justify-center gap-1.5 ${selectedLang === lang.code ? "active" : ""}`}
              onClick={() => setSelectedLang(lang.code)}
              disabled={isSpeaking}
              id={`tts-lang-${lang.code.replace("-", "")}`}
              aria-pressed={selectedLang === lang.code}
            >
              <span>{lang.emoji}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
        {selectedLangVoice && (
          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            <svg className="w-3 h-3 text-teal-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
            Voice: <span className="text-slate-400">{selectedLangVoice.name}</span>
          </p>
        )}
        {!selectedLangVoice && selectedLang !== "en-US" && (
          <p className="text-xs text-yellow-500/70">
            ⚠ No dedicated {LANGUAGES.find((l) => l.code === selectedLang)?.label} voice found. Will use system default.
          </p>
        )}
      </div>

      {/* Text input */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-300">Text to Speak</label>
          <span className={`char-counter ${text.length > maxChars * 0.9 ? "warn" : ""}`}>
            {text.length.toLocaleString()} / {maxChars.toLocaleString()}
          </span>
        </div>
        <textarea
          className="input-field"
          rows={5}
          placeholder="Type or paste text here to hear it read aloud..."
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, maxChars))}
          id="tts-input"
          aria-label="Text to be spoken"
          disabled={isSpeaking}
        />
      </div>

      {/* Controls */}
      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-400 flex items-center justify-between">
            <span>Speed</span>
            <span className="text-indigo-400">{rate}x</span>
          </label>
          <input type="range" min="0.5" max="2" step="0.25" value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value))}
            className="w-full accent-indigo-500" id="tts-rate"
            aria-label="Speech rate" disabled={isSpeaking} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-400 flex items-center justify-between">
            <span>Pitch</span>
            <span className="text-teal-400">{pitch.toFixed(1)}</span>
          </label>
          <input type="range" min="0.5" max="2" step="0.1" value={pitch}
            onChange={(e) => setPitch(parseFloat(e.target.value))}
            className="w-full accent-teal-500" id="tts-pitch"
            aria-label="Speech pitch" disabled={isSpeaking} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-400 flex items-center justify-between">
            <span>Volume</span>
            <span className="text-indigo-400">{Math.round(volume * 100)}%</span>
          </label>
          <input type="range" min="0" max="1" step="0.1" value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full accent-indigo-500" id="tts-volume"
            aria-label="Speech volume" />
        </div>
      </div>

      {/* Progress bar */}
      {(isSpeaking || progress > 0) && (
        <div className="flex flex-col gap-1.5">
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}
            role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: "linear-gradient(90deg, #6366f1, #14b8a6)" }} />
          </div>
          <p className="text-xs text-slate-500">{isPaused ? "Paused" : isSpeaking ? "Speaking…" : "Done"}</p>
        </div>
      )}

      {/* Playback buttons */}
      <div className="flex flex-wrap gap-3">
        {!isSpeaking ? (
          <button className="btn-primary flex-1 min-w-[120px] justify-center"
            onClick={handleSpeak} disabled={!text.trim() || !supported}
            id="tts-speak-btn" aria-label="Start speaking">
            <span className="relative z-10 flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              Speak
            </span>
          </button>
        ) : (
          <>
            <button className="btn-ghost flex-1 justify-center" onClick={handlePauseResume}
              id="tts-pause-btn" aria-label={isPaused ? "Resume speaking" : "Pause speaking"}>
              {isPaused ? (
                <><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>Resume</>
              ) : (
                <><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>Pause</>
              )}
            </button>
            <button className="btn-danger flex-1 justify-center" onClick={handleStop}
              id="tts-stop-btn" aria-label="Stop speaking">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h12v12H6z" /></svg>
              Stop
            </button>
          </>
        )}
      </div>

      {/* Status */}
      <div className="flex items-center gap-2">
        {isSpeaking && !isPaused && (
          <span className="badge badge-teal">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />Speaking
          </span>
        )}
        {isPaused && (
          <span className="badge badge-indigo">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
            Paused
          </span>
        )}
        {!isSpeaking && !isPaused && text && (
          <p className="text-xs text-slate-500">
            {text.trim().split(/\s+/).length} words · est. {Math.ceil(text.trim().split(/\s+/).length / (rate * 130))} min read
          </p>
        )}
      </div>
    </div>
  );
}
