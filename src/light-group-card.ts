import { LitElement, html, nothing, type PropertyValues } from "lit";
import { live } from "lit/directives/live.js";
import {
  normalizeConfig,
  ConfigValidationError,
  type ConfigErrorCode,
  TYPE,
} from "./config";
import { t, formatPercent, type TextKey } from "./localize";
import {
  available,
  allOffTargets,
  brightnessPercent,
  supportsBrightness,
} from "./model";
import { Requests, type Expected } from "./requests";
import { styles } from "./styles";
import type { CardConfig, HomeAssistant, LightConfig } from "./types";
export class LightGroupCard extends LitElement {
  static styles = styles;
  static properties = { hass: { attribute: false } };
  hass?: HomeAssistant;
  private config: CardConfig = { type: TYPE, sections: [] };
  private configError?: ConfigErrorCode;
  private selected?: LightConfig;
  private configuring = false;
  private confirmingAllOff = false;
  private trigger?: HTMLElement;
  private draft?: number;
  private inlineDrafts = new Map<string, number>();
  private inlinePending = new Set<string>();
  private requests = new Requests(() => {
    for (const id of this.inlineDrafts.keys()) {
      if (this.requests.pending(id)) this.inlinePending.add(id);
      else if (this.inlinePending.delete(id)) this.inlineDrafts.delete(id);
    }
    if (
      this.requests?.error ||
      !this.selected ||
      !this.requests.pending(this.selected.entity)
    )
      this.draft = undefined;
    this.requestUpdate();
  });
  setConfig(input: unknown): void {
    this.close();
    this.configError = undefined;
    try {
      this.config = normalizeConfig(input);
    } catch (error) {
      if (!(error instanceof ConfigValidationError)) throw error;
      this.config = { type: TYPE, sections: [] };
      this.configError = error.code;
    }
    this.inlineDrafts.clear();
    this.inlinePending.clear();
    this.requests.reset();
    this.requestUpdate();
  }
  static getStubConfig(): CardConfig {
    return { type: TYPE, sections: [] };
  }
  static async getConfigElement(): Promise<HTMLElement> {
    await import("./editor");
    return document.createElement("light-group-card-editor");
  }
  getCardSize(): number {
    return Math.max(
      2,
      1 +
        this.config.sections.reduce(
          (n, s) => n + 1 + Math.ceil(s.lights.length / 2),
          0,
        ),
    );
  }
  private t(key: TextKey): string {
    return t(this.hass, key);
  }
  protected willUpdate(changed: PropertyValues): void {
    if (changed.has("hass")) {
      for (const id of this.inlineDrafts.keys()) {
        if (!this.hass || !available(this.hass, id)) {
          this.inlineDrafts.delete(id);
          this.inlinePending.delete(id);
        }
      }
      if (this.hass) this.requests.reconcile(this.hass.states);
    }
    this.setAttribute("appearance", this.config.appearance ?? "default");
    if (
      !this.config.color_scheme ||
      this.config.color_scheme === "home-assistant"
    )
      this.removeAttribute("data-color-scheme");
    else this.setAttribute("data-color-scheme", this.config.color_scheme);
  }
  protected updated(): void {
    const dialog = this.renderRoot.querySelector<HTMLDialogElement>("dialog");
    if ((this.selected || this.configuring || this.confirmingAllOff) && dialog && !dialog.open)
      dialog.showModal();
  }
  disconnectedCallback(): void {
    this.close();
    this.inlineDrafts.clear();
    this.inlinePending.clear();
    this.requests.reset();
    super.disconnectedCallback();
  }
  private name(light: LightConfig): string {
    const friendly = this.hass?.states[light.entity]?.attributes.friendly_name;
    return (
      light.name || (typeof friendly === "string" ? friendly : light.entity)
    );
  }
  private enabled(id: string): boolean {
    return (
      !!this.hass && available(this.hass, id) && !this.requests.pending(id)
    );
  }
  private status(id: string): string {
    if (!this.hass || !available(this.hass, id)) return this.t("unavailable");
    if (this.requests.pending(id)) return this.t("pending");
    return this.t(this.hass.states[id].state === "on" ? "on" : "off");
  }
  private send(
    ids: string[],
    expected: Expected,
    service: string,
    data: Record<string, unknown>,
  ): void {
    const hass = this.hass;
    if (!hass || ids.some((id) => !this.enabled(id))) return;
    this.requests.start(ids, expected, () =>
      hass.callService("light", service, data),
    );
  }
  private toggle(id: string): void {
    const on = this.hass?.states[id]?.state === "on";
    this.send([id], { state: on ? "off" : "on" }, on ? "turn_off" : "turn_on", {
      entity_id: id,
    });
  }
  private requestAllOff(event: Event): void {
    if (this.config.confirm_all_off) {
      this.trigger = event.currentTarget as HTMLElement;
      this.confirmingAllOff = true;
      this.requestUpdate();
    } else this.allOff();
  }
  private allOff(): void {
    if (
      !this.hass ||
      this.config.sections.some((s) =>
        s.lights.some((l) => this.requests.pending(l.entity)),
      )
    )
      return;
    const ids = allOffTargets(this.config, this.hass);
    if (ids.length)
      this.send(ids, { state: "off" }, "turn_off", { entity_id: ids });
  }
  private open(light: LightConfig | undefined, event: Event): void {
    this.trigger = event.currentTarget as HTMLElement;
    this.selected = light;
    this.configuring = !light;
    this.draft = undefined;
    this.requestUpdate();
  }
  private close(): void {
    this.renderRoot?.querySelector<HTMLDialogElement>("dialog")?.close();
    this.selected = undefined;
    this.configuring = false;
    this.confirmingAllOff = false;
    this.draft = undefined;
    if (this.trigger?.isConnected) this.trigger.focus();
    this.trigger = undefined;
    this.requestUpdate();
  }
  private more(): void {
    const id = this.selected?.entity;
    if (!id || !this.hass || !available(this.hass, id)) return;
    this.close();
    this.dispatchEvent(
      new CustomEvent("hass-more-info", {
        detail: { entityId: id },
        bubbles: true,
        composed: true,
      }),
    );
  }
  private brightness(event: Event, commit: boolean, inlineId?: string): void {
    const id = inlineId ?? this.selected?.entity;
    const value = Number((event.target as HTMLInputElement).value);
    if (
      !id ||
      !this.enabled(id) ||
      !supportsBrightness(this.hass?.states[id]) ||
      !Number.isFinite(value) ||
      value < 0 ||
      value > 100
    )
      return;
    if (inlineId) this.inlineDrafts.set(inlineId, value);
    else this.draft = value;
    this.requestUpdate();
    if (commit)
      this.send(
        [id],
        { state: value === 0 ? "off" : "on", brightnessPct: value },
        "turn_on",
        { entity_id: id, brightness_pct: value },
      );
  }
  private error() {
    return this.requests.error
      ? html`<p class="error" role="alert">
          ${this.t(this.requests.error)}${this.requests.errorDetail ? html` — ${this.requests.errorDetail}` : nothing}
        </p>`
      : nothing;
  }
  private light(light: LightConfig) {
    const id = light.entity;
    const entity = this.hass?.states[id];
    const valid = !!this.hass && available(this.hass, id);
    const on = entity?.state === "on";
    const brightness = this.inlineDrafts.get(id) ?? (entity?.state === "off" ? 0 : brightnessPercent(entity));
    const icon =
      light.icon ||
      (typeof entity?.attributes.icon === "string"
        ? entity.attributes.icon
        : "mdi:lightbulb-outline");
    return html`<div
      class="light"
      data-entity=${id}
      data-state=${valid ? (on ? "on" : "off") : "unavailable"}
      aria-busy=${String(this.requests.pending(id))}
    >
      <button
        class="round symbol"
        data-action="toggle"
        ?disabled=${!this.enabled(id)}
        aria-label=${`${this.t(on ? "turnOff" : "turnOn")}: ${this.name(light)}`}
        aria-pressed=${String(on)}
        title=${this.t(on ? "turnOff" : "turnOn")}
        @click=${() => this.toggle(id)}
      >
        <ha-icon .icon=${icon}></ha-icon>
      </button>
      <div class="light-content">
      <button
        class="label"
        data-action="details"
        @click=${(e: Event) => this.open(light, e)}
        aria-label=${`${this.t("details")}: ${this.name(light)}`}
        title=${this.name(light)}
      >
        <span class="name">${this.name(light)}</span
        ><span class="status">${this.status(id)}</span>
      </button>
      ${supportsBrightness(entity) ? html`
        <div class="inline-brightness">
          <input type="range" min="0" max="100" step="1"
            .value=${live(String(brightness ?? 0))}
            aria-label=${`${this.t("brightness")}: ${this.name(light)}`}
            aria-valuetext=${brightness === undefined ? this.t("unknownBrightness") : formatPercent(this.hass, brightness)}
            ?disabled=${!this.enabled(id)}
            @input=${(e: Event) => this.brightness(e, false, id)}
            @change=${(e: Event) => this.brightness(e, true, id)}
          />
          <output>${brightness === undefined ? this.t("unknownBrightness") : formatPercent(this.hass, brightness)}</output>
        </div>` : nothing}
      </div>
    </div>`;
  }
  private dialog() {
    const light = this.selected;
    const entity = light ? this.hass?.states[light.entity] : undefined;
    const actual = entity?.state === "off" ? 0 : brightnessPercent(entity);
    const value = this.draft ?? actual;
    return html`<dialog
      aria-labelledby="dialog-title"
      @cancel=${(e: Event) => {
        e.preventDefault();
        this.close();
      }}
    >
      <header>
        <div class="heading">
          <h2 id="dialog-title">
            ${light ? this.name(light) : this.t(this.confirmingAllOff ? "allOff" : "configure")}
          </h2>
          ${light ? html`<span class="status" aria-live="polite">${this.status(light.entity)}</span>` : nothing}
        </div>
        <button
          class="round"
          data-action="close"
          aria-label=${this.t("close")}
          title=${this.t("close")}
          @click=${() => this.close()}
        >
          <ha-icon .icon=${"mdi:close"}></ha-icon>
        </button>
      </header>
      ${
        this.confirmingAllOff
          ? html`<p>${this.t("allOffPrompt").replace("{title}", this.config.title || this.t("title"))}</p>
              <div class="controls">
                <button class="action" data-action="cancel-all-off" autofocus
                  @click=${() => this.close()}>${this.t("cancel")}</button>
                <button class="action primary" data-action="confirm-all-off"
                  ?disabled=${!this.hass || !allOffTargets(this.config, this.hass).length || this.config.sections.some((s) => s.lights.some((l) => this.requests.pending(l.entity)))}
                  @click=${() => { this.close(); this.allOff(); }}>${this.t("allOff")}</button>
              </div>`
          : light
          ? html`
              ${
                supportsBrightness(entity)
                  ? html`<label class="brightness"
                      ><span class="brightness-label"
                        ><span>${this.t("brightness")}</span
                        ><output
                          >${value === undefined ? this.t("unknownBrightness") : formatPercent(this.hass, value)}</output
                        ></span
                      >
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        .value=${live(String(value ?? 0))}
                        aria-label=${this.t("brightness")}
                        aria-valuetext=${value === undefined ? this.t("unknownBrightness") : formatPercent(this.hass, value)}
                        ?disabled=${!this.enabled(light.entity)}
                        @input=${(e: Event) => this.brightness(e, false)}
                        @change=${(e: Event) => this.brightness(e, true)}
                    /></label>`
                  : nothing
              }
              ${this.error()}
              <div class="controls">
                <button
                  class="action"
                  data-action="more"
                  ?disabled=${!this.hass || !available(this.hass, light.entity)}
                  @click=${() => this.more()}
                >
                  ${this.t("more")}</button
                ><button
                  class="action primary"
                  data-action="dialog-toggle"
                  ?disabled=${!this.enabled(light.entity)}
                  @click=${() => this.toggle(light.entity)}
                >
                  ${this.t(entity?.state === "on" ? "turnOff" : "turnOn")}
                </button>
              </div>
            `
          : html`<p class="hint">${this.t("configureHelp")}</p>`
      }
    </dialog>`;
  }
  protected render() {
    const ids = this.hass ? allOffTargets(this.config, this.hass) : [];
    const pending = this.config.sections.some((s) =>
      s.lights.some((l) => this.requests.pending(l.entity)),
    );
    return html`<ha-card>
      <header>
        <div class="heading">
          <ha-icon
            .icon=${this.config.icon || "mdi:lightbulb-group-outline"}
          ></ha-icon>
          <h2>${this.config.title || this.t("title")}</h2>
        </div>
        <div class="header-actions">
          ${this.config.show_all_off !== false ? html`<button
            class="all-off"
            data-action="all-off"
            ?disabled=${!ids.length || pending}
            @click=${(event: Event) => this.requestAllOff(event)}
          >
            <ha-icon .icon=${"mdi:lightbulb-group-off-outline"}></ha-icon
            >${this.t("allOff")}
          </button>` : nothing}
          <button
            class="round"
            data-action="configure"
            aria-label=${this.t("configure")}
            title=${this.t("configure")}
            @click=${(e: Event) => this.open(undefined, e)}
          >
            <ha-icon .icon=${"mdi:cog-outline"}></ha-icon>
          </button>
        </div>
      </header>
      ${this.configError ? html`<p class="error" role="alert">${this.t(this.configError)}</p>` : this.error()}
      ${
        !this.config.sections.length
          ? html`<p class="hint">${this.t("setup")}</p>`
          : this.config.sections.map(
              (s) =>
                html`<section>
                  <div class="section-heading">
                    ${s.icon ? html`<ha-icon .icon=${s.icon}></ha-icon>` : nothing}
                    <h3>${s.name}</h3>
                  </div>
                  <div class="lights">
                    ${s.lights.map((l) => this.light(l))}
                  </div>
                </section>`,
            )
      }
      ${this.dialog()}
    </ha-card>`;
  }
}
if (!customElements.get("light-group-card"))
  customElements.define("light-group-card", LightGroupCard);
const registry = window as unknown as {
  customCards?: Array<Record<string, unknown>>;
};
registry.customCards ??= [];
if (!registry.customCards.some((c) => c.type === "light-group-card"))
  registry.customCards.push({
    type: "light-group-card",
    name: "Light Group Card",
    description:
      "Room sections, light controls and all off for a floor or zone.",
    preview: true,
  });
