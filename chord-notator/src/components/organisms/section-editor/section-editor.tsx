import ChordPill from "components/molecules/chord-pill";
import type { Section } from "app/types";

interface Props {
  section: Section;
  onDeleteChord: (chordId: string) => void;
}

function SectionEditor({ section, onDeleteChord }: Props) {
  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900/40 p-4">
      <div className="text-xs uppercase tracking-wide text-gray-400 mb-3">
        {section.name}
      </div>
      {section.chords.length === 0 ? (
        <p className="text-gray-500 text-sm italic">
          No chords yet — pick a root note below to start.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {section.chords.map((c) => (
            <ChordPill
              key={c.id}
              chord={c}
              onDelete={() => onDeleteChord(c.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default SectionEditor;
