import { type FC } from "react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import type { useSortable } from "@dnd-kit/sortable";
import { cn } from "components/lib/cn";

// Pull the prop shapes straight off useSortable's return so this atom is always
// in sync with whatever dnd-kit currently emits.
type SortableReturn = ReturnType<typeof useSortable>;

type Props = {
  label: string;
  attributes: SortableReturn["attributes"];
  listeners: SortableReturn["listeners"];
  className?: string;
}

export const DragHandle: FC<Props> = ({ label, attributes, listeners, className }) => {
  return (
    <button
      type="button"
      aria-label={label}
      // touch-none: lets TouchSensor own the gesture (no scroll/zoom hijack).
      // select-none + -webkit-touch-callout: suppress text-selection + iOS long-press menu.
      // onContextMenu.preventDefault: stops Android Chrome's long-press context menu.
      onContextMenu={(e) => e.preventDefault()}
      className={cn(
        "touch-none select-none [-webkit-touch-callout:none] cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-accent-ring rounded-sm",
        className,
      )}
      {...attributes}
      {...listeners}
    >
      <EllipsisVerticalIcon className="w-4 h-4" />
    </button>
  );
}

