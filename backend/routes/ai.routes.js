// ─────────────────────────────────────────────
//  AI Routes
// ─────────────────────────────────────────────

import { Router } from "express";
import { callNvidiaAI } from "../services/nvidia.service.js";
import { validateAiRequest } from "../validations/ai.validation.js";

const router = Router();

router.post("/", validateAiRequest, async (req, res, next) => {
  try {
    const { mode, text, language, history, chatLang } = req.body;
    const { result, error, status } = await callNvidiaAI({
      mode,
      text,
      language,
      history,
      chatLang,
    });

    if (error) {
      return res.status(status || 500).json({ error });
    }

    return res.json({ result });
  } catch (err) {
    next(err);
  }
});

export default router;
