import { useEffect, useReducer } from "react";
import { songReducer } from "app/song-reducer";
import { loadSong, saveSong } from "app/persistence";

export function useSong() {
  const [song, dispatch] = useReducer(songReducer, undefined, loadSong);

  useEffect(() => {
    saveSong(song);
  }, [song]);

  return { song, dispatch };
}
