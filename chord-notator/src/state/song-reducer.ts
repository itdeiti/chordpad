import { transposeSong } from "domain/theory/transpose";
import type {
  Beats,
  Chord,
  DisplayMode,
  Extension,
  Quality,
  RootNote,
  Section,
  Song,
  Staging,
} from "domain/types";

const emptyStaging: Staging = {
  quality: "major",
  extensions: [],
  beats: 4,
};

export function uuid(): string {
  return crypto.randomUUID();
}

function makeSection(name: string): Section {
  return { id: uuid(), name, chords: [] };
}

export function initialSong(name: string = "My Song"): Song {
  const sections: Section[] = [
    makeSection("Intro"),
    makeSection("Verse"),
    makeSection("Pre-Chorus"),
    makeSection("Chorus"),
    makeSection("Bridge"),
    makeSection("Outro"),
    makeSection("Inst"),
  ];
  return {
    id: uuid(),
    name,
    key: "C",
    displayMode: "letters",
    sections,
    activeSectionId: sections[1].id,
    staging: null,
  };
}

export type SongAction =
  | { type: "SELECT_SECTION"; id: string }
  | { type: "FOCUS_SECTION"; id: string }
  | { type: "ADD_SECTION"; name: string }
  | { type: "RENAME_SECTION"; id: string; name: string }
  | { type: "DELETE_SECTION"; id: string }
  | { type: "SET_ROOT"; root: RootNote }
  | { type: "SET_QUALITY"; quality: Quality }
  | { type: "TOGGLE_EXTENSION"; ext: Extension }
  | { type: "SET_BASS"; bass: RootNote | undefined }
  | { type: "SET_BEATS"; beats: Beats }
  | { type: "CLEAR_STAGING" }
  | { type: "COMMIT_CHORD" }
  | { type: "DELETE_CHORD"; sectionId: string; chordId: string }
  | { type: "RESET_SONG" }
  | { type: "TRANSPOSE"; semitones: number }
  | { type: "SET_KEY"; key: RootNote }
  | { type: "SET_DISPLAY_MODE"; mode: DisplayMode };

function withStaging(song: Song, patch: Partial<Staging>): Song {
  const base: Staging = song.staging ?? emptyStaging;
  return { ...song, staging: { ...base, ...patch } };
}

function toggleExt(staging: Staging, ext: Extension): Staging {
  const has = staging.extensions.includes(ext);
  return {
    ...staging,
    extensions: has
      ? staging.extensions.filter((e) => e !== ext)
      : [...staging.extensions, ext],
  };
}

export function songReducer(song: Song, action: SongAction): Song {
  switch (action.type) {
    case "SELECT_SECTION":
      return { ...song, activeSectionId: action.id, staging: null };

    case "FOCUS_SECTION":
      // Like SELECT_SECTION but preserves staging — used by playback follow,
      // where the user didn't initiate the switch and shouldn't lose their
      // in-progress chord.
      return song.activeSectionId === action.id
        ? song
        : { ...song, activeSectionId: action.id };

    case "ADD_SECTION": {
      const section = makeSection(action.name.trim() || "Section");
      return {
        ...song,
        sections: [...song.sections, section],
        activeSectionId: section.id,
        staging: null,
      };
    }

    case "RENAME_SECTION":
      return {
        ...song,
        sections: song.sections.map((s) =>
          s.id === action.id ? { ...s, name: action.name.trim() || s.name } : s,
        ),
      };

    case "DELETE_SECTION": {
      const target = song.sections.find((s) => s.id === action.id);
      if (!target || target.chords.length > 0) return song;
      const remaining = song.sections.filter((s) => s.id !== action.id);
      if (remaining.length === 0) return song;
      const nextActive =
        song.activeSectionId === action.id
          ? remaining[0].id
          : song.activeSectionId;
      return { ...song, sections: remaining, activeSectionId: nextActive };
    }

    case "SET_ROOT":
      return withStaging(song, { root: action.root });

    case "SET_QUALITY": {
      // Auto-clean extensions that don't make sense under the new quality
      // (e.g. m7 / maj7 are removed when switching to dim/aug) so the user
      // doesn't have to manually un-toggle them.
      const base: Staging = song.staging ?? emptyStaging;
      let next: Staging = { ...base, quality: action.quality };
      next = pruneIncompatible(next);
      return { ...song, staging: next };
    }

    case "TOGGLE_EXTENSION": {
      const base: Staging = song.staging ?? emptyStaging;
      return { ...song, staging: toggleExt(base, action.ext) };
    }

    case "SET_BASS":
      return withStaging(song, { bass: action.bass });

    case "SET_BEATS":
      return withStaging(song, { beats: action.beats });

    case "CLEAR_STAGING":
      return { ...song, staging: null };

    case "COMMIT_CHORD": {
      if (!song.staging?.root) return song;
      const chord: Chord = {
        id: uuid(),
        root: song.staging.root,
        quality: song.staging.quality,
        extensions: [...song.staging.extensions],
        bass: song.staging.bass,
        beats: song.staging.beats,
      };
      return {
        ...song,
        sections: song.sections.map((s) =>
          s.id === song.activeSectionId
            ? { ...s, chords: [...s.chords, chord] }
            : s,
        ),
        staging: null,
      };
    }

    case "DELETE_CHORD":
      return {
        ...song,
        sections: song.sections.map((s) =>
          s.id === action.sectionId
            ? { ...s, chords: s.chords.filter((c) => c.id !== action.chordId) }
            : s,
        ),
      };

    case "RESET_SONG": {
      // Preserve id + name so the song stays in the library; this is a
      // clear-content action, not a delete.
      const fresh = initialSong(song.name);
      return { ...fresh, id: song.id };
    }

    case "TRANSPOSE":
      return transposeSong(song, action.semitones);

    case "SET_KEY":
      return { ...song, key: action.key };

    case "SET_DISPLAY_MODE":
      return { ...song, displayMode: action.mode };
  }
}

export function isExtensionAllowed(
  ext: Extension,
  quality: Quality,
): boolean {
  if (quality === "minor" && ext === "m7") return false;
  if (quality === "minor" && ext === "maj7") return false;
  if (quality === "dim" && (ext === "maj7" || ext === "m7")) return false;
  if (quality === "aug" && (ext === "maj7" || ext === "m7")) return false;
  return true;
}

function pruneIncompatible(staging: Staging): Staging {
  return {
    ...staging,
    extensions: staging.extensions.filter((e) =>
      isExtensionAllowed(e, staging.quality),
    ),
  };
}
