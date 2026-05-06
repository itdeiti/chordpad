import { useMemo, useState } from "react";
import {
  CheckCircleIcon,
  DocumentDuplicateIcon,
} from "@heroicons/react/24/outline";
import { formatSong } from "app/format-chord";
import type { Song } from "app/types";

interface Props {
  song: Song;
}

function ChordChart({ song }: Props) {
  const text = useMemo(() => formatSong(song), [song]);
  const [copied, setCopied] = useState(false);

  const onCopy = () => {
    if (!text) return;
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    });
  };

  const Icon = copied ? CheckCircleIcon : DocumentDuplicateIcon;

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900/40 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs uppercase tracking-wide text-gray-400">
          Chart
        </div>
        <button
          type="button"
          onClick={onCopy}
          disabled={!text}
          className="inline-flex items-center gap-2 rounded-md border border-gray-700 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-400"
        >
          <Icon className="w-4 h-4" />
          {copied ? "Copied" : "Copy"}
        </button>
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
