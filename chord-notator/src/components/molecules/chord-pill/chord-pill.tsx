import { type FC, ReactNode } from "react";
import { PencilSquareIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { IconButton } from "components/atoms/icon-button";
import { formatChord } from "domain/notation/format";
import type { Chord, RootNote } from "domain/types";

type Props = {
  chord: Chord;
  songKey?: RootNote;
  roman?: boolean;
  playing?: boolean;
  editing?: boolean;
  // Optional slot for a drag handle rendered to the left of the chord text.
  // Kept as a render slot so this atom doesn't import dnd-kit.
  dragHandle?: ReactNode;
  onEdit?: () => void;
  onDelete: () => void;
}

export const ChordPill: FC<Props> = ({
  chord,
  songKey,
  roman = false,
  playing = false,
  editing = false,
  dragHandle,
  onEdit,
  onDelete,
}) => {
  const text = formatChord(chord, songKey, roman);
  // Edit state wins over playing visually — the user explicitly opted in.
  const tone = editing
    ? "bg-gray-800 border-dashed border-purple-400 text-white ring-1 ring-purple-400/60"
    : playing
      ? "bg-accent/30 border-accent-ring text-white ring-2 ring-accent-ring"
      : "bg-gray-800 border-gray-700 text-gray-100";
  return (
    <span
      className={
        "inline-flex items-baseline gap-2 rounded-md border px-3 py-1.5 font-mono text-base transition-colors " +
        tone
      }
    >
      {dragHandle}
      <span>{text}</span>
      {chord.beats !== 4 && (
        <span className="text-xs text-gray-500">·{chord.beats}</span>
      )}
      {onEdit && (
        <IconButton
          Icon={PencilSquareIcon}
          label={`Edit ${text}`}
          onClick={onEdit}
        />
      )}
      {!editing && (
        <IconButton
          Icon={XMarkIcon}
          label={`Remove ${text}`}
          onClick={onDelete}
        />
      )}
    </span>
  );
}

