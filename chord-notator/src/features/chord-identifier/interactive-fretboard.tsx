import { type FC } from "react";

type Props = {
  // Absolute fret per string, low E → high E. -1 = muted, 0 = open, n = fret n.
  frets: number[];
  baseFret: number;
  onChange: (frets: number[]) => void;
  onBaseFretChange: (baseFret: number) => void;
};

const STRING_LABELS = ["E", "A", "D", "G", "B", "e"];
const WINDOW = 5; // frets shown at once
const MAX_BASE_FRET = 12;

export const InteractiveFretboard: FC<Props> = ({
  frets,
  baseFret,
  onChange,
  onBaseFretChange,
}) => {
  const setString = (i: number, value: number) => {
    const next = frets.slice();
    // Tapping the already-selected fret clears the string back to muted.
    next[i] = next[i] === value ? -1 : value;
    onChange(next);
  };

  const cycleMarker = (i: number) => {
    // Muted (×) → open (○) → muted, for the marker row above the nut.
    const next = frets.slice();
    next[i] = next[i] === 0 ? -1 : 0;
    onChange(next);
  };

  const fretRows = Array.from({ length: WINDOW }, (_, r) => baseFret + r);

  return (
    <div className="select-none">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-gray-400">
          Tap the frets you're playing
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Move down a fret"
            disabled={baseFret <= 1}
            onClick={() => onBaseFretChange(Math.max(1, baseFret - 1))}
            className="h-7 w-7 rounded-md border border-gray-600 text-gray-200 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            −
          </button>
          <span className="w-14 text-center text-xs font-mono text-gray-300 tabular-nums">
            fr {baseFret}–{baseFret + WINDOW - 1}
          </span>
          <button
            type="button"
            aria-label="Move up a fret"
            disabled={baseFret >= MAX_BASE_FRET}
            onClick={() =>
              onBaseFretChange(Math.min(MAX_BASE_FRET, baseFret + 1))
            }
            className="h-7 w-7 rounded-md border border-gray-600 text-gray-200 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            +
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[1.5rem_repeat(6,1fr)] gap-1">
        {/* String name row */}
        <span />
        {STRING_LABELS.map((name, i) => (
          <div
            // eslint-disable-next-line @eslint-react/no-array-index-key
            key={`label-${i}`}
            className="text-center text-xs font-mono text-gray-400"
          >
            {name}
          </div>
        ))}

        {/* Open / muted marker row */}
        <span className="text-right text-[10px] text-gray-500 leading-7">
          o/x
        </span>
        {frets.map((f, i) => (
          <button
            // eslint-disable-next-line @eslint-react/no-array-index-key
            key={`mark-${i}`}
            type="button"
            onClick={() => cycleMarker(i)}
            aria-label={`String ${STRING_LABELS[i]} ${
              f === 0 ? "open" : f < 0 ? "muted" : "fretted"
            }`}
            className={
              "flex h-7 items-center justify-center rounded-md border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-400 " +
              (f === 0
                ? "border-purple-400 text-purple-200"
                : f < 0
                  ? "border-gray-700 text-gray-500"
                  : "border-gray-800 text-gray-700")
            }
          >
            {f === 0 ? "○" : f < 0 ? "×" : "·"}
          </button>
        ))}

        {/* Fret rows */}
        {fretRows.map((fret) => (
          <FretRow
            key={fret}
            fret={fret}
            frets={frets}
            onSelect={setString}
          />
        ))}
      </div>
    </div>
  );
};

type RowProps = {
  fret: number;
  frets: number[];
  onSelect: (stringIndex: number, fret: number) => void;
};

const FretRow: FC<RowProps> = ({ fret, frets, onSelect }) => (
  <>
    <span className="text-right text-[10px] text-gray-500 leading-8 tabular-nums">
      {fret}
    </span>
    {frets.map((f, i) => {
      const active = f === fret;
      return (
        <button
          // eslint-disable-next-line @eslint-react/no-array-index-key
          key={`cell-${fret}-${i}`}
          type="button"
          onClick={() => onSelect(i, fret)}
          aria-label={`String ${STRING_LABELS[i]} fret ${fret}`}
          aria-pressed={active}
          className={
            "flex h-8 items-center justify-center rounded-md border focus:outline-none focus:ring-2 focus:ring-purple-400 " +
            (active
              ? "border-purple-300 bg-purple-500"
              : "border-gray-700 bg-gray-800/40 hover:bg-gray-700")
          }
        >
          {active && <span className="h-3 w-3 rounded-full bg-white" />}
        </button>
      );
    })}
  </>
);
