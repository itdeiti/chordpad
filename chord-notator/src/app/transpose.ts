import { ROOT_NOTES, type Chord, type RootNote, type Song } from "app/types";

export function transposeRoot(root: RootNote, semitones: number): RootNote {
  const i = ROOT_NOTES.indexOf(root);
  const n = ROOT_NOTES.length;
  const next = ((i + semitones) % n + n) % n;
  return ROOT_NOTES[next];
}

export function transposeChord(chord: Chord, semitones: number): Chord {
  return {
    ...chord,
    root: transposeRoot(chord.root, semitones),
    bass: chord.bass ? transposeRoot(chord.bass, semitones) : undefined,
  };
}

export function transposeSong(song: Song, semitones: number): Song {
  return {
    ...song,
    sections: song.sections.map((s) => ({
      ...s,
      chords: s.chords.map((c) => transposeChord(c, semitones)),
    })),
  };
}
