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

export const EXTENSIONS = ["7", "maj7", "m7", "add9", "sus2", "sus4"] as const;
export type Extension = (typeof EXTENSIONS)[number];

export const BEAT_OPTIONS = [1, 2, 3, 4] as const;
export type Beats = (typeof BEAT_OPTIONS)[number];
export const BEATS_PER_BAR = 4;

export interface Chord {
  id: string;
  root: RootNote;
  quality: Quality;
  extensions: Extension[];
  bass?: RootNote;
  beats: Beats;
}

export interface Section {
  id: string;
  name: string;
  chords: Chord[];
}

export interface Staging {
  root?: RootNote;
  quality: Quality;
  extensions: Extension[];
  bass?: RootNote;
  beats: Beats;
}

export interface Song {
  sections: Section[];
  activeSectionId: string;
  staging: Staging | null;
}
