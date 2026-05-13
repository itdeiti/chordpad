import type {
  ChordDb,
  DbChordEntry,
  Fingering,
} from "domain/theory/fingerings";
import type { Chord, Extension, RootNote } from "domain/types";

// The DB indexes chords by a per-root key that uses a mix of sharp ("Csharp",
// "Fsharp") and flat ("Eb", "Ab", "Bb") spellings — not the C#/D#/F#/G#/A#
// convention our app uses. This map bridges the two.
const ROOT_TO_DB_KEY: Record<RootNote, string> = {
  C: "C",
  "C#": "Csharp",
  D: "D",
  "D#": "Eb",
  E: "E",
  F: "F",
  "F#": "Fsharp",
  G: "G",
  "G#": "Ab",
  A: "A",
  "A#": "Bb",
  B: "B",
};

// Maps our Chord (quality + extensions) to the DB's suffix string for a single
// voicing lookup. Returns the most specific suffix the DB is likely to have.
// Combinations that don't map cleanly fall back to a simpler chord via
// `lookupFingering`'s fallback chain.
export function chordToDbSuffix(chord: Chord): string {
  const ext = new Set<Extension>(chord.extensions);

  // Jazz "altered" is its own DB entry — return it directly so we don't try to
  // synthesize a less-accurate suffix from individual alterations.
  if (ext.has("alt")) return "alt";

  if (ext.has("sus4")) return ext.has("7") ? "7sus4" : "sus4";
  if (ext.has("sus2")) return "sus2";

  const has7 = ext.has("7") || ext.has("m7");
  const hasMaj7 = ext.has("maj7");
  const hasAdd9 = ext.has("add9");
  const hasAdd11 = ext.has("add11");
  const has6 = ext.has("6");
  const has13 = ext.has("13");
  const hasFlat5 = ext.has("b5");
  const hasSharp5 = ext.has("#5");
  const hasFlat9 = ext.has("b9");
  const hasSharp9 = ext.has("#9");
  // `m7` as an extension means "minor-7-flavored" even on a "major" base chord.
  const isMinorish = chord.quality === "minor" || ext.has("m7");

  if (chord.quality === "dim") return has7 ? "dim7" : "dim";
  if (chord.quality === "aug") {
    if (has7 && hasAdd9) return "aug9";
    if (has7) return "aug7";
    return "aug";
  }

  // #5 modifier on a major-base chord behaves the same as augmented quality.
  if (hasSharp5 && !isMinorish) {
    if (has7 && hasAdd9) return "aug9";
    if (has7) return "aug7";
    return "aug";
  }

  if (isMinorish) {
    if (has6 && hasAdd9) return "m69";
    if (has6) return "m6";
    if (hasMaj7 && hasFlat5) return "mmaj7b5";
    if (hasMaj7 && hasAdd9) return "mmaj9";
    if (hasMaj7 && hasAdd11) return "mmaj11";
    if (hasMaj7) return "mmaj7";
    if (has7 && hasFlat5) return "m7b5";
    if (has7 && hasAdd9) return "m9";
    if (has7 && hasAdd11) return "m11";
    if (has7) return "m7";
    if (hasAdd9) return "madd9";
    if (hasAdd11) return "m11";
    return "minor";
  }

  if (has6 && hasAdd9) return "69";
  if (has6) return "6";

  if (hasMaj7 && hasFlat5) return "maj7b5";
  if (hasMaj7 && hasSharp5) return "maj7#5";
  if (hasMaj7 && has13) return "maj13";
  if (hasMaj7 && hasAdd11) return "maj11";
  if (hasMaj7 && hasAdd9) return "maj9";
  if (hasMaj7) return "maj7";

  if (has7 && hasFlat5 && hasAdd9) return "9b5";
  if (has7 && hasFlat5) return "7b5";
  if (has7 && hasFlat9) return "7b9";
  if (has7 && hasSharp9) return "7#9";
  if (has7 && hasAdd9 && hasAdd11) return "9#11";
  if (has13) return "13";
  if (has7 && hasAdd11) return "11";
  if (has7 && hasAdd9) return "9";
  if (has7) return "7";

  if (hasAdd9) return "add9";
  if (hasAdd11) return "11";
  return "major";
}
// Try progressively simpler chord shapes until one matches. The label shown
// above the diagram is always the *original* chord symbol — only the shape
// degrades when we can't find an exact voicing.
export function lookupFingering(
  chord: Chord,
  db: ChordDb,
): Fingering | null {
  const dbKey = ROOT_TO_DB_KEY[chord.root];
  const entries: DbChordEntry[] | undefined = db.chords[dbKey];
  if (!entries) return null;

  const tries: string[] = [chordToDbSuffix(chord)];

  // Slash chord: try `${suffix}/${bassLetter}`. The DB only carries a small
  // set per root (e.g. C has /E, /F, /G) so this often misses; fall back to
  // the non-slash form below.
  if (chord.bass) {
    const bassLetter = ROOT_TO_DB_KEY[chord.bass].replace(/sharp|b$/g, "");
    tries.push(`${chordToDbSuffix(chord)}/${bassLetter}`);
  }

  // Triad fallback: drop all extensions and just look up the base quality.
  const baseSuffix =
    chord.quality === "minor"
      ? "minor"
      : chord.quality === "dim"
        ? "dim"
        : chord.quality === "aug"
          ? "aug"
          : "major";
  tries.push(baseSuffix);

  for (const suffix of tries) {
    const match = entries.find((e) => e.suffix === suffix);
    if (match && match.positions[0]) return match.positions[0];
  }
  return null;
}
