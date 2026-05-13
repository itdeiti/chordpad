import * as Tone from "tone";
import { chordToNotes } from "domain/theory/voicing";
import type { Song } from "domain/types";

export type PlaybackTick = {
  sectionId: string;
  chordId: string;
}

type TickListener = (tick: PlaybackTick | null) => void;

type ScheduledEvent = {
  sectionId: string;
  chordId: string;
  notes: string[];
  beats: number;
}

function beatsToBbs(beats: number): string {
  const bars = Math.floor(beats / 4);
  const beat = beats % 4;
  return `${bars}:${beat}:0`;
}

export class PlaybackEngine {
  private synth: Tone.PolySynth | null = null;
  private listeners = new Set<TickListener>();
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;
    // Browser autoplay policy: AudioContext must be resumed from a user gesture.
    await Tone.start();
    this.synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "triangle" },
      envelope: { attack: 0.004, decay: 0.1, sustain: 0.3, release: 0.2 },
    }).toDestination();
    this.synth.volume.value = -8;
    this.initialized = true;
  }

  setTempo(bpm: number): void {
    Tone.getTransport().bpm.value = bpm;
  }

  async play(song: Song, bpm: number, sectionId?: string): Promise<void> {
    await this.init();
    this.stopInternal();
    this.setTempo(bpm);

    const events = this.songToEvents(song, sectionId);
    if (events.length === 0) return;

    const transport = Tone.getTransport();
    let cumBeats = 0;
    for (const evt of events) {
      // BBS positions are bpm-relative: Tone rescales them live when transport.bpm changes,
      // so dragging the tempo slider during playback shifts future chords automatically.
      const startTime = beatsToBbs(cumBeats);
      transport.scheduleOnce((time) => {
        // Read bpm at trigger time (not at schedule time) so tempo edits while playing
        // affect subsequent chord durations.
        const dur = (evt.beats * 60) / transport.bpm.value;
        this.synth?.triggerAttackRelease(evt.notes, dur, time);
        // Tone.Draw routes the UI emit through requestAnimationFrame at the exact
        // transport time the audio fires, so the highlight lands in sync with sound.
        Tone.getDraw().schedule(() => this.emit(evt), time);
      }, startTime);
      cumBeats += evt.beats;
    }

    const endTime = beatsToBbs(cumBeats);
    transport.scheduleOnce((time) => {
      Tone.getDraw().schedule(() => {
        this.emit(null);
        this.stopInternal();
      }, time);
    }, endTime);

    transport.start();
  }

  stop(): void {
    this.stopInternal();
    this.emit(null);
  }

  onTick(cb: TickListener): () => void {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  dispose(): void {
    this.stopInternal();
    this.synth?.dispose();
    this.synth = null;
    this.listeners.clear();
    this.initialized = false;
  }

  private stopInternal(): void {
    const transport = Tone.getTransport();
    transport.stop();
    transport.cancel(0);
  }

  private emit(tick: PlaybackTick | null): void {
    for (const l of this.listeners) l(tick);
  }

  private songToEvents(song: Song, sectionId?: string): ScheduledEvent[] {
    const sections = sectionId
      ? song.sections.filter((s) => s.id === sectionId)
      : song.sections;
    const events: ScheduledEvent[] = [];
    for (const section of sections) {
      for (const chord of section.chords) {
        events.push({
          sectionId: section.id,
          chordId: chord.id,
          // Unparsed chords have no voicing; treat them as silent rests so the
          // playback cursor still walks across them in time.
          notes: chord.raw ? [] : chordToNotes(chord),
          beats: chord.beats,
        });
      }
    }
    return events;
  }
}
