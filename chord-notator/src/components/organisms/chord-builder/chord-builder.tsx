import { type FC, useEffect, useMemo } from "react";
import { RootGrid } from "components/molecules/root-grid";
import { ModifierPanel } from "components/molecules/modifier-panel";
import { StagingPreview } from "components/molecules/staging-preview";
import {
  ChordDiagram,
  lookupFingerings,
  useFingerings,
} from "features/chord-diagrams";
import type { SongAction } from "state/song-reducer";
import type { Chord, Staging } from "domain/types";

type Props = {
  staging: Staging | null;
  editing: boolean;
  dispatch: (a: SongAction) => void;
}

const DEFAULT_STAGING: Staging = { quality: "major", extensions: [], beats: 4 };

export const ChordBuilder: FC<Props> = ({ staging, editing, dispatch }) => {
  const view = staging ?? DEFAULT_STAGING;
  const { db } = useFingerings();

  // All voicings for the in-progress chord, so the user can pick a fingering
  // before committing. Only meaningful once a root is chosen.
  const voicings = useMemo(() => {
    if (!db || !staging?.root) return [];
    const chord: Chord = {
      id: "staging",
      root: staging.root,
      quality: staging.quality,
      extensions: staging.extensions,
      bass: staging.bass,
      beats: staging.beats,
    };
    return lookupFingerings(chord, db);
  }, [db, staging]);
  const selectedVoicing = Math.min(
    view.voicing ?? 0,
    Math.max(voicings.length - 1, 0),
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dispatch({ type: "CLEAR_STAGING" });
      else if (e.key === "Enter" && staging?.root)
        dispatch({ type: "COMMIT_CHORD" });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch, staging?.root]);

  return (
    <div className="space-y-4">
      <StagingPreview
        staging={staging}
        beats={view.beats}
        editing={editing}
        onSetBeats={(beats) => dispatch({ type: "SET_BEATS", beats })}
        onAdd={() => dispatch({ type: "COMMIT_CHORD" })}
        onClear={() => dispatch({ type: "CLEAR_STAGING" })}
      />
      <div>
        <div className="text-xs uppercase tracking-wide text-gray-400 mb-2">
          Root
        </div>
        <RootGrid
          value={view.root}
          onSelect={(root) => dispatch({ type: "SET_ROOT", root })}
        />
      </div>
      <ModifierPanel
        quality={view.quality}
        extensions={view.extensions}
        bass={view.bass}
        onSetQuality={(quality) => dispatch({ type: "SET_QUALITY", quality })}
        onToggleExtension={(ext) =>
          dispatch({ type: "TOGGLE_EXTENSION", ext })
        }
        onSetBass={(bass) => dispatch({ type: "SET_BASS", bass })}
      />
      {voicings.length > 1 && (
        <div>
          <div className="text-xs uppercase tracking-wide text-gray-400 mb-2">
            Fingering · {selectedVoicing + 1}/{voicings.length}
          </div>
          <div className="flex flex-wrap gap-2">
            {voicings.map((f, i) => (
              <ChordDiagram
                // eslint-disable-next-line @eslint-react/no-array-index-key
                key={i}
                label={`${i + 1}`}
                fingering={f}
                selected={i === selectedVoicing}
                onClick={() =>
                  dispatch({ type: "SET_STAGING_VOICING", index: i })
                }
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

