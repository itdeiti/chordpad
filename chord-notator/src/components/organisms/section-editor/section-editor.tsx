import { type FC } from "react";
import { ClipboardDocumentIcon } from "@heroicons/react/24/outline";
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
  editingChordId: string | null;
  onDeleteChord: (chordId: string) => void;
  onEditChord: (chordId: string) => void;
  onReorderChord: (fromIndex: number, toIndex: number) => void;
  onOpenPaste: () => void;
}

type SortablePillProps = {
  chord: Chord;
  songKey: RootNote;
  roman: boolean;
  playing: boolean;
  editing: boolean;
  onDelete: () => void;
  onEdit: () => void;
}

const SortablePill: FC<SortablePillProps> = ({
  chord,
  songKey,
  roman,
  playing,
  editing,
  onDelete,
  onEdit,
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
        editing={editing}
        dragHandle={
          <DragHandle
            label="Drag chord"
            attributes={attributes}
            listeners={listeners}
            className="self-center text-gray-500 hover:text-gray-200"
          />
        }
        onEdit={onEdit}
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
  editingChordId,
  onDeleteChord,
  onEditChord,
  onReorderChord,
  onOpenPaste,
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
      <div className="mb-3 flex items-center justify-between">
        <div className="text-xs uppercase tracking-wide text-gray-400">
          {section.name}
        </div>
        <button
          type="button"
          onClick={onOpenPaste}
          className="inline-flex items-center gap-1 rounded-md border border-gray-700 px-2 py-1 text-xs text-gray-300 hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
          title="Paste a chord progression into this section"
        >
          <ClipboardDocumentIcon className="w-3.5 h-3.5" />
          Paste…
        </button>
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
                  editing={c.id === editingChordId}
                  onDelete={() => onDeleteChord(c.id)}
                  onEdit={() => onEditChord(c.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

