import "../dist/light-group-card.js";
import {
  mdiLightbulbOutline,
  mdiLightbulbGroupOutline,
  mdiLightbulbGroupOffOutline,
  mdiCogOutline,
  mdiClose,
  mdiHomeFloor1,
  mdiHomeFloor2,
  mdiCeilingLight,
  mdiSofa,
  mdiBed,
  mdiDesk,
  mdiCountertop,
  mdiOutdoorLamp,
  mdiBathtubOutline,
  mdiWashingMachine,
  mdiFlower,
  mdiTools,
  mdiControllerClassic,
  mdiLedStripVariant,
  mdiStarFourPoints,
  mdiHanger,
  mdiGarage,
  mdiArrowUp,
  mdiArrowDown,
  mdiDeleteOutline,
} from "@mdi/js";
import type { LightGroupCard } from "../src/light-group-card";
import type {
  CardConfig,
  HassEntity,
  HomeAssistant,
  SectionConfig,
  ColorScheme,
} from "../src/types";
const icons: Record<string, string> = {
  "lightbulb-outline": mdiLightbulbOutline,
  "lightbulb-group-outline": mdiLightbulbGroupOutline,
  "lightbulb-group-off-outline": mdiLightbulbGroupOffOutline,
  "cog-outline": mdiCogOutline,
  close: mdiClose,
  "home-floor-1": mdiHomeFloor1,
  "home-floor-2": mdiHomeFloor2,
  "ceiling-light": mdiCeilingLight,
  sofa: mdiSofa,
  bed: mdiBed,
  desk: mdiDesk,
  countertop: mdiCountertop,
  "outdoor-lamp": mdiOutdoorLamp,
  "bathtub-outline": mdiBathtubOutline,
  "washing-machine": mdiWashingMachine,
  flower: mdiFlower,
  tools: mdiTools,
  "controller-classic": mdiControllerClassic,
  "led-strip-variant": mdiLedStripVariant,
  "star-four-points": mdiStarFourPoints,
  hanger: mdiHanger,
  garage: mdiGarage,
  "arrow-up": mdiArrowUp,
  "arrow-down": mdiArrowDown,
  "delete-outline": mdiDeleteOutline,
};
customElements.define(
  "ha-icon",
  class extends HTMLElement {
    set icon(value: string) {
      this.innerHTML = `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="${icons[value.replace("mdi:", "")] ?? mdiLightbulbOutline}"/></svg>`;
    }
  },
);
const states: Record<string, HassEntity> = {};
let counter = 0;
function room(
  name: string,
  icon: string,
  lights: Array<[string, string?, string?]>,
): SectionConfig {
  return {
    name,
    icon: `mdi:${icon}`,
    lights: lights.map(([name, icon = "ceiling-light", value = "off"]) => {
      const id = `light.demo_${counter++}`;
      states[id] = {
        entity_id: id,
        state: value,
        attributes: {
          friendly_name: name,
          icon: `mdi:${icon}`,
          supported_color_modes: ["brightness"],
          brightness: value === "on" ? 150 : 0,
        },
      };
      return { entity: id };
    }),
  };
}
const configs: CardConfig[] = [
  {
    type: "custom:light-group-card",
    title: "1. etasje",
    icon: "mdi:home-floor-1",
    appearance: "bubble",
    sections: [
      room("Gang, bad og bod", "home-floor-1", [
        ["Korridor", "ceiling-light", "on"],
        ["Bad nede", "bathtub-outline"],
        ["Grovgarderobe", "ceiling-light", "on"],
        ["Vaskerom", "washing-machine"],
        ["Vekstlys", "flower"],
        ["Teknisk", "tools"],
      ]),
      room("Herjerom", "controller-classic", [
        ["Herjerom 1", "led-strip-variant"],
        ["Herjerom 2", "led-strip-variant"],
        ["Herjerom 3", "led-strip-variant"],
      ]),
      room("Soverom", "bed", [
        ["Matilde"],
        ["Matilde vindu", "star-four-points"],
        ["Ludvig"],
        ["Ludvig lampe", "lightbulb-outline", "unavailable"],
        ["Lila"],
      ]),
    ],
  },
  {
    type: "custom:light-group-card",
    title: "2. etasje",
    icon: "mdi:home-floor-2",
    appearance: "bubble",
    sections: [
      room("Kjøkken", "countertop", [
        ["Kjøkkentak"],
        ["Kjøkkenbenk", "led-strip-variant"],
        ["Kjøkkenøy"],
        ["Manhattan"],
        ["Spisebord"],
        ["Stjerne kjøkken", "star-four-points"],
      ]),
      room("Stue og gang", "sofa", [
        ["TV-stue"],
        ["Trappegang"],
        ["Vegg i gang"],
      ]),
      room("Kontor og bad", "desk", [
        ["Kontor", "ceiling-light", "on"],
        ["Bad tak"],
        ["Bad speil"],
        ["Bad pendel"],
      ]),
      room("Soverom", "bed", [
        ["Sov voksen"],
        ["Vindu voksen", "star-four-points"],
        ["Garderobe", "hanger"],
      ]),
    ],
  },
  {
    type: "custom:light-group-card",
    title: "Ute og uthus",
    icon: "mdi:outdoor-lamp",
    appearance: "bubble",
    sections: [
      room("", "outdoor-lamp", [
        ["Utelys dør", "outdoor-lamp"],
        ["Nude"],
        ["Tak ute", "outdoor-lamp"],
        ["Verksted tak", "garage"],
      ]),
    ],
  },
];
let failure = false;
let delay = false;
const hass: HomeAssistant = {
  language: "nb",
  locale: { language: "nb-NO" },
  connection: { connected: true },
  states,
  async callService(_domain, service, data) {
    const fail = failure;
    const slow = delay;
    failure = false;
    delay = false;
    await new Promise((resolve) => setTimeout(resolve, slow ? 5000 : 500));
    if (fail) throw new Error("Simulated device rejection");
    const ids = Array.isArray(data.entity_id)
      ? data.entity_id
      : [data.entity_id];
    for (const id of ids as string[]) {
      const old = hass.states[id];
      hass.states[id] = {
        ...old,
        state:
          service === "turn_off" || data.brightness_pct === 0 ? "off" : "on",
        attributes: {
          ...old.attributes,
          brightness:
            typeof data.brightness_pct === "number"
              ? Math.round((data.brightness_pct * 255) / 100)
              : old.attributes.brightness || 200,
        },
      };
    }
    update();
  },
};
const cards: LightGroupCard[] = [];
function add(config: CardConfig, target: string) {
  const card = document.createElement("light-group-card") as LightGroupCard;
  card.setConfig(config);
  card.hass = hass;
  document.querySelector(target)!.append(card);
  cards.push(card);
  return card;
}
function update() {
  for (const card of cards) card.hass = { ...hass, states: { ...hass.states } };
}
for (const config of configs) add(config, "#cards");
document
  .querySelector("#theme")!
  .addEventListener("click", () => document.body.classList.toggle("dark"));
document.querySelector("#language")!.addEventListener("click", () => {
  hass.language = hass.language === "nb" ? "en" : "nb";
  update();
});
document.querySelector("#offline")!.addEventListener("click", () => {
  hass.connection = { connected: !hass.connection!.connected };
  update();
});
document.querySelector("#failure")!.addEventListener("click", () => {
  failure = true;
});
document.querySelector("#pending")!.addEventListener("click", () => {
  delay = true;
});
document.querySelector("#appearance")!.addEventListener("click", () =>
  configs.forEach((c, i) => {
    c.appearance = c.appearance === "bubble" ? "default" : "bubble";
    cards[i].setConfig(c);
  }),
);
document.querySelector("#schemes")!.addEventListener("click", () => {
  if (document.querySelector("#scheme-gallery")!.children.length) return;
  for (const color_scheme of [
    "home-assistant",
    "bright",
    "warm",
    "mint",
    "sky",
    "lavender",
  ] as ColorScheme[])
    add(
      {
        ...configs[0],
        title: color_scheme,
        color_scheme,
        sections: [configs[0].sections[0]],
      },
      "#scheme-gallery",
    );
});
// Preview-only HA dialog acknowledgement; the actual card dispatches HA's public event.
document.addEventListener("hass-more-info", () => {
  document.querySelector(".intro")!.textContent =
    "Home Assistant more-info requested (simulated preview)";
});
