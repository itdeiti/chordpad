import { describe, expect, it } from "vitest";
import {
  parseChord,
  parseProgression,
  splitProgression,
} from "domain/notation/parse";

describe("parseChord", () => {
  it("parses bare major", () => {
    expect(parseChord("C")).toEqual({
      root: "C",
      quality: "major",
      extensions: [],
      bass: undefined,
      beats: 4,
    });
  });

  it("parses minor via m, min, -", () => {
    expect(parseChord("Am")?.quality).toBe("minor");
    expect(parseChord("Amin")?.quality).toBe("minor");
    expect(parseChord("A-")?.quality).toBe("minor");
  });

  it("parses dim and aug aliases", () => {
    expect(parseChord("Cdim")?.quality).toBe("dim");
    expect(parseChord("C°")?.quality).toBe("dim");
    expect(parseChord("Caug")?.quality).toBe("aug");
    expect(parseChord("C+")?.quality).toBe("aug");
  });

  it("treats maj7 as an extension, not a quality", () => {
    expect(parseChord("Cmaj7")).toEqual({
      root: "C",
      quality: "major",
      extensions: ["maj7"],
      bass: undefined,
      beats: 4,
    });
  });

  it("parses minor + 7 from Am7 (not minor + m7)", () => {
    expect(parseChord("Am7")).toEqual({
      root: "A",
      quality: "minor",
      extensions: ["7"],
      bass: undefined,
      beats: 4,
    });
  });

  it("parses sharp roots", () => {
    expect(parseChord("F#")?.root).toBe("F#");
    expect(parseChord("C#m7")?.root).toBe("C#");
  });

  it("normalizes enharmonic flats to sharps", () => {
    expect(parseChord("Db")?.root).toBe("C#");
    expect(parseChord("Eb")?.root).toBe("D#");
    expect(parseChord("Gb")?.root).toBe("F#");
    expect(parseChord("Ab")?.root).toBe("G#");
    expect(parseChord("Bb")?.root).toBe("A#");
  });

  it("normalizes Cb/Fb/E#/B# to their enharmonic naturals", () => {
    expect(parseChord("Cb")?.root).toBe("B");
    expect(parseChord("Fb")?.root).toBe("E");
    expect(parseChord("E#")?.root).toBe("F");
    expect(parseChord("B#")?.root).toBe("C");
  });

  it("disambiguates b5/b9/#5/#9 from root accidentals", () => {
    // Cb5 → C with b5 ext (NOT Cb = B with garbage)
    expect(parseChord("Cb5")).toEqual({
      root: "C",
      quality: "major",
      extensions: ["b5"],
      bass: undefined,
      beats: 4,
    });
    expect(parseChord("C#9")).toEqual({
      root: "C",
      quality: "major",
      extensions: ["#9"],
      bass: undefined,
      beats: 4,
    });
  });

  it("still claims # as root when followed by a non-ambiguous digit", () => {
    // C#7 → C# major + 7 (since #7 isn't an extension token)
    expect(parseChord("C#7")).toEqual({
      root: "C#",
      quality: "major",
      extensions: ["7"],
      bass: undefined,
      beats: 4,
    });
  });

  it("parses half-diminished as minor + 7 + b5", () => {
    expect(parseChord("F#m7b5")).toEqual({
      root: "F#",
      quality: "minor",
      extensions: ["7", "b5"],
      bass: undefined,
      beats: 4,
    });
  });

  it("parses slash chords", () => {
    expect(parseChord("G/B")).toEqual({
      root: "G",
      quality: "major",
      extensions: [],
      bass: "B",
      beats: 4,
    });
  });

  it("parses multi-extension stacks", () => {
    expect(parseChord("Csus4add9")).toEqual({
      root: "C",
      quality: "major",
      extensions: ["sus4", "add9"],
      bass: undefined,
      beats: 4,
    });
  });

  it("accepts lowercase input", () => {
    expect(parseChord("am7")?.root).toBe("A");
    expect(parseChord("am7")?.quality).toBe("minor");
    expect(parseChord("am7")?.extensions).toEqual(["7"]);
  });

  it("rejects domain-violating quality+extension combos", () => {
    // maj7 isn't allowed on a minor triad — that's contradictory.
    expect(parseChord("Cmmaj7")).toBeNull();
    // 6 on a dim triad
    expect(parseChord("Cdim6")).toBeNull();
  });

  it("rejects gibberish", () => {
    expect(parseChord("")).toBeNull();
    expect(parseChord("   ")).toBeNull();
    expect(parseChord("H")).toBeNull();
    expect(parseChord("Xyz")).toBeNull();
    expect(parseChord("Cgarbage")).toBeNull();
    expect(parseChord("C/H")).toBeNull();
  });

  it("rejects double accidentals", () => {
    expect(parseChord("C##")).toBeNull();
    expect(parseChord("Cbb")).toBeNull();
  });

  it("deduplicates repeated extensions", () => {
    expect(parseChord("C77")?.extensions).toEqual(["7"]);
  });
});

describe("splitProgression", () => {
  it("splits on whitespace, comma, and pipe", () => {
    expect(splitProgression("C Am F G")).toEqual(["C", "Am", "F", "G"]);
    expect(splitProgression("C | Am | F | G")).toEqual(["C", "Am", "F", "G"]);
    expect(splitProgression("C, Am, F, G")).toEqual(["C", "Am", "F", "G"]);
    expect(splitProgression("C\nAm\nF\nG")).toEqual(["C", "Am", "F", "G"]);
    expect(splitProgression("C  ||  Am ,, F\n\nG")).toEqual([
      "C",
      "Am",
      "F",
      "G",
    ]);
  });

  it("returns an empty array for empty input", () => {
    expect(splitProgression("")).toEqual([]);
    expect(splitProgression("   ")).toEqual([]);
  });
});

describe("parseProgression", () => {
  it("returns parsed + unparsed entries in order", () => {
    const result = parseProgression("C Am Xyz G");
    expect(result.map((r) => r.kind)).toEqual([
      "parsed",
      "parsed",
      "unparsed",
      "parsed",
    ]);
    expect(result[2]).toEqual({ kind: "unparsed", raw: "Xyz" });
  });

  it("preserves the raw token on parsed entries", () => {
    const [first] = parseProgression("Cmaj7");
    expect(first).toEqual({
      kind: "parsed",
      raw: "Cmaj7",
      spec: {
        root: "C",
        quality: "major",
        extensions: ["maj7"],
        bass: undefined,
        beats: 4,
      },
    });
  });
});
