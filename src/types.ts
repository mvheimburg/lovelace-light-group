export const colorSchemes = [
  "home-assistant",
  "bright",
  "warm",
  "mint",
  "sky",
  "lavender",
] as const;
export type ColorScheme = (typeof colorSchemes)[number];
export interface LightConfig {
  entity: string;
  name?: string;
  icon?: string;
}
export interface SectionConfig {
  show_controls?: boolean;
  name: string;
  icon?: string;
  lights: LightConfig[];
}
export interface CardConfig {
  type: "custom:light-group-card";
  title?: string;
  icon?: string;
  appearance?: "default" | "bubble";
  color_scheme?: ColorScheme;
  confirm_all_off?: boolean;
  show_all_off?: boolean;
  sections: SectionConfig[];
  [key: string]: unknown;
}
export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
}
export interface LanguageContext {
  language?: string;
  locale?: { language?: string; number_format?: string };
}
export interface HomeAssistant extends LanguageContext {
  connection?: { connected: boolean };
  states: Record<string, HassEntity>;
  callService(
    domain: string,
    service: string,
    data: Record<string, unknown>,
  ): Promise<unknown>;
}
