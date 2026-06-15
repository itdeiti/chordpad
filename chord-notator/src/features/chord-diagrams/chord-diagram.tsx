import { type FC } from "react";
import type { Fingering } from "domain/theory/fingerings";

type Props = {
  label: string;
  fingering: Fingering | null;
  // When set, the diagram becomes a button that fires this on click/tap — used
  // to open the voicing picker (legend) or select a voicing (picker grid).
  onClick?: () => void;
  // Highlights the diagram as the currently selected voicing.
  selected?: boolean;
  // Small corner badge, e.g. "2/5", advertising that alternatives exist.
  badge?: string;
};

// SVG coordinates — keep small numbers so the box is dense and scales sharply.
// 6 strings × 5 frets fits comfortably in 60×72.
const W = 60;
const H = 72;
const PAD_X = 7;
const PAD_TOP = 14;
const PAD_BOTTOM = 6;
const STRINGS = 6;
const FRETS = 5;
const STRING_GAP = (W - 2 * PAD_X) / (STRINGS - 1);
const FRET_GAP = (H - PAD_TOP - PAD_BOTTOM) / FRETS;

const renderFingering = (f: Fingering) => {
  const showBaseFret = f.baseFret > 1;

  return (
    <>
      {/* Nut (thicker top line) when this is a first-position voicing.
          Otherwise show the base fret number on the left. */}
      {!showBaseFret ? (
        <line
          x1={PAD_X - 1}
          y1={PAD_TOP}
          x2={W - PAD_X + 1}
          y2={PAD_TOP}
          stroke="currentColor"
          strokeWidth={2}
        />
      ) : (
        <text
          x={PAD_X - 4}
          y={PAD_TOP + FRET_GAP / 2 + 2}
          fontSize={6}
          fill="currentColor"
          textAnchor="end"
        >
          {f.baseFret}
        </text>
      )}

      {/* Frets */}
      {Array.from({ length: FRETS }, (_, i) => i + 1).map((i) => (
        <line
          key={`fret-${i}`}
          x1={PAD_X}
          y1={PAD_TOP + i * FRET_GAP}
          x2={W - PAD_X}
          y2={PAD_TOP + i * FRET_GAP}
          stroke="currentColor"
          strokeWidth={0.5}
          opacity={0.6}
        />
      ))}

      {/* Strings */}
      {Array.from({ length: STRINGS }, (_, i) => (
        <line
          key={`string-${i}`}
          x1={PAD_X + i * STRING_GAP}
          y1={PAD_TOP}
          x2={PAD_X + i * STRING_GAP}
          y2={H - PAD_BOTTOM}
          stroke="currentColor"
          strokeWidth={0.5}
          opacity={0.6}
        />
      ))}

      {/* Open / muted markers above the nut */}
      {f.frets.map((fret, i) => {
        const x = PAD_X + i * STRING_GAP;
        const y = PAD_TOP - 5;
        if (fret === -1) {
          return (
            <text
              // eslint-disable-next-line @eslint-react/no-array-index-key
              key={`mark-${i}`}
              x={x}
              y={y}
              fontSize={6}
              fill="currentColor"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              ×
            </text>
          );
        }
        if (fret === 0) {
          return (
            <circle
              // eslint-disable-next-line @eslint-react/no-array-index-key
              key={`mark-${i}`}
              cx={x}
              cy={y}
              r={2}
              fill="none"
              stroke="currentColor"
              strokeWidth={0.6}
            />
          );
        }
        return null;
      })}

      {/* Barres */}
      {(f.barres ?? []).map((fret) => {
        // Span the strings that are pressed at this fret.
        const pressed = f.frets
          .map((v, i) => (v === fret ? i : -1))
          .filter((i) => i >= 0);
        if (pressed.length < 2) return null;
        const first = pressed[0];
        const last = pressed[pressed.length - 1];
        const x1 = PAD_X + first * STRING_GAP;
        const x2 = PAD_X + last * STRING_GAP;
        const y = PAD_TOP + (fret - 0.5) * FRET_GAP;
        return (
          <rect
            key={`barre-${fret}`}
            x={x1 - 2}
            y={y - 2}
            width={x2 - x1 + 4}
            height={4}
            rx={2}
            className="fill-accent-soft"
          />
        );
      })}

      {/* Fingered dots */}
      {f.frets.map((fret, i) => {
        if (fret <= 0) return null;
        const x = PAD_X + i * STRING_GAP;
        const y = PAD_TOP + (fret - 0.5) * FRET_GAP;
        return (
          <circle
            // eslint-disable-next-line @eslint-react/no-array-index-key
            key={`dot-${i}`}
            cx={x}
            cy={y}
            r={2.5}
            className="fill-accent-soft"
          />
        );
      })}
    </>
  );
};

const renderPlaceholder = () => (
  <text
    x={W / 2}
    y={H / 2}
    fontSize={14}
    fill="currentColor"
    textAnchor="middle"
    dominantBaseline="middle"
    opacity={0.5}
  >
    ?
  </text>
);

export const ChordDiagram: FC<Props> = ({
  label,
  fingering,
  onClick,
  selected,
  badge,
}) => {
  const body = (
    <>
      <div className="flex items-center gap-1">
        <span className="font-mono text-xs text-accent-soft tabular-nums">
          {label}
        </span>
        {badge && (
          <span className="rounded-full bg-gray-700 px-1.5 text-[9px] font-medium leading-tight text-gray-300 tabular-nums">
            {badge}
          </span>
        )}
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width={W}
        height={H}
        className="text-muted"
        role="img"
        aria-label={
          fingering
            ? `${label} chord diagram`
            : `${label}: no diagram available`
        }
      >
        {fingering ? renderFingering(fingering) : renderPlaceholder()}
      </svg>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={selected}
        className={
          "flex flex-col items-center gap-1 rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-accent-ring " +
          (selected
            ? "bg-accent/20 ring-1 ring-accent-ring"
            : "hover:bg-gray-800")
        }
      >
        {body}
      </button>
    );
  }

  return <div className="flex flex-col items-center gap-1 p-1">{body}</div>;
};
