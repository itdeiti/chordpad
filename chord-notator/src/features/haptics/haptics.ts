// The haptics "port" — the abstraction the UI depends on (Dependency Inversion).
// Concrete adapters (web, Capacitor, noop) implement this and are swapped in at the
// app root via HapticsProvider. Nothing in the UI imports an adapter directly.

// Semantic feedback intensities. Adapters map these onto whatever the platform
// supports (vibration durations on the web, ImpactStyle/NotificationType on native).
export const HAPTIC_PATTERNS = [
  "selection",
  "light",
  "medium",
  "heavy",
  "success",
  "warning",
  "error",
] as const;

export type HapticPattern = (typeof HAPTIC_PATTERNS)[number];

export interface Haptics {
  // Fire-and-forget. Must never throw — unsupported platforms degrade to a no-op.
  trigger(pattern?: HapticPattern): void;
}

export const DEFAULT_PATTERN: HapticPattern = "selection";

export function isHapticPattern(value: string | null): value is HapticPattern {
  return value != null && (HAPTIC_PATTERNS as readonly string[]).includes(value);
}
