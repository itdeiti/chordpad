# 1. Haptic feedback architecture

- Status: Accepted
- Date: 2026-06-15
- Deciders: itdeiti

## Context

We want tactile feedback when a user taps interactive elements (initially the
chord-identifier fretboard, but app-wide). Two constraints shaped the design:

1. **The tapped elements must stay unaware of haptics.** The fretboard is built
   from raw `<button>` elements with their own `onClick` handlers
   (`src/features/chord-identifier/interactive-fretboard.tsx`). We did not want to
   thread a haptics dependency through every handler or wrap every control.
2. **The implementation must be swappable per deployment.** On the web,
   `navigator.vibrate` only works on Android Chrome (no iOS Safari, no desktop), so
   the web adapter is frequently a graceful no-op. A future Capacitor (native
   mobile) build must swap in real native haptics (`@capacitor/haptics`) **without
   touching any UI code.**

This is a cross-cutting concern, so we wanted it to follow SOLID — in particular a
stable abstraction (port) that the UI depends on, with interchangeable adapters.

## Decision

Introduce a `Haptics` **port** (interface) under `src/features/haptics/`, with
interchangeable adapters (`WebHaptics`, `NoopHaptics`, and a documented
`CapacitorHaptics` template). Wire it with the two idiomatic React 19 primitives:

- **React Context = dependency injection.** `HapticsProvider` chooses the adapter
  (`createDefaultHaptics()`, the single swap point) and exposes it via context.
  `useHaptics()` is available for any imperative use, but is not required.
- **Event delegation = the "elements unaware" mechanism.** The provider attaches a
  single capture-phase pointer listener at the document root. Any tap on a
  `button`, `[role="button"]`, `a[href]`, or `[data-haptic]` element fires the
  injected adapter. The tapped elements need **zero** changes.

Elements opt out with `data-no-haptic` and tune intensity with
`data-haptic="medium"` — declarative, optional attributes, the only way the DOM
expresses haptic intent.

Tap vs. scroll: feedback fires on **pointerup**, only when the pointer moved ≤10px
since pointerdown (and not after a `pointercancel`). At pointerdown a tap and the
start of a scroll are indistinguishable, so firing there caused scrolling to buzz.

Switching to native: change one line in `create-haptics.ts`
(`if (Capacitor.isNativePlatform()) return new CapacitorHaptics()`). No consumer
changes — they depend only on the port.

How this maps to SOLID: **SRP** — each adapter does one thing; the provider only
wires DI + delegation. **OCP** — add an adapter without editing consumers. **LSP** —
adapters are interchangeable behind the port. **ISP** — the port is a single
`trigger(pattern?)` method. **DIP** — the UI depends on the `Haptics` abstraction;
the concrete adapter is injected at the root.

## Considered options

### 1. Event delegation + Context DI (chosen)

- ➕ Tapped elements stay completely unaware — no edits to the fretboard's raw
  `<button>`s, which are not the shared `Button` atom.
- ➕ One listener covers the whole app; new UI gets haptics for free.
- ➕ Implementation is injected at the root and swappable for Capacitor.
- ➖ Slightly "magic" (behaviour lives outside the components).
- ➖ Relies on a DOM selector + `data-*` attributes for opt-out/intensity.

### 2. `useHaptics()` hook called in component handlers

- ➕ Explicit and easy to trace; fine-grained control per interaction.
- ➖ **Violates the "unaware" constraint** — every handler must call the hook
  (`onClick={() => { haptics.tap(); setString(i, f); }}`), spreading the concern
  across all interactive code, including the raw fretboard buttons.
- ➖ Easy to forget; inconsistent coverage.

(The hook still exists as an escape hatch for cases that genuinely need imperative,
non-tap feedback — it is just not the primary mechanism.)

### 3. `withHaptics(Component)` HOC

- ➕ Keeps handlers clean; wrapping is centralised.
- ➖ Every interactive element must be **swapped** for the wrapped version
  (`<button>` → `<HapticButton>`), so elements are still effectively "aware."
- ➖ HOCs are discouraged in modern React 19 (favouring hooks/composition) and are
  unused elsewhere in this codebase — introducing the pattern for one feature adds
  inconsistency.

### 4. Bake haptics into the shared `Button` atom

- ➕ No HOC, no delegation; feedback lives in one component.
- ➖ **Does not cover the trigger case** — the fretboard uses raw `<button>`s, not
  the `Button` atom, so the core interaction would get no feedback.
- ➖ Couples a UI atom to a cross-cutting service; misses non-atom controls.

## Consequences

- New interactive elements receive haptics automatically; no wiring needed.
- Intensity/opt-out is declarative via `data-haptic` / `data-no-haptic`.
- The web adapter is a no-op on iOS/desktop by design; real feedback there is the
  Capacitor adapter's responsibility (see the `feat/capacitor` work).
- Pure tap-decision logic (`tap-pattern.ts`) is unit-tested; the DOM gesture wiring
  in the provider is not (the project has no jsdom/testing-library setup).
- Slight indirection cost: a developer tracing "why did this buzz?" must know about
  the root delegation listener rather than finding it in the component.

## Files

- `src/features/haptics/haptics.ts` — the `Haptics` port + `HapticPattern`.
- `src/features/haptics/web-haptics.ts` / `noop-haptics.ts` — adapters.
- `src/features/haptics/create-haptics.ts` — adapter selection (the swap point).
- `src/features/haptics/capacitor-haptics.ts` — native adapter template.
- `src/features/haptics/haptics-context.ts` — context + `useHaptics()`.
- `src/features/haptics/haptics-provider.tsx` — DI + delegated tap detection.
- `src/features/haptics/tap-pattern.ts` — pure tap-decision logic (tested).
- `src/main.tsx` — `HapticsProvider` mounted at the app root.
