import { it, expect, vi, afterEach } from "vitest";
import { LightGroupCard } from "../src/light-group-card";
import { fixture, config, state } from "./fixture";
import { colorSchemes } from "../src/types";
afterEach(() => {
  document.body.replaceChildren();
  vi.useRealTimers();
});
async function mount() {
  const card = new LightGroupCard();
  card.setConfig(config());
  card.hass = fixture();
  document.body.append(card);
  await card.updateComplete;
  return card;
}
const button = (card: LightGroupCard, selector: string) =>
  card.shadowRoot!.querySelector<HTMLButtonElement>(selector)!;
async function click(card: LightGroupCard, selector: string) {
  button(card, selector).click();
  await card.updateComplete;
  await Promise.resolve();
  await card.updateComplete;
}
const toggle = '[data-entity="light.a"] [data-action="toggle"]';
const details = '[data-entity="light.a"] [data-action="details"]';
it("turns off only configured available on lights once and waits for HA confirmation", async () => {
  const card = await mount();
  await click(card, '[data-action="all-off"]');
  expect(card.hass!.callService).toHaveBeenCalledExactlyOnceWith(
    "light",
    "turn_off",
    { entity_id: ["light.a"] },
  );
  expect(button(card, toggle).disabled).toBe(true);
  expect(
    card.shadowRoot!.querySelectorAll(
      '[data-entity="light.a"] [data-action="toggle"]:disabled',
    ),
  ).toHaveLength(2);
  expect(
    card
      .shadowRoot!.querySelector('[data-entity="light.a"]')!
      .getAttribute("data-state"),
  ).toBe("on");
  card.hass = {
    ...card.hass!,
    states: { ...card.hass!.states, "light.a": state("light.a", "off") },
  };
  await card.updateComplete;
  expect(button(card, toggle).disabled).toBe(false);
});
it("calls explicit single-light service and disables unavailable or disconnected actions", async () => {
  const card = await mount();
  await click(card, '[data-entity="light.b"] [data-action="toggle"]');
  expect(card.hass!.callService).toHaveBeenCalledWith("light", "turn_on", {
    entity_id: "light.b",
  });
  expect(
    button(card, '[data-entity="light.c"] [data-action="toggle"]').disabled,
  ).toBe(true);
  expect(
    button(card, '[data-entity="light.missing"] [data-action="toggle"]')
      .disabled,
  ).toBe(true);
  card.hass = { ...card.hass!, connection: { connected: false } };
  await card.updateComplete;
  expect(button(card, toggle).disabled).toBe(true);
  expect(button(card, '[data-action="configure"]').disabled).toBe(false);
});
it("commits brightness on change, shows pending, restores authoritative value on failure", async () => {
  const card = await mount();
  let reject!: (e: unknown) => void;
  card.hass!.callService = vi.fn(
    () =>
      new Promise((_, r) => {
        reject = r;
      }),
  );
  await click(card, details);
  const slider = card.shadowRoot!.querySelector<HTMLInputElement>(
    'input[type="range"]',
  )!;
  expect(slider.value).toBe("50");
  slider.value = "42";
  slider.dispatchEvent(new Event("input", { bubbles: true }));
  await card.updateComplete;
  expect(card.hass!.callService).not.toHaveBeenCalled();
  slider.dispatchEvent(new Event("change", { bubbles: true }));
  await card.updateComplete;
  expect(card.hass!.callService).toHaveBeenCalledWith("light", "turn_on", {
    entity_id: "light.a",
    brightness_pct: 42,
  });
  expect(slider.disabled).toBe(true);
  reject(new Error("denied"));
  await vi.waitFor(() => expect(slider.disabled).toBe(false));
  expect(slider.value).toBe("50");
  expect(card.shadowRoot!.textContent).toContain("denied");
});
it("omits unsupported brightness and emits more-info", async () => {
  const card = await mount();
  const event = vi.fn();
  card.addEventListener("hass-more-info", event);
  await click(card, '[data-entity="light.b"] [data-action="details"]');
  expect(card.shadowRoot!.querySelector('input[type="range"]')).toBeNull();
  await click(card, '[data-action="more"]');
  expect(event.mock.lastCall![0].detail).toEqual({ entityId: "light.b" });
});
it("handles zero and missing brightness safely", async () => {
  const card = await mount();
  await click(card, details);
  const slider = card.shadowRoot!.querySelector<HTMLInputElement>(
    'input[type="range"]',
  )!;
  slider.value = "0";
  slider.dispatchEvent(new Event("change", { bubbles: true }));
  await card.updateComplete;
  expect(card.hass!.callService).toHaveBeenCalledWith("light", "turn_on", {
    entity_id: "light.a",
    brightness_pct: 0,
  });
  card.setConfig(config());
  card.hass = {
    ...fixture(),
    states: {
      "light.a": state("light.a", "on", {
        supported_color_modes: ["brightness"],
      }),
    },
  };
  await card.updateComplete;
  await click(card, details);
  expect(card.shadowRoot!.textContent).toContain("Brightness not reported");
});
it("supports modal keyboard cancellation, restores focus and closes on config change", async () => {
  const card = await mount();
  const trigger = button(card, details);
  trigger.focus();
  await click(card, details);
  const dialog = card.shadowRoot!.querySelector<HTMLDialogElement>("dialog")!;
  expect(dialog.open).toBe(true);
  expect(card.shadowRoot!.activeElement).not.toBe(trigger);
  dialog.dispatchEvent(new Event("cancel", { cancelable: true }));
  await card.updateComplete;
  expect(dialog.open).toBe(false);
  expect(card.shadowRoot!.activeElement).toBe(trigger);
  await click(card, details);
  card.setConfig({ type: "custom:light-group-card", sections: [] });
  await card.updateComplete;
  expect(card.shadowRoot!.querySelector("dialog")?.hasAttribute("open")).toBe(
    false,
  );
});
it("ignores old request failure after reconfiguration and keeps Configure accessible", async () => {
  const card = await mount();
  let reject!: (e: unknown) => void;
  card.hass!.callService = vi.fn(
    () =>
      new Promise((_, r) => {
        reject = r;
      }),
  );
  await click(card, toggle);
  card.setConfig({ type: "custom:light-group-card", sections: [] });
  reject(new Error("stale"));
  await Promise.resolve();
  await card.updateComplete;
  expect(card.shadowRoot!.textContent).not.toContain("stale");
  await click(card, '[data-action="configure"]');
  expect(card.shadowRoot!.textContent).toContain("Save the dashboard");
});
it.each(["nb", "NB_no", "no", "nn-NO"])(
  "renders language %s and updates live without changing custom names",
  async (language) => {
    const card = await mount();
    card.hass = { ...card.hass!, language };
    await card.updateComplete;
    expect(card.shadowRoot!.textContent).toContain("Alt av");
    expect(card.shadowRoot!.textContent).toContain("Kjøkken");
    card.hass = { ...card.hass!, language: "en-GB" };
    await card.updateComplete;
    expect(card.shadowRoot!.textContent).toContain("All off");
    expect(card.shadowRoot!.textContent).toContain("My home");
  },
);
it.each(colorSchemes)(
  "applies scheme %s and Bubble appearance",
  async (color_scheme) => {
    const card = await mount();
    card.setConfig({ ...config(), appearance: "bubble", color_scheme });
    await card.updateComplete;
    expect(card.getAttribute("appearance")).toBe("bubble");
    expect(card.getAttribute("data-color-scheme")).toBe(
      color_scheme === "home-assistant" ? null : color_scheme,
    );
  },
);

it("renders invalid YAML in the active language even when config arrives before hass", async () => {
  const card = new LightGroupCard();
  expect(() =>
    card.setConfig({
      type: "custom:light-group-card",
      sections: [{ name: "Room", lights: [{ entity: "switch.wrong" }] }],
    }),
  ).not.toThrow();
  card.hass = { ...fixture(), language: "nb" };
  document.body.append(card);
  await card.updateComplete;
  expect(
    card.shadowRoot!.querySelector('[role="alert"]')!.textContent,
  ).toContain("Velg en lysenhet");
  expect(card.shadowRoot!.querySelector('[data-action="toggle"]')).toBeNull();
  expect(button(card, '[data-action="configure"]').disabled).toBe(false);
  card.hass = { ...card.hass!, language: "en" };
  await card.updateComplete;
  expect(
    card.shadowRoot!.querySelector('[role="alert"]')!.textContent,
  ).toContain("Choose a light entity");
  card.setConfig(config());
  await card.updateComplete;
  expect(card.shadowRoot!.querySelector('[role="alert"]')).toBeNull();
  expect(button(card, toggle).disabled).toBe(false);
});
