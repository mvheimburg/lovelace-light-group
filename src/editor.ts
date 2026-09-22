import { LitElement, css, html, type TemplateResult } from "lit";
import { live } from "lit/directives/live.js";
import { normalizeConfig, TYPE } from "./config";
import { t, type TextKey } from "./localize";
import {
  colorSchemes,
  type CardConfig,
  type HomeAssistant,
  type LightConfig,
  type SectionConfig,
} from "./types";
/** Edits only Lovelace configuration. HA's dashboard owns Save and Cancel. */
export class LightGroupEditor extends LitElement {
  static properties = { hass: { attribute: false } };
  static styles = css`
    :host {
      display: block;
      color: var(--primary-text-color, #202b36);
      font: inherit;
    }
    * {
      box-sizing: border-box;
    }
    p {
      line-height: 1.5;
      color: var(--secondary-text-color, #626976);
    }
    label {
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-size: 14px;
    }
    input,
    select,
    button {
      font: inherit;
      color: inherit;
      min-height: 44px;
      border-radius: 10px;
      border: 1px solid var(--divider-color, #ccc);
      background: var(--card-background-color, #fff);
      padding: 8px 10px;
    }
    button {
      cursor: pointer;
      background: var(--secondary-background-color, #f1f3f6);
    }
    button:disabled {
      opacity: 0.4;
      cursor: default;
    }
    input:focus-visible,
    select:focus-visible,
    button:focus-visible {
      outline: 3px solid var(--primary-color, #507b9b);
      outline-offset: 2px;
    }
    .fields {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 180px), 1fr));
      gap: 12px;
      margin: 12px 0;
    }
    fieldset {
      min-width: 0;
      border: 1px solid var(--divider-color, #ccc);
      border-radius: 14px;
      padding: 12px;
      margin: 16px 0;
    }
    legend {
      padding: 0 6px;
      font-weight: 600;
    }
    .tools {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      margin: 10px 0;
    }
    .light-row {
      border-top: 1px solid var(--divider-color, #ccc);
      padding: 12px 0;
    }
    .error {
      color: var(--error-color, #bd2635);
    }
    ha-selector {
      display: block;
      width: 100%;
      margin: 8px 0;
    }
    .icon-button {
      min-width: 44px;
    }
    ha-icon {
      --mdc-icon-size: 20px;
    }
    .add {
      width: 100%;
      margin-top: 8px;
    }
  `;
  hass?: HomeAssistant;
  private config: CardConfig = { type: TYPE, sections: [] };
  private invalid = false;
  setConfig(config: CardConfig): void {
    this.config = normalizeConfig(config);
    this.invalid = false;
    this.requestUpdate();
  }
  private t(key: TextKey) {
    return t(this.hass, key);
  }
  private change(update: (next: CardConfig) => void): void {
    const next = structuredClone(this.config);
    update(next);
    this.config = next;
    this.invalid = false;
    try {
      const valid = normalizeConfig(next);
      this.dispatchEvent(
        new CustomEvent("config-changed", {
          detail: { config: valid },
          bubbles: true,
          composed: true,
        }),
      );
    } catch {
      // A new selector remains a local draft until the user selects a light.
      this.invalid = next.sections.some((s) =>
        s.lights.some(
          (l) => l.entity !== "" && !/^light\.[a-z0-9_]+$/.test(l.entity),
        ),
      );
    }
    this.requestUpdate();
  }
  private text(
    name: string,
    label: TextKey,
    value: string | undefined,
    change: (value: string) => void,
  ): TemplateResult {
    return html`<label
      >${this.t(label)}<input
        name=${name}
        .value=${live(value ?? "")}
        @change=${(e: Event) => change((e.target as HTMLInputElement).value)}
    /></label>`;
  }
  private move<T>(list: T[], index: number, offset: number): void {
    const to = index + offset;
    if (to < 0 || to >= list.length) return;
    [list[index], list[to]] = [list[to], list[index]];
  }
  private tool(
    action: string,
    label: TextKey,
    icon: string,
    disabled: boolean,
    run: () => void,
    context: string,
  ) {
    return html`<button
      class="icon-button"
      data-action=${action}
      ?disabled=${disabled}
      title=${this.t(label)}
      aria-label=${`${this.t(label)}: ${context}`}
      @click=${run}
    >
      <ha-icon .icon=${icon}></ha-icon>
    </button>`;
  }
  private light(light: LightConfig, s: number, l: number) {
    const count = this.config.sections[s].lights.length;
    const name = light.name || light.entity || this.t("entity");
    return html`<div class="light-row" data-light=${l}>
      <ha-selector
        .hass=${this.hass}
        .selector=${{ entity: { domain: "light" } }}
        .value=${light.entity || undefined}
        .label=${this.t("entity")}
        @value-changed=${(e: CustomEvent<{ value?: string }>) => {
          e.stopPropagation();
          this.change((c) => {
            c.sections[s].lights[l].entity = e.detail.value ?? "";
          });
        }}
      ></ha-selector>
      <div class="fields">
        ${this.text(`light-name-${s}-${l}`, "name", light.name, (value) =>
          this.change((c) => {
            c.sections[s].lights[l].name = value;
          }),
        )}${this.text(`light-icon-${s}-${l}`, "icon", light.icon, (value) =>
          this.change((c) => {
            c.sections[s].lights[l].icon = value;
          }),
        )}
      </div>
      <div class="tools">
        ${this.tool("light-up", "moveUp", "mdi:arrow-up", l === 0, () => this.change((c) => this.move(c.sections[s].lights, l, -1)), name)}
        ${this.tool("light-down", "moveDown", "mdi:arrow-down", l === count - 1, () => this.change((c) => this.move(c.sections[s].lights, l, 1)), name)}
        ${this.tool(
          "remove-light",
          "remove",
          "mdi:delete-outline",
          false,
          () =>
            this.change((c) => {
              c.sections[s].lights.splice(l, 1);
            }),
          name,
        )}
      </div>
    </div>`;
  }
  private section(section: SectionConfig, index: number) {
    return html`<fieldset data-section=${index}>
      <legend>${section.name || this.t("newRoom")}</legend>
      <div class="fields">
        ${this.text(
          `section-name-${index}`,
          "sectionName",
          section.name,
          (value) =>
            this.change((c) => {
              c.sections[index].name = value;
            }),
        )}${this.text(`section-icon-${index}`, "icon", section.icon, (value) =>
          this.change((c) => {
            c.sections[index].icon = value;
          }),
        )}
      </div>
      <div class="tools">
        ${this.tool("section-up", "moveUp", "mdi:arrow-up", index === 0, () => this.change((c) => this.move(c.sections, index, -1)), section.name)}
        ${this.tool("section-down", "moveDown", "mdi:arrow-down", index === this.config.sections.length - 1, () => this.change((c) => this.move(c.sections, index, 1)), section.name)}
        ${this.tool(
          "remove-section",
          "remove",
          "mdi:delete-outline",
          false,
          () =>
            this.change((c) => {
              c.sections.splice(index, 1);
            }),
          section.name,
        )}
      </div>
      ${section.lights.map((light, l) => this.light(light, index, l))}
      <button
        class="add"
        data-action="add-light"
        @click=${() =>
          this.change((c) => {
            c.sections[index].lights.push({ entity: "" });
          })}
      >
        ${this.t("addLight")}
      </button>
    </fieldset>`;
  }
  protected render() {
    return html`
      <p>${this.t("editorHelp")}</p>
      <div class="fields">
        ${this.text("title", "cardTitle", this.config.title, (value) =>
          this.change((c) => {
            c.title = value;
          }),
        )}${this.text("icon", "icon", this.config.icon, (value) =>
          this.change((c) => {
            c.icon = value;
          }),
        )}
        <label
          >${this.t("appearance")}<select
            name="appearance"
            .value=${live(this.config.appearance ?? "default")}
            @change=${(e: Event) =>
              this.change((c) => {
                c.appearance = (e.target as HTMLSelectElement)
                  .value as CardConfig["appearance"];
              })}
          >
            ${(["default", "bubble"] as const).map((v) => html`<option value=${v} ?selected=${v === (this.config.appearance ?? "default")}>${this.t(v)}</option>`)}
          </select></label
        >
        <label
          >${this.t("colorScheme")}<select
            name="color_scheme"
            .value=${live(this.config.color_scheme ?? "home-assistant")}
            @change=${(e: Event) =>
              this.change((c) => {
                c.color_scheme = (e.target as HTMLSelectElement)
                  .value as CardConfig["color_scheme"];
              })}
          >
            ${colorSchemes.map((v) => html`<option value=${v} ?selected=${v === (this.config.color_scheme ?? "home-assistant")}>${this.t(v)}</option>`)}
          </select></label
        >
      </div>
      ${this.invalid ? html`<p class="error" role="alert">${this.t("invalidValue")}</p>` : ""}
      ${this.config.sections.map((s, i) => this.section(s, i))}
      <button
        class="add"
        data-action="add-section"
        @click=${() =>
          this.change((c) => {
            c.sections.push({ name: this.t("newRoom"), lights: [] });
          })}
      >
        ${this.t("addSection")}
      </button>
    `;
  }
}
if (!customElements.get("light-group-card-editor"))
  customElements.define("light-group-card-editor", LightGroupEditor);
