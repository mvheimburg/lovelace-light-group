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
    'dialog input[type="range"]',
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
  expect(card.shadowRoot!.querySelector('dialog input[type="range"]')).toBeNull();
  await click(card, '[data-action="more"]');
  expect(event.mock.lastCall![0].detail).toEqual({ entityId: "light.b" });
});
it("handles zero and missing brightness safely", async () => {
  const card = await mount();
  await click(card, details);
  const slider = card.shadowRoot!.querySelector<HTMLInputElement>(
    'dialog input[type="range"]',
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

it("requires optional confirmation, supports cancellation and translates the prompt live", async () => {
  const card = await mount();
  card.setConfig({ ...config(), title: "1. etasje", confirm_all_off: true });
  await card.updateComplete;
  await click(card, '[data-action="all-off"]');
  expect(card.hass!.callService).not.toHaveBeenCalled();
  expect(card.shadowRoot!.querySelector("dialog")!.open).toBe(true);
  expect(card.shadowRoot!.textContent).toContain("Turn off all lights in 1. etasje?");
  card.hass = { ...card.hass!, language: "nb_NO" };
  await card.updateComplete;
  expect(card.shadowRoot!.textContent).toContain("Slå av alt lys i 1. etasje?");
  await click(card, '[data-action="cancel-all-off"]');
  expect(card.hass!.callService).not.toHaveBeenCalled();
  await click(card, '[data-action="all-off"]');
  await click(card, '[data-action="confirm-all-off"]');
  expect(card.hass!.callService).toHaveBeenCalledExactlyOnceWith(
    "light", "turn_off", { entity_id: ["light.a"] },
  );
});

it("rechecks availability while confirmation is open and closes it on config changes", async () => {
  const card = await mount();
  card.setConfig({ ...config(), confirm_all_off: true });
  await card.updateComplete;
  await click(card, '[data-action="all-off"]');
  expect(card.hass!.callService).not.toHaveBeenCalled();
  card.hass = { ...card.hass!, connection: { connected: false } };
  await card.updateComplete;
  expect(button(card, '[data-action="confirm-all-off"]').disabled).toBe(true);
  await click(card, '[data-action="confirm-all-off"]');
  expect(card.hass!.callService).not.toHaveBeenCalled();
  card.setConfig(config());
  await card.updateComplete;
  expect(card.shadowRoot!.querySelector("dialog")?.open ?? false).toBe(false);
});


it("dims directly on the tile, waits for release and restores HA brightness after failure", async () => {
  const card = await mount();
  const slider = card.shadowRoot!.querySelector<HTMLInputElement>('[data-entity="light.a"] input[type="range"]');
  expect(slider).not.toBeNull();
  expect(card.shadowRoot!.querySelector('[data-entity="light.b"] input[type="range"]')).toBeNull();
  expect(slider!.value).toBe("50");
  let reject!: (error: Error) => void;
  card.hass!.callService = vi.fn(() => new Promise((_, fail) => { reject = fail; }));
  slider!.value = "37";
  slider!.dispatchEvent(new Event("input", { bubbles: true }));
  await card.updateComplete;
  expect(card.hass!.callService).not.toHaveBeenCalled();
  expect(slider!.value).toBe("37");
  slider!.dispatchEvent(new Event("change", { bubbles: true }));
  await card.updateComplete;
  expect(card.hass!.callService).toHaveBeenCalledExactlyOnceWith("light", "turn_on", { entity_id: "light.a", brightness_pct: 37 });
  expect(slider!.disabled).toBe(true);
  reject(new Error("denied"));
  await vi.waitFor(() => expect(slider!.disabled).toBe(false));
  expect(slider!.value).toBe("50");
  card.hass = { ...card.hass!, language: "nb", connection: { connected: false } };
  await card.updateComplete;
  expect(slider!.disabled).toBe(true);
  expect(slider!.getAttribute("aria-label")).toBe("Lysstyrke: Kitchen ceiling");
});

it("supports explicit confirmation opt-out and cancels confirmation with Escape", async () => {
  const card = await mount();
  card.setConfig({ ...config(), confirm_all_off: true });
  await card.updateComplete;
  const trigger = button(card, '[data-action="all-off"]');
  trigger.focus();
  await click(card, '[data-action="all-off"]');
  card.shadowRoot!.querySelector("dialog")!.dispatchEvent(new Event("cancel", { cancelable: true }));
  await card.updateComplete;
  expect(card.hass!.callService).not.toHaveBeenCalled();
  expect(card.shadowRoot!.activeElement).toBe(trigger);
  card.setConfig({ ...config(), confirm_all_off: false });
  await card.updateComplete;
  await click(card, '[data-action="all-off"]');
  expect(card.hass!.callService).toHaveBeenCalledExactlyOnceWith("light", "turn_off", { entity_id: ["light.a"] });
});

it("uses current targets on confirmation instead of the lights on when the dialog opened", async () => {
  const card = await mount();
  card.setConfig({ ...config(), confirm_all_off: true });
  await card.updateComplete;
  await click(card, '[data-action="all-off"]');
  card.hass = { ...card.hass!, states: { ...card.hass!.states, "light.a": state("light.a", "off"), "light.b": state("light.b", "on") } };
  await card.updateComplete;
  await click(card, '[data-action="confirm-all-off"]');
  expect(card.hass!.callService).toHaveBeenCalledExactlyOnceWith("light", "turn_off", { entity_id: ["light.b"] });
});

it("can hide All off while retaining individual light controls", async () => {
  const card = await mount();
  card.setConfig({ ...config(), show_all_off: false });
  await card.updateComplete;
  expect(card.shadowRoot!.querySelector('[data-action="all-off"]')).toBeNull();
  await click(card, toggle);
  expect(card.hass!.callService).toHaveBeenCalledExactlyOnceWith("light", "turn_off", { entity_id: "light.a" });
});

it("preserves an active slider drag when another light request completes", async () => {
  const card = await mount();
  await click(card, '[data-entity="light.b"] [data-action="toggle"]');
  const slider = card.shadowRoot!.querySelector<HTMLInputElement>('[data-entity="light.a"] input')!;
  slider.value = "37";
  slider.dispatchEvent(new Event("input"));
  await card.updateComplete;
  card.hass = { ...card.hass!, states: { ...card.hass!.states, "light.b": state("light.b", "on") } };
  await card.updateComplete;
  expect(slider.value).toBe("37");
});

it("discards an interrupted drag when HA disconnects", async () => {
  const card = await mount();
  const slider = card.shadowRoot!.querySelector<HTMLInputElement>('[data-entity="light.a"] input')!;
  slider.value = "37";
  slider.dispatchEvent(new Event("input"));
  await card.updateComplete;
  card.hass = { ...card.hass!, connection: { connected: false } };
  await card.updateComplete;
  slider.dispatchEvent(new Event("change"));
  card.hass = { ...fixture(), states: { "light.a": state("light.a", "on", { brightness: 204, supported_color_modes: ["brightness"] }) } };
  await card.updateComplete;
  expect(slider.value).toBe("80");
  expect(card.hass!.callService).not.toHaveBeenCalled();
});

it.each(["inline", "popup"])("turns an off dimmable light on from zero using the %s slider", async (surface) => {
  const card = await mount();
  card.hass = { ...fixture(), states: { "light.a": state("light.a", "off", { brightness: 128, supported_color_modes: ["brightness"] }) } };
  await card.updateComplete;
  if (surface === "popup") await click(card, details);
  const selector = surface === "popup" ? 'dialog input[type="range"]' : '[data-entity="light.a"] input[type="range"]';
  const slider = card.shadowRoot!.querySelector<HTMLInputElement>(selector)!;
  expect(slider.value).toBe("0");
  expect(slider.disabled).toBe(false);
  slider.value = "35";
  slider.dispatchEvent(new Event("change"));
  await card.updateComplete;
  expect(card.hass!.callService).toHaveBeenCalledExactlyOnceWith("light", "turn_on", { entity_id: "light.a", brightness_pct: 35 });
});

it("offers color directly in the popup and waits for HA color confirmation", async () => {
  const card = await mount();
  card.hass = { ...fixture(), states: { "light.a": state("light.a", "on", { supported_color_modes: ["rgb"], hs_color: [120, 70], brightness: 128 }) } };
  await card.updateComplete;
  await click(card, details);
  const hue = card.shadowRoot!.querySelector<HTMLInputElement>('[data-control="hue"]');
  expect(hue).not.toBeNull();
  expect(hue!.value).toBe("120");
  hue!.value = "240";
  hue!.dispatchEvent(new Event("input"));
  await card.updateComplete;
  expect(card.hass!.callService).not.toHaveBeenCalled();
  hue!.dispatchEvent(new Event("change"));
  await card.updateComplete;
  expect(card.hass!.callService).toHaveBeenCalledExactlyOnceWith("light", "turn_on", { entity_id: "light.a", hs_color: [240, 70] });
  expect(hue!.disabled).toBe(true);
  card.hass = { ...card.hass!, states: { "light.a": state("light.a", "on", { supported_color_modes: ["rgb"], hs_color: [240, 70], brightness: 128 }) } };
  await card.updateComplete;
  expect(hue!.disabled).toBe(false);
  card.hass = { ...card.hass!, language: "nb_NO" };
  await card.updateComplete;
  expect(hue!.getAttribute("aria-label")).toBe("Fargetone");
});

it("restores reported color on failure and omits color for non-color lights", async () => {
  const card = await mount();
  await click(card, details);
  expect(card.shadowRoot!.querySelector('[data-control="hue"]')).toBeNull();
  card.hass = { ...fixture(), states: { "light.a": state("light.a", "on", { supported_color_modes: ["hs"], hs_color: [30, 80] }) }, callService: vi.fn(async () => { throw new Error("denied"); }) };
  await card.updateComplete;
  const saturation = card.shadowRoot!.querySelector<HTMLInputElement>('[data-control="saturation"]');
  expect(saturation).not.toBeNull();
  saturation!.value = "40";
  saturation!.dispatchEvent(new Event("change"));
  await vi.waitFor(() => expect(saturation!.value).toBe("80"));
  expect(card.shadowRoot!.textContent).toContain("denied");
  card.hass = { ...card.hass!, connection: { connected: false } };
  await card.updateComplete;
  expect(saturation!.disabled).toBe(true);
});

it("provides opt-in room power controls scoped to unique available members", async () => {
  const card = await mount();
  expect(card.shadowRoot!.querySelector('[data-action="room-toggle"]')).toBeNull();
  const c = config();
  card.setConfig({ ...c, sections: [{ ...c.sections[0], show_controls: true }] });
  await card.updateComplete;
  await click(card, '[data-action="room-toggle"]');
  expect(card.hass!.callService).toHaveBeenCalledExactlyOnceWith("light", "turn_off", { entity_id: ["light.a"] });
});

it("dims all available dimmable room lights including off lights without touching on/off-only lights", async () => {
  const card = await mount();
  const c = config();
  card.setConfig({ ...c, sections: [{ ...c.sections[0], show_controls: true, lights: [...c.sections[0].lights, { entity: "light.d" }] }] });
  card.hass = { ...fixture(), states: { ...fixture().states, "light.d": state("light.d", "off", { supported_color_modes: ["brightness"] }) } };
  await card.updateComplete;
  const slider = card.shadowRoot!.querySelector<HTMLInputElement>('[data-control="room-brightness"]');
  expect(slider).not.toBeNull();
  expect(slider!.value).toBe("25");
  slider!.value = "60";
  slider!.dispatchEvent(new Event("input"));
  await card.updateComplete;
  expect(card.hass!.callService).not.toHaveBeenCalled();
  slider!.dispatchEvent(new Event("change"));
  await card.updateComplete;
  expect(card.hass!.callService).toHaveBeenCalledExactlyOnceWith("light", "turn_on", { entity_id: ["light.a", "light.d"], brightness_pct: 60 });
  expect(slider!.disabled).toBe(true);
  expect(button(card, toggle).disabled).toBe(true);
});

it("uses the configured confirmation for room off and names that room", async () => {
  const card = await mount();
  const c = config();
  card.setConfig({ ...c, confirm_all_off: true, sections: [{ ...c.sections[0], show_controls: true }] });
  await card.updateComplete;
  await click(card, '[data-action="room-toggle"]');
  expect(card.hass!.callService).not.toHaveBeenCalled();
  expect(card.shadowRoot!.querySelector("dialog")!.textContent).toContain("Kjøkken?");
  await click(card, '[data-action="confirm-all-off"]');
  expect(card.hass!.callService).toHaveBeenCalledExactlyOnceWith("light", "turn_off", { entity_id: ["light.a"] });
});

it("turns an entirely off room on and disables room actions while disconnected", async () => {
  const card = await mount();
  card.setConfig({ ...config(), sections: [{ name: "Herjerom", show_controls: true, lights: [{ entity: "light.a" }, { entity: "light.b" }] }] });
  card.hass = { ...fixture(), states: { ...fixture().states, "light.a": state("light.a", "off", { supported_color_modes: ["brightness"] }) } };
  await card.updateComplete;
  await click(card, '[data-action="room-toggle"]');
  expect(card.hass!.callService).toHaveBeenCalledExactlyOnceWith("light", "turn_on", { entity_id: ["light.a", "light.b"] });
  card.hass = { ...card.hass!, connection: { connected: false } };
  await card.updateComplete;
  expect(button(card, '[data-action="room-toggle"]').disabled).toBe(true);
  expect(card.shadowRoot!.querySelector<HTMLInputElement>('[data-control="room-brightness"]')!.disabled).toBe(true);
});

it("retains the room brightness request through unrelated updates and restores it on failure", async () => {
  const card = await mount();
  const c = config();
  card.setConfig({ ...c, sections: [{ ...c.sections[0], show_controls: true }] });
  let reject!: (error: Error) => void;
  card.hass!.callService = vi.fn(() => new Promise((_, fail) => { reject = fail; }));
  await card.updateComplete;
  const slider = card.shadowRoot!.querySelector<HTMLInputElement>('[data-control="room-brightness"]')!;
  slider.value = "65";
  slider.dispatchEvent(new Event("change"));
  await card.updateComplete;
  card.hass = { ...card.hass! };
  await card.updateComplete;
  expect(slider.value).toBe("65");
  reject(new Error("denied"));
  await vi.waitFor(() => expect(slider.disabled).toBe(false));
  expect(slider.value).toBe("50");
  expect(card.shadowRoot!.textContent).toContain("denied");
});

it("clears unsubmitted color on disconnect and when selecting another light", async () => {
  const card = await mount();
  card.hass = { ...fixture(), states: { "light.a": state("light.a", "on", { supported_color_modes: ["hs"], hs_color: [30, 80] }) } };
  await card.updateComplete;
  await click(card, details);
  const hue = card.shadowRoot!.querySelector<HTMLInputElement>('[data-control="hue"]')!;
  hue.value = "240";
  hue.dispatchEvent(new Event("input"));
  await card.updateComplete;
  card.hass = { ...card.hass!, connection: { connected: false } };
  await card.updateComplete;
  expect(hue.value).toBe("30");
  expect(card.hass!.callService).not.toHaveBeenCalled();
  await click(card, '[data-action="close"]');
  await click(card, '[data-entity="light.b"] [data-action="details"]');
  expect(card.shadowRoot!.querySelector('[data-control="hue"]')).toBeNull();
});
