import { formatChord } from "app/format-chord";
import type { Staging } from "app/types";

interface Props {
  staging: Staging | null;
  onAdd: () => void;
  onClear: () => void;
}

function StagingPreview({ staging, onAdd, onClear }: Props) {
  const text = staging?.root ? formatChord(staging) : "—";
  const canCommit = !!staging?.root;

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-gray-700 bg-gray-800/60 px-4 py-3">
      <div>
        <div className="text-xs uppercase tracking-wide text-gray-400">
          Building
        </div>
        <div className="text-3xl font-mono font-bold text-purple-200 leading-none mt-1">
          {text}
        </div>
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
  );
}

export default StagingPreview;
