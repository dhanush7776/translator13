// ─────────────────────────────────────────────
//  CORS Middleware Configuration
// ─────────────────────────────────────────────

import cors from "cors";

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL.replace(/\/$/, ""));
}

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      process.env.NODE_ENV !== "production" ||
      origin.endsWith(".onrender.com") ||
      origin.endsWith(".vercel.app")
    ) {
      return callback(null, true);
    }
    console.warn(`[CORS] Request from origin ${origin} not allowed`);
    return callback(null, false);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
});

