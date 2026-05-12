import * as Tone from "tone";
import { chordToNotes } from "domain/theory/voicing";
import type { Song } from "domain/types";

export interface PlaybackTick {
  sectionId: string;
  chordId: string;
}

type TickListener = (tick: PlaybackTick | null) => void;

interface ScheduledEvent {
  sectionId: string;
  chordId: string;
  notes: string[];
  beats: number;
}

export class PlaybackEngine {
  private synth: Tone.PolySynth | null = null;
  private listeners = new Set<TickListener>();
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;
    await Tone.start();
    this.synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "triangle" },
      envelope: { attack: 0.04, decay: 0.12, sustain: 0.55, release: 0.45 },
    }).toDestination();
    this.synth.volume.value = -8;
    this.initialized = true;
  }

  setTempo(bpm: number): void {
    Tone.getTransport().bpm.value = bpm;
  }

  async play(song: Song, bpm: number): Promise<void> {
    await this.init();
    this.stopInternal();
    this.setTempo(bpm);

    const events = this.songToEvents(song);
    if (events.length === 0) return;

    const transport = Tone.getTransport();
    let cumBeats = 0;
    for (const evt of events) {
      const startTime = `${cumBeats}*4n`;
      transport.scheduleOnce((time) => {
        const dur = `${evt.beats}*4n`;
        this.synth?.triggerAttackRelease(evt.notes, dur, time);
        Tone.getDraw().schedule(() => this.emit(evt), time);
      }, startTime);
      cumBeats += evt.beats;
    }

    const endTime = `${cumBeats}*4n`;
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

  private songToEvents(song: Song): ScheduledEvent[] {
    const events: ScheduledEvent[] = [];
    for (const section of song.sections) {
      for (const chord of section.chords) {
        events.push({
          sectionId: section.id,
          chordId: chord.id,
          notes: chordToNotes(chord),
          beats: chord.beats,
        });
      }
    }
    return events;
  }
}
