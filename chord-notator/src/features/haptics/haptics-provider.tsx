import { type FC, type ReactNode, useEffect, useMemo } from "react";
import { createDefaultHaptics } from "./create-haptics";
import type { Haptics } from "./haptics";
import { HapticsContext } from "./haptics-context";
import { patternForTarget } from "./tap-pattern";

// Interactive elements that should buzz on tap. Elements opt out with
// [data-no-haptic] and tune intensity with [data-haptic="medium"], etc. — these
// are the only ways the DOM expresses haptic intent, so components stay unaware.
const TRIGGER_SELECTOR = 'button, [role="button"], a[href], [data-haptic]';

type Props = {
  children: ReactNode;
  // Inject a specific implementation (tests, Capacitor build). Auto-detected when omitted.
  haptics?: Haptics;
  // Master switch — when false, no listener is attached.
  enabled?: boolean;
  // Ignore mouse pointers so only touch/pen taps fire (desktop clicks are skipped).
  touchOnly?: boolean;
};

// Provides the haptics implementation via context AND wires a single delegated
// pointerdown listener so taps anywhere in the subtree produce feedback without the
// tapped elements knowing haptics exist.
export const HapticsProvider: FC<Props> = ({
  children,
  haptics,
  enabled = true,
  touchOnly = true,
}) => {
  // Memoised so the listener effect only re-binds when the implementation
  // actually changes (e.g. a different adapter is injected).
  const impl = useMemo(() => haptics ?? createDefaultHaptics(), [haptics]);

  useEffect(() => {
    if (!enabled) return;

    // Movement (px) beyond which a press is treated as a scroll/drag, not a tap.
    const TAP_SLOP = 10;
    // The interactive element pressed, plus where, so pointerup can tell a tap
    // (fire) from a scroll (don't). Fire on up — not down — because at press time
    // a scroll and a tap are indistinguishable.
    let pending: { el: HTMLElement; x: number; y: number } | null = null;

    const onPointerDown = (e: PointerEvent) => {
      pending = null;
      if (touchOnly && e.pointerType === "mouse") return;
      const el = (e.target as Element | null)?.closest<HTMLElement>(
        TRIGGER_SELECTOR,
      );
      if (el) pending = { el, x: e.clientX, y: e.clientY };
    };

    const onPointerUp = (e: PointerEvent) => {
      const tap = pending;
      pending = null;
      if (!tap) return;
      const moved = Math.hypot(e.clientX - tap.x, e.clientY - tap.y);
      if (moved > TAP_SLOP) return; // dragged/scrolled — not a tap
      const pattern = patternForTarget(tap.el);
      if (pattern) impl.trigger(pattern);
    };

    // The browser fires pointercancel when it takes the gesture over for
    // scrolling — discard the pending tap so the lift doesn't buzz.
    const onPointerCancel = () => {
      pending = null;
    };

    // Capture phase: observe even if a child handler calls stopPropagation().
    const opts = { capture: true } as const;
    document.addEventListener("pointerdown", onPointerDown, opts);
    document.addEventListener("pointerup", onPointerUp, opts);
    document.addEventListener("pointercancel", onPointerCancel, opts);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, opts);
      document.removeEventListener("pointerup", onPointerUp, opts);
      document.removeEventListener("pointercancel", onPointerCancel, opts);
    };
  }, [enabled, touchOnly, impl]);

  return <HapticsContext value={impl}>{children}</HapticsContext>;
};
