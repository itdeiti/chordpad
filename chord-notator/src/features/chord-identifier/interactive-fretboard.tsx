import { type CSSProperties, type FC, type ReactNode } from "react";

type Props = {
  // Absolute fret per string, low E → high E. -1 = muted, 0 = open, n = fret n.
  frets: number[];
  baseFret: number;
  onChange: (frets: number[]) => void;
  onBaseFretChange: (baseFret: number) => void;
};

const WINDOW = 5; // frets shown at once
const MAX_BASE_FRET = 12;
// Low E → high E. Rendered bottom → top so the board reads like guitar TAB,
// where the bottom line is the low E (6th) string.
const STRING_LABELS = ["E", "A", "D", "G", "B", "e"];
// Single-dot inlays; fret 12 gets a double dot.
const INLAY_FRETS = new Set([3, 5, 7, 9, 15, 17, 19, 21]);

// Horizontal string line drawn through the vertical centre of a cell.
const stringLine: CSSProperties = {
  backgroundImage:
    "linear-gradient(to bottom, transparent calc(50% - 0.5px), rgba(156,163,175,0.55) calc(50% - 0.5px), rgba(156,163,175,0.55) calc(50% + 0.5px), transparent calc(50% + 0.5px))",
};

const gridCols = `1.75rem repeat(${WINDOW}, minmax(0, 1fr))`;

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
    // Tapping the marker toggles open (○) ⇄ muted (×); a fretted string
    // collapses to open.
    const next = frets.slice();
    next[i] = next[i] === 0 ? -1 : 0;
    onChange(next);
  };

  const fretCols = Array.from({ length: WINDOW }, (_, c) => baseFret + c);
  // Render strings top → bottom = high e → low E (TAB orientation).
  const rows = [5, 4, 3, 2, 1, 0];

  return (
    <div className="select-none">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-gray-400">
          Tap frets · low E is the bottom string
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

      {/* Fretboard grid: marker column + WINDOW fret columns, one row per
          string (high e on top, low E on the bottom). */}
      <div className="grid" style={{ gridTemplateColumns: gridCols }}>
        {rows.map((i) => {
          const f = frets[i];
          return (
            <Row key={i}>
              {/* Open / muted marker, to the left of the nut. */}
              <button
                type="button"
                onClick={() => cycleMarker(i)}
                aria-label={`String ${STRING_LABELS[i]} ${
                  f === 0 ? "open" : f < 0 ? "muted" : "fretted"
                }`}
                className={
                  "flex h-9 items-center justify-center text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-400 focus:rounded " +
                  (f === 0
                    ? "text-purple-200"
                    : f < 0
                      ? "text-gray-500"
                      : "text-gray-700")
                }
              >
                {f === 0 ? "○" : f < 0 ? "×" : ""}
              </button>

              {fretCols.map((fret, c) => {
                const active = f === fret;
                const isNut = c === 0 && baseFret === 1;
                const showInlay =
                  !active && i === 2 && INLAY_FRETS.has(fret);
                const showDoubleInlay = !active && fret === 12;
                return (
                  <button
                    key={fret}
                    type="button"
                    onClick={() => setString(i, fret)}
                    aria-label={`String ${STRING_LABELS[i]} fret ${fret}`}
                    aria-pressed={active}
                    style={stringLine}
                    className={
                      "relative flex h-9 items-center justify-center border-gray-600 hover:bg-purple-500/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-400 " +
                      (isNut ? "border-l-2 border-l-gray-300 " : "border-l ") +
                      (c === WINDOW - 1 ? "border-r border-r-gray-600" : "")
                    }
                  >
                    {/* Fret-position inlays for orientation. The double dot
                        at fret 12 straddles the two middle strings. */}
                    {showInlay && (
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-600" />
                    )}
                    {showDoubleInlay && (i === 1 || i === 3) && (
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-600" />
                    )}
                    {active && (
                      <span className="h-4 w-4 rounded-full bg-purple-500 ring-1 ring-purple-200" />
                    )}
                  </button>
                );
              })}
            </Row>
          );
        })}
      </div>

      {/* Fret-number ruler aligned under the fret columns. */}
      <div className="grid" style={{ gridTemplateColumns: gridCols }}>
        <span />
        {fretCols.map((fret) => (
          <span
            key={fret}
            className="text-center text-[10px] text-gray-500 tabular-nums"
          >
            {fret}
          </span>
        ))}
      </div>
    </div>
  );
};

// `display: contents` so the marker + fret buttons land directly in the parent
// grid tracks while still being grouped per string in the markup.
const Row: FC<{ children: ReactNode }> = ({ children }) => (
  <div className="contents">{children}</div>
);
