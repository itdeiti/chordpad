import { type FC, useEffect, useMemo, useState } from "react";
import type { ChordSpec } from "domain/types";
import { detectChords, fretsToNotes, tonalNameToSpec } from "./detect";
import { InteractiveFretboard } from "./interactive-fretboard";

type Props = {
  open: boolean;
  sectionName: string;
  onClose: () => void;
  onInsert: (spec: ChordSpec) => void;
};

const EMPTY_FRETS = [-1, -1, -1, -1, -1, -1];

export const ChordIdentifier: FC<Props> = ({
  open,
  sectionName,
  onClose,
  onInsert,
}) => {
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

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const notes = useMemo(() => fretsToNotes(frets), [frets]);
  const insertSpec = selected ? tonalNameToSpec(selected) : null;

  const reset = () => {
    setFrets(EMPTY_FRETS);
    setBaseFret(1);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg border border-gray-700 bg-gray-900 p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-purple-200">
              Identify chord
            </h2>
            <p className="mt-1 text-xs text-gray-400">
              Tap strings to build a shape — we'll name it.
            </p>
          </div>
          <button
            type="button"
            onClick={reset}
            className="px-2.5 py-1 rounded-md text-xs font-semibold border border-gray-600 text-gray-300 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Clear
          </button>
        </div>

        <div className="mt-4">
          <InteractiveFretboard
            frets={frets}
            baseFret={baseFret}
            onChange={setFrets}
            onBaseFretChange={setBaseFret}
          />
        </div>

        <div className="mt-4 min-h-[4.5rem] rounded-md border border-gray-700 bg-gray-800/50 p-3">
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

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 rounded-md text-sm font-semibold border border-gray-600 text-gray-200 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Close
          </button>
          <button
            type="button"
            disabled={!insertSpec}
            title={
              selected && !insertSpec
                ? "This chord can't be represented in the builder yet"
                : undefined
            }
            onClick={() => {
              if (!insertSpec) return;
              onInsert(insertSpec);
              onClose();
            }}
            className="px-4 py-2 rounded-md text-sm font-semibold bg-purple-500 text-white hover:bg-purple-400 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-300"
          >
            Add to {sectionName}
          </button>
        </div>
      </div>
    </div>
  );
};
