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

export interface Chord {
  id: string;
  root: RootNote;
  quality: Quality;
  extensions: Extension[];
  bass?: RootNote;
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
}

export interface Song {
  sections: Section[];
  activeSectionId: string;
  staging: Staging | null;
}
