import { initialLibrary } from "app/library-reducer";
import { uuid } from "app/song-reducer";
import type { Library, Song } from "app/types";

const STORAGE_KEY = "chordpad:song";
const STORAGE_VERSION = 2;

interface PersistedV1 {
  version: 1;
  song: Omit<Song, "id" | "name"> & { id?: string; name?: string };
}

interface PersistedV2 {
  version: 2;
  library: Library;
}

type Persisted = PersistedV1 | PersistedV2;

function normalize(song: Song): Song {
  return {
    ...song,
    key: song.key ?? "C",
    displayMode: song.displayMode ?? "letters",
    staging: null,
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
