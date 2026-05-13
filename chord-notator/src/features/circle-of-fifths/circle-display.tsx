import {
  CIRCLE_OF_FIFTHS,
  relativeMinor,
} from "domain/theory/circle-of-fifths";
import type { RootNote } from "domain/types";

interface Props {
  majorRoots: Set<RootNote>;
  minorRoots: Set<RootNote>;
  size?: number;
}

// Geometry — kept in named constants so the radial math reads top-to-bottom.
const VIEWBOX = 240;
const CENTER = VIEWBOX / 2;
// Two concentric pie rings + a small empty center hole. Radii chosen so the
// outer band has more visual weight (majors get the prominent ring) and the
// inner band still has enough thickness for legible labels.
const OUTER_R = 110;
const MID_R = 60;
const INNER_R = 22;
const OUTER_LABEL_R = (OUTER_R + MID_R) / 2;
const INNER_LABEL_R = (MID_R + INNER_R) / 2;
const SLOT_COUNT = 12;
const SLOT_DEG = 360 / SLOT_COUNT;
// Each slot is centered on its label angle; the wedge spans ±15° around that
// center so the C wedge straddles 12 o'clock instead of starting there.
const HALF_SLOT_DEG = SLOT_DEG / 2;
// Subtract 90° to put slot 0 (C) at the top instead of due east.
const TWELVE_OCLOCK_DEG = -90;

function deg2rad(d: number): number {
  return (d * Math.PI) / 180;
}

function pointOnCircle(angleDeg: number, radius: number) {
  const a = deg2rad(angleDeg);
  return { x: CENTER + radius * Math.cos(a), y: CENTER + radius * Math.sin(a) };
}

// Build an SVG path for an annular sector (a pie wedge with a hole punched out
// of the middle). Used twice per slot — once for the outer ring (majors), once
// for the inner ring (minors).
function annularWedge(
  startDeg: number,
  endDeg: number,
  rInner: number,
  rOuter: number,
): string {
  const outerStart = pointOnCircle(startDeg, rOuter);
  const outerEnd = pointOnCircle(endDeg, rOuter);
  const innerStart = pointOnCircle(startDeg, rInner);
  const innerEnd = pointOnCircle(endDeg, rInner);
  // large-arc-flag = 0 because every wedge is 30° (< 180°).
  // Outer arc sweeps clockwise (flag 1); inner arc sweeps counter-clockwise (flag 0)
  // so the path closes cleanly into a single filled region.
  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${rOuter} ${rOuter} 0 0 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${rInner} ${rInner} 0 0 0 ${innerStart.x} ${innerStart.y}`,
    "Z",
  ].join(" ");
}

function CircleDisplay({ majorRoots, minorRoots, size = 240 }: Props) {
  return (
    <svg
      viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
      width={size}
      height={size}
      className="text-muted"
      role="img"
      aria-label="Circle of fifths"
    >
      {CIRCLE_OF_FIFTHS.map((major, i) => {
        const centerDeg = TWELVE_OCLOCK_DEG + i * SLOT_DEG;
        const startDeg = centerDeg - HALF_SLOT_DEG;
        const endDeg = centerDeg + HALF_SLOT_DEG;
        const minor = relativeMinor(major);
        const outerActive = majorRoots.has(major);
        const innerActive = minorRoots.has(minor);

        const outerLabel = pointOnCircle(centerDeg, OUTER_LABEL_R);
        const innerLabel = pointOnCircle(centerDeg, INNER_LABEL_R);

        return (
          <g key={major}>
            {/* Outer wedge: major */}
            <path
              d={annularWedge(startDeg, endDeg, MID_R, OUTER_R)}
              className={
                outerActive
                  ? "fill-accent stroke-accent-ring"
                  : "fill-surface-2 stroke-edge"
              }
              strokeWidth={1}
            />
            <text
              x={outerLabel.x}
              y={outerLabel.y}
              fontSize={13}
              fontFamily="ui-monospace, monospace"
              fontWeight={outerActive ? 700 : 500}
              fill={outerActive ? "white" : "currentColor"}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {major}
            </text>

            {/* Inner wedge: relative minor */}
            <path
              d={annularWedge(startDeg, endDeg, INNER_R, MID_R)}
              className={
                innerActive
                  ? "fill-accent stroke-accent-ring"
                  : "fill-surface-2 stroke-edge"
              }
              strokeWidth={1}
            />
            <text
              x={innerLabel.x}
              y={innerLabel.y}
              fontSize={10}
              fontFamily="ui-monospace, monospace"
              fontWeight={innerActive ? 700 : 500}
              fill={innerActive ? "white" : "currentColor"}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {minor}m
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default CircleDisplay;
