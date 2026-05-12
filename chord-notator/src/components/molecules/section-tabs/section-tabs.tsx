import { useState, KeyboardEvent } from "react";
import {
  EllipsisVerticalIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import IconButton from "components/atoms/icon-button";
import type { Section } from "domain/types";

interface Props {
  sections: Section[];
  activeId: string;
  onSelect: (id: string) => void;
  onAdd: (name: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

interface TabProps {
  section: Section;
  active: boolean;
  canDelete: boolean;
  isEditing: boolean;
  draftName: string;
  onStartRename: () => void;
  onSelect: () => void;
  onDelete: () => void;
  onDraftChange: (v: string) => void;
  onCommitRename: () => void;
  onCancelRename: () => void;
}

function SortableTab({
  section,
  active,
  canDelete,
  isEditing,
  draftName,
  onStartRename,
  onSelect,
  onDelete,
  onDraftChange,
  onCommitRename,
  onCancelRename,
}: TabProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") onCommitRename();
    else if (e.key === "Escape") onCancelRename();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group inline-flex items-center gap-1 rounded-md border px-2 py-1 transition-colors duration-150 ${
        active
          ? "bg-purple-600 border-purple-400 text-white"
          : "bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700"
      }`}
    >
      <button
        type="button"
        aria-label={`Drag ${section.name}`}
        className="cursor-grab active:cursor-grabbing text-current/70 hover:text-current focus:outline-none focus:ring-2 focus:ring-accent-ring rounded-sm"
        {...attributes}
        {...listeners}
      >
        <EllipsisVerticalIcon className="w-4 h-4" />
      </button>
      {isEditing ? (
        <input
          autoFocus
          value={draftName}
          onChange={(e) => onDraftChange(e.target.value)}
          onBlur={onCommitRename}
          onKeyDown={onKey}
          className="bg-transparent border-b border-white/40 focus:outline-none text-sm font-medium w-24"
        />
      ) : (
        <button
          type="button"
          onClick={() => (active ? onStartRename() : onSelect())}
          className="text-sm font-medium leading-none focus:outline-none"
          title={active ? "Click to rename" : "Switch to section"}
        >
          {section.name}
        </button>
      )}
      {active && canDelete && !isEditing && (
        <IconButton
          Icon={XMarkIcon}
          label={`Delete ${section.name}`}
          onClick={onDelete}
        />
      )}
    </div>
  );
}

function SectionTabs({
  sections,
  activeId,
  onSelect,
  onAdd,
  onRename,
  onDelete,
  onReorder,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");

  // 5px activation distance so a tab tap selects/renames rather than starting a drag.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const startRename = (s: Section) => {
    setEditingId(s.id);
    setDraftName(s.name);
  };

  const commitRename = () => {
    if (editingId) onRename(editingId, draftName);
    setEditingId(null);
  };

  const handleAdd = () => {
    const name = window.prompt("Section name", "Section");
    if (name && name.trim()) onAdd(name);
  };

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const fromIndex = sections.findIndex((s) => s.id === active.id);
    const toIndex = sections.findIndex((s) => s.id === over.id);
    if (fromIndex >= 0 && toIndex >= 0) onReorder(fromIndex, toIndex);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sections.map((s) => s.id)}
          strategy={horizontalListSortingStrategy}
        >
          {sections.map((s) => (
            <SortableTab
              key={s.id}
              section={s}
              active={s.id === activeId}
              canDelete={s.chords.length === 0 && sections.length > 1}
              isEditing={editingId === s.id}
              draftName={draftName}
              onStartRename={() => startRename(s)}
              onSelect={() => onSelect(s.id)}
              onDelete={() => onDelete(s.id)}
              onDraftChange={setDraftName}
              onCommitRename={commitRename}
              onCancelRename={() => setEditingId(null)}
            />
          ))}
        </SortableContext>
      </DndContext>
      <button
        type="button"
        onClick={handleAdd}
        className="inline-flex items-center gap-1 rounded-md border border-dashed border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
      >
        <PlusIcon className="w-4 h-4" />
        Add
      </button>
    </div>
  );
}

export default SectionTabs;
