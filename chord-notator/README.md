# Chordpad

A fast button-driven chord chart editor. Tap a root note, layer modifiers, set a beat duration, commit — then move to the next section. The output is monospace-aligned shorthand you can paste into any plain-text context (Slack, Discord code blocks, READMEs, notes apps), hear played back through a built-in synth, or print as a clean A4 chord sheet.

## Features at a glance

- **Button-driven chord input** — root grid + quality + extensions + slash bass.
- **Per-chord beat duration** — 1–4 beats; the renderer packs chords into 4-beat bars.
- **Sections** — Intro / Verse / Pre-Chorus / Chorus / Bridge / Outro / Inst by default; add, rename, delete.
- **Multi-song library** — many songs in localStorage, switchable from a song picker.
- **Transposition** — semitone ± buttons shift every chord and its bass note.
- **Key + Roman numeral mode** — pick a key, toggle between letter names and Roman numerals (`I ii iii IV V vi vii°`, with `b`/`#` for non-diatonic).
- **URL share** — encode the active song into the URL hash; opening the link imports it as a new song.
- **Audio playback (Tone.js)** — hear the progression with a tempo slider (60–200 BPM); the currently sounding chord highlights live.
- **Print** — clean A4 view with only the song name + chord chart.
- **Persistence** — every change auto-saves to `localStorage["chordpad:song"]`, with versioned migration.

## How it works

**Sections** — every song has tabs (`Intro`, `Verse`, `Pre-Chorus`, `Chorus`, `Bridge`, `Outro`, `Inst` by default). Click `+` to add, click an active tab to rename inline, click the × to delete (only enabled on empty sections).

**Building a chord** — pick a root (C through B), pick quality (maj / min / dim / aug), toggle extensions (`7`, `maj7`, `m7`, `add9`, `add11`, `sus2`, `sus4`), optionally pick a slash bass. The staging preview shows the resulting symbol in real time.

**Beats per chord** — `[1] [2] [3] [4]` next to **Add Chord**. Defaults to 4 (one chord per bar). Use 2 for two chords per bar, 1 for stabs. Chords with `beats < 4` show a muted `·N` annotation on the pill.

**Add Chord** (or Enter) commits the staged chord into the active section. **Clear** (or Esc) resets the staging area without committing.

**Root note / Display toolbar** (under the section tabs):

- `[−]` / `[+]` transpose the whole song by a semitone (wraps modulo 12, takes bass with it).
- Key dropdown sets the song's tonal center used by Roman numeral mode.
- `[ C | I ]` toggles between letter names and Roman numerals. The toggle affects both the chart and the chord pills above.

**Playback** (next to the toolbar):

- Play / Stop button — calls `Tone.start()` on first click (browser autoplay policy requires a user gesture).
- Tempo slider (60–200 BPM) — works live; dragging during playback scales subsequent chords.
- The chord pill currently sounding glows in accent purple.

**Chart output** — every section with chords is rendered as bar-packed monospace:

```text
Verse  | C  /  /  /  | F  /  C  /  | G  /  /  /  |
Chorus | Am /  /  /  | F  /  C  G  | C  /  /  /  |
```

`/` means "hold previous chord for this beat." Section names and slot widths are padded to a single max width so columns line up vertically across all sections.

**Chart toolbar** sits on top of the output:

- **Share** copies a URL with the active song base64url-encoded into the hash. Opening it on another device imports the song into that library.
- **Copy** copies the monospace text.
- **Print** opens the browser print dialog with a clean A4 layout.

## Notation conventions

- Quality suffixes: `m`, `dim`, `aug`. Major has no suffix.
- Extensions append directly: `Cm7`, `Gadd9`, `Dsus4`.
- Slash chords: `G/B`.
- Bar lines: `|`. Beats per bar: 4 (currently fixed).
- Incompatible extensions are auto-pruned (e.g. `maj7` / `m7` clear themselves when quality switches to `dim`/`aug`).
- Roman numerals: uppercase for major / aug, lowercase for minor / dim. Quality suffixes `°` (dim) and `+` (aug) follow the numeral. Non-diatonic chord roots prefix with `b` or `#` (e.g. `bIII`, `#IV`).

## Architecture

The codebase is layered along SOLID + lightweight DDD lines so each new feature lands as a self-contained slice rather than further cluttering a flat `app/` directory.

```text
src/
  domain/         # Pure. No React, no DOM, no side effects.
    types.ts            # Chord, Section, Song, Library, enums
    notation/format.ts  # formatChord/formatSong + bar packing + Roman conversion
    theory/transpose.ts # transposeChord/transposeSong (chromatic, mod-12)
    theory/voicing.ts   # chordToNotes — chord → MIDI note names for playback
  state/          # Application services. Reducers, hooks, storage.
    song-reducer.ts     # Song-level actions (sections, chords, transpose, key, mode)
    library-reducer.ts  # Wraps song-reducer + library-level actions (create/rename/select/delete/import)
    persistence.ts      # localStorage repo with versioned schema migration
    use-library.ts      # React hook: reducer + persistence + URL-hash import
  features/       # Bounded contexts. Each self-contained.
    share/        # encode/decode song ↔ URL hash
    playback/     # Tone.js engine + hook + controls
    print/        # @media print stylesheet + Print button
  components/     # Atomic-Design UI primitives. Render data, no biz logic imports beyond types.
    atoms/, molecules/, organisms/
  app/
    app.tsx       # Composition root only
  main.tsx
  index.css       # Tailwind import, @theme tokens, base layer
```

### Why these four layers

- `domain/` enforces single-responsibility for music-theory operations and types. Pure, framework-free, trivially testable when we add a test runner.
- `state/` is the application-service layer — orchestrates domain operations and side effects (localStorage, URL hash).
- `features/` are bounded contexts. Adding ChordPro export or MIDI later means a new folder under `features/`, not edits to existing reducers.
- `components/` stays atomic — UI primitives that render data and accept callbacks.

**Dependency direction:** `components → domain types`; `state → domain + features/share`; `features → domain`; `app → state + features + components`. Domain never imports from anywhere else.

### SOLID payoff in practice

- Adding audio playback didn't touch a single reducer, persistence file, or notation function — it slotted under `features/playback/`.
- Adding print didn't touch any state. Just CSS + a button + a few `data-print-*` attributes on containers.
- The `PlaybackEngine` class is the seam: swap Tone.js for any other audio backend by replacing that one file.

## Theme tokens

Tailwind v4 CSS-first config lives in [src/index.css](src/index.css). The `@theme` block exposes semantic color tokens so components use intent ("accent", "surface", "edge") rather than raw palette numbers.

| Token | Default |
| --- | --- |
| `accent`, `accent-soft`, `accent-ring` | purple-500 / 200 / 400 |
| `surface`, `surface-2` | gray-900 / 800 |
| `edge`, `edge-strong` | gray-700 / 600 |
| `muted` | gray-400 |
| `danger` | red-400 |
| `--control-height` | 2.25rem (h-9) |

Use as `bg-accent`, `border-edge`, `text-muted`, `bg-surface/40`, etc. Older components still using raw `purple-500` / `gray-700` work fine; they can adopt the semantic tokens incrementally.

## State and persistence

- One `useReducer` powers the whole app, via the [useLibrary](src/state/use-library.ts) hook in the composition root.
- `Library = { songs: Song[]; activeSongId }`; the library reducer wraps the song reducer, delegating unknown actions to whichever song is currently active.
- Persistence is a thin localStorage repository under `chordpad:song`, versioned (currently v2 — v1 was a single song; the loader auto-migrates).
- Transient state (`staging`, `currentChordId`) is intentionally **not** persisted — you don't want a half-built chord or a playback highlight reappearing after reload.

## URL share format

`?` queries hit the server; the hash never does. We use a hash so:
- Static hosting (GitHub Pages) needs no backend handling.
- The encoded song doesn't show up in server access logs.

Format: `#s=<base64url(JSON(song))>`. On mount, [`useLibrary`](src/state/use-library.ts) decodes any incoming hash, imports the song as a new entry in the library (with a fresh id, so it doesn't collide if the user shares back to themselves), and clears the hash so refresh doesn't re-import.

## Audio playback model

[`PlaybackEngine`](src/features/playback/playback-engine.ts) wraps Tone.js. It schedules events on `Tone.Transport` using **bars:beats:sixteenths** positions (so live tempo edits scale all subsequent chord positions automatically), and computes each chord's duration **inside the trigger callback** from `transport.bpm.value` (so the slider stays responsive). UI updates are routed through `Tone.getDraw().schedule(...)` so the highlight lands on the same animation frame the audio begins.

[`chordToNotes`](src/domain/theory/voicing.ts) converts a chord struct to an array of MIDI note names. Quality picks third + fifth, extensions append, `sus2`/`sus4` replace the third, and slash-bass plays one octave below the chord.

The `[`usePlayback`](src/features/playback/use-playback.ts)` hook owns the engine in a `useRef`, exposes `{playing, currentChordId, tempo, play, stop, setTempo}`, and disposes the engine on unmount.

## Print layout

`@media print` rules in [print.css](src/features/print/print.css) hide everything tagged `data-print-hide` and reveal everything tagged `data-print-only`. The chord-chart card carries `data-print-area` so its background, borders, and dark-mode colors reset to white-on-black for paper. `@page` sets A4 portrait + 2 cm margins.

The Print button just calls `window.print()` — no extra DOM, the same components render in both screen and paper modes. Cleanest possible coupling.

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # tsc + vite build → dist/
npm run lint
```

Type checking runs as part of `npm run build`; `npm run lint` is ESLint-only.

Path aliases: `app/*`, `components/*`, `domain/*`, `state/*`, `features/*` (configured in [vite.config.ts](vite.config.ts) and [tsconfig.app.json](tsconfig.app.json)).

Recommended workflow for any non-trivial change:

1. Write the feature under the right layer (`domain/` for pure logic, `state/` for reducers/storage, `features/` for self-contained bounded contexts, `components/` for UI primitives).
2. Run `npm run build` to confirm TypeScript strict passes.
3. Stage and commit with a Conventional Commits message — `lint-staged` will run Prettier + ESLint on staged files and `commitlint` will validate the message.

## Commit conventions

Commits must follow [Conventional Commits](https://www.conventionalcommits.org/). [commitlint.config.js](commitlint.config.js) and a Husky `commit-msg` hook enforce this on every commit; the GitHub Actions release workflow reads these commits to compute version bumps and changelog entries.

Common types:

- `feat:` — new feature (minor version bump)
- `fix:` — bug fix (patch bump)
- `feat!:` or `BREAKING CHANGE:` in the body — breaking change (major bump)
- `chore:`, `docs:`, `style:`, `refactor:`, `test:` — no version bump but appear in the changelog under "Miscellaneous"

Example:

```text
feat(playback): add tempo slider to playback controls

Slider drives transport.bpm.value live; BBS-scheduled events rescale
automatically so the slider works mid-playback.
```

A `scope` in parentheses is optional but useful for grouping changes by area (`playback`, `share`, `notation`, `state`, etc.).

## Releases

[release-please](https://github.com/googleapis/release-please) automates versioning + changelog generation. The action lives in [.github/workflows/release-please.yml](../.github/workflows/release-please.yml) at the repo root, configured by [release-please-config.json](../release-please-config.json) and [.release-please-manifest.json](../.release-please-manifest.json).

How it works:

1. On every push to `main`, the action scans commits since the last release tag and (re-)opens a single Release PR titled something like `chore(main): release chordpad 1.1.0`.
2. The PR contains a bumped `package.json` version, an updated `CHANGELOG.md` grouped by Conventional Commit type, and a manifest bump.
3. While the PR stays open, the action keeps rebasing it as more commits land.
4. Merging the PR creates a git tag (`v1.1.0`) and a matching GitHub Release with the same notes.

**One-time setup** in the GitHub repo settings: **Settings → Actions → General → Workflow permissions** must allow GitHub Actions to create and approve pull requests. Without this, the action can't open the release PR.

The CHANGELOG lives at [CHANGELOG.md](CHANGELOG.md) (alongside this README, inside `chord-notator/`).

## Deploy

GitHub Pages auto-deploys every push to `main` via [.github/workflows/deploy.yml](../.github/workflows/deploy.yml). The workflow builds the Vite app from `chord-notator/` and publishes `dist/` to `https://<user>.github.io/chordpad/`. The Vite `base` is set to `/chordpad/` in [vite.config.ts](vite.config.ts) — change it if you fork under a different repo name.

Deploy and release are intentionally **independent**: every push to `main` deploys (including the release-please merge commit), and releases are cut on top of whatever is already live. If you'd rather gate deploys on releases, swap the deploy workflow's trigger from `push: branches: [main]` to `release: types: [published]` and drop the `concurrency` group.

## Continuous integration

Every pull request to `main` runs [.github/workflows/ci.yml](../.github/workflows/ci.yml), which executes `npm ci`, `npm run lint`, and `npm run build` against the `chord-notator/` package. `npm run build` covers TypeScript strict-mode checking via `tsc -b` before invoking Vite, so a single workflow gates lint + types + bundling.

Deploy ([.github/workflows/deploy.yml](../.github/workflows/deploy.yml)) and release-please run on push to `main` independently; CI only runs on PRs.

## Dependencies

Dependabot is configured at [.github/dependabot.yml](../.github/dependabot.yml) at the repo root. Weekly checks for both npm (the `chord-notator/` package) and GitHub Actions; minor/patch npm updates are grouped into a single PR, majors get their own PR. All Dependabot PRs use the `chore(deps): ...` prefix to align with the commitlint rules above.

### Auto-merging Dependabot PRs

[.github/workflows/auto-merge-dependabot.yml](../.github/workflows/auto-merge-dependabot.yml) auto-approves and queues for auto-merge any Dependabot PR whose update type is **patch** or **minor**. Majors fall through and remain open for manual review — major bumps to React, Vite, or Tailwind in particular have shipped breakage in recent versions.

Flow:

1. Dependabot opens a PR (e.g. `chore(deps): bump react from 19.2.0 to 19.2.1`).
2. CI starts running on the PR branch.
3. The auto-merge workflow inspects the PR via [`dependabot/fetch-metadata`](https://github.com/dependabot/fetch-metadata). If patch or minor, it approves the PR and runs `gh pr merge --auto --squash`.
4. GitHub holds the merge until every registered status check (i.e. CI) is green, then squash-merges automatically.

Grouped updates: since the npm config groups minor/patch into a single PR, `fetch-metadata` reports the **highest** bump in the group. If any package in a grouped PR is a major, the whole group stays manual — conservative by design.

**One-time repo settings** required for this to work (the same settings cover release-please's need to open PRs too):

- **Settings → General → Allow auto-merge** ✓
- **Settings → Actions → General → Workflow permissions** → "Allow GitHub Actions to create and approve pull requests" ✓

## Out of scope (deferred)

- Unit tests (Vitest would slot naturally into `domain/`).
- Configurable beats-per-bar (4/4 hardcoded).
- Voicing options (open vs. closed), strum patterns, swing, metronome click.
- Undo / redo.
- Multi-song export (ChordPro, MIDI, MusicXML, PDF).
- Mobile-specific gestures.
- Accessibility audit beyond focus rings + ARIA labels.

## Credits

Thanks to Josep Vidal for the Vite Starter template: <https://github.com/jvidalv/vital#readme>