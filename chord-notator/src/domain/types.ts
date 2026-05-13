export const ROOT_NOTES = [
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

export type RootNote = (typeof ROOT_NOTES)[number];

export const QUALITIES = ["major", "minor", "dim", "aug"] as const;
export type Quality = (typeof QUALITIES)[number];

export const EXTENSIONS = [
  "7",
  "maj7",
  "m7",
  "add9",
  "sus2",
  "sus4",
  "add11",
  "6",
  "13",
  "b5",
  "#5",
  "b9",
  "#9",
  "alt",
] as const;
export type Extension = (typeof EXTENSIONS)[number];

export const BEAT_OPTIONS = [1, 2, 3, 4] as const;
export type Beats = (typeof BEAT_OPTIONS)[number];
export const BEATS_PER_BAR = 4;

export type Chord = {
  id: string;
  root: RootNote;
  quality: Quality;
  extensions: Extension[];
  bass?: RootNote;
  beats: Beats;
}

export type Section = {
  id: string;
  name: string;
  chords: Chord[];
}

export type Staging = {
  root?: RootNote;
  quality: Quality;
  extensions: Extension[];
  bass?: RootNote;
  beats: Beats;
}

export type DisplayMode = "letters" | "roman";

export type Song = {
  id: string;
  name: string;
  key: RootNote;
  displayMode: DisplayMode;
  showDiagrams: boolean;
  sections: Section[];
  activeSectionId: string;
  staging: Staging | null;
  editingChordId: string | null;
}

export type Library = {
  songs: Song[];
  activeSongId: string;
}
