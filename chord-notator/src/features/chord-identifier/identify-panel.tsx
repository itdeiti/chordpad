import { type FC, useEffect, useMemo, useState } from "react";
import type { ChordSpec } from "domain/types";
import { detectChords, fretsToNotes, tonalNameToSpec } from "./detect";
import { InteractiveFretboard } from "./interactive-fretboard";

type Props = {
  sectionName: string;
  onInsert: (spec: ChordSpec) => void;
};

const EMPTY_FRETS = [-1, -1, -1, -1, -1, -1];

// Inline chord-identifier used inside the Input Dock. Tap strings to build a
// shape, pick a detected name, and add it. Adding keeps you in the panel (and
// clears the board) so you can enter several chords in a row.
export const IdentifyPanel: FC<Props> = ({ sectionName, onInsert }) => {
  const [frets, setFrets] = useState<number[]>(EMPTY_FRETS);
  const [baseFret, setBaseFret] = useState(1);
  const [results, setResults] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  // Re-detect whenever the shape changes. tonal is dynamically imported inside
  // detectChords, so the first detection also lazy-loads the library.
  useEffect(() => {
    let cancelled = false;
    detectChords(frets).then((names) => {
      if (cancelled) return;
      setResults(names);
      setSelected(names[0] ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [frets]);

  const notes = useMemo(() => fretsToNotes(frets), [frets]);
  const insertSpec = selected ? tonalNameToSpec(selected) : null;

  const reset = () => {
    setFrets(EMPTY_FRETS);
    setBaseFret(1);
  };

  const add = () => {
    if (!insertSpec) return;
    onInsert(insertSpec);
    reset();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <p className="text-sm text-gray-400">
          Tap strings to build a shape — we'll name it.
        </p>
        <button
          type="button"
          onClick={reset}
          className="px-2.5 py-1 rounded-md text-xs font-semibold border border-gray-600 text-gray-300 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          Clear
        </button>
      </div>

      <InteractiveFretboard
        frets={frets}
        baseFret={baseFret}
        onChange={setFrets}
        onBaseFretChange={setBaseFret}
      />

      <div className="min-h-[4.5rem] rounded-md border border-gray-700 bg-gray-800/50 p-3">
        {notes.length < 2 ? (
          <p className="text-sm text-gray-500 italic">
            Add at least two notes to identify a chord.
          </p>
        ) : results.length === 0 ? (
          <p className="text-sm text-gray-400">
            No chord matches{" "}
            <span className="font-mono text-gray-300">
              {notes.map((n) => n.replace(/\d+$/, "")).join(" ")}
            </span>
            .
          </p>
        ) : (
          <>
            <div className="text-xs uppercase tracking-wide text-gray-400">
              Detected
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {results.map((name) => {
                const active = name === selected;
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setSelected(name)}
                    aria-pressed={active}
                    className={
                      "rounded-md border px-2.5 py-1 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 " +
                      (active
                        ? "border-purple-300 bg-purple-500/30 text-purple-100"
                        : "border-gray-600 text-gray-300 hover:bg-gray-700")
                    }
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      <div className="flex items-center justify-end">
        <button
          type="button"
          disabled={!insertSpec}
          data-haptic="success"
          title={
            selected && !insertSpec
              ? "This chord can't be represented in the builder yet"
              : undefined
          }
          onClick={add}
          className="px-4 py-2 rounded-md text-sm font-semibold bg-purple-500 text-white hover:bg-purple-400 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-300"
        >
          Add to {sectionName}
        </button>
      </div>
    </div>
  );
};
