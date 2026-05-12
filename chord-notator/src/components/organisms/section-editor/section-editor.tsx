import ChordPill from "components/molecules/chord-pill";
import type { RootNote, Section } from "domain/types";

interface Props {
  section: Section;
  songKey: RootNote;
  roman: boolean;
  currentChordId: string | null;
  onDeleteChord: (chordId: string) => void;
}

function SectionEditor({
  section,
  songKey,
  roman,
  currentChordId,
  onDeleteChord,
}: Props) {
  return (
    <div className="rounded-lg border border-gray-800 bg-gray-600/10 p-4 bg-blend-color-burn">
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
              songKey={songKey}
              roman={roman}
              playing={c.id === currentChordId}
              onDelete={() => onDeleteChord(c.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default SectionEditor;
