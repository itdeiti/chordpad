import { PauseIcon, PlayIcon } from "@heroicons/react/24/solid";

interface Props {
  playing: boolean;
  tempo: number;
  hasSongChords: boolean;
  hasSectionChords: boolean;
  onPlaySection: () => void;
  onPlaySong: () => void;
  onStop: () => void;
  onSetTempo: (bpm: number) => void;
}

function PlaybackControls({
  playing,
  tempo,
  hasSongChords,
  hasSectionChords,
  onPlaySection,
  onPlaySong,
  onStop,
  onSetTempo,
}: Props) {
  return (
    <div className="space-y-1">
      <div className="text-xs uppercase tracking-wide text-muted">Playback</div>
      <div className="inline-flex h-9 items-stretch rounded-md border border-edge overflow-hidden">
        {playing ? (
          <button
            type="button"
            onClick={onStop}
            aria-label="Stop playback"
            className="px-3 flex items-center gap-1.5 text-sm text-gray-200 hover:bg-surface-2 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent-ring"
          >
            <PauseIcon className="w-4 h-4" />
            Stop
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={onPlaySection}
              disabled={!hasSectionChords}
              aria-label="Play active section"
              className="px-3 flex items-center gap-1.5 text-sm text-gray-200 hover:bg-surface-2 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent-ring"
            >
              <PlayIcon className="w-4 h-4" />
              Section
            </button>
            <button
              type="button"
              onClick={onPlaySong}
              disabled={!hasSongChords}
              aria-label="Play whole song"
              className="px-3 flex items-center gap-1.5 text-sm text-gray-200 border-l border-edge hover:bg-surface-2 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent-ring"
            >
              <PlayIcon className="w-4 h-4" />
              Song
            </button>
          </>
        )}
        <div className="flex items-center gap-2 border-l border-edge bg-surface/40 px-3">
          <input
            type="range"
            min={60}
            max={200}
            step={1}
            value={tempo}
            onChange={(e) => onSetTempo(Number(e.target.value))}
            aria-label="Tempo (BPM)"
            className="w-24 accent-accent cursor-pointer"
          />
          <span className="font-mono text-xs text-gray-300 w-14 text-right tabular-nums">
            {tempo} bpm
          </span>
        </div>
      </div>
    </div>
  );
}

export default PlaybackControls;
