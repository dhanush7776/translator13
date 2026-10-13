// ─────────────────────────────────────────────
//  AI Request Validation Middleware
// ─────────────────────────────────────────────

export function validateAiRequest(req, res, next) {
  const { mode, text } = req.body || {};

  if (!mode || !text || typeof text !== "string") {
    return res.status(400).json({
      error: "Missing required fields: mode and text.",
    });
  }

  const validModes = ["simplify", "translate", "chat", "summarize"];
  if (!validModes.includes(mode)) {
    return res.status(400).json({
      error: "Invalid mode. Use 'simplify', 'translate', 'chat', or 'summarize'.",
    });
  }

  next();
}
