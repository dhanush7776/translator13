"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

// Points to Render backend in production (or fallback relative URL in development)
const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* Mark body as login-page for CSS scoping */
  useEffect(() => {
    document.body.classList.add("login-page");
    return () => document.body.classList.remove("login-page");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const endpoint = isSignUp ? `${API_URL}/api/auth/signup` : `${API_URL}/api/auth/login`;
      const payload = isSignUp ? { email, password, name } : { email, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Authentication failed. Please check your credentials.");
        return;
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("accessai_user", JSON.stringify(data.user));
        if (data.token) {
          localStorage.setItem("accessai_token", data.token);
        }
      }

      setSuccess(isSignUp ? "Account created! Redirecting…" : "Authenticated! Loading workspace…");
      setTimeout(() => {
        router.push("/");
      }, 700);
    } catch {
      setError("Network error. Please make sure the backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail("admin@accessai.io");
    setPassword("accessai123");
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "admin@accessai.io", password: "accessai123" }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "Demo authentication failed.");
        return;
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("accessai_user", JSON.stringify(data.user));
        if (data.token) {
          localStorage.setItem("accessai_token", data.token);
        }
      }

      setSuccess("Logged in as Demo Admin! Redirecting…");
      setTimeout(() => {
        router.push("/");
      }, 600);
    } catch {
      setError("Network connection issue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}
    >
      {/* ── Top Navbar ── */}
      <header
        className="w-full px-6 py-4 flex items-center justify-between z-20"
        style={{ borderBottom: "1px solid var(--border-color)" }}
      >
        <Link href="/" className="inline-flex items-center gap-3 group">
          {/* Logo mark — monochrome circle */}
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
            style={{
              background: "var(--text-primary)",
              color: "var(--bg-primary)",
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <div>
            <p className="text-base font-bold tracking-tight leading-none" style={{ color: "var(--text-primary)" }}>
              AccessAI
            </p>
            <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>
              Accessibility Assistant
            </p>
          </div>
        </Link>

        {/* Moon / Sun toggle */}
        <ThemeToggle />
      </header>

      {/* ── Main 2-Col Split ── */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

          {/* ── LEFT: User's image showcase ── */}
          <div className="lg:col-span-7 flex flex-col justify-center fade-in">
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{
                border: "1px solid var(--border-color)",
                boxShadow: "var(--card-shadow)",
              }}
            >
              {/* The user-given AI image */}
              <div className="relative aspect-[16/10] w-full overflow-hidden">
                <img
                  src="/bg.jpg"
                  alt="AccessAI — Human interacting with AI assistant"
                  className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
                />
                {/* Bottom gradient overlay */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.55) 65%, rgba(0,0,0,0.88) 100%)",
                  }}
                />

                {/* Text over image */}
                <div className="absolute bottom-0 inset-x-0 p-6 sm:p-8 text-white z-10">
                  <div
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3"
                    style={{
                      background: "rgba(255,255,255,0.12)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <span>NVIDIA NIM · Supabase Powered</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight text-white drop-shadow">
                    Breaking Language &amp; Comprehension Barriers
                  </h2>
                  <p className="text-xs sm:text-sm mt-2 drop-shadow" style={{ color: "rgba(255,255,255,0.75)" }}>
                    AI-powered text simplification, English → Telugu &amp; Hindi translation,
                    speech recognition, and JARVIS voice assistant.
                  </p>
                </div>
              </div>

              {/* Feature row below image */}
              <div
                className="grid grid-cols-3 divide-x text-center text-xs"
                style={{
                  background: "var(--bg-secondary)",
                  borderTop: "1px solid var(--border-color)",
                  borderColor: "var(--border-color)",
                }}
              >
                {[
                  { label: "3 Languages", sub: "EN · TE · HI" },
                  { label: "JARVIS Voice", sub: "AI Voice-to-Voice" },
                  { label: "100% Secure", sub: "Protected APIs" },
                ].map((f) => (
                  <div key={f.label} className="p-3">
                    <div className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                      {f.label}
                    </div>
                    <div className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {f.sub}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Auth Card ── */}
          <div className="lg:col-span-5 flex flex-col justify-center fade-in fade-in-delay-1">
            <div
              className="glass-card p-7 sm:p-9"
              style={{
                background: "var(--bg-card)",
                borderColor: "var(--border-color)",
              }}
            >
              {/* Card Header */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
                  {isSignUp ? "Create Account" : "Welcome Back"}
                </h2>
                <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                  {isSignUp
                    ? "Register to access the assistive intelligence suite"
                    : "Sign in to your workspace"}
                </p>
              </div>

              {/* Mode switcher */}
              <div
                className="flex p-1 rounded-xl mb-5"
                style={{
                  background: "var(--bg-tertiary)",
                  border: "1px solid var(--border-color)",
                }}
              >
                {[
                  { label: "Sign In", active: !isSignUp, onClick: () => { setIsSignUp(false); setError(""); } },
                  { label: "Create Account", active: isSignUp, onClick: () => { setIsSignUp(true); setError(""); } },
                ].map((tab) => (
                  <button
                    key={tab.label}
                    type="button"
                    onClick={tab.onClick}
                    className="flex-1 py-2 text-xs font-semibold rounded-lg transition-all"
                    style={{
                      background: tab.active ? "var(--bg-primary)" : "transparent",
                      color: tab.active ? "var(--text-primary)" : "var(--text-muted)",
                      border: tab.active ? "1px solid var(--border-color)" : "1px solid transparent",
                      boxShadow: tab.active ? "0 1px 4px rgba(0,0,0,0.15)" : "none",
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Error alert */}
              {error && (
                <div
                  className="mb-4 p-3 rounded-xl text-xs flex items-start gap-2.5"
                  style={{
                    background: "rgba(220,38,38,0.08)",
                    border: "1px solid rgba(220,38,38,0.3)",
                    color: "#ef4444",
                  }}
                >
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {/* Success alert */}
              {success && (
                <div
                  className="mb-4 p-3 rounded-xl text-xs flex items-start gap-2.5"
                  style={{
                    background: "rgba(34,197,94,0.08)",
                    border: "1px solid rgba(34,197,94,0.3)",
                    color: "#22c55e",
                  }}
                >
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{success}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
                {isSignUp && (
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      required={isSignUp}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Morgan"
                      className="input-field"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@organization.com"
                    className="input-field"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                      Password
                    </label>
                    <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>Min 6 chars</span>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input-field pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity"
                      style={{ opacity: 0.5, color: "var(--text-primary)" }}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center py-2.5 mt-1 text-sm font-semibold rounded-xl"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      <span>Authenticating…</span>
                    </div>
                  ) : isSignUp ? (
                    "Create Account"
                  ) : (
                    "Sign In →"
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-5 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full" style={{ borderTop: "1px solid var(--border-color)" }} />
                </div>
                <span
                  className="relative px-3 text-[10px] font-semibold uppercase tracking-wider"
                  style={{ background: "var(--bg-card)", color: "var(--text-muted)" }}
                >
                  or quick demo
                </span>
              </div>

              {/* Demo login */}
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all hover:scale-[1.01]"
                style={{
                  background: "var(--bg-tertiary)",
                  border: "1px solid var(--border-color)",
                  color: "var(--text-primary)",
                }}
              >
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--text-primary)" }} />
                <span>1-Click Demo Sign In</span>
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* ── Footer ── */}
      <footer
        className="w-full px-6 py-3 text-[11px] flex items-center justify-between"
        style={{ borderTop: "1px solid var(--border-color)", color: "var(--text-muted)" }}
      >
        <span>AccessAI · Intelligent Accessibility Assistant</span>
        <div className="flex items-center gap-4">
          <span>256-bit SSL</span>
          <span>Supabase Auth</span>
          <span>NVIDIA Protected</span>
        </div>
      </footer>
    </div>
  );
}
