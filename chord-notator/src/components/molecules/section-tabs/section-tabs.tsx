import { useState, KeyboardEvent } from "react";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import IconButton from "components/atoms/icon-button";
import type { Section } from "app/types";

interface Props {
  sections: Section[];
  activeId: string;
  onSelect: (id: string) => void;
  onAdd: (name: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

function SectionTabs({
  sections,
  activeId,
  onSelect,
  onAdd,
  onRename,
  onDelete,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");

  const startRename = (s: Section) => {
    setEditingId(s.id);
    setDraftName(s.name);
  };

  const commitRename = () => {
    if (editingId) onRename(editingId, draftName);
    setEditingId(null);
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") commitRename();
    else if (e.key === "Escape") setEditingId(null);
  };

  const handleAdd = () => {
    const name = window.prompt("Section name", "Section");
    if (name && name.trim()) onAdd(name);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {sections.map((s) => {
        const active = s.id === activeId;
        const isEditing = editingId === s.id;
        const canDelete = s.chords.length === 0 && sections.length > 1;
        return (
          <div
            key={s.id}
            className={`group inline-flex items-center gap-1 rounded-md border px-2 py-1 transition-colors duration-150 ${
              active
                ? "bg-purple-600 border-purple-400 text-white"
                : "bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700"
            }`}
          >
            {isEditing ? (
              <input
                autoFocus
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                onBlur={commitRename}
                onKeyDown={onKey}
                className="bg-transparent border-b border-white/40 focus:outline-none text-sm font-medium w-24"
              />
            ) : (
              <button
                type="button"
                onClick={() => (active ? startRename(s) : onSelect(s.id))}
                className="text-sm font-medium leading-none focus:outline-none"
                title={active ? "Click to rename" : "Switch to section"}
              >
                {s.name}
              </button>
            )}
            {active && canDelete && !isEditing && (
              <IconButton
                Icon={XMarkIcon}
                label={`Delete ${s.name}`}
                onClick={() => onDelete(s.id)}
              />
            )}
          </div>
        );
      })}
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
