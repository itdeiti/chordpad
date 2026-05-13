import { type FC, useEffect } from "react";
import { RootGrid } from "components/molecules/root-grid";
import { ModifierPanel } from "components/molecules/modifier-panel";
import { StagingPreview } from "components/molecules/staging-preview";
import type { SongAction } from "state/song-reducer";
import type { Staging } from "domain/types";

type Props = {
  staging: Staging | null;
  editing: boolean;
  dispatch: (a: SongAction) => void;
}

const DEFAULT_STAGING: Staging = { quality: "major", extensions: [], beats: 4 };

export const ChordBuilder: FC<Props> = ({ staging, editing, dispatch }) => {
  const view = staging ?? DEFAULT_STAGING;

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
    <div className="space-y-4 rounded-lg border border-gray-800 bg-gray-900/40 p-4">
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
    </div>
  );
}

