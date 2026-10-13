// ─────────────────────────────────────────────
//  History & Analytics Routes
// ─────────────────────────────────────────────

import { Router } from "express";
import {
  saveChatMessage,
  loadChatHistory,
  clearChatHistory,
  logUsage,
  getUsageStats,
} from "../database/db.js";
import {
  validateHistoryGet,
  validateHistoryPost,
  validateHistoryDelete,
} from "../validations/history.validation.js";

const router = Router();

// GET /api/history?sessionId=xxx OR ?type=stats
router.get("/", validateHistoryGet, async (req, res, next) => {
  try {
    const { sessionId, type } = req.query;

    if (type === "stats") {
      const stats = await getUsageStats();
      return res.json({ stats });
    }

    const { messages, error } = await loadChatHistory(sessionId);
    if (error && messages.length === 0) {
      return res.status(503).json({ error });
    }

    return res.json({ messages });
  } catch (err) {
    next(err);
  }
});

// POST /api/history (save message or log tool usage)
router.post("/", validateHistoryPost, async (req, res, next) => {
  try {
    const { action, sessionId, role, content, language, tool } = req.body;

    if (action === "save") {
      const { success, error } = await saveChatMessage({
        session_id: sessionId,
        role,
        content,
        language: language || "english",
      });

      if (!success) {
        return res.status(503).json({ error });
      }

      return res.json({ success: true });
    }

    if (action === "log") {
      await logUsage(tool, language);
      return res.json({ success: true });
    }
  } catch (err) {
    next(err);
  }
});

// DELETE /api/history?sessionId=xxx
router.delete("/", validateHistoryDelete, async (req, res, next) => {
  try {
    const { sessionId } = req.query;
    const { success, error } = await clearChatHistory(sessionId);

    if (!success) {
      return res.status(503).json({ error });
    }

    return res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
