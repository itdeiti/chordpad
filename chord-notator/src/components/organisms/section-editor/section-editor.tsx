import { type FC } from "react";
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DragHandle } from "components/atoms/drag-handle";
import { useDragSensors } from "components/hooks/use-drag-sensors";
import { ChordPill } from "components/molecules/chord-pill";
import type { Chord, RootNote, Section } from "domain/types";

type Props = {
  section: Section;
  songKey: RootNote;
  roman: boolean;
  currentChordId: string | null;
  onDeleteChord: (chordId: string) => void;
  onReorderChord: (fromIndex: number, toIndex: number) => void;
}

type SortablePillProps = {
  chord: Chord;
  songKey: RootNote;
  roman: boolean;
  playing: boolean;
  onDelete: () => void;
}

const SortablePill: FC<SortablePillProps> = ({
  chord,
  songKey,
  roman,
  playing,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: chord.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <ChordPill
        chord={chord}
        songKey={songKey}
        roman={roman}
        playing={playing}
        dragHandle={
          <DragHandle
            label="Drag chord"
            attributes={attributes}
            listeners={listeners}
            className="self-center text-gray-500 hover:text-gray-200"
          />
        }
        onDelete={onDelete}
      />
    </div>
  );
}

export const SectionEditor: FC<Props> = ({
  section,
  songKey,
  roman,
  currentChordId,
  onDeleteChord,
  onReorderChord,
}) => {
  const sensors = useDragSensors();

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const fromIndex = section.chords.findIndex((c) => c.id === active.id);
    const toIndex = section.chords.findIndex((c) => c.id === over.id);
    if (fromIndex >= 0 && toIndex >= 0) onReorderChord(fromIndex, toIndex);
  };

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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={section.chords.map((c) => c.id)}
            strategy={rectSortingStrategy}
          >
            <div className="flex flex-wrap gap-2">
              {section.chords.map((c) => (
                <SortablePill
                  key={c.id}
                  chord={c}
                  songKey={songKey}
                  roman={roman}
                  playing={c.id === currentChordId}
                  onDelete={() => onDeleteChord(c.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

