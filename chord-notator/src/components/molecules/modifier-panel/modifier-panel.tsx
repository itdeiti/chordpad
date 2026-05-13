import { type FC, useState } from "react";
import { ChordButton } from "components/atoms/chord-button";
import {
  ROOT_NOTES,
  type Extension,
  type Quality,
  type RootNote,
} from "domain/types";
import { isExtensionAllowed } from "state/song-reducer";
import { QualityPanel } from "./quality-panel";

type Props = {
  quality: Quality;
  extensions: Extension[];
  bass?: RootNote;
  onSetQuality: (q: Quality) => void;
  onToggleExtension: (e: Extension) => void;
  onSetBass: (b: RootNote | undefined) => void;
}

// Modifier groups drive the UI layout and the radio-vs-toggle behavior.
// Keeping this as data (not three hand-rolled sections) makes adding future
// modifiers — alterations like b5/#5/b9/#9, sixths, thirteenths — a one-line
// change. EXTENSIONS in domain/types.ts stays the source of truth for the
// data model; this just decides how each one is presented.
type GroupKind = "radio" | "toggle";
type ExtensionGroup = {
  label: string;
  kind: GroupKind;
  members: Extension[];
}

const GROUPS: ExtensionGroup[] = [
  // Radio: at most one seventh active at a time. Clicking the active one toggles it off.
  { label: "7th", kind: "radio", members: ["7", "maj7", "m7"] },
  // Radio: sus chords replace the third — only one of sus2 / sus4 makes sense.
  { label: "Sus", kind: "radio", members: ["sus2", "sus4"] },
  // Toggle: additive tones stack freely (e.g. add9 + add11 = "add9add11").
  { label: "Add", kind: "toggle", members: ["6", "add9", "add11", "13"] },
  // Toggle: chord-tone alterations. `alt` is shorthand for "all four alterations
  // stacked"; we still let the user toggle individual ones independently.
  { label: "Alter", kind: "toggle", members: ["b5", "#5", "b9", "#9", "alt"] },
];

export const ModifierPanel: FC<Props> = ({
  quality,
  extensions,
  bass,
  onSetQuality,
  onToggleExtension,
  onSetBass,
}) => {
  const [bassOpen, setBassOpen] = useState(false);

  // Radio behavior over the flat extensions[] array: if a sibling in the same
  // group is already on, toggle it off first, then toggle the new one on.
  // useReducer processes dispatches serially so the second call sees the state
  // after the first.
  const onRadio = (group: ExtensionGroup, next: Extension) => {
    const current = group.members.find((m) => extensions.includes(m));
    if (current) onToggleExtension(current);
    if (next !== current) onToggleExtension(next);
  };

  return (
    <div className="space-y-4">
      <QualityPanel quality={quality} onSetQuality={onSetQuality} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {GROUPS.map((group) => (
          <div key={group.label}>
            <div className="text-xs uppercase tracking-wide text-gray-400 mb-2">
              {group.label}
            </div>
            <div className="flex flex-wrap gap-2">
              {group.members.map((ext) => {
                const allowed = isExtensionAllowed(ext, quality);
                const selected = extensions.includes(ext);
                return (
                  <ChordButton
                    key={ext}
                    selected={selected}
                    disabled={!allowed}
                    onClick={() =>
                      group.kind === "radio"
                        ? onRadio(group, ext)
                        : onToggleExtension(ext)
                    }
                  >
                    {ext}
                  </ChordButton>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div>
        <div className="text-xs uppercase tracking-wide text-gray-400 mb-2">
          Bass
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ChordButton
            selected={bass === undefined && !bassOpen}
            onClick={() => {
              onSetBass(undefined);
              setBassOpen((v) => !v);
            }}
          >
            {bass ? `/${bass}` : bassOpen ? "close" : "/ none"}
          </ChordButton>
          {bassOpen &&
            ROOT_NOTES.map((note) => (
              <ChordButton
                key={note}
                selected={bass === note}
                onClick={() => {
                  onSetBass(note);
                  setBassOpen(false);
                }}
              >
                {note}
              </ChordButton>
            ))}
        </div>
      </div>
    </div>
  );
}
