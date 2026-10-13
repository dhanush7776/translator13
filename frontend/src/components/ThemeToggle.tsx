"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("accessai_theme") as "dark" | "light" | null;
    const initial = saved || "dark";
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("accessai_theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  if (!mounted) {
    return (
      <div className={`w-9 h-9 rounded-xl border border-white/10 ${className}`} />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      id="theme-toggle-btn"
      className={`relative inline-flex items-center justify-center p-2 rounded-xl transition-all duration-200 ${
        isDark
          ? "bg-white/5 hover:bg-white/10 text-yellow-300 border border-white/10 shadow-sm"
          : "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 shadow-sm"
      } ${className}`}
      aria-label={isDark ? "Switch to white (light mode)" : "Switch to black (dark mode)"}
      title={isDark ? "Click for White / Light mode" : "Click for Black / Dark mode (Moon)"}
    >
      {isDark ? (
        // Currently Dark (Black) -> Show Sun icon to switch to White
        <svg className="w-5 h-5 text-amber-300 transition-transform hover:rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ) : (
        // Currently Light (White) -> Show Moon icon to switch to Black ("if i click on moon it change to black")
        <svg className="w-5 h-5 text-slate-800 transition-transform hover:-rotate-12" fill="currentColor" viewBox="0 0 24 24">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
      )}
    </button>
  );
}
