import { BEATS_PER_BAR, type Chord, type Section, type Song, type Staging } from "app/types";

export function formatChord(c: Chord | Staging): string {
  if (!c.root) return "";
  let s: string = c.root;
  if (c.quality === "minor") s += "m";
  else if (c.quality === "dim") s += "dim";
  else if (c.quality === "aug") s += "aug";
  for (const ext of c.extensions) s += ext;
  if (c.bass) s += "/" + c.bass;
  return s;
}

function chordSlots(chord: Chord): string[] {
  const slots = [formatChord(chord)];
  for (let i = 1; i < chord.beats; i++) slots.push("/");
  return slots;
}

function packBars(section: Section): string[][] {
  const flat = section.chords.flatMap(chordSlots);
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

  const rows = visible.map((s) => ({ name: s.name, bars: packBars(s) }));
  const nameWidth = Math.max(...rows.map((r) => r.name.length));
  const slotWidth = Math.max(
    1,
    ...rows.flatMap((r) => r.bars.flatMap((b) => b.map((slot) => slot.length))),
  );

  return rows
    .map(({ name, bars }) => {
      const paddedName = name.padEnd(nameWidth);
      const barStrs = bars.map((bar) =>
        bar.map((slot) => slot.padEnd(slotWidth)).join(" "),
      );
      return `${paddedName} | ${barStrs.join(" | ")} |`;
    })
    .join("\n");
}
