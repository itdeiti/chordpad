import { XMarkIcon } from "@heroicons/react/24/outline";
import IconButton from "components/atoms/icon-button";
import { formatChord } from "app/format-chord";
import type { Chord } from "app/types";

interface Props {
  chord: Chord;
  onDelete: () => void;
}

function ChordPill({ chord, onDelete }: Props) {
  const text = formatChord(chord);
  return (
    <span className="inline-flex items-baseline gap-2 rounded-md bg-gray-800 border border-gray-700 px-3 py-1.5 font-mono text-base text-gray-100">
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
