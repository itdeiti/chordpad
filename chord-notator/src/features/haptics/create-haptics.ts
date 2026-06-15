import type { Haptics } from "./haptics";
import { NoopHaptics } from "./noop-haptics";
import { WebHaptics } from "./web-haptics";

// Single swap point for choosing the haptics implementation.
//
// On a Capacitor (native mobile) build, swap in the native adapter here, e.g.:
//
//   import { Capacitor } from "@capacitor/core";
//   import { CapacitorHaptics } from "./capacitor-haptics";
//   if (Capacitor.isNativePlatform()) return new CapacitorHaptics();
//
// Consumers never change — they depend only on the Haptics port.
export function createDefaultHaptics(): Haptics {
  const supportsVibrate =
    typeof navigator !== "undefined" && "vibrate" in navigator;
  return supportsVibrate ? new WebHaptics() : new NoopHaptics();
}
