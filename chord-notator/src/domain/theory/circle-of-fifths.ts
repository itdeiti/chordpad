import { transposeRoot } from "domain/theory/transpose";
import type { RootNote } from "domain/types";

// Twelve roots arranged by ascending perfect fifth. C sits at slot 0 (the
// "12 o'clock" position in a clockwise wheel); each subsequent entry is
// seven semitones higher than the previous.
export const CIRCLE_OF_FIFTHS: readonly RootNote[] = [
  "C",
  "G",
  "D",
  "A",
  "E",
  "B",
  "F#",
  "C#",
  "G#",
  "D#",
  "A#",
  "F",
] as const;

export function circlePositionOf(root: RootNote): number {
  return CIRCLE_OF_FIFTHS.indexOf(root);
}

// The relative minor of a major key sits 3 semitones below the tonic
// (e.g. C major ↔ A minor). Computed via the existing transpose helper rather
// than a separate lookup table — single source of truth for chromatic math.
export function relativeMinor(major: RootNote): RootNote {
  return transposeRoot(major, -3);
}
