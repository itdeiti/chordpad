import {
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

// Shared sensor config for every drag-and-drop surface in the app.
// - PointerSensor with a 5px activation distance: a tap (select / rename / ×)
//   never accidentally starts a drag; you have to move ~5px while holding.
// - TouchSensor with delay + tolerance: long-press initiates the drag on mobile.
//   250ms is the sweet spot — long enough to feel intentional, short enough not
//   to drag (pun intended). Tolerance lets the finger jitter a few pixels during
//   the press without canceling.
// - KeyboardSensor: Space to grab, arrows to move, Space to drop, Esc to cancel.
export function useDragSensors() {
  return useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
}
