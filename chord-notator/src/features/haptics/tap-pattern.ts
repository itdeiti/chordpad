import { DEFAULT_PATTERN, type HapticPattern, isHapticPattern } from "./haptics";

// Minimal shape needed to decide on feedback — real DOM elements satisfy it
// structurally, which keeps this logic unit-testable without a DOM.
export interface TapTarget {
  getAttribute(name: string): string | null;
  hasAttribute(name: string): boolean;
  disabled?: boolean;
}

// Decide whether a tapped interactive element should buzz, and with what pattern.
// Returns null to suppress (opted out via [data-no-haptic] or disabled control).
export function patternForTarget(el: TapTarget): HapticPattern | null {
  if (el.hasAttribute("data-no-haptic")) return null;
  if (el.disabled) return null;
  const attr = el.getAttribute("data-haptic");
  return isHapticPattern(attr) ? attr : DEFAULT_PATTERN;
}
