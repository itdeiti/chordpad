import { isExtensionAllowed } from "domain/theory/extension-rules";
import {
  EXTENSIONS,
  ROOT_NOTES,
  type ChordSpec,
  type Extension,
  type Quality,
  type RootNote,
} from "domain/types";

// Enharmonic flats → sharps (our domain only stores sharps).
const FLAT_TO_SHARP: Record<string, RootNote> = {
  "C#": "C#",
  "D#": "D#",
  "F#": "F#",
  "G#": "G#",
  "A#": "A#",
  Db: "C#",
  Eb: "D#",
  Gb: "F#",
  Ab: "G#",
  Bb: "A#",
  Cb: "B",
  Fb: "E",
  "E#": "F",
  "B#": "C",
};

// Extensions whose first char is an accidental and which collide with the
// "is this an accidental on the root or the start of an extension?" decision.
// These are the only strings where the parser prefers extension over root
// accidental, because they're well-defined two-character tokens.
const ACCIDENTAL_EXT_PREFIXES = new Set(["b5", "b9", "#5", "#9"]);

// Quality aliases, tried in priority order (longest first to avoid `min` eating
// just the `m`). `maj` is intentionally NOT a quality alias — `maj7` is the
// extension, and a bare `C` is already major by default.
const QUALITY_ALIASES: Array<[string, Quality]> = [
  ["min", "minor"],
  ["dim", "dim"],
  ["aug", "aug"],
  ["m", "minor"],
  ["-", "minor"],
  ["°", "dim"],
  ["+", "aug"],
];

// Greedy-longest-first extension list so `7` never wins over `maj7`/`m7`.
const EXT_BY_LENGTH: Extension[] = [...EXTENSIONS].sort(
  (a, b) => b.length - a.length,
);

type Cursor = { s: string; i: number };

const peek = (c: Cursor, n = 1): string => c.s.slice(c.i, c.i + n);

function consumeRoot(c: Cursor): RootNote | null {
  const letter = c.s[c.i];
  if (!letter || !/^[a-g]$/.test(letter)) return null;
  c.i++;
  const upper = letter.toUpperCase();
  // Don't claim a b/# as an accidental when it's actually the start of a
  // b5/b9/#5/#9 extension.
  if (ACCIDENTAL_EXT_PREFIXES.has(peek(c, 2))) {
    return upper as RootNote;
  }
  const accidental = c.s[c.i];
  if (accidental === "#" || accidental === "b") {
    c.i++;
    const candidate = upper + accidental;
    if ((ROOT_NOTES as readonly string[]).includes(candidate)) {
      return candidate as RootNote;
    }
    const normalized = FLAT_TO_SHARP[candidate];
    return normalized ?? null;
  }
  return upper as RootNote;
}

function consumeQuality(c: Cursor): Quality {
  for (const [token, quality] of QUALITY_ALIASES) {
    // Don't let `m` swallow the leading `m` of the `maj7` extension — that
    // would leave `aj7` as leftover. `Cm7` (minor + 7) and `Am7b5`
    // (minor + 7 + b5) still work because `m7` doesn't start with `maj`.
    if (token === "m" && peek(c, 3) === "maj") continue;
    if (peek(c, token.length) === token) {
      c.i += token.length;
      return quality;
    }
  }
  return "major";
}

function consumeExtension(c: Cursor): Extension | null {
  for (const ext of EXT_BY_LENGTH) {
    if (peek(c, ext.length) === ext) {
      c.i += ext.length;
      return ext;
    }
  }
  return null;
}

function consumeBass(c: Cursor): { ok: boolean; bass?: RootNote } {
  if (peek(c, 1) !== "/") return { ok: true };
  c.i++;
  const bass = consumeRoot(c);
  return bass ? { ok: true, bass } : { ok: false };
}

export function parseChord(token: string): ChordSpec | null {
  const trimmed = token.trim().toLowerCase();
  if (!trimmed) return null;
  const c: Cursor = { s: trimmed, i: 0 };

  const root = consumeRoot(c);
  if (!root) return null;

  const quality = consumeQuality(c);

  const extensions: Extension[] = [];
  while (c.i < c.s.length) {
    const ext = consumeExtension(c);
    if (!ext) break;
    if (!isExtensionAllowed(ext, quality)) return null;
    if (!extensions.includes(ext)) extensions.push(ext);
  }

  const bass = consumeBass(c);
  if (!bass.ok) return null;

  if (c.i < c.s.length) return null; // leftover garbage

  return {
    root,
    quality,
    extensions,
    bass: bass.bass,
    beats: 4,
  };
}

export function splitProgression(input: string): string[] {
  return input
    .split(/[\s,|]+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

export type ParseToken =
  | { kind: "parsed"; spec: ChordSpec; raw: string }
  | { kind: "unparsed"; raw: string };

export function parseProgression(input: string): ParseToken[] {
  return splitProgression(input).map((raw) => {
    const spec = parseChord(raw);
    return spec ? { kind: "parsed", spec, raw } : { kind: "unparsed", raw };
  });
}
