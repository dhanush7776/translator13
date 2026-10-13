// ─────────────────────────────────────────────
//  Centralized Global Error Handler Middleware
// ─────────────────────────────────────────────

export function errorHandler(err, req, res, next) {
  console.error("[ServerError]", err);

  // Multer specific errors
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      error: "File too large. Maximum size is 10 MB.",
    });
  }

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || "Internal server error.";

  res.status(statusCode).json({
    error: message,
  });
}
