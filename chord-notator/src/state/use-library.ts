import { useEffect, useReducer, useRef } from "react";
import { activeSong, libraryReducer } from "state/library-reducer";
import { loadLibrary, saveLibrary } from "state/persistence";
import { clearHash, decodeSongFromHash } from "features/share";

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
