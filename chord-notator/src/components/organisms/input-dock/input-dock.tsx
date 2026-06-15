import { type FC, useState } from "react";
import {
  PencilSquareIcon,
  MusicalNoteIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/24/outline";
import { useSwipe } from "components/hooks/use-swipe";
import { cn } from "components/lib/cn";
import { ChordBuilder } from "components/organisms/chord-builder";
import { PastePanel } from "components/molecules/paste-chords-dialog/paste-panel";
import { IdentifyPanel } from "features/chord-identifier";
import { useHaptics } from "features/haptics";
import type { ChordSpec, Staging } from "domain/types";
import type { SongAction } from "state/song-reducer";

type Props = {
  staging: Staging | null;
  editing: boolean;
  sectionName: string;
  dispatch: (a: SongAction) => void;
  onInsertIdentified: (spec: ChordSpec) => void;
  onPaste: (chords: ChordSpec[], mode: "append" | "replace") => void;
};

const MODES = [
  { key: "build", label: "Build", Icon: PencilSquareIcon },
  { key: "identify", label: "Identify", Icon: MusicalNoteIcon },
  { key: "paste", label: "Paste", Icon: ClipboardDocumentIcon },
] as const;

// Single home for every way to add chords: a segmented control plus a
// swipeable panel. Segments + arrow keys drive desktop; horizontal swipe drives
// touch. Mode changes (however triggered) fire one selection haptic so swipe and
// tap feel identical — segment buttons opt out of the global tap-haptic to avoid
// a double buzz.
export const InputDock: FC<Props> = ({
  staging,
  editing,
  sectionName,
  dispatch,
  onInsertIdentified,
  onPaste,
}) => {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState<"left" | "right">("right");
  const haptics = useHaptics();

  const go = (next: number) => {
    const clamped = Math.max(0, Math.min(MODES.length - 1, next));
    if (clamped === index) return;
    setDir(clamped > index ? "right" : "left");
    setIndex(clamped);
    haptics.trigger("selection");
  };

  const swipe = useSwipe({
    onSwipeLeft: () => go(index + 1),
    onSwipeRight: () => go(index - 1),
  });

  const active = MODES[index];

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900/40">
      <div
        role="tablist"
        aria-label="Chord input method"
        className="flex border-b border-gray-800"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            go(index + 1);
          } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            go(index - 1);
          }
        }}
      >
        {MODES.map((mode, i) => {
          const selected = i === index;
          return (
            <button
              key={mode.key}
              type="button"
              role="tab"
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              data-no-haptic
              onClick={() => go(i)}
              className={cn(
                "relative flex flex-1 items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-purple-400",
                selected
                  ? "text-purple-200"
                  : "text-gray-400 hover:text-gray-200",
              )}
            >
              <mode.Icon className="w-4 h-4" />
              {mode.label}
              {selected && (
                <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-purple-400" />
              )}
            </button>
          );
        })}
      </div>

      <div
        className="touch-pan-y p-4"
        onPointerDown={swipe.onPointerDown}
        onPointerUp={swipe.onPointerUp}
        onPointerCancel={swipe.onPointerCancel}
      >
        <div
          key={active.key}
          role="tabpanel"
          className={
            dir === "right"
              ? "animate-dock-in-right"
              : "animate-dock-in-left"
          }
        >
          {active.key === "build" && (
            <ChordBuilder
              staging={staging}
              editing={editing}
              dispatch={dispatch}
            />
          )}
          {active.key === "identify" && (
            <IdentifyPanel
              sectionName={sectionName}
              onInsert={onInsertIdentified}
            />
          )}
          {active.key === "paste" && (
            <PastePanel sectionName={sectionName} onSubmit={onPaste} />
          )}
        </div>
      </div>
    </div>
  );
};
