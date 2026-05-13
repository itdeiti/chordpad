import { useEffect, useRef, useState } from "react";
import type { Song } from "domain/types";
import { PlaybackEngine } from "./playback-engine";

const DEFAULT_TEMPO = 120;

export function usePlayback(song: Song) {
  const engineRef = useRef<PlaybackEngine | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentChordId, setCurrentChordId] = useState<string | null>(null);
  const [currentSectionId, setCurrentSectionId] = useState<string | null>(null);
  const [tempo, setTempo] = useState(DEFAULT_TEMPO);

  useEffect(() => {
    const engine = new PlaybackEngine();
    engineRef.current = engine;
    const unsub = engine.onTick((tick) => {
      setCurrentChordId(tick?.chordId ?? null);
      setCurrentSectionId(tick?.sectionId ?? null);
      if (!tick) setPlaying(false);
    });
    return () => {
      unsub();
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  const play = (sectionId?: string) => {
    if (!engineRef.current) return;
    setPlaying(true);
    engineRef.current.play(song, tempo, sectionId).catch(() => {
      setPlaying(false);
    });
  };

  const stop = () => {
    engineRef.current?.stop();
    setPlaying(false);
  };

  const handleTempoChange = (bpm: number) => {
    setTempo(bpm);
    engineRef.current?.setTempo(bpm);
  };

  return {
    playing,
    currentChordId,
    currentSectionId,
    tempo,
    play,
    stop,
    setTempo: handleTempoChange,
  };
}
