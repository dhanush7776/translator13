// ─────────────────────────────────────────────
//  History Request Validation Middleware
// ─────────────────────────────────────────────

export function validateHistoryGet(req, res, next) {
  const { sessionId, type } = req.query || {};

  if (type === "stats") {
    return next();
  }

  if (!sessionId) {
    return res.status(400).json({
      error: "Missing sessionId query parameter.",
    });
  }

  next();
}

export function validateHistoryPost(req, res, next) {
  const { action, sessionId, role, content, tool } = req.body || {};

  if (!action || !["save", "log"].includes(action)) {
    return res.status(400).json({
      error: "Invalid or missing action. Use 'save' or 'log'.",
    });
  }

  if (action === "save") {
    if (!sessionId || !role || !content) {
      return res.status(400).json({
        error: "Missing sessionId, role, or content.",
      });
    }
    if (!["user", "assistant"].includes(role)) {
      return res.status(400).json({
        error: "Invalid role. Must be 'user' or 'assistant'.",
      });
    }
  }

  if (action === "log") {
    if (!tool) {
      return res.status(400).json({
        error: "Missing tool.",
      });
    }
  }

  next();
}

export function validateHistoryDelete(req, res, next) {
  const { sessionId } = req.query || {};

  if (!sessionId) {
    return res.status(400).json({
      error: "Missing sessionId query parameter.",
    });
  }

  next();
}
