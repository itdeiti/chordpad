import { describe, expect, it } from "vitest";
import guitar from "@tombatossals/chords-db/lib/guitar.json";
import type { ChordDb } from "domain/theory/fingerings";
import type { Chord } from "domain/types";
import { lookupFingering, lookupFingerings } from "./db-adapter";

const db = guitar as unknown as ChordDb;

const cMajor: Chord = {
  id: "1",
  root: "C",
  quality: "major",
  extensions: [],
  beats: 4,
};

describe("lookupFingerings", () => {
  it("returns multiple voicings for a common chord", () => {
    expect(lookupFingerings(cMajor, db).length).toBeGreaterThan(1);
  });
});

describe("lookupFingering", () => {
  it("returns the first voicing by default", () => {
    expect(lookupFingering(cMajor, db)).toEqual(lookupFingerings(cMajor, db)[0]);
  });

  it("honors the voicing index", () => {
    const all = lookupFingerings(cMajor, db);
    expect(lookupFingering({ ...cMajor, voicing: 1 }, db)).toEqual(all[1]);
  });

  it("clamps an out-of-range voicing index", () => {
    const all = lookupFingerings(cMajor, db);
    expect(lookupFingering({ ...cMajor, voicing: 999 }, db)).toEqual(
      all[all.length - 1],
    );
    expect(lookupFingering({ ...cMajor, voicing: -5 }, db)).toEqual(all[0]);
  });
});
