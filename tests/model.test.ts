import { it, expect, vi } from "vitest";
import {
  allOffTargets,
  available,
  brightnessPercent,
  supportsBrightness,
  supportsColor,
  hsColor,
} from "../src/model";
import { normalizeConfig } from "../src/config";
const entity = (state = "on", attributes: Record<string, unknown> = {}) => ({
  entity_id: "light.a",
  state,
  attributes,
});
it("deduplicates only configured on targets", () => {
  const config = normalizeConfig({
    type: "custom:light-group-card",
    sections: [
      {
        name: "Room",
        lights: ["a", "a", "b", "c", "missing"].map((x) => ({
          entity: `light.${x}`,
        })),
      },
    ],
  });
  const hass = {
    states: {
      "light.a": entity(),
      "light.b": entity("off"),
      "light.c": entity("unavailable"),
      "light.unrelated": entity(),
    },
    callService: vi.fn(),
  };
  expect(allOffTargets(config, hass)).toEqual(["light.a"]);
  expect(
    allOffTargets(config, { ...hass, connection: { connected: false } }),
  ).toEqual([]);
  expect(available(hass, "light.missing")).toBe(false);
});
it.each([
  "brightness",
  "color_temp",
  "hs",
  "xy",
  "rgb",
  "rgbw",
  "rgbww",
  "white",
])("supports brightness mode %s", (mode) =>
  expect(
    supportsBrightness(entity("on", { supported_color_modes: [mode] })),
  ).toBe(true),
);
it.each([undefined, [], ["onoff"], ["unknown"], "rgb", 1])(
  "does not infer support from malformed modes %j",
  (modes) =>
    expect(
      supportsBrightness(entity("on", { supported_color_modes: modes })),
    ).toBe(false),
);
it.each([NaN, Infinity, -1, 256, "128", undefined])(
  "rejects bad brightness %s",
  (brightness) =>
    expect(brightnessPercent(entity("on", { brightness }))).toBeUndefined(),
);
it("converts valid brightness", () =>
  expect(brightnessPercent(entity("on", { brightness: 128 }))).toBe(50));

it.each(["hs", "xy", "rgb", "rgbw", "rgbww"])("offers direct color for %s lights", (mode) => {
  expect(supportsColor(entity("on", { supported_color_modes: [mode] }))).toBe(true);
});
it.each(["brightness", "color_temp", "white", "onoff"])("omits color controls for %s lights", (mode) => {
  expect(supportsColor(entity("on", { supported_color_modes: [mode] }))).toBe(false);
});
it.each([undefined, [], [NaN, 50], [20, 101], [361, 50], ["red", 50]])("ignores malformed reported color %j", (value) => {
  expect(hsColor(entity("on", { hs_color: value }))).toBeUndefined();
});
