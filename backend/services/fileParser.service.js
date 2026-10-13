// ─────────────────────────────────────────────────────────────
//  File text extractor — SERVER-SIDE ONLY
//  Supports: .txt, .md, .pdf, .docx, .doc
// ─────────────────────────────────────────────────────────────

import { createRequire } from "module";
const require = createRequire(import.meta.url);

/** Detect file type from extension */
export function detectFileType(filename) {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  if (["txt", "md", "csv", "rtf"].includes(ext)) return "txt";
  if (ext === "pdf") return "pdf";
  if (["docx", "doc"].includes(ext)) return "docx";
  return "unsupported";
}

const MAX_CHARS = 15000; // ~3750 tokens — well within model context

/** Extract plain text from an uploaded file buffer */
export async function extractText(buffer, filename) {
  const fileType = detectFileType(filename);

  if (fileType === "unsupported") {
    return {
      text: "",
      fileType,
      error: "Unsupported file type. Please upload a .txt, .pdf, or .docx file.",
      charCount: 0,
    };
  }

  try {
    if (fileType === "txt") {
      const text = buffer.toString("utf-8").slice(0, MAX_CHARS);
      return { text, fileType, charCount: text.length };
    }

    if (fileType === "pdf") {
      const pdfParse = require("pdf-parse");
      const data = await pdfParse(buffer);
      const text = (data.text || "").trim().slice(0, MAX_CHARS);
      return { text, fileType, charCount: text.length };
    }

    if (fileType === "docx") {
      const mammoth = require("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      const text = (result.value || "").trim().slice(0, MAX_CHARS);
      return { text, fileType, charCount: text.length };
    }

    return { text: "", fileType: "unsupported", error: "Parse error.", charCount: 0 };
  } catch (err) {
    console.error("[fileParser] error:", err);
    return {
      text: "",
      fileType,
      error: "Failed to read the file. It may be corrupted or password-protected.",
      charCount: 0,
    };
  }
}
