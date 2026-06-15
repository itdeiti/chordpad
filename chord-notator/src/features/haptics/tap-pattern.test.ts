import { describe, expect, it } from "vitest";
import { patternForTarget, type TapTarget } from "./tap-pattern";

// Minimal stand-in for a DOM element, driven by an attribute map.
function fakeTarget(
  attrs: Record<string, string> = {},
  disabled = false,
): TapTarget {
  return {
    getAttribute: (name) => attrs[name] ?? null,
    hasAttribute: (name) => name in attrs,
    disabled,
  };
}

describe("patternForTarget", () => {
  it("defaults to the selection pattern for a plain interactive element", () => {
    expect(patternForTarget(fakeTarget())).toBe("selection");
  });

  it("honours a valid data-haptic override", () => {
    expect(patternForTarget(fakeTarget({ "data-haptic": "medium" }))).toBe(
      "medium",
    );
  });

  it("falls back to the default for an unknown data-haptic value", () => {
    expect(patternForTarget(fakeTarget({ "data-haptic": "bogus" }))).toBe(
      "selection",
    );
  });

  it("suppresses feedback when opted out with data-no-haptic", () => {
    expect(patternForTarget(fakeTarget({ "data-no-haptic": "" }))).toBeNull();
  });

  it("suppresses feedback for a disabled control", () => {
    expect(patternForTarget(fakeTarget({}, true))).toBeNull();
  });
});
