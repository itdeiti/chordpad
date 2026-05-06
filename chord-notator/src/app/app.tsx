import SectionTabs from "components/molecules/section-tabs";
import ChordBuilder from "components/organisms/chord-builder";
import SectionEditor from "components/organisms/section-editor";
import ChordChart from "components/organisms/chord-chart";
import { useSong } from "hooks/use-song";

function App() {
  const { song, dispatch } = useSong();
  const activeSection =
    song.sections.find((s) => s.id === song.activeSectionId) ??
    song.sections[0];

  return (
    <main>
      <div className="max-w-3xl mx-auto py-10 space-y-6">
        <header>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-purple-200">
            Chord Notator
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Tap a root note, layer modifiers, commit. Switch sections to keep
            building.
          </p>
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
          onDeleteChord={(chordId) =>
            dispatch({
              type: "DELETE_CHORD",
              sectionId: activeSection.id,
              chordId,
            })
          }
        />

        <ChordBuilder staging={song.staging} dispatch={dispatch} />

        <ChordChart song={song} />
      </div>
    </main>
  );
}

export default App;
