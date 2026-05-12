import { useMemo, useState } from "react";
import {
  CheckCircleIcon,
  DocumentDuplicateIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";
import { formatSong } from "domain/notation/format";
import { PrintButton } from "features/print";
import { encodeSongToUrl } from "features/share";
import type { Song } from "domain/types";

interface Props {
  song: Song;
}

function ChordChart({ song }: Props) {
  const text = useMemo(() => formatSong(song), [song]);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

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

  const CopyIcon = copied ? CheckCircleIcon : DocumentDuplicateIcon;
  const ShareIcon = shared ? CheckCircleIcon : LinkIcon;

  return (
    <div
      data-print-area
      className="rounded-lg border border-gray-800 bg-gray-900/40 p-4"
    >
      <div
        data-print-hide
        className="flex flex-wrap items-center justify-between gap-2 mb-3"
      >
        <div className="text-xs uppercase tracking-wide text-gray-400">
          Chart
        </div>
        <div className="flex flex-wrap items-center gap-2">
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
          <PrintButton disabled={!text} />
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
