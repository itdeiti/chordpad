import { useMemo } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import type { RootNote, Section } from "domain/types";
import CircleDisplay from "./circle-display";
import { useCircleToggle } from "./use-circle-toggle";

interface Props {
  section: Section;
}

// Self-contained orchestrator for the circle-of-fifths view.
// - Owns its own visibility state (via useCircleToggle, backed by a feature-
//   scoped localStorage key) so it never touches Song, the reducer, or the
//   app's persistence layer.
// - Derives the highlight sets from the section it's given; no shared state
//   between the feature and the surrounding app.
// - Marks itself data-print-hide so the printed sheet remains the chord chart
//   alone — print visibility is owned by the feature, not the integration site.
function CircleOfFifths({ section }: Props) {
  const [shown, setShown] = useCircleToggle();

  // Quality-aware split: outer-ring highlights for "major-flavored" chords
  // (anything that isn't an explicit minor), inner-ring highlights only for
  // minor chords. Keeps the rule explainable as one line — minor goes inside,
  // everything else goes outside.
  const { majorRoots, minorRoots } = useMemo(() => {
    const major = new Set<RootNote>();
    const minor = new Set<RootNote>();
    for (const c of section.chords) {
      if (c.quality === "minor") minor.add(c.root);
      else major.add(c.root);
    }
    return { majorRoots: major, minorRoots: minor };
  }, [section.chords]);
  const totalRoots = majorRoots.size + minorRoots.size;

  const Icon = shown ? ChevronUpIcon : ChevronDownIcon;

  return (
    <div data-print-hide>
      <button
        type="button"
        onClick={() => setShown(!shown)}
        aria-expanded={shown}
        className="inline-flex items-center gap-2 rounded-md border border-edge px-3 py-1.5 text-sm text-gray-300 hover:bg-surface-2 hover:text-white focus:outline-none focus:ring-2 focus:ring-accent-ring"
      >
        <Icon className="w-4 h-4" />
        Circle of fifths
        {shown && totalRoots > 0 && (
          <span className="text-xs text-muted">
            ({totalRoots} root{totalRoots === 1 ? "" : "s"})
          </span>
        )}
      </button>
      {shown && (
        <div className="mt-3 flex justify-center rounded-lg border border-edge bg-surface/40 p-4">
          <CircleDisplay majorRoots={majorRoots} minorRoots={minorRoots} />
        </div>
      )}
    </div>
  );
}

export default CircleOfFifths;
