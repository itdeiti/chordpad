import {
  BEATS_PER_BAR,
  ROOT_NOTES,
  type Chord,
  type RootNote,
  type Section,
  type Song,
  type Staging,
} from "app/types";

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
  if (!c.root) return "";
  const isUpper = c.quality === "major" || c.quality === "aug";
  let s: string;
  if (roman && key) {
    s = romanFor(c.root, key, isUpper);
    if (c.quality === "dim") s += "°";
    else if (c.quality === "aug") s += "+";
  } else {
    s = c.root;
    if (c.quality === "minor") s += "m";
    else if (c.quality === "dim") s += "dim";
    else if (c.quality === "aug") s += "aug";
  }
  for (const ext of c.extensions) s += ext;
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
