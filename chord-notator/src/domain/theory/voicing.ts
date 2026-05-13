import { ROOT_NOTES, type Chord, type RootNote } from "domain/types";

const SEMITONES_FROM_C: Record<RootNote, number> = {
  C: 0,
  "C#": 1,
  D: 2,
  "D#": 3,
  E: 4,
  F: 5,
  "F#": 6,
  G: 7,
  "G#": 8,
  A: 9,
  "A#": 10,
  B: 11,
};

function midiName(rootSemis: number, baseOctave: number): string {
  const wrapped = ((rootSemis % 12) + 12) % 12;
  const octave = baseOctave + Math.floor(rootSemis / 12);
  return `${ROOT_NOTES[wrapped]}${octave}`;
}

export function chordToNotes(chord: Chord, baseOctave: number = 4): string[] {
  const rootSemi = SEMITONES_FROM_C[chord.root];

  let third: number;
  let fifth: number;
  switch (chord.quality) {
    case "major":
      third = 4;
      fifth = 7;
      break;
    case "minor":
      third = 3;
      fifth = 7;
      break;
    case "dim":
      third = 3;
      fifth = 6;
      break;
    case "aug":
      third = 4;
      fifth = 8;
      break;
  }

  // sus chords *replace* the third with a 2nd or 4th; they're not additive.
  // If both are somehow toggled, sus4 wins — sus4 is more common and
  // unambiguous, and the alternative would produce a four-note cluster that
  // wouldn't reflect any standard chord symbol.
  const hasSus2 = chord.extensions.includes("sus2");
  const hasSus4 = chord.extensions.includes("sus4");
  let thirdInterval: number | null = third;
  if (hasSus4) thirdInterval = 5;
  else if (hasSus2) thirdInterval = 2;

  // Fifth alterations *replace* the fifth, not add to it. b5 + #5 simultaneously
  // doesn't make sense; #5 wins (matches augmented-quality semantics).
  if (chord.extensions.includes("#5")) fifth = 8;
  else if (chord.extensions.includes("b5")) fifth = 6;

  const intervals: number[] = [0];
  if (thirdInterval !== null) intervals.push(thirdInterval);
  intervals.push(fifth);

  for (const ext of chord.extensions) {
    switch (ext) {
      case "7":
      case "m7":
        intervals.push(10);
        break;
      case "maj7":
        intervals.push(11);
        break;
      case "add9":
        intervals.push(14);
        break;
      case "add11":
        intervals.push(17);
        break;
      case "6":
        intervals.push(9);
        break;
      case "13":
        intervals.push(21);
        break;
      case "b9":
        intervals.push(13);
        break;
      case "#9":
        intervals.push(15);
        break;
      case "alt":
        // Jazz "altered" implies dom7 + altered 9ths. The altered 5th(s) are
        // handled above as fifth-replacement; here we add the seventh and the
        // altered ninths. The dedupe via Set below removes any overlap with an
        // explicit 7 toggle.
        intervals.push(10, 13, 15);
        break;
      case "sus2":
      case "sus4":
      case "b5":
      case "#5":
        break;
    }
  }

  const upper = Array.from(new Set(intervals)).map((semi) =>
    midiName(rootSemi + semi, baseOctave),
  );

  if (chord.bass) {
    // Slash-chord convention: the bass note is the lowest pitch. Drop it an
    // octave below the chord so it sits beneath whatever inversion the upper
    // structure produces.
    const bassSemi = SEMITONES_FROM_C[chord.bass];
    return [midiName(bassSemi, baseOctave - 1), ...upper];
  }
  return upper;
}
