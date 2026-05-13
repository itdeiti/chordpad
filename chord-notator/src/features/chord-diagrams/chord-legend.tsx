import { useMemo } from "react";
import { formatChord } from "domain/notation/format";
import type { Chord, Song } from "domain/types";
import ChordDiagram from "./chord-diagram";
import { lookupFingering } from "./db-adapter";
import { useFingerings } from "./use-fingerings";

interface Props {
  song: Song;
}

// Walks every chord in the song and returns each unique symbol once, in
// first-occurrence order. Uses formatChord() as the canonical key so chords
// that render identically (e.g. equivalent extensions) dedupe correctly.
function uniqueChords(song: Song): Chord[] {
  const seen = new Set<string>();
  const out: Chord[] = [];
  for (const section of song.sections) {
    for (const chord of section.chords) {
      const key = formatChord(chord);
      if (!seen.has(key)) {
        seen.add(key);
        out.push(chord);
      }
    }
  }
  return out;
}

function ChordLegend({ song }: Props) {
  const { db, loading } = useFingerings();
  const chords = useMemo(() => uniqueChords(song), [song]);

  if (chords.length === 0) return null;

  return (
    <div className="mb-4 flex flex-wrap gap-3">
      {chords.map((c) => {
        // Label always uses the absolute letter spelling, even in Roman mode —
        // fingerings are bound to specific pitches.
        const label = formatChord(c);
        const fingering = db ? lookupFingering(c, db) : null;
        return (
          <ChordDiagram
            key={c.id}
            label={label}
            fingering={loading ? null : fingering}
          />
        );
      })}
    </div>
  );
}

export default ChordLegend;
