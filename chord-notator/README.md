# Chordpad

A fast button-driven chord chart editor. Tap a root note, layer modifiers, set a beat duration, commit — then move to the next section. Output is monospace-aligned shorthand that pastes cleanly into any plain-text context (Slack, Discord code blocks, READMEs, notes apps).

## How it works

**Sections** — every song has tabs (`Intro`, `Verse`, `Pre-Chorus`, `Chorus`, `Bridge`, `Outro`, `Inst` by default). Add or rename freely; delete only allowed when empty.

**Building a chord** — pick a root (C through B), pick quality (maj / min / dim / aug), toggle extensions (`7`, `maj7`, `m7`, `add9`, `sus2`, `sus4`), optionally pick a slash bass. The staging preview shows the resulting symbol in real time.

**Beats per chord** — `[1] [2] [3] [4]` next to the Add Chord button. Defaults to 4 (one chord per bar). Set to 2 for two chords per bar, 1 for stabs, etc.

**Add Chord** (or Enter) commits the staged chord into the active section. **Clear** (or Esc) resets the staging area without committing.

**Chart output** — every section with chords is rendered as bar-packed monospace:

```text
Verse  | C  /  /  /  | F  /  C  /  | G  /  /  /  |
Chorus | Am /  /  /  | F  /  C  G  | C  /  /  /  |
```

`/` means "hold previous chord for this beat." Chords with `beats < 4` show a muted `·N` annotation on their pill so you can spot non-bar-length chords at a glance.

## Notation conventions

- Quality suffixes: `m`, `dim`, `aug`. Major has no suffix.
- Extensions append directly: `Cm7`, `Gadd9`, `Dsus4`.
- Slash chords: `G/B`.
- Bar lines: `|`. Beats per bar: 4 (currently fixed).
- Incompatible extensions are disabled in the UI (e.g. `maj7` / `m7` are hidden when quality is `minor`, `dim`, or `aug`).

## Stack

Vite 7, React 19, TypeScript 5.9 (strict), Tailwind CSS v4 (CSS-first config in [src/index.css](src/index.css)), Heroicons. Atomic Design layout under [src/components/](src/components/). State lives in a single `useReducer` ([src/app/song-reducer.ts](src/app/song-reducer.ts)).

## Develop

```bash
yarn install
yarn dev      # http://localhost:3000
yarn build    # tsc + vite build → dist/
yarn lint
```

## Deploy

GitHub Pages is wired via [.github/workflows/deploy.yml](../.github/workflows/deploy.yml). Push to `main`, the workflow builds and publishes to `https://<user>.github.io/chordpad/`. The Vite `base` is set to `/chordpad/` in [vite.config.ts](vite.config.ts) — change it if you fork under a different repo name.

## Out of scope (for now)

Transposition, Roman-numeral / Nashville modes, audio playback, persistence (localStorage / cloud), undo/redo, drag-reorder, configurable beats-per-bar.
