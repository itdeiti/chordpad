import type { Haptics } from "./haptics";

// Used when the platform has no vibration API (iOS Safari, desktop) and in tests.
export class NoopHaptics implements Haptics {
  trigger(): void {
    // intentionally empty
  }
}
