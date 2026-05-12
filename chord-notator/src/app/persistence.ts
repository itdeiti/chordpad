import { initialSong } from "app/song-reducer";
import type { Song } from "app/types";

const STORAGE_KEY = "chordpad:song";
const STORAGE_VERSION = 1;

interface Persisted {
  version: number;
  song: Song;
}

export function loadSong(): Song {
  if (typeof localStorage === "undefined") return initialSong();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialSong();
    const parsed = JSON.parse(raw) as Persisted;
    if (parsed?.version !== STORAGE_VERSION || !parsed.song) {
      return initialSong();
    }
    return { ...parsed.song, staging: null };
  } catch {
    return initialSong();
  }
}

export function saveSong(song: Song): void {
  if (typeof localStorage === "undefined") return;
  try {
    const payload: Persisted = {
      version: STORAGE_VERSION,
      song: { ...song, staging: null },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // quota exceeded or disabled — drop silently
  }
}

export function clearSavedSong(): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
