import { parseChord } from "domain/notation/parse";
import type { ChordSpec } from "domain/types";

// MIDI note numbers of the open strings in standard tuning, low E → high E.
export const STANDARD_TUNING_MIDI = [40, 45, 50, 55, 59, 64] as const;

const CHROMATIC = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
] as const;

const midiToName = (midi: number): string => {
  const pc = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  return `${CHROMATIC[pc]}${octave}`;
};

// Convert a six-element fret array (absolute fret per string; -1 = muted,
// 0 = open) into scientific note names ordered low → high pitch. Bass note is
// first so chord detection can spot slash voicings. Pure + synchronous so it's
// trivially testable; only `detectChords` needs the tonal runtime.
export function fretsToNotes(frets: number[]): string[] {
  return frets
    .map((fret, i) =>
      fret < 0 ? null : STANDARD_TUNING_MIDI[i] + fret,
    )
    .filter((midi): midi is number => midi !== null)
    .sort((a, b) => a - b)
    .map(midiToName);
}

// Lazily load tonal (kept out of the main bundle) and detect candidate chord
// names for the tapped shape, best match first. Needs at least two sounding
// strings to mean anything.
export async function detectChords(frets: number[]): Promise<string[]> {
  const notes = fretsToNotes(frets);
  if (notes.length < 2) return [];
  const { Chord } = await import("tonal");
  return Chord.detect(notes, { assumePerfectFifth: true });
}

// Rewrite tonal's chord spelling into something our parser understands, then
// parse it into a ChordSpec for insertion. Returns null when the chord uses an
// extension our limited model can't represent (e.g. a bare "9" or "11"); the
// name is still shown to the user, just not insertable.
export function tonalNameToSpec(name: string): ChordSpec | null {
  const m = name.match(/^([A-G](?:#|b)?)(.*)$/);
  if (!m) return null;
  const tonic = m[1];
  let suffix = m[2];

  // Preserve a slash bass and normalize the quality/extension portion only.
  let bass = "";
  const slash = suffix.indexOf("/");
  if (slash >= 0) {
    bass = suffix.slice(slash);
    suffix = suffix.slice(0, slash);
  }

  const SUFFIX_MAP: Record<string, string> = {
    M: "", // tonal major-triad symbol → bare letter
    maj: "",
    "°": "dim",
    o: "dim",
    "+": "aug",
    ø: "m7b5",
    Δ: "maj7",
    M7: "maj7",
    ma7: "maj7",
  };
  if (suffix in SUFFIX_MAP) suffix = SUFFIX_MAP[suffix];

  return parseChord(`${tonic}${suffix}${bass}`);
}
