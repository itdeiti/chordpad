import { initialLibrary } from "state/library-reducer";
import { uuid } from "state/song-reducer";
import type { Library, Song } from "domain/types";

const STORAGE_KEY = "chordpad:song";
const STORAGE_VERSION = 2;

type PersistedV1 = {
  version: 1;
  song: Omit<Song, "id" | "name"> & { id?: string; name?: string };
}

type PersistedV2 = {
  version: 2;
  library: Library;
}

type Persisted = PersistedV1 | PersistedV2;

// Backfill additive fields (key, displayMode) with defaults so saves from earlier
// versions load without a hard schema bump. Also drops staging: a half-built chord
// shouldn't survive a reload.
// Backfill additive fields (key, displayMode, showDiagrams) with defaults so saves
// from earlier versions load without a hard schema bump. Also drops staging:
// a half-built chord shouldn't survive a reload.
function normalize(song: Song): Song {
  return {
    ...song,
    key: song.key ?? "C",
    displayMode: song.displayMode ?? "letters",
    showDiagrams: song.showDiagrams ?? true,
    staging: null,
    editingChordId: null,
  };
}

function migrate(persisted: Persisted): Library | null {
  if (persisted.version === 2) {
    return {
      ...persisted.library,
      songs: persisted.library.songs.map(normalize),
    };
  }
  if (persisted.version === 1) {
    const song = normalize({
      ...(persisted.song as Song),
      id: persisted.song.id ?? uuid(),
      name: persisted.song.name ?? "My Song",
    });
    return { songs: [song], activeSongId: song.id };
  }
  return null;
}

export function loadLibrary(): Library {
  if (typeof localStorage === "undefined") return initialLibrary();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialLibrary();
    const parsed = JSON.parse(raw) as Persisted;
    return migrate(parsed) ?? initialLibrary();
  } catch {
    return initialLibrary();
  }
}

export function saveLibrary(lib: Library): void {
  if (typeof localStorage === "undefined") return;
  try {
    const payload: PersistedV2 = {
      version: STORAGE_VERSION,
      library: { ...lib, songs: lib.songs.map(normalize) },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // quota / disabled
  }
}

export function clearSavedLibrary(): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
