import { useEffect, useReducer, useRef } from "react";
import { activeSong, libraryReducer } from "app/library-reducer";
import { loadLibrary, saveLibrary } from "app/persistence";
import { clearHash, decodeSongFromHash } from "app/share";

export function useLibrary() {
  const [library, dispatch] = useReducer(libraryReducer, undefined, loadLibrary);
  const importedRef = useRef(false);

  useEffect(() => {
    if (importedRef.current) return;
    importedRef.current = true;
    const imported = decodeSongFromHash(window.location.hash);
    if (imported) {
      dispatch({ type: "IMPORT_SONG", song: imported });
      clearHash();
    }
  }, []);

  useEffect(() => {
    saveLibrary(library);
  }, [library]);

  return { library, song: activeSong(library), dispatch };
}
