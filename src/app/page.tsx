"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const TextSimplifier = dynamic(() => import("@/frontend/components/TextSimplifier"), { ssr: false });
const Translator = dynamic(() => import("@/frontend/components/Translator"), { ssr: false });
const SpeechToText = dynamic(() => import("@/frontend/components/SpeechToText"), { ssr: false });
const TextToSpeech = dynamic(() => import("@/frontend/components/TextToSpeech"), { ssr: false });
const VoiceChat = dynamic(() => import("@/frontend/components/VoiceChat"), { ssr: false });

type Tab = "simplify" | "translate" | "stt" | "tts" | "jarvis";

interface TabConfig {
  id: Tab;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
  badge: string;
  badgeClass: string;
  description: string;
  featureType: "ai" | "browser";
}

const TABS: TabConfig[] = [
  {
    id: "simplify",
    label: "Text Simplifier",
    shortLabel: "Simplify",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    badge: "AI",
    badgeClass: "badge-indigo",
    description: "Make complex text easy to understand",
    featureType: "ai",
  },
  {
    id: "translate",
    label: "Translator",
    shortLabel: "Translate",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
      </svg>
    ),
    badge: "AI",
    badgeClass: "badge-indigo",
    description: "English → Telugu & Hindi",
    featureType: "ai",
  },
  {
    id: "stt",
    label: "Speech to Text",
    shortLabel: "Listen",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 016 0v6a3 3 0 01-3 3z" />
      </svg>
    ),
    badge: "Browser",
    badgeClass: "badge-teal",
    description: "Voice recognition in 3 languages",
    featureType: "browser",
  },
  {
    id: "tts",
    label: "Text to Speech",
    shortLabel: "Speak",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    badge: "Browser",
    badgeClass: "badge-teal",
    description: "Read text aloud with adjustable voice",
    featureType: "browser",
  },
  {
    id: "jarvis",
    label: "JARVIS Voice Chat",
    shortLabel: "JARVIS",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    badge: "AI+Voice",
    badgeClass: "badge-teal",
    description: "Voice-to-voice AI assistant powered by NVIDIA",
    featureType: "ai",
  },
];

const STATS = [
  { value: "3", unit: "Languages", description: "English, Telugu, Hindi" },
  { value: "5", unit: "Tools", description: "Including JARVIS voice chat" },
  { value: "AI", unit: "Powered", description: "NVIDIA NIM (Llama 3.1)" },
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<Tab>("simplify");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeConfig = TABS.find((t) => t.id === activeTab)!;

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header
        className="sticky top-0 z-50 px-4 py-3"
        style={{
          background: "rgba(11,15,26,0.85)",
          backdropFilter: "blur(24px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #6366f1, #14b8a6)" }}
              aria-hidden="true"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-bold gradient-text leading-none">AccessAI</h1>
              <p className="text-xs text-slate-500 leading-none mt-0.5">Accessibility Assistant</p>
            </div>
          </div>

          {/* Nav tabs (desktop) */}
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }} aria-label="Feature tabs">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-btn flex items-center gap-2 ${activeTab === tab.id ? "active" : ""}`}
                id={`nav-tab-${tab.id}`}
                aria-selected={activeTab === tab.id}
                role="tab"
              >
                {tab.icon}
                <span>{tab.shortLabel}</span>
                <span className={`badge ${tab.badgeClass} text-[10px] px-1.5 py-0.5`}>{tab.badge}</span>
              </button>
            ))}
          </nav>

          {/* API indicator */}
          <div className="flex items-center gap-2">
            <div
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
              style={{ background: "rgba(20,184,166,0.1)", border: "1px solid rgba(20,184,166,0.2)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              <span className="text-teal-400 font-medium">NVIDIA NIM</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section className="px-4 pt-12 pb-8 text-center">
        <div className="max-w-3xl mx-auto">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 fade-in"
            style={{
              background: "rgba(99,102,241,0.1)",
              border: "1px solid rgba(99,102,241,0.25)",
              color: "#a5b4fc",
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            Powered by NVIDIA NIM · Llama 3.1
          </div>

          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4 fade-in fade-in-delay-1 leading-tight">
            Breaking Barriers with{" "}
            <span className="gradient-text">Intelligent Accessibility</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8 fade-in fade-in-delay-2 leading-relaxed">
            AI-powered tools to simplify complex text, translate to Telugu & Hindi, and enable seamless voice interaction — making information accessible to everyone.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-8 fade-in fade-in-delay-3">
            {STATS.map((stat) => (
              <div
                key={stat.unit}
                className="glass-card p-4"
                style={{ textAlign: "center" }}
              >
                <div className="text-2xl font-bold gradient-text">{stat.value}</div>
                <div className="text-xs font-semibold text-slate-300 mt-0.5">{stat.unit}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile tab selector */}
      <div className="md:hidden px-4 mb-6">
        <div className="flex overflow-x-auto gap-2 pb-2 snap-x" role="tablist" aria-label="Feature tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-btn flex-shrink-0 snap-start flex items-center gap-1.5 ${activeTab === tab.id ? "active" : ""}`}
              id={`mobile-tab-${tab.id}`}
              aria-selected={activeTab === tab.id}
              role="tab"
            >
              {tab.icon}
              <span>{tab.shortLabel}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Feature cards grid */}
      <section className="px-4 pb-16 flex-1">
        <div className="max-w-6xl mx-auto">
          {/* Feature selector grid (visible only on large screens as sidebar) */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar feature list */}
            <aside className="hidden lg:flex flex-col gap-3 w-64 flex-shrink-0">
              {TABS.map((tab, index) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`glass-card p-4 text-left transition-all ${activeTab === tab.id ? "!border-indigo-500/50 !bg-indigo-500/10" : ""}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  id={`sidebar-feature-${tab.id}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{
                        background:
                          activeTab === tab.id
                            ? "linear-gradient(135deg, rgba(99,102,241,0.4), rgba(20,184,166,0.3))"
                            : "rgba(255,255,255,0.06)",
                      }}
                    >
                      <span
                        style={{
                          color: activeTab === tab.id ? "#a5b4fc" : "rgba(226,232,240,0.5)",
                        }}
                      >
                        {tab.icon}
                      </span>
                    </div>
                    <span className={`badge ${tab.badgeClass}`}>{tab.badge}</span>
                  </div>
                  <div className="text-sm font-semibold text-slate-200 mb-0.5">{tab.label}</div>
                  <div className="text-xs text-slate-500">{tab.description}</div>
                </button>
              ))}

              {/* Setup tip */}
              <div
                className="p-4 rounded-xl mt-2"
                style={{
                  background: "rgba(99,102,241,0.06)",
                  border: "1px solid rgba(99,102,241,0.15)",
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  <span className="text-xs font-semibold text-indigo-400">API Setup</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Add your{" "}
                  <a
                    href="https://build.nvidia.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:text-indigo-300 underline"
                  >
                    NVIDIA NIM
                  </a>{" "}
                  key to <code className="text-teal-400">.env.local</code> to enable AI features.
                </p>
              </div>
            </aside>

            {/* Main content panel */}
            <div className="flex-1 min-w-0">
              <div className="glass-card p-6 lg:p-8 fade-in">
                {/* Panel header */}
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(20,184,166,0.2))" }}
                    aria-hidden="true"
                  >
                    <span className="text-indigo-300">{activeConfig.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl font-bold text-white">{activeConfig.label}</h2>
                      <span className={`badge ${activeConfig.badgeClass}`}>
                        {activeConfig.id === "jarvis" ? "AI + Voice • NVIDIA NIM" : activeConfig.featureType === "ai" ? "AI • NVIDIA NIM" : "Browser API"}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mt-0.5">{activeConfig.description}</p>
                  </div>
                </div>

                <div className="section-divider" />

                {/* Dynamic feature component */}
                {mounted && (
                  <div className="mt-5">
                    {activeTab === "simplify" && <TextSimplifier />}
                    {activeTab === "translate" && <Translator />}
                    {activeTab === "stt" && <SpeechToText />}
                    {activeTab === "tts" && <TextToSpeech />}
                    {activeTab === "jarvis" && <VoiceChat />}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="px-4 py-6 text-center"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="gradient-text font-semibold">AccessAI</span>
            <span>·</span>
            <span>Accessibility for everyone</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              AI: NVIDIA NIM
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
              Speech: Web API
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
              No data stored
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}
