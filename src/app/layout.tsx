import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AccessAI — Intelligent Accessibility Assistant",
  description:
    "AI-powered accessibility app featuring text simplification, Telugu & Hindi translation, speech-to-text, and text-to-speech. Breaking language and comprehension barriers with AI.",
  keywords: ["accessibility", "AI", "Telugu translation", "Hindi translation", "text simplification", "speech to text"],
  authors: [{ name: "AccessAI" }],
  openGraph: {
    title: "AccessAI — Intelligent Accessibility Assistant",
    description: "AI-powered accessibility with text simplification and multilingual translation.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
