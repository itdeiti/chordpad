import {
  initialSong,
  songReducer,
  uuid,
  type SongAction,
} from "state/song-reducer";
import type { Library, Song } from "domain/types";

export type LibraryAction =
  | SongAction
  | { type: "CREATE_SONG"; name?: string }
  | { type: "SELECT_SONG"; id: string }
  | { type: "RENAME_SONG"; id: string; name: string }
  | { type: "DELETE_SONG"; id: string }
  | { type: "IMPORT_SONG"; song: Song };

export function initialLibrary(): Library {
  const song = initialSong("My Song");
  return { songs: [song], activeSongId: song.id };
}

function mapActive(lib: Library, fn: (s: Song) => Song): Library {
  return {
    ...lib,
    songs: lib.songs.map((s) => (s.id === lib.activeSongId ? fn(s) : s)),
  };
}

export function libraryReducer(lib: Library, action: LibraryAction): Library {
  switch (action.type) {
    case "CREATE_SONG": {
      const name = action.name?.trim() || `Song ${lib.songs.length + 1}`;
      const song = initialSong(name);
      return { songs: [...lib.songs, song], activeSongId: song.id };
    }

    case "SELECT_SONG":
      if (!lib.songs.some((s) => s.id === action.id)) return lib;
      return { ...lib, activeSongId: action.id };

    case "RENAME_SONG":
      return {
        ...lib,
        songs: lib.songs.map((s) =>
          s.id === action.id ? { ...s, name: action.name.trim() || s.name } : s,
        ),
      };

    case "DELETE_SONG": {
      if (lib.songs.length <= 1) return lib;
      const remaining = lib.songs.filter((s) => s.id !== action.id);
      const nextActive =
        lib.activeSongId === action.id ? remaining[0].id : lib.activeSongId;
      return { songs: remaining, activeSongId: nextActive };
    }

    case "IMPORT_SONG": {
      const imported: Song = { ...action.song, id: uuid(), staging: null };
      return {
        songs: [...lib.songs, imported],
        activeSongId: imported.id,
      };
    }

    default:
      return mapActive(lib, (s) => songReducer(s, action));
  }
}

export function activeSong(lib: Library): Song {
  return lib.songs.find((s) => s.id === lib.activeSongId) ?? lib.songs[0];
}
