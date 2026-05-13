// Shape of one guitar voicing — matches @tombatossals/chords-db's `Position`
// (6 strings, left-to-right = low E → high E).
export type Fingering = {
  // -1 = muted string, 0 = open, positive int = fret number (relative to baseFret)
  frets: number[];
  // 0 = no finger / open / muted, 1..4 = which finger frets it
  fingers: number[];
  // Fret offset for the voicing — 1 means the diagram starts at fret 1
  baseFret: number;
  // Fret numbers (relative to baseFret) where a barre is held
  barres?: number[];
}

// One entry in the DB's chords[KEY] array.
export type DbChordEntry = {
  key: string;
  suffix: string;
  positions: Fingering[];
}

// Top-level DB shape (just the bits we use).
export type ChordDb = {
  chords: Record<string, DbChordEntry[]>;
}
