import { useState } from "react";
import ChordButton from "components/atoms/chord-button";
import {
  EXTENSIONS,
  QUALITIES,
  ROOT_NOTES,
  type Extension,
  type Quality,
  type RootNote,
} from "app/types";
import { isExtensionAllowed } from "app/song-reducer";

interface Props {
  quality: Quality;
  extensions: Extension[];
  bass?: RootNote;
  onSetQuality: (q: Quality) => void;
  onToggleExtension: (e: Extension) => void;
  onSetBass: (b: RootNote | undefined) => void;
}

const QUALITY_LABEL: Record<Quality, string> = {
  major: "maj",
  minor: "min",
  dim: "dim",
  aug: "aug",
};

function ModifierPanel({
  quality,
  extensions,
  bass,
  onSetQuality,
  onToggleExtension,
  onSetBass,
}: Props) {
  const [bassOpen, setBassOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xs uppercase tracking-wide text-gray-400 mb-2">
          Quality
        </div>
        <div className="flex flex-wrap gap-2">
          {QUALITIES.map((q) => (
            <ChordButton
              key={q}
              selected={quality === q}
              onClick={() => onSetQuality(q)}
            >
              {QUALITY_LABEL[q]}
            </ChordButton>
          ))}
        </div>
      </div>

      <div>
        <div className="text-xs uppercase tracking-wide text-gray-400 mb-2">
          Extensions
        </div>
        <div className="flex flex-wrap gap-2">
          {EXTENSIONS.map((ext) => {
            const allowed = isExtensionAllowed(ext, quality);
            return (
              <ChordButton
                key={ext}
                selected={extensions.includes(ext)}
                disabled={!allowed}
                onClick={() => onToggleExtension(ext)}
              >
                {ext}
              </ChordButton>
            );
          })}
        </div>
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

export default ModifierPanel;
