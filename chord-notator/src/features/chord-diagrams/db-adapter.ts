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
// Extensions that don't map cleanly fall back to a simpler chord — the caller
// uses `lookupFingering` to walk the fallback chain.
export function chordToDbSuffix(chord: Chord): string {
  const ext = new Set<Extension>(chord.extensions);
  // sus chords replace the third — they override quality semantics in the DB too.
  if (ext.has("sus4")) return ext.has("7") ? "7sus4" : "sus4";
  if (ext.has("sus2")) return "sus2";

  const has7 = ext.has("7") || ext.has("m7");
  const hasMaj7 = ext.has("maj7");
  const hasAdd9 = ext.has("add9");
  const hasAdd11 = ext.has("add11");
  // `m7` as an extension means "minor-7-flavored" even on a "major" base chord.
  const isMinorish = chord.quality === "minor" || ext.has("m7");

  if (chord.quality === "dim") return has7 ? "dim7" : "dim";
  if (chord.quality === "aug") return has7 ? "aug7" : "aug";

  if (isMinorish) {
    if (hasMaj7 && hasAdd9) return "mmaj9";
    if (hasMaj7) return "mmaj7";
    if (has7 && hasAdd9) return "m9";
    if (has7 && hasAdd11) return "m11";
    if (has7) return "m7";
    if (hasAdd9) return "madd9";
    if (hasAdd11) return "m11";
    return "minor";
  }

  if (hasMaj7 && hasAdd9) return "maj9";
  if (hasMaj7 && hasAdd11) return "maj11";
  if (hasMaj7) return "maj7";
  if (has7 && hasAdd9) return "9";
  if (has7 && hasAdd11) return "11";
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
