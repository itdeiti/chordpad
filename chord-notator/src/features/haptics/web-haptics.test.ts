import { afterEach, describe, expect, it, vi } from "vitest";
import { WebHaptics } from "./web-haptics";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("WebHaptics", () => {
  it("calls navigator.vibrate with a one-shot duration for the default pattern", () => {
    const vibrate = vi.fn();
    vi.stubGlobal("navigator", { vibrate });
    new WebHaptics().trigger();
    expect(vibrate).toHaveBeenCalledWith(5);
  });

  it("maps a composite pattern to a vibration sequence", () => {
    const vibrate = vi.fn();
    vi.stubGlobal("navigator", { vibrate });
    new WebHaptics().trigger("success");
    expect(vibrate).toHaveBeenCalledWith([10, 40, 10]);
  });

  it("is a no-op when the platform lacks navigator.vibrate", () => {
    vi.stubGlobal("navigator", {});
    expect(() => new WebHaptics().trigger("heavy")).not.toThrow();
  });

  it("swallows errors thrown by vibrate (e.g. outside a user gesture)", () => {
    const vibrate = vi.fn(() => {
      throw new Error("blocked");
    });
    vi.stubGlobal("navigator", { vibrate });
    expect(() => new WebHaptics().trigger()).not.toThrow();
  });
});
