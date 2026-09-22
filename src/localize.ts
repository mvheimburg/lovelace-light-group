import type { LanguageContext } from "./types";
const en = {
  title: "Lights",
  allOff: "All off",
  configure: "Configure",
  on: "On",
  off: "Off",
  unavailable: "Unavailable",
  turnOn: "Turn on",
  turnOff: "Turn off",
  pending: "Updating…",
  failed: "Could not update lights",
  timeout: "No confirmation from the light. Check its state and try again.",
  brightness: "Brightness",
  unknownBrightness: "Brightness not reported",
  more: "More controls",
  close: "Close",
  details: "Light controls",
  setup: "Choose lights and room sections in the visual card editor.",
  configureHelp:
    "To choose lights, room sections and appearance, edit this dashboard, select Edit on this card, and use the visual editor. Save the dashboard to keep your changes; Cancel leaves saved settings unchanged.",
  name: "Name",
  icon: "Icon",
  cardTitle: "Title",
  sectionName: "Room name",
  entity: "Light entity",
  appearance: "Appearance",
  default: "Default",
  bubble: "Bubble",
  addSection: "Add room",
  addLight: "Add light",
  remove: "Remove",
  moveUp: "Move up",
  moveDown: "Move down",
  invalidValue:
    "Choose a valid light entity and check the configuration fields.",
  newRoom: "Room",
  editorHelp:
    "Arrange your rooms and lights below. Changes are saved with the dashboard.",
  colorScheme: "Color scheme",
  "home-assistant": "Home Assistant",
  bright: "Bright",
  warm: "Warm",
  mint: "Mint",
  sky: "Sky",
  lavender: "Lavender",
};
const nb: Record<keyof typeof en, string> = {
  title: "Lys",
  allOff: "Alt av",
  configure: "Konfigurer",
  on: "På",
  off: "Av",
  unavailable: "Utilgjengelig",
  turnOn: "Slå på",
  turnOff: "Slå av",
  pending: "Oppdaterer …",
  failed: "Kunne ikke endre lysene",
  timeout: "Ingen bekreftelse fra lyset. Kontroller tilstanden og prøv igjen.",
  brightness: "Lysstyrke",
  unknownBrightness: "Lysstyrke er ikke oppgitt",
  more: "Flere kontroller",
  close: "Lukk",
  details: "Lyskontroller",
  setup: "Velg lys og rom i den visuelle korteditoren.",
  configureHelp:
    "For å velge lys, rom og utseende, rediger dashbordet, velg Rediger på dette kortet og bruk den visuelle editoren. Lagre dashbordet for å beholde endringene. Avbryt lar lagrede innstillinger være uendret.",
  name: "Navn",
  icon: "Ikon",
  cardTitle: "Tittel",
  sectionName: "Romnavn",
  entity: "Lysenhet",
  appearance: "Utseende",
  default: "Standard",
  bubble: "Bubble",
  addSection: "Legg til rom",
  addLight: "Legg til lys",
  remove: "Fjern",
  moveUp: "Flytt opp",
  moveDown: "Flytt ned",
  invalidValue: "Velg en gyldig lysenhet og kontroller feltene i oppsettet.",
  newRoom: "Rom",
  editorHelp: "Organiser rom og lys nedenfor. Endringer lagres med dashbordet.",
  colorScheme: "Fargevalg",
  "home-assistant": "Home Assistant",
  bright: "Lys",
  warm: "Varm",
  mint: "Mint",
  sky: "Himmelblå",
  lavender: "Lavendel",
};
export type TextKey = keyof typeof en;
export function t(hass: LanguageContext | undefined, key: TextKey): string {
  const lang = (hass?.language || hass?.locale?.language || "en")
    .toLowerCase()
    .replace(/_/g, "-")
    .split("-")[0];
  return (["nb", "no", "nn"].includes(lang) ? nb : en)[key];
}
export function formatPercent(
  hass: LanguageContext | undefined,
  value: number,
): string {
  let locale = (hass?.locale?.language || hass?.language || "en")
    .replace(/_/g, "-")
    .replace(/^(no|nn)(?=-|$)/i, "nb");
  const preference = hass?.locale?.number_format;
  const formats: Record<string, string> = {
    comma_decimal: "en-US",
    decimal_comma: "de-DE",
    space_comma: "nb-NO",
    none: "en-US",
  };
  locale = formats[preference ?? ""] ?? locale;
  const options: Intl.NumberFormatOptions = {
    style: "percent",
    maximumFractionDigits: 1,
    useGrouping: preference !== "none",
  };
  try {
    return new Intl.NumberFormat(locale, options).format(value / 100);
  } catch {
    return new Intl.NumberFormat("en", options).format(value / 100);
  }
}
