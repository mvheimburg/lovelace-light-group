import { it, expect, vi, afterEach } from "vitest";
import { LightGroupEditor } from "../src/editor";
import { fixture, config } from "./fixture";
import type { CardConfig } from "../src/types";
afterEach(() => document.body.replaceChildren());
async function mount(
  input: CardConfig = { type: "custom:light-group-card", sections: [] },
) {
  const editor = new LightGroupEditor();
  editor.hass = fixture();
  editor.setConfig(input);
  document.body.append(editor);
  await editor.updateComplete;
  return editor;
}
async function click(editor: LightGroupEditor, selector: string) {
  editor.shadowRoot!.querySelector<HTMLButtonElement>(selector)!.click();
  await editor.updateComplete;
}
async function input(
  editor: LightGroupEditor,
  selector: string,
  value: string,
) {
  const node = editor.shadowRoot!.querySelector<HTMLInputElement>(selector)!;
  node.value = value;
  node.dispatchEvent(new Event("change", { bubbles: true }));
  await editor.updateComplete;
}
it("adds sections without mutating the supplied config and emits HA config events", async () => {
  const original: CardConfig = {
    type: "custom:light-group-card",
    sections: [],
  };
  const editor = await mount(original);
  const changed = vi.fn();
  editor.addEventListener("config-changed", changed);
  await click(editor, '[data-action="add-section"]');
  const e = changed.mock.lastCall![0];
  expect(e.bubbles).toBe(true);
  expect(e.composed).toBe(true);
  expect(e.detail.config.sections).toHaveLength(1);
  expect(original.sections).toHaveLength(0);
});
it("keeps a new light draft until valid selection and filters to light entities", async () => {
  const editor = await mount({
    ...config(),
    sections: [{ name: "Room", lights: [] }],
  });
  const changed = vi.fn();
  editor.addEventListener("config-changed", changed);
  await click(editor, '[data-action="add-light"]');
  expect(changed).not.toHaveBeenCalled();
  const selector = editor.shadowRoot!.querySelector(
    "ha-selector",
  ) as HTMLElement & { selector: unknown };
  expect(selector.selector).toEqual({ entity: { domain: "light" } });
  selector.dispatchEvent(
    new CustomEvent("value-changed", {
      detail: { value: "switch.wrong" },
      bubbles: true,
      composed: true,
    }),
  );
  await editor.updateComplete;
  expect(changed).not.toHaveBeenCalled();
  expect(editor.shadowRoot!.textContent).toContain("Choose a valid light");
  selector.dispatchEvent(
    new CustomEvent("value-changed", {
      detail: { value: "light.a" },
      bubbles: true,
      composed: true,
    }),
  );
  await editor.updateComplete;
  expect(changed.mock.lastCall![0].detail.config.sections[0].lights).toEqual([
    { entity: "light.a" },
  ]);
});
it("reorders and removes rooms and lights and edits display bindings", async () => {
  const editor = await mount({
    type: "custom:light-group-card",
    sections: [
      { name: "First", lights: [{ entity: "light.a" }, { entity: "light.b" }] },
      { name: "Second", lights: [] },
    ],
  });
  const changed = vi.fn();
  editor.addEventListener("config-changed", changed);
  await click(editor, '[data-section="0"] [data-action="light-down"]');
  expect(
    changed.mock.lastCall![0].detail.config.sections[0].lights.map(
      (l: { entity: string }) => l.entity,
    ),
  ).toEqual(["light.b", "light.a"]);
  await input(editor, '[name="light-name-0-0"]', "Island");
  await input(editor, '[name="light-icon-0-0"]', "mdi:lamp");
  expect(changed.mock.lastCall![0].detail.config.sections[0].lights[0]).toEqual(
    { entity: "light.b", name: "Island", icon: "mdi:lamp" },
  );
  await click(editor, '[data-section="0"] [data-action="section-down"]');
  expect(changed.mock.lastCall![0].detail.config.sections[0].name).toBe(
    "Second",
  );
  await click(editor, '[data-section="1"] [data-action="remove-light"]');
  expect(
    changed.mock.lastCall![0].detail.config.sections[1].lights,
  ).toHaveLength(1);
  await click(editor, '[data-section="0"] [data-action="remove-section"]');
  expect(changed.mock.lastCall![0].detail.config.sections).toHaveLength(1);
});
it("edits title, icon, appearance and scheme, preserves layout metadata, and updates language", async () => {
  const editor = await mount({ ...config(), grid_options: { columns: 12 } });
  const changed = vi.fn();
  editor.addEventListener("config-changed", changed);
  await input(editor, '[name="title"]', "Mine");
  await input(editor, '[name="icon"]', "mdi:home");
  await input(editor, '[name="appearance"]', "bubble");
  await input(editor, '[name="color_scheme"]', "mint");
  expect(changed.mock.lastCall![0].detail.config).toMatchObject({
    title: "Mine",
    icon: "mdi:home",
    appearance: "bubble",
    color_scheme: "mint",
    grid_options: { columns: 12 },
  });
  editor.hass = { ...editor.hass!, language: "nb_NO" };
  await editor.updateComplete;
  expect(editor.shadowRoot!.textContent).toContain("Legg til rom");
  expect(editor.shadowRoot!.textContent).toContain("Fargevalg");
  expect(
    editor.shadowRoot!.querySelector<HTMLInputElement>('[name="title"]')!.value,
  ).toBe("Mine");
  editor.hass = { ...editor.hass!, language: "en" };
  await editor.updateComplete;
  expect(editor.shadowRoot!.textContent).toContain("Add room");
});
it("does not emit incomplete configuration and can cancel an unfinished light row", async () => {
  const editor = await mount({
    ...config(),
    sections: [{ name: "Room", lights: [] }],
  });
  const changed = vi.fn();
  editor.addEventListener("config-changed", changed);
  await click(editor, '[data-action="add-light"]');
  await input(editor, '[name="title"]', "Draft");
  expect(changed).not.toHaveBeenCalled();
  await click(editor, '[data-action="remove-light"]');
  expect(changed.mock.lastCall![0].detail.config).toMatchObject({
    title: "Draft",
    sections: [{ name: "Room", lights: [] }],
  });
});

it("warns visibly about incomplete rows and translates the warning live", async () => {
  const editor = await mount({
    ...config(),
    sections: [{ name: "Room", lights: [] }],
  });
  await click(editor, '[data-action="add-light"]');
  expect(
    editor.shadowRoot!.querySelector('[role="alert"]')!.textContent,
  ).toContain("before saving");
  editor.hass = { ...editor.hass!, language: "nb" };
  await editor.updateComplete;
  expect(
    editor.shadowRoot!.querySelector('[role="alert"]')!.textContent,
  ).toContain("før du lagrer");
  await click(editor, '[data-action="remove-light"]');
  expect(editor.shadowRoot!.querySelector('[role="alert"]')).toBeNull();
});
it("renders malformed configuration errors with hass assigned after setConfig", async () => {
  const editor = new LightGroupEditor();
  expect(() =>
    editor.setConfig({
      type: "custom:light-group-card",
      sections: [],
    } as CardConfig),
  ).not.toThrow();
  expect(() =>
    editor.setConfig({
      ...config(),
      appearance: "invalid",
    } as unknown as CardConfig),
  ).not.toThrow();
  editor.hass = { ...fixture(), language: "nb" };
  document.body.append(editor);
  await editor.updateComplete;
  expect(
    editor.shadowRoot!.querySelector('[role="alert"]')!.textContent,
  ).toContain("Velg Standard eller Bubble");
  expect(
    editor.shadowRoot!.querySelector('[data-action="add-section"]'),
  ).toBeNull();
  editor.setConfig(config());
  await editor.updateComplete;
  expect(
    editor.shadowRoot!.querySelector('[data-action="add-section"]'),
  ).not.toBeNull();
});

it("edits all-off confirmation without mutating saved configuration and localizes its label", async () => {
  const original = { ...config(), confirm_all_off: false };
  const editor = await mount(original);
  const changed = vi.fn();
  editor.addEventListener("config-changed", changed);
  expect(editor.shadowRoot!.textContent).toContain("Require confirmation for All off");
  await click(editor, '[name="confirm_all_off"]');
  expect(changed.mock.lastCall![0].detail.config.confirm_all_off).toBe(true);
  expect(original.confirm_all_off).toBe(false);
  editor.hass = { ...editor.hass!, language: "no" };
  await editor.updateComplete;
  expect(editor.shadowRoot!.textContent).toContain("Krev bekreftelse for Alt av");
  await click(editor, '[name="confirm_all_off"]');
  expect(changed.mock.lastCall![0].detail.config.confirm_all_off).toBe(false);
});

it("lets the user hide and restore All off without losing confirmation preference", async () => {
  const editor = await mount({ ...config(), confirm_all_off: true });
  const changed = vi.fn();
  editor.addEventListener("config-changed", changed);
  const checkbox = editor.shadowRoot!.querySelector<HTMLInputElement>('[name="show_all_off"]');
  expect(checkbox?.checked).toBe(true);
  await click(editor, '[name="show_all_off"]');
  expect(changed.mock.lastCall![0].detail.config).toMatchObject({ show_all_off: false, confirm_all_off: true });
  editor.hass = { ...editor.hass!, language: "nb" };
  await editor.updateComplete;
  expect(editor.shadowRoot!.textContent).toContain("Vis Alt av-knapp");
  await click(editor, '[name="show_all_off"]');
  expect(changed.mock.lastCall![0].detail.config.show_all_off).toBe(true);
});

it("configures room controls independently without mutating the saved sections", async () => {
  const original = config();
  const editor = await mount(original);
  const changed = vi.fn();
  editor.addEventListener("config-changed", changed);
  expect(editor.shadowRoot!.textContent).toContain("Show room power and brightness controls");
  await click(editor, '[name="section-controls-0"]');
  expect(changed.mock.lastCall![0].detail.config.sections[0].show_controls).toBe(true);
  expect(original.sections[0].show_controls).toBeUndefined();
  editor.hass = { ...editor.hass!, language: "nb" };
  await editor.updateComplete;
  expect(editor.shadowRoot!.textContent).toContain("Vis av/på og lysstyrke for rommet");
});
