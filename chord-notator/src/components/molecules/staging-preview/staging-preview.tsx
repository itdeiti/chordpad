import { type FC } from "react";
import { formatChord } from "domain/notation/format";
import { BEAT_OPTIONS, type Beats, type Staging } from "domain/types";

type Props = {
  staging: Staging | null;
  beats: Beats;
  onSetBeats: (beats: Beats) => void;
  onAdd: () => void;
  onClear: () => void;
}

export const StagingPreview: FC<Props> = ({
  staging,
  beats,
  onSetBeats,
  onAdd,
  onClear,
}) => {
  const text = staging?.root ? formatChord(staging) : "—";
  const canCommit = !!staging?.root;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-gray-700 bg-gray-800/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="text-xs uppercase tracking-wide text-gray-400">
          Building
        </div>
        <div className="text-3xl font-mono font-bold text-purple-200 leading-none mt-1">
          {text}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1">
          <span className="text-xs uppercase tracking-wide text-gray-400 mr-1">
            Beats
          </span>
          {BEAT_OPTIONS.map((n) => {
            const selected = beats === n;
            return (
              <button
                key={n}
                type="button"
                onClick={() => onSetBeats(n)}
                aria-pressed={selected}
                className={
                  selected
                    ? "px-2.5 py-1 rounded-md text-sm font-mono font-semibold bg-purple-500 text-white ring-1 ring-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-300"
                    : "px-2.5 py-1 rounded-md text-sm font-mono text-gray-200 border border-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
                }
              >
                {n}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClear}
            disabled={!staging}
            className="px-3 py-2 rounded-md text-sm font-semibold border border-gray-600 text-gray-200 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={onAdd}
            disabled={!canCommit}
            className="px-4 py-2 rounded-md text-sm font-semibold bg-purple-500 text-white hover:bg-purple-400 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-300"
          >
            Add Chord
          </button>
        </div>
      </div>
    </div>
  );
}

