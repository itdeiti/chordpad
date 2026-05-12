import { useEffect, useRef, useState } from "react";
import type { Song } from "domain/types";
import { PlaybackEngine } from "./playback-engine";

const DEFAULT_TEMPO = 120;

export function usePlayback(song: Song) {
  const engineRef = useRef<PlaybackEngine | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentChordId, setCurrentChordId] = useState<string | null>(null);
  const [tempo, setTempoState] = useState(DEFAULT_TEMPO);

  useEffect(() => {
    const engine = new PlaybackEngine();
    engineRef.current = engine;
    const unsub = engine.onTick((tick) => {
      setCurrentChordId(tick?.chordId ?? null);
      if (!tick) setPlaying(false);
    });
    return () => {
      unsub();
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  const play = () => {
    if (!engineRef.current) return;
    setPlaying(true);
    engineRef.current.play(song, tempo).catch(() => {
      setPlaying(false);
    });
  };

  const stop = () => {
    engineRef.current?.stop();
    setPlaying(false);
  };

  const setTempo = (bpm: number) => {
    setTempoState(bpm);
    engineRef.current?.setTempo(bpm);
  };

  return { playing, currentChordId, tempo, play, stop, setTempo };
}
