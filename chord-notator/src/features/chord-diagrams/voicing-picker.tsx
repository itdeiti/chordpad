import { type FC, useEffect } from "react";
import type { ChordDb } from "domain/theory/fingerings";
import type { Chord } from "domain/types";
import { ChordDiagram } from "./chord-diagram";
import { lookupFingerings } from "./db-adapter";

type Props = {
  // The chord whose alternative voicings are shown. The label/lookup use this
  // chord; `selectedIndex` is passed separately so the picker can be driven by
  // either a committed chord (legend) or in-progress staging (builder).
  chord: Chord;
  label: string;
  db: ChordDb;
  selectedIndex: number;
  onSelect: (index: number) => void;
  onClose: () => void;
};

export const VoicingPicker: FC<Props> = ({
  chord,
  label,
  db,
  selectedIndex,
  onSelect,
  onClose,
}) => {
  const positions = lookupFingerings(chord, db);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-lg border border-gray-700 bg-gray-900 p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-purple-200">
          {label} · fingerings
        </h2>
        <p className="mt-1 text-xs text-gray-400">
          {positions.length > 1
            ? `${positions.length} voicings available. Pick one to display.`
            : "Only one voicing is available for this chord."}
        </p>

        <div className="mt-4 flex max-h-[60vh] flex-wrap gap-2 overflow-y-auto">
          {positions.map((f, i) => (
            <ChordDiagram
              // eslint-disable-next-line @eslint-react/no-array-index-key
              key={i}
              label={`${i + 1}`}
              fingering={f}
              selected={i === selectedIndex}
              onClick={() => {
                onSelect(i);
                onClose();
              }}
            />
          ))}
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 rounded-md text-sm font-semibold border border-gray-600 text-gray-200 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
