import type { Chord, Song, Staging } from "app/types";

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

export function formatSong(song: Song): string {
  return song.sections
    .filter((s) => s.chords.length > 0)
    .map((s) => `${s.name}: ${s.chords.map(formatChord).join(" ")}`)
    .join("\n");
}
