import { type FC, useMemo, useState } from "react";
import { formatChord } from "domain/notation/format";
import { parseProgression, type ParseToken } from "domain/notation/parse";
import type { ChordSpec } from "domain/types";

type Props = {
  sectionName: string;
  onSubmit: (chords: ChordSpec[], mode: "append" | "replace") => void;
};

const toSpecs = (tokens: ParseToken[]): ChordSpec[] =>
  tokens.map((t) =>
    t.kind === "parsed"
      ? t.spec
      : {
          // Placeholder values; the formatter / transpose / playback all branch
          // on `raw` and ignore these.
          root: "C",
          quality: "major",
          extensions: [],
          beats: 4,
          raw: t.raw,
        },
  );

// Inline paste-a-progression panel used inside the Input Dock. Submitting
// clears the box so the panel is ready for the next paste.
export const PastePanel: FC<Props> = ({ sectionName, onSubmit }) => {
  const [text, setText] = useState("");

  const tokens = useMemo(() => parseProgression(text), [text]);
  const parsedCount = tokens.filter((t) => t.kind === "parsed").length;
  const unparsedCount = tokens.length - parsedCount;
  const canSubmit = tokens.length > 0;

  const submit = (mode: "append" | "replace") => {
    if (!canSubmit) return;
    onSubmit(toSpecs(tokens), mode);
    setText("");
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-400">
        Paste a progression into{" "}
        <span className="text-gray-200">{sectionName}</span>. Separate with
        spaces, commas, pipes, or newlines — e.g.{" "}
        <span className="font-mono">C Am F G</span> or{" "}
        <span className="font-mono">Cmaj7 | F#m7b5 | G/B</span>.
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        spellCheck={false}
        placeholder="C Am F G"
        className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 font-mono text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-400"
      />

      {tokens.length > 0 && (
        <div>
          <div className="text-xs uppercase tracking-wide text-gray-400 mb-2">
            Preview · {parsedCount} parsed
            {unparsedCount > 0 ? `, ${unparsedCount} unparsed` : ""}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {tokens.map((t, i) =>
              t.kind === "parsed" ? (
                <span
                  // eslint-disable-next-line @eslint-react/no-array-index-key
                  key={`${t.raw}-${i}`}
                  className="inline-flex items-center rounded border border-gray-700 bg-gray-800 px-2 py-0.5 font-mono text-sm text-gray-100"
                >
                  {formatChord({ ...t.spec, id: "preview" })}
                </span>
              ) : (
                <span
                  // eslint-disable-next-line @eslint-react/no-array-index-key
                  key={`${t.raw}-${i}`}
                  title="Couldn't parse — will be inserted as raw text"
                  className="inline-flex items-center rounded border border-dashed border-amber-500/70 bg-amber-900/30 px-2 py-0.5 font-mono text-sm italic text-amber-100"
                >
                  {t.raw}
                </span>
              ),
            )}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => submit("replace")}
          disabled={!canSubmit}
          className="px-3 py-2 rounded-md text-sm font-semibold border border-red-700 text-red-200 hover:bg-red-900/30 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-400"
        >
          Replace
        </button>
        <button
          type="button"
          onClick={() => submit("append")}
          disabled={!canSubmit}
          data-haptic="success"
          className="px-4 py-2 rounded-md text-sm font-semibold bg-purple-500 text-white hover:bg-purple-400 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-300"
        >
          Append
        </button>
      </div>
    </div>
  );
};
