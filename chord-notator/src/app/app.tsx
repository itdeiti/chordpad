import { TrashIcon } from "@heroicons/react/24/outline";
import SectionTabs from "components/molecules/section-tabs";
import SongPicker from "components/molecules/song-picker";
import ChordBuilder from "components/organisms/chord-builder";
import SectionEditor from "components/organisms/section-editor";
import ChordChart from "components/organisms/chord-chart";
import { useLibrary } from "hooks/use-library";

function App() {
  const { library, song, dispatch } = useLibrary();
  const activeSection =
    song.sections.find((s) => s.id === song.activeSectionId) ??
    song.sections[0];
  const hasContent = song.sections.some((s) => s.chords.length > 0);

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

        <SectionTabs
          sections={song.sections}
          activeId={song.activeSectionId}
          onSelect={(id) => dispatch({ type: "SELECT_SECTION", id })}
          onAdd={(name) => dispatch({ type: "ADD_SECTION", name })}
          onRename={(id, name) =>
            dispatch({ type: "RENAME_SECTION", id, name })
          }
          onDelete={(id) => dispatch({ type: "DELETE_SECTION", id })}
        />

        <SectionEditor
          section={activeSection}
          songKey={song.key}
          roman={song.displayMode === "roman"}
          onDeleteChord={(chordId) =>
            dispatch({
              type: "DELETE_CHORD",
              sectionId: activeSection.id,
              chordId,
            })
          }
        />

        <ChordBuilder staging={song.staging} dispatch={dispatch} />

        <ChordChart song={song} dispatch={dispatch} />
      </div>
    </main>
  );
}

export default App;
