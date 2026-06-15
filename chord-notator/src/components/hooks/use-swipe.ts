import { useRef, type PointerEvent as ReactPointerEvent } from "react";

type Options = {
  // Finger travels right→left: advance to the next panel.
  onSwipeLeft: () => void;
  // Finger travels left→right: go back to the previous panel.
  onSwipeRight: () => void;
  // Minimum horizontal travel (px) before a drag counts as a swipe.
  threshold?: number;
};

export type SwipeHandlers = {
  onPointerDown: (e: ReactPointerEvent) => void;
  onPointerUp: (e: ReactPointerEvent) => void;
  onPointerCancel: () => void;
};

// Lightweight horizontal-swipe detector. Touch/pen only — mouse is ignored so
// desktop clicks and text selection aren't hijacked (the segmented control and
// arrow keys cover desktop). Fires on pointer-up once travel is dominantly
// horizontal and past the threshold, mirroring how the tap-haptics listener
// distinguishes a tap from a scroll.
export function useSwipe({
  onSwipeLeft,
  onSwipeRight,
  threshold = 50,
}: Options): SwipeHandlers {
  const start = useRef<{ x: number; y: number } | null>(null);

  return {
    onPointerDown: (e) => {
      if (e.pointerType === "mouse") {
        start.current = null;
        return;
      }
      start.current = { x: e.clientX, y: e.clientY };
    },
    onPointerUp: (e) => {
      const s = start.current;
      start.current = null;
      if (!s) return;
      const dx = e.clientX - s.x;
      const dy = e.clientY - s.y;
      // Require horizontal dominance so a vertical scroll never flips panels.
      if (Math.abs(dx) < threshold || Math.abs(dx) < Math.abs(dy)) return;
      if (dx < 0) onSwipeLeft();
      else onSwipeRight();
    },
    onPointerCancel: () => {
      start.current = null;
    },
  };
}
