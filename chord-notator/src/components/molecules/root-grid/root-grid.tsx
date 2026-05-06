import ChordButton from "components/atoms/chord-button";
import { ROOT_NOTES, type RootNote } from "app/types";

interface Props {
  value?: RootNote;
  onSelect: (note: RootNote) => void;
}

function RootGrid({ value, onSelect }: Props) {
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

export default RootGrid;
