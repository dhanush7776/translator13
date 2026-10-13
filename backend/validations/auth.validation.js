// ─────────────────────────────────────────────
//  Authentication Request Validation
// ─────────────────────────────────────────────

export function validateAuthPayload(req, res, next) {
  const { email, password } = req.body || {};

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return res.status(400).json({
      error: "Please provide a valid email address.",
    });
  }

  if (!password || typeof password !== "string" || password.length < 6) {
    return res.status(400).json({
      error: "Password must be at least 6 characters long.",
    });
  }

  next();
}
