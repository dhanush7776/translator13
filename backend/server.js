// ─────────────────────────────────────────────
//  AccessAI Backend Server
// ─────────────────────────────────────────────

import "dotenv/config";
import express from "express";
import { corsMiddleware } from "./middleware/cors.js";
import { errorHandler } from "./middleware/errorHandler.js";
import apiRoutes from "./routes/index.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Apply middleware
app.use(corsMiddleware);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "AccessAI Backend",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api", apiRoutes);

// Error Handling Middleware
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`[AccessAI Backend] Server listening at http://localhost:${PORT}`);
});
