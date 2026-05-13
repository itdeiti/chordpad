import { useEffect, useState } from "react";

// Self-owned localStorage key, deliberately distinct from `chordpad:song` so
// this feature never touches the Song schema or its persistence layer.
const STORAGE_KEY = "chordpad:ui:circle-of-fifths";

function load(): boolean {
  if (typeof localStorage === "undefined") return false;
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function useCircleToggle(): [boolean, (next: boolean) => void] {
  const [shown, setShown] = useState<boolean>(load);

  useEffect(() => {
    if (typeof localStorage === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, String(shown));
    } catch {
      // quota / disabled — silently drop
    }
  }, [shown]);

  return [shown, setShown];
}
