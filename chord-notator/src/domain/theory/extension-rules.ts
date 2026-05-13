import type { Extension, Quality } from "domain/types";

export function isExtensionAllowed(
  ext: Extension,
  quality: Quality,
): boolean {
  // m7 / maj7 are sevenths; they're redundant or contradictory when the
  // base quality already implies a 7th type.
  if (quality === "minor" && ext === "m7") return false;
  if (quality === "minor" && ext === "maj7") return false;
  if (quality === "dim" && (ext === "maj7" || ext === "m7")) return false;
  if (quality === "aug" && (ext === "maj7" || ext === "m7")) return false;
  // 6 is meaningful only on major / minor (dim6 and aug6 aren't standard).
  if (ext === "6" && (quality === "dim" || quality === "aug")) return false;
  // b5 / #5 alter the fifth, but dim already lowers it and aug already raises it —
  // disallowing avoids redundant or self-contradictory voicings.
  if (
    (ext === "b5" || ext === "#5") &&
    (quality === "dim" || quality === "aug")
  ) {
    return false;
  }
  return true;
}
