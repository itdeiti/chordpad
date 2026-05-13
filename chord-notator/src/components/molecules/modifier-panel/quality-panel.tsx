import { FC } from "react";
import { QUALITIES, type Quality } from "domain/types";
import { ChordButton } from "components/atoms/chord-button";
import { QUALITY_LABEL } from "./consts";

type QualityProps = {
  quality: string;
  onSetQuality: (q: Quality) => void;
};

export const QualityPanel: FC<QualityProps> = ({ onSetQuality, quality }) => (
  <div>
    <div className="text-xs uppercase tracking-wide text-gray-400 mb-2">
      Quality
    </div>
    <div className="flex flex-wrap gap-2">
      {QUALITIES.map((q) => (
        <ChordButton
          key={q}
          selected={quality === q}
          onClick={() => onSetQuality(q)}
        >
          {QUALITY_LABEL[q]}
        </ChordButton>
      ))}
    </div>
  </div>
);
