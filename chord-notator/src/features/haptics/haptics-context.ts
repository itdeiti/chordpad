import { createContext, use } from "react";
import type { Haptics } from "./haptics";
import { NoopHaptics } from "./noop-haptics";

// Context is the dependency-injection seam: the provider puts the chosen
// implementation here, and useHaptics() reads it. Default is a no-op so the hook
// is safe to call even without a provider (e.g. isolated component tests).
export const HapticsContext = createContext<Haptics>(new NoopHaptics());

export function useHaptics(): Haptics {
  return use(HapticsContext);
}
