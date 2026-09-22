import {
  colorSchemes,
  type CardConfig,
  type LightConfig,
  type SectionConfig,
} from "./types";
export type ConfigErrorCode =
  | "invalidConfig"
  | "invalidType"
  | "invalidAppearance"
  | "invalidScheme"
  | "invalidSections"
  | "invalidRoom"
  | "invalidLight"
  | "invalidText";
export class ConfigValidationError extends Error {
  constructor(readonly code: ConfigErrorCode) {
    super(code);
  }
}
export const TYPE = "custom:light-group-card" as const;
function object(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new ConfigValidationError("invalidConfig");
  return input as Record<string, unknown>;
}
function optional(input: Record<string, unknown>, key: string): void {
  if (input[key] !== undefined && typeof input[key] !== "string")
    throw new ConfigValidationError("invalidText");
}
export function normalizeConfig(input: unknown): CardConfig {
  const c = object(input);
  if (c.type !== TYPE) throw new ConfigValidationError("invalidType");
  for (const key of ["title", "icon"]) optional(c, key);
  if (
    c.appearance !== undefined &&
    !["default", "bubble"].includes(String(c.appearance))
  )
    throw new ConfigValidationError("invalidAppearance");
  if (
    c.color_scheme !== undefined &&
    !colorSchemes.includes(c.color_scheme as (typeof colorSchemes)[number])
  )
    throw new ConfigValidationError("invalidScheme");
  const sections = c.sections ?? [];
  if (!Array.isArray(sections))
    throw new ConfigValidationError("invalidSections");
  return {
    ...c,
    type: TYPE,
    sections: sections.map((value): SectionConfig => {
      const s = object(value);
      if (typeof s.name !== "string" || !Array.isArray(s.lights))
        throw new ConfigValidationError("invalidRoom");
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
            throw new ConfigValidationError("invalidLight");
          optional(l, "name");
          optional(l, "icon");
          return { ...l, entity: l.entity };
        }),
      };
    }),
  };
}
