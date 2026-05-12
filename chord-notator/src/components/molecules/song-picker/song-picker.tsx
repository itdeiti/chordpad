import { useRef, useState } from "react";
import {
  ChevronDownIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import type { Library } from "app/types";

interface Props {
  library: Library;
  onSelect: (id: string) => void;
  onCreate: (name?: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

function SongPicker({ library, onSelect, onCreate, onRename, onDelete }: Props) {
  const [open, setOpen] = useState(false);
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const active = library.songs.find((s) => s.id === library.activeSongId);

  const close = () => {
    setOpen(false);
    if (detailsRef.current) detailsRef.current.open = false;
  };

  const handleRename = (id: string, current: string) => {
    const next = window.prompt("Rename song", current);
    if (next && next.trim()) onRename(id, next.trim());
    close();
  };

  const handleDelete = (id: string, name: string) => {
    if (library.songs.length <= 1) {
      window.alert("Can't delete the last song.");
      return;
    }
    if (window.confirm(`Delete "${name}"?`)) onDelete(id);
    close();
  };

  const handleCreate = () => {
    const name = window.prompt("Song name", "New Song");
    if (name === null) return;
    onCreate(name.trim() || undefined);
    close();
  };

  return (
    <details
      ref={detailsRef}
      open={open}
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
      className="relative"
    >
      <summary className="list-none cursor-pointer inline-flex items-center gap-2 rounded-md border border-gray-700 bg-gray-800/60 px-3 py-1.5 text-sm text-gray-100 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400">
        <span className="font-semibold">{active?.name ?? "Song"}</span>
        <ChevronDownIcon className="w-4 h-4 text-gray-400" />
      </summary>
      <div className="absolute right-0 z-10 mt-1 w-64 rounded-md border border-gray-700 bg-gray-900 shadow-lg p-1">
        <ul className="max-h-64 overflow-auto">
          {library.songs.map((s) => {
            const isActive = s.id === library.activeSongId;
            return (
              <li key={s.id}>
                <div
                  className={
                    "flex items-center gap-1 rounded-sm " +
                    (isActive ? "bg-purple-900/40" : "hover:bg-gray-800")
                  }
                >
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(s.id);
                      close();
                    }}
                    className="flex-1 text-left px-2 py-1.5 text-sm text-gray-100 truncate focus:outline-none"
                  >
                    {s.name}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRename(s.id, s.name)}
                    aria-label={`Rename ${s.name}`}
                    className="p-1.5 rounded-sm text-gray-400 hover:text-purple-200 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  >
                    <PencilSquareIcon className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(s.id, s.name)}
                    aria-label={`Delete ${s.name}`}
                    disabled={library.songs.length <= 1}
                    className="p-1.5 rounded-sm text-gray-400 hover:text-red-300 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-400"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
        <div className="border-t border-gray-800 mt-1 pt-1">
          <button
            type="button"
            onClick={handleCreate}
            className="w-full inline-flex items-center gap-2 px-2 py-1.5 text-sm text-purple-200 hover:bg-gray-800 rounded-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <PlusIcon className="w-4 h-4" />
            New song
          </button>
        </div>
      </div>
    </details>
  );
}

export default SongPicker;
