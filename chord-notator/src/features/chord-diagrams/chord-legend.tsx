import { type FC, useMemo, useState } from "react";
import { formatChord } from "domain/notation/format";
import type { Chord, Song } from "domain/types";
import type { SongAction } from "state/song-reducer";
import { ChordDiagram } from "./chord-diagram";
import { lookupFingering, lookupFingerings } from "./db-adapter";
import { useFingerings } from "./use-fingerings";
import { VoicingPicker } from "./voicing-picker";

type Props = {
  song: Song;
  dispatch: (a: SongAction) => void;
};

// Walks every chord in the song and returns each unique symbol once, in
// first-occurrence order. Uses formatChord() as the canonical key so chords
// that render identically (e.g. equivalent extensions) dedupe correctly.
const uniqueChords = (song: Song): Chord[] => {
  const seen = new Set<string>();
  const out: Chord[] = [];
  for (const section of song.sections) {
    for (const chord of section.chords) {
      // Unparsed chords have no fingering — exclude them from the legend.
      if (chord.raw) continue;
      const key = formatChord(chord);
      if (!seen.has(key)) {
        seen.add(key);
        out.push(chord);
      }
    }
  }
  return out;
};

export const ChordLegend: FC<Props> = ({ song, dispatch }) => {
  const { db, loading } = useFingerings();
  const chords = useMemo(() => uniqueChords(song), [song]);
  // The symbol whose voicing picker is open (null = closed). Keyed by symbol
  // because selection is applied to all instances sharing it.
  const [pickerFor, setPickerFor] = useState<Chord | null>(null);

  if (chords.length === 0) return null;

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-3">
        {chords.map((c) => {
          // Label always uses the absolute letter spelling, even in Roman mode —
          // fingerings are bound to specific pitches.
          const label = formatChord(c);
          const fingering = db ? lookupFingering(c, db) : null;
          const count = db ? lookupFingerings(c, db).length : 0;
          const hasAlternatives = count > 1;
          const current = Math.min(c.voicing ?? 0, Math.max(count - 1, 0));
          return (
            <ChordDiagram
              key={c.id}
              label={label}
              fingering={loading ? null : fingering}
              badge={hasAlternatives ? `${current + 1}/${count}` : undefined}
              onClick={
                hasAlternatives ? () => setPickerFor(c) : undefined
              }
            />
          );
        })}
      </div>
      {pickerFor && db && (
        <VoicingPicker
          chord={pickerFor}
          label={formatChord(pickerFor)}
          db={db}
          selectedIndex={pickerFor.voicing ?? 0}
          onSelect={(index) =>
            dispatch({
              type: "SET_VOICING_BY_SYMBOL",
              symbol: formatChord(pickerFor),
              index,
            })
          }
          onClose={() => setPickerFor(null)}
        />
      )}
    </>
  );
};
