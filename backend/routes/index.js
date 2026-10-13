// ─────────────────────────────────────────────
//  Master Routes Index
// ─────────────────────────────────────────────

import { Router } from "express";
import aiRoutes from "./ai.routes.js";
import historyRoutes from "./history.routes.js";
import summarizeRoutes from "./summarize.routes.js";
import authRoutes from "./auth.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/ai", aiRoutes);
router.use("/history", historyRoutes);
router.use("/summarize-file", summarizeRoutes);

export default router;
