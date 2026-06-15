import { DEFAULT_PATTERN, type HapticPattern, type Haptics } from "./haptics";

// navigator.vibrate argument per pattern. A single number is a one-shot buzz; an
// array is an on/off/on… millisecond pattern. Tuned to feel like UI feedback, not
// an alarm. Note: vibrate is Android-Chrome only — iOS Safari and desktop lack it,
// where WebHaptics is selected against (see create-haptics.ts) so this never runs.
const PATTERNS: Record<HapticPattern, number | number[]> = {
  selection: 5,
  light: 8,
  medium: 15,
  heavy: 25,
  success: [10, 40, 10],
  warning: [15, 50, 15],
  error: [25, 40, 25, 40, 25],
};

export class WebHaptics implements Haptics {
  trigger(pattern: HapticPattern = DEFAULT_PATTERN): void {
    if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
    try {
      navigator.vibrate(PATTERNS[pattern]);
    } catch {
      // Some browsers throw if called outside a user gesture — ignore.
    }
  }
}
