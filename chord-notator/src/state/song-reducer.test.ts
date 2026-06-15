import { describe, expect, it } from "vitest";
import { initialSong, songReducer } from "state/song-reducer";
import type { Song } from "domain/types";

// Build a song with one staged chord ready to commit.
const staged = (): Song => {
  let s = initialSong();
  s = songReducer(s, { type: "SET_ROOT", root: "C" });
  return s;
};

describe("voicing in the builder flow", () => {
  it("carries the staged voicing onto the committed chord", () => {
    let s = staged();
    s = songReducer(s, { type: "SET_STAGING_VOICING", index: 2 });
    s = songReducer(s, { type: "COMMIT_CHORD" });
    const chord = s.sections.find((x) => x.id === s.activeSectionId)!.chords[0];
    expect(chord.voicing).toBe(2);
  });

  it("restores the voicing into staging when editing", () => {
    let s = staged();
    s = songReducer(s, { type: "SET_STAGING_VOICING", index: 3 });
    s = songReducer(s, { type: "COMMIT_CHORD" });
    const section = s.sections.find((x) => x.id === s.activeSectionId)!;
    const chordId = section.chords[0].id;
    s = songReducer(s, {
      type: "START_EDIT_CHORD",
      sectionId: section.id,
      chordId,
    });
    expect(s.staging?.voicing).toBe(3);
  });

  it("resets voicing when the chord identity changes", () => {
    let s = staged();
    s = songReducer(s, { type: "SET_STAGING_VOICING", index: 4 });
    s = songReducer(s, { type: "TOGGLE_EXTENSION", ext: "7" });
    expect(s.staging?.voicing).toBe(0);
    s = songReducer(s, { type: "SET_STAGING_VOICING", index: 2 });
    s = songReducer(s, { type: "SET_QUALITY", quality: "minor" });
    expect(s.staging?.voicing).toBe(0);
  });
});

describe("SET_VOICING_BY_SYMBOL", () => {
  it("updates every chord instance sharing the rendered symbol", () => {
    let s = staged();
    s = songReducer(s, { type: "COMMIT_CHORD" }); // C #1
    s = songReducer(s, { type: "SET_ROOT", root: "C" });
    s = songReducer(s, { type: "COMMIT_CHORD" }); // C #2
    s = songReducer(s, { type: "SET_ROOT", root: "G" });
    s = songReducer(s, { type: "COMMIT_CHORD" }); // G

    s = songReducer(s, {
      type: "SET_VOICING_BY_SYMBOL",
      symbol: "C",
      index: 2,
    });

    const chords = s.sections.find((x) => x.id === s.activeSectionId)!.chords;
    expect(chords.filter((c) => c.voicing === 2)).toHaveLength(2);
    expect(chords.find((c) => c.root === "G")?.voicing).toBeUndefined();
  });
});
