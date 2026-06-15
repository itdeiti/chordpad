import { describe, expect, it } from "vitest";
import { detectChords, fretsToNotes, tonalNameToSpec } from "./detect";

describe("fretsToNotes", () => {
  it("maps an open C major shape to its notes, low → high", () => {
    // x32010 = C major
    expect(fretsToNotes([-1, 3, 2, 0, 1, 0])).toEqual([
      "C3",
      "E3",
      "G3",
      "C4",
      "E4",
    ]);
  });

  it("skips muted strings and includes open strings", () => {
    // 022000 = E minor (low E, open A→muted? here all sounding)
    expect(fretsToNotes([0, 2, 2, 0, 0, 0])).toEqual([
      "E2",
      "B2",
      "E3",
      "G3",
      "B3",
      "E4",
    ]);
  });

  it("returns empty for an all-muted shape", () => {
    expect(fretsToNotes([-1, -1, -1, -1, -1, -1])).toEqual([]);
  });
});

describe("detectChords", () => {
  it("names an open C major shape", async () => {
    const names = await detectChords([-1, 3, 2, 0, 1, 0]);
    expect(names[0]).toBe("CM");
  });

  it("names an open E minor shape", async () => {
    const names = await detectChords([0, 2, 2, 0, 0, 0]);
    expect(names[0]).toBe("Em");
  });

  it("returns nothing for fewer than two notes", async () => {
    expect(await detectChords([-1, -1, -1, -1, -1, 0])).toEqual([]);
  });
});

describe("tonalNameToSpec", () => {
  it("normalizes tonal's major-triad 'M' suffix to a bare major chord", () => {
    expect(tonalNameToSpec("CM")).toMatchObject({
      root: "C",
      quality: "major",
      extensions: [],
    });
  });

  it("parses minor and seventh chords", () => {
    // "m" is the quality; the trailing "7" is the extension.
    expect(tonalNameToSpec("Am7")).toMatchObject({
      root: "A",
      quality: "minor",
      extensions: ["7"],
    });
    expect(tonalNameToSpec("Cmaj7")).toMatchObject({
      root: "C",
      quality: "major",
      extensions: ["maj7"],
    });
  });

  it("preserves a slash bass", () => {
    expect(tonalNameToSpec("C6/A")).toMatchObject({
      root: "C",
      bass: "A",
    });
  });

  it("returns null for a chord our model can't represent", () => {
    // A bare dominant 9th isn't in our extension set.
    expect(tonalNameToSpec("C9")).toBeNull();
  });
});
