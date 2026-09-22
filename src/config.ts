import {
  colorSchemes,
  type CardConfig,
  type LightConfig,
  type SectionConfig,
} from "./types";
export const TYPE = "custom:light-group-card" as const;
function object(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new Error("Invalid configuration");
  return input as Record<string, unknown>;
}
function optional(input: Record<string, unknown>, key: string): void {
  if (input[key] !== undefined && typeof input[key] !== "string")
    throw new Error(`Invalid ${key}`);
}
export function normalizeConfig(input: unknown): CardConfig {
  const c = object(input);
  if (c.type !== TYPE) throw new Error("Invalid card type");
  for (const key of ["title", "icon"]) optional(c, key);
  if (
    c.appearance !== undefined &&
    !["default", "bubble"].includes(String(c.appearance))
  )
    throw new Error("Invalid appearance");
  if (
    c.color_scheme !== undefined &&
    !colorSchemes.includes(c.color_scheme as (typeof colorSchemes)[number])
  )
    throw new Error("Invalid color_scheme");
  const sections = c.sections ?? [];
  if (!Array.isArray(sections)) throw new Error("Invalid sections");
  return {
    ...c,
    type: TYPE,
    sections: sections.map((value): SectionConfig => {
      const s = object(value);
      if (typeof s.name !== "string" || !Array.isArray(s.lights))
        throw new Error("Invalid room");
      optional(s, "icon");
      return {
        ...s,
        name: s.name,
        lights: s.lights.map((value): LightConfig => {
          const l = object(value);
          if (
            typeof l.entity !== "string" ||
            !/^light\.[a-z0-9_]+$/.test(l.entity)
          )
            throw new Error("Invalid light entity");
          optional(l, "name");
          optional(l, "icon");
          return { ...l, entity: l.entity };
        }),
      };
    }),
  };
}
