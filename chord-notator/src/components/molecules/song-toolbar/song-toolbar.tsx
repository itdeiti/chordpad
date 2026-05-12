import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import { ROOT_NOTES, type DisplayMode, type RootNote } from "domain/types";

interface Props {
  songKey: RootNote;
  displayMode: DisplayMode;
  hasChords: boolean;
  onTranspose: (semitones: number) => void;
  onSetKey: (key: RootNote) => void;
  onSetMode: (mode: DisplayMode) => void;
}

const labelClass = "text-xs uppercase tracking-wide text-muted";
const groupClass =
  "inline-flex h-9 items-stretch rounded-md border border-edge overflow-hidden";
const stepBtnClass =
  "px-2 flex items-center text-gray-300 hover:bg-surface-2 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent-ring";
const toggleBtnBase =
  "px-3 flex items-center text-sm font-mono focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent-ring";

function SongToolbar({
  songKey,
  displayMode,
  hasChords,
  onTranspose,
  onSetKey,
  onSetMode,
}: Props) {
  return (
    <>
      <div className="space-y-1">
        <div className={labelClass}>Root note</div>
        <div className={groupClass}>
          <button
            type="button"
            onClick={() => onTranspose(-1)}
            disabled={!hasChords}
            aria-label="Transpose down a semitone"
            className={stepBtnClass}
          >
            <MinusIcon className="w-4 h-4" />
          </button>
          <div className="flex items-center border-x border-edge bg-surface/40 w-30">
            <select
              value={songKey}
              onChange={(e) => onSetKey(e.target.value as RootNote)}
              aria-label="Song root note"
              className="w-full -full bg-transparent text-gray-100 font-mono text-sm px-2 focus:outline-none cursor-pointer appearance-none"
            >
              {ROOT_NOTES.map((n) => (
                <option key={n} value={n} className="bg-surface">
                  {n}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => onTranspose(1)}
            disabled={!hasChords}
            aria-label="Transpose up a semitone"
            className={stepBtnClass}
          >
            <PlusIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-1">
        <div className={labelClass}>Display</div>
        <div className={groupClass}>
          <button
            type="button"
            onClick={() => onSetMode("letters")}
            aria-pressed={displayMode === "letters"}
            className={
              toggleBtnBase +
              (displayMode === "letters"
                ? " bg-accent text-white"
                : " text-gray-300 hover:bg-surface-2")
            }
          >
            C
          </button>
          <button
            type="button"
            onClick={() => onSetMode("roman")}
            aria-pressed={displayMode === "roman"}
            className={
              toggleBtnBase +
              " border-l border-edge" +
              (displayMode === "roman"
                ? " bg-accent text-white"
                : " text-gray-300 hover:bg-surface-2")
            }
          >
            I
          </button>
        </div>
      </div>
    </>
  );
}

export default SongToolbar;
