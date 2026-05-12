import { useMemo, useState } from "react";
import {
  CheckCircleIcon,
  DocumentDuplicateIcon,
  LinkIcon,
  MinusIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { formatSong } from "app/format-chord";
import { encodeSongToUrl } from "app/share";
import type { SongAction } from "app/song-reducer";
import { ROOT_NOTES, type DisplayMode, type RootNote, type Song } from "app/types";

interface Props {
  song: Song;
  dispatch: (a: SongAction) => void;
}

function ChordChart({ song, dispatch }: Props) {
  const text = useMemo(() => formatSong(song), [song]);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const hasChords = song.sections.some((s) => s.chords.length > 0);

  const onCopy = () => {
    if (!text) return;
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    });
  };

  const onShare = () => {
    const url = encodeSongToUrl(song);
    navigator.clipboard?.writeText(url).then(() => {
      setShared(true);
      window.setTimeout(() => setShared(false), 1500);
    });
  };

  const setMode = (mode: DisplayMode) =>
    dispatch({ type: "SET_DISPLAY_MODE", mode });

  const CopyIcon = copied ? CheckCircleIcon : DocumentDuplicateIcon;
  const ShareIcon = shared ? CheckCircleIcon : LinkIcon;

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="text-xs uppercase tracking-wide text-gray-400">
          Chart
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center rounded-md border border-gray-700 overflow-hidden">
            <button
              type="button"
              onClick={() => dispatch({ type: "TRANSPOSE", semitones: -1 })}
              disabled={!hasChords}
              aria-label="Transpose down a semitone"
              className="px-2 py-1.5 text-gray-300 hover:bg-gray-800 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-400"
            >
              <MinusIcon className="w-4 h-4" />
            </button>
            <label className="px-2 py-1.5 text-xs uppercase tracking-wide text-gray-400 border-x border-gray-700">
              <span className="sr-only">Key</span>
              <select
                value={song.key}
                onChange={(e) =>
                  dispatch({ type: "SET_KEY", key: e.target.value as RootNote })
                }
                className="bg-transparent text-gray-100 font-mono focus:outline-none cursor-pointer"
                aria-label="Song key"
              >
                {ROOT_NOTES.map((n) => (
                  <option key={n} value={n} className="bg-gray-900">
                    {n}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={() => dispatch({ type: "TRANSPOSE", semitones: 1 })}
              disabled={!hasChords}
              aria-label="Transpose up a semitone"
              className="px-2 py-1.5 text-gray-300 hover:bg-gray-800 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-400"
            >
              <PlusIcon className="w-4 h-4" />
            </button>
          </div>
          <div className="inline-flex items-center rounded-md border border-gray-700 overflow-hidden text-sm font-mono">
            <button
              type="button"
              onClick={() => setMode("letters")}
              aria-pressed={song.displayMode === "letters"}
              className={
                "px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-400 " +
                (song.displayMode === "letters"
                  ? "bg-purple-500 text-white"
                  : "text-gray-300 hover:bg-gray-800")
              }
            >
              C
            </button>
            <button
              type="button"
              onClick={() => setMode("roman")}
              aria-pressed={song.displayMode === "roman"}
              className={
                "px-2.5 py-1.5 border-l border-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-400 " +
                (song.displayMode === "roman"
                  ? "bg-purple-500 text-white"
                  : "text-gray-300 hover:bg-gray-800")
              }
            >
              I
            </button>
          </div>
          <button
            type="button"
            onClick={onShare}
            className="inline-flex items-center gap-2 rounded-md border border-gray-700 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <ShareIcon className="w-4 h-4" />
            {shared ? "Link copied" : "Share"}
          </button>
          <button
            type="button"
            onClick={onCopy}
            disabled={!text}
            className="inline-flex items-center gap-2 rounded-md border border-gray-700 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <CopyIcon className="w-4 h-4" />
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
      {text ? (
        <pre className="font-mono text-sm text-gray-100 whitespace-pre-wrap leading-relaxed">
          {text}
        </pre>
      ) : (
        <p className="text-gray-500 text-sm italic">
          Add a chord to a section to populate the chart.
        </p>
      )}
    </div>
  );
}

export default ChordChart;
