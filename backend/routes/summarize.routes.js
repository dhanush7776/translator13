// ─────────────────────────────────────────────
//  Document Summarization Route
// ─────────────────────────────────────────────

import { Router } from "express";
import { uploadMiddleware } from "../middleware/upload.js";
import { extractText } from "../services/fileParser.service.js";
import { callNvidiaAI } from "../services/nvidia.service.js";

const router = Router();

router.post("/", uploadMiddleware.single("file"), async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file provided." });
    }

    // Extract text from the in-memory buffer
    const { text, fileType, error: parseError, charCount } = await extractText(
      file.buffer,
      file.originalname
    );

    if (parseError || !text.trim()) {
      return res.status(422).json({
        error: parseError || "Could not extract any text from this file.",
      });
    }

    // Request AI summarization
    const { result, error: aiError, status } = await callNvidiaAI({
      mode: "summarize",
      text,
    });

    if (aiError) {
      return res.status(status || 500).json({ error: aiError });
    }

    return res.json({
      summary: result,
      fileName: file.originalname,
      fileType,
      charCount,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
