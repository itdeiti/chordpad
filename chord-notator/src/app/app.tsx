import { useEffect } from "react";
import { TrashIcon } from "@heroicons/react/24/outline";
import SectionTabs from "components/molecules/section-tabs";
import SongPicker from "components/molecules/song-picker";
import SongToolbar from "components/molecules/song-toolbar";
import ChordBuilder from "components/organisms/chord-builder";
import SectionEditor from "components/organisms/section-editor";
import ChordChart from "components/organisms/chord-chart";
import { PlaybackControls, usePlayback } from "features/playback";
import { useLibrary } from "state/use-library";

function App() {
  const { library, song, dispatch } = useLibrary();
  const playback = usePlayback(song);

  // Playback follow: when the transport enters a new section, focus that
  // section so the chord-pill highlight stays visible. FOCUS_SECTION (vs
  // SELECT_SECTION) is used so an in-progress staging chord isn't wiped.
  useEffect(() => {
    if (
      playback.currentSectionId &&
      playback.currentSectionId !== song.activeSectionId
    ) {
      dispatch({ type: "FOCUS_SECTION", id: playback.currentSectionId });
    }
  }, [playback.currentSectionId, song.activeSectionId, dispatch]);
  const activeSection =
    song.sections.find((s) => s.id === song.activeSectionId) ??
    song.sections[0];
  const hasContent = song.sections.some((s) => s.chords.length > 0);
  const hasSectionContent = activeSection.chords.length > 0;

  const onReset = () => {
    if (
      window.confirm("Clear all chords in this song? This can't be undone.")
    ) {
      dispatch({ type: "RESET_SONG" });
    }
  };

  return (
    <main>
      <div className="max-w-3xl mx-auto py-10 space-y-6">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-purple-200">
              Chordpad
            </h1>
            <p className="text-gray-400 mt-1 text-sm">
              Tap a root note, layer modifiers, commit. Switch sections to keep
              building.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <SongPicker
              library={library}
              onSelect={(id) => dispatch({ type: "SELECT_SONG", id })}
              onCreate={(name) => dispatch({ type: "CREATE_SONG", name })}
              onRename={(id, name) =>
                dispatch({ type: "RENAME_SONG", id, name })
              }
              onDelete={(id) => dispatch({ type: "DELETE_SONG", id })}
            />
            <button
              type="button"
              onClick={onReset}
              disabled={!hasContent}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-700 px-3 py-1.5 text-sm text-gray-300 hover:bg-red-900/30 hover:text-red-200 hover:border-red-700 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              <TrashIcon className="w-8 h-8" />
              Clear
            </button>
          </div>
        </header>

        <div data-print-hide>
          <SectionTabs
            sections={song.sections}
            activeId={song.activeSectionId}
            onSelect={(id) => dispatch({ type: "SELECT_SECTION", id })}
            onAdd={(name) => dispatch({ type: "ADD_SECTION", name })}
            onRename={(id, name) =>
              dispatch({ type: "RENAME_SECTION", id, name })
            }
            onDelete={(id) => dispatch({ type: "DELETE_SECTION", id })}
            onReorder={(fromIndex, toIndex) =>
              dispatch({ type: "REORDER_SECTION", fromIndex, toIndex })
            }
          />
        </div>

        <div data-print-hide className="flex flex-wrap items-end gap-3">
          <SongToolbar
            songKey={song.key}
            displayMode={song.displayMode}
            hasChords={hasContent}
            onTranspose={(semitones) =>
              dispatch({ type: "TRANSPOSE", semitones })
            }
            onSetKey={(key) => dispatch({ type: "SET_KEY", key })}
            onSetMode={(mode) => dispatch({ type: "SET_DISPLAY_MODE", mode })}
          />
          <PlaybackControls
            playing={playback.playing}
            tempo={playback.tempo}
            hasSongChords={hasContent}
            hasSectionChords={hasSectionContent}
            onPlaySection={() => playback.play(activeSection.id)}
            onPlaySong={() => playback.play()}
            onStop={playback.stop}
            onSetTempo={playback.setTempo}
          />
        </div>

        <div data-print-hide>
          <SectionEditor
            section={activeSection}
            songKey={song.key}
            roman={song.displayMode === "roman"}
            currentChordId={playback.currentChordId}
            onDeleteChord={(chordId) =>
              dispatch({
                type: "DELETE_CHORD",
                sectionId: activeSection.id,
                chordId,
              })
            }
            onReorderChord={(fromIndex, toIndex) =>
              dispatch({
                type: "REORDER_CHORD",
                sectionId: activeSection.id,
                fromIndex,
                toIndex,
              })
            }
          />
        </div>

        <div data-print-hide>
          <ChordBuilder staging={song.staging} dispatch={dispatch} />
        </div>

        <h2
          data-print-only
          className="text-2xl font-bold text-black mb-4"
        >
          {song.name}
        </h2>

        <ChordChart song={song} />
      </div>
    </main>
  );
}

export default App;
