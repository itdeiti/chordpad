import {
  BEATS_PER_BAR,
  ROOT_NOTES,
  type Chord,
  type Extension,
  type RootNote,
  type Section,
  type Song,
  type Staging,
} from "domain/types";

const ROMAN_NUMERALS = [
  "I",
  "bII",
  "II",
  "bIII",
  "III",
  "IV",
  "#IV",
  "V",
  "bVI",
  "VI",
  "bVII",
  "VII",
] as const;

// Canonical display order for extensions, regardless of toggle order. Keeps
// output stable (`C7b5` always, never `Cb57`) and makes the leading-extension
// check below deterministic. Anything not listed sorts after the named entries.
const EXTENSION_ORDER: Extension[] = [
  "7",
  "maj7",
  "m7",
  "6",
  "add9",
  "add11",
  "13",
  "sus2",
  "sus4",
  "b5",
  "#5",
  "b9",
  "#9",
  "alt",
];

function sortedExtensions(exts: Extension[]): Extension[] {
  return exts.slice().sort(
    (a, b) => EXTENSION_ORDER.indexOf(a) - EXTENSION_ORDER.indexOf(b),
  );
}

function semitoneOffset(root: RootNote, key: RootNote): number {
  const r = ROOT_NOTES.indexOf(root);
  const k = ROOT_NOTES.indexOf(key);
  return ((r - k) % 12 + 12) % 12;
}

function romanFor(root: RootNote, key: RootNote, isUpper: boolean): string {
  const numeral = ROMAN_NUMERALS[semitoneOffset(root, key)];
  return isUpper ? numeral : numeral.toLowerCase();
}

export function formatChord(c: Chord | Staging, key?: RootNote, roman = false): string {
  // Unparsed (raw) chords bypass the formatter — they have no semantic meaning
  // to render, just the literal text the user pasted.
  if ("raw" in c && c.raw) return c.raw;
  if (!c.root) return "";
  const isUpper = c.quality === "major" || c.quality === "aug";
  let s: string;
  // Tracks whether the part built so far ends with a "root-only" symbol — i.e.
  // nothing has been appended that would prevent a trailing accidental from
  // being misread as part of the root (Cb, C#, bIII, etc.).
  let rootStillBare: boolean;
  if (roman && key) {
    s = romanFor(c.root, key, isUpper);
    if (c.quality === "dim") {
      s += "°";
      rootStillBare = false;
    } else if (c.quality === "aug") {
      s += "+";
      rootStillBare = false;
    } else {
      rootStillBare = true; // I, ii, etc. — still parses as a numeral on its own
    }
  } else {
    s = c.root;
    if (c.quality === "minor") {
      s += "m";
      rootStillBare = false;
    } else if (c.quality === "dim") {
      s += "dim";
      rootStillBare = false;
    } else if (c.quality === "aug") {
      s += "aug";
      rootStillBare = false;
    } else {
      rootStillBare = true; // C, F#, etc.
    }
  }

  const exts = sortedExtensions(c.extensions);
  // Wrap leading alterations (b5/#5/b9/#9) in parens when the chord text
  // wouldn't otherwise disambiguate them from the root — e.g., bare `Cb5`
  // reads as "C-flat octave 5" rather than "C with flat-5". Parens make
  // intent explicit. `alt` starts with a letter, not an accidental, so it
  // doesn't trigger.
  const firstStartsWithAccidental =
    exts.length > 0 && /^[b#]/.test(exts[0]);
  const wrap = rootStillBare && firstStartsWithAccidental;

  if (wrap) s += "(";
  for (const ext of exts) s += ext;
  if (wrap) s += ")";

  if (c.bass) {
    s += "/" + (roman && key ? romanFor(c.bass, key, true) : c.bass);
  }
  return s;
}

function chordSlots(chord: Chord, key: RootNote, roman: boolean): string[] {
  const slots = [formatChord(chord, key, roman)];
  for (let i = 1; i < chord.beats; i++) slots.push("/");
  return slots;
}

function packBars(section: Section, key: RootNote, roman: boolean): string[][] {
  const flat = section.chords.flatMap((c) => chordSlots(c, key, roman));
  const bars: string[][] = [];
  for (let i = 0; i < flat.length; i += BEATS_PER_BAR) {
    const bar = flat.slice(i, i + BEATS_PER_BAR);
    while (bar.length < BEATS_PER_BAR) bar.push("/");
    bars.push(bar);
  }
  return bars;
}

export function formatSong(song: Song): string {
  const visible = song.sections.filter((s) => s.chords.length > 0);
  if (visible.length === 0) return "";

  const roman = song.displayMode === "roman";
  const rows = visible.map((s) => ({
    name: s.name,
    bars: packBars(s, song.key, roman),
  }));
  // Unify pad widths across every section so columns stack vertically: the
  // widest section name dictates the label column; the widest chord symbol
  // anywhere in the song dictates every slot. Without this, each section
  // would line up internally but not against the others.
  const nameWidth = Math.max(...rows.map((r) => r.name.length));
  const slotWidth = Math.max(
    1,
    ...rows.flatMap((r) => r.bars.flatMap((b) => b.map((slot) => slot.length))),
  );

  const header = roman ? `Key: ${song.key}\n` : "";
  return (
    header +
    rows
      .map(({ name, bars }) => {
        const paddedName = name.padEnd(nameWidth);
        const barStrs = bars.map((bar) =>
          bar.map((slot) => slot.padEnd(slotWidth)).join(" "),
        );
        return `${paddedName} | ${barStrs.join(" | ")} |`;
      })
      .join("\n")
  );
}
