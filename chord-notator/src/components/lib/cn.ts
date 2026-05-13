import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Compose Tailwind class lists with conflict-aware merging. Use this in any
// component that accepts a `className` override — `twMerge` ensures the
// caller's class wins over the component's default for the same utility
// family (e.g. `p-4` overrides `p-2`), instead of letting CSS source order
// silently decide.
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
