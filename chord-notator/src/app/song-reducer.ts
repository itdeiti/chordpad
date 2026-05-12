import type {
  Beats,
  Chord,
  Extension,
  Quality,
  RootNote,
  Section,
  Song,
  Staging,
} from "app/types";

const emptyStaging: Staging = {
  quality: "major",
  extensions: [],
  beats: 4,
};

function uuid(): string {
  return crypto.randomUUID();
}

function makeSection(name: string): Section {
  return { id: uuid(), name, chords: [] };
}

export function initialSong(): Song {
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
    sections,
    activeSectionId: sections[1].id,
    staging: null,
  };
}

export type Action =
  | { type: "SELECT_SECTION"; id: string }
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
  | { type: "RESET_SONG" };

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

export function songReducer(song: Song, action: Action): Song {
  switch (action.type) {
    case "SELECT_SECTION":
      return { ...song, activeSectionId: action.id, staging: null };

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

    case "RESET_SONG":
      return initialSong();
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
