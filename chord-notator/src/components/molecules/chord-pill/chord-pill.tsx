import { XMarkIcon } from "@heroicons/react/24/outline";
import IconButton from "components/atoms/icon-button";
import { formatChord } from "domain/notation/format";
import type { Chord, RootNote } from "domain/types";

interface Props {
  chord: Chord;
  songKey?: RootNote;
  roman?: boolean;
  playing?: boolean;
  onDelete: () => void;
}

function ChordPill({
  chord,
  songKey,
  roman = false,
  playing = false,
  onDelete,
}: Props) {
  const text = formatChord(chord, songKey, roman);
  return (
    <span
      className={
        "inline-flex items-baseline gap-2 rounded-md border px-3 py-1.5 font-mono text-base transition-colors " +
        (playing
          ? "bg-accent/30 border-accent-ring text-white ring-2 ring-accent-ring"
          : "bg-gray-800 border-gray-700 text-gray-100")
      }
    >
      <span>{text}</span>
      {chord.beats !== 4 && (
        <span className="text-xs text-gray-500">·{chord.beats}</span>
      )}
      <IconButton
        Icon={XMarkIcon}
        label={`Remove ${text}`}
        onClick={onDelete}
      />
    </span>
  );
}

export default ChordPill;
