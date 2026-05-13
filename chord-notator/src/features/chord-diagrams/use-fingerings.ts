import { useEffect, useState } from "react";
import type { ChordDb } from "domain/theory/fingerings";

type DbState = {
  db: ChordDb | null;
  loading: boolean;
  error: Error | null;
}

// Module-level cache so toggling the legend off and on doesn't re-import.
let cached: ChordDb | null = null;
let inflight: Promise<ChordDb> | null = null;

function load(): Promise<ChordDb> {
  if (cached) return Promise.resolve(cached);
  if (inflight) return inflight;
  // Dynamic import — Vite emits the ~150 KB chord JSON as a separate chunk so
  // users with diagrams toggled off never pay the cost.
  inflight = import("@tombatossals/chords-db/lib/guitar.json").then((mod) => {
    cached = (mod.default ?? mod) as unknown as ChordDb;
    return cached;
  });
  return inflight;
}

export function useFingerings(): DbState {
  const [state, setState] = useState<DbState>(() => ({
    db: cached,
    loading: cached === null,
    error: null,
  }));

  useEffect(() => {
    // When `cached` is already populated, useState's initializer captured it on
    // first render — no setState needed and no second load to kick off.
    if (cached) return;
    let cancelled = false;
    load()
      .then((db) => {
        if (!cancelled) setState({ db, loading: false, error: null });
      })
      .catch((error: Error) => {
        if (!cancelled) setState({ db: null, loading: false, error });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
