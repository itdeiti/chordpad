import { useReducer } from "react";
import { initialSong, songReducer } from "app/song-reducer";

export function useSong() {
  const [song, dispatch] = useReducer(songReducer, undefined, initialSong);
  return { song, dispatch };
}
