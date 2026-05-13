import { type FC } from "react";
import { ChordButton } from "components/atoms/chord-button";
import { ROOT_NOTES, type RootNote } from "domain/types";

type Props = {
  value?: RootNote;
  onSelect: (note: RootNote) => void;
}

export const RootGrid: FC<Props> = ({ value, onSelect }) => {
  return (
    <div className="grid grid-cols-4 gap-2">
      {ROOT_NOTES.map((note) => (
        <ChordButton
          key={note}
          selected={value === note}
          onClick={() => onSelect(note)}
        >
          {note}
        </ChordButton>
      ))}
    </div>
  );
}

