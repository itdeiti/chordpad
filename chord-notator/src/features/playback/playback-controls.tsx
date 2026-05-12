import { PauseIcon, PlayIcon } from "@heroicons/react/24/solid";

interface Props {
  playing: boolean;
  tempo: number;
  hasChords: boolean;
  onPlay: () => void;
  onStop: () => void;
  onSetTempo: (bpm: number) => void;
}

function PlaybackControls({
  playing,
  tempo,
  hasChords,
  onPlay,
  onStop,
  onSetTempo,
}: Props) {
  const Icon = playing ? PauseIcon : PlayIcon;
  return (
    <div className="space-y-1">
      <div className="text-xs uppercase tracking-wide text-muted">Playback</div>
      <div className="inline-flex h-9 items-stretch rounded-md border border-edge overflow-hidden">
        <button
          type="button"
          onClick={playing ? onStop : onPlay}
          disabled={!hasChords}
          aria-label={playing ? "Stop playback" : "Play"}
          className="px-3 flex items-center text-gray-200 hover:bg-surface-2 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent-ring"
        >
          <Icon className="w-4 h-4" />
        </button>
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
