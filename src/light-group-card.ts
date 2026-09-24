import { LitElement, html, nothing, type PropertyValues } from "lit";
import { HistoryController, historyConnection, loadSeries, historyDialog, openHistoryDialog,
  historyFormat, historyStrings, historyStyles, lineChart, lineChartTimeAt, valueAt, stateAt,
  type Series, type Source } from "lovelace-card-history";
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
  supportsColor,
  hsColor,
} from "./model";
import { Requests, type Expected } from "./requests";
import { styles } from "./styles";
import type { CardConfig, HomeAssistant, LightConfig, SectionConfig } from "./types";
export class LightGroupCard extends LitElement {
  static styles = [styles, historyStyles];
  static properties = { hass: { attribute: false } };
  hass?: HomeAssistant;
  private config: CardConfig = { type: TYPE, sections: [] };
  private configError?: ConfigErrorCode;
  private selected?: LightConfig;
  private historyLight?: LightConfig;
  private history = new HistoryController<Series[]>(this, async (range, end) => {
    const hass = this.hass;
    const light = this.historyLight;
    if (!hass || !light || hass.connection?.connected === false) throw new Error(this.t("unavailable"));
    const sources: Source[] = [{ entityId: light.entity, kind: "lane", color: 0 }];
    if (supportsBrightness(hass.states[light.entity])) sources.push({ entityId: light.entity, attribute: "brightness", unit: "%", color: 1 });
    const series = await loadSeries(historyConnection({ callWS: hass.callWS?.bind(hass), connection: hass.connection?.sendMessagePromise ? { sendMessagePromise: hass.connection.sendMessagePromise.bind(hass.connection) } : undefined }), sources, hass.states, range, { now: end, statisticsFrom: 0 });
    return series.map((item) => item.attribute === "brightness" ? { ...item, points: item.points.map(([time, value]) => [time, stateAt(series[0], time) === "off" ? 0 : value === undefined ? undefined : value * 100 / 255] as [number, number | undefined]) } : item);
  });
  private showHistory(light: LightConfig, event: Event): void {
    const trigger = this.selected ? this.trigger : event.currentTarget as HTMLElement;
    this.close();
    this.historyLight = light;
    void openHistoryDialog(this.history, this.renderRoot, this, historyStrings(this.hass).failed, trigger);
  }
  private historyView() {
    const strings = historyStrings(this.hass);
    const format = historyFormat(this.hass);
    const light = this.historyLight;
    return historyDialog(this.history, {
      strings, format, subtitle: light ? this.name(light) : undefined,
      headerActions: html`<button class="history-action" data-action="more" title=${this.t("more")} aria-label=${this.t("more")}
        ?disabled=${!light || !this.hass || !available(this.hass, light.entity)} @click=${() => this.more(light?.entity)}><ha-icon .icon=${"mdi:tune"}></ha-icon></button>`,
      chart: (data, [start, end], hover, width) => lineChart(data, start, end, hover, { ...format, label: strings.history }, { width, domains: { "%": [0, 100] } }),
      isEmpty: (data) => !data.some((item) => item.points.some(([, value]) => value !== undefined)),
      timeAt: (event, svg, [start, end]) => lineChartTimeAt(event, svg, start, end, false),
      legend: (data, time) => data.map((item) => {
        const value = time === undefined
          ? item.kind === "lane" ? (this.hass && available(this.hass, item.entityId) ? Number(this.hass.states[item.entityId].state === "on") : undefined)
            : (this.hass && available(this.hass, item.entityId) ? this.hass.states[item.entityId].state === "off" ? 0 : brightnessPercent(this.hass.states[item.entityId]) : undefined)
          : valueAt(item, time);
        return { entityId: item.entityId, name: item.attribute ? this.t("brightness") : light ? this.name(light) : item.entityId,
          color: item.color, kind: item.kind, value: value === undefined ? strings.unavailable : item.kind === "lane" ? (value ? strings.on : strings.off) : formatPercent(this.hass, value) };
      }),
      select: (id) => this.more(id),
    });
  }
  private configuring = false;
  private confirmingAllOff = false;
  private confirmationSection?: SectionConfig;
  private colorDraft?: [number, number];
  private colorPending = false;
  private roomDrafts = new Map<SectionConfig, { value: number; ids: string[]; pending: boolean }>();
  private trigger?: HTMLElement;
  private draft?: number;
  private inlineDrafts = new Map<string, number>();
  private inlinePending = new Set<string>();
  private requests = new Requests(() => {
    for (const [section, draft] of this.roomDrafts) {
      if (draft.ids.some((id) => this.requests.pending(id))) draft.pending = true;
      else if (draft.pending) this.roomDrafts.delete(section);
    }
    if (this.colorPending && (!this.selected || !this.requests.pending(this.selected.entity))) {
      this.colorDraft = undefined;
      this.colorPending = false;
    }
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
    this.history.reset();
    this.historyLight = undefined;
    this.configError = undefined;
    try {
      this.config = normalizeConfig(input);
    } catch (error) {
      if (!(error instanceof ConfigValidationError)) throw error;
      this.config = { type: TYPE, sections: [] };
      this.configError = error.code;
    }
    this.roomDrafts.clear();
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
      if (this.selected && (!this.hass || !available(this.hass, this.selected.entity))) {
        this.colorDraft = undefined;
        this.draft = undefined;
      }
      for (const [section, draft] of this.roomDrafts) {
        if (!this.hass || draft.ids.some((id) => !available(this.hass!, id)))
          this.roomDrafts.delete(section);
      }
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
    const dialog = this.renderRoot.querySelector<HTMLDialogElement>("dialog:not(#history)");
    if ((this.selected || this.configuring || this.confirmingAllOff) && dialog && !dialog.open)
      dialog.showModal();
  }
  disconnectedCallback(): void {
    this.close();
    this.roomDrafts.clear();
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
  private requestAllOff(event: Event, section?: SectionConfig): void {
    if (this.config.confirm_all_off) {
      this.trigger = event.currentTarget as HTMLElement;
      this.confirmingAllOff = true;
      this.confirmationSection = section;
      this.requestUpdate();
    } else this.allOff(section);
  }
  private allOff(section?: SectionConfig): void {
    const config = section ? { ...this.config, sections: [section] } : this.config;
    if (
      !this.hass ||
      config.sections.some((s) =>
        s.lights.some((l) => this.requests.pending(l.entity)),
      )
    )
      return;
    const ids = allOffTargets(config, this.hass);
    if (ids.length)
      this.send(ids, { state: "off" }, "turn_off", { entity_id: ids });
  }
  private open(light: LightConfig | undefined, event: Event): void {
    this.trigger = event.currentTarget as HTMLElement;
    this.selected = light;
    this.colorDraft = undefined;
    this.colorPending = false;
    this.configuring = !light;
    this.draft = undefined;
    this.requestUpdate();
  }
  private close(): void {
    this.renderRoot?.querySelector<HTMLDialogElement>("dialog:not(#history)")?.close();
    this.renderRoot?.querySelector<HTMLDialogElement>("#history")?.close();
    this.history.cancel();
    this.selected = undefined;
    this.configuring = false;
    this.confirmingAllOff = false;
    this.confirmationSection = undefined;
    this.colorDraft = undefined;
    this.colorPending = false;
    this.draft = undefined;
    if (this.trigger?.isConnected) this.trigger.focus();
    this.trigger = undefined;
    this.requestUpdate();
  }
  private more(id = this.selected?.entity): void {
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
  private setColor(event: Event, channel: 0 | 1, commit: boolean): void {
    const id = this.selected?.entity;
    const value = Number((event.target as HTMLInputElement).value);
    if (!id || !this.enabled(id) || !supportsColor(this.hass?.states[id]) ||
        !Number.isFinite(value) || value < 0 || value > (channel === 0 ? 360 : 100)) return;
    const color: [number, number] = [...(this.colorDraft ?? hsColor(this.hass?.states[id]) ?? [0, 100])];
    color[channel] = value;
    this.colorDraft = color;
    this.requestUpdate();
    if (commit) {
      this.colorPending = true;
      this.send([id], { state: "on", hsColor: color, previousHsColor: hsColor(this.hass?.states[id]) }, "turn_on", { entity_id: id, hs_color: color });
    }
  }
  private roomIds(section: SectionConfig, dimmable = false): string[] {
    return [...new Set(section.lights.map((l) => l.entity))].filter((id) =>
      this.hass && available(this.hass, id) && (!dimmable || supportsBrightness(this.hass.states[id])));
  }
  private roomBusy(section: SectionConfig): boolean {
    return section.lights.some((l) => this.requests.pending(l.entity));
  }
  private toggleRoom(section: SectionConfig, event: Event): void {
    if (this.roomBusy(section)) return;
    const ids = this.roomIds(section);
    if (ids.some((id) => this.hass!.states[id].state === "on"))
      this.requestAllOff(event, section);
    else this.send(ids, { state: "on" }, "turn_on", { entity_id: ids });
  }
  private dimRoom(section: SectionConfig, event: Event, commit: boolean): void {
    const ids = this.roomIds(section, true);
    const value = Number((event.target as HTMLInputElement).value);
    if (!ids.length || this.roomBusy(section) || !Number.isFinite(value) || value < 0 || value > 100) return;
    this.roomDrafts.set(section, { value, ids, pending: false });
    this.requestUpdate();
    if (commit)
      this.send(ids, { state: value === 0 ? "off" : "on", brightnessPct: value },
        "turn_on", { entity_id: ids, brightness_pct: value });
  }
  private roomControls(section: SectionConfig) {
    const ids = this.roomIds(section);
    const dimmable = this.roomIds(section, true);
    const on = ids.some((id) => this.hass!.states[id].state === "on");
    const busy = this.roomBusy(section);
    const levels = dimmable.map((id) => this.hass!.states[id].state === "off" ? 0 : brightnessPercent(this.hass!.states[id]));
    const known = levels.length > 0 && levels.every((level) => level !== undefined);
    const average = known ? Math.round((levels as number[]).reduce((a, b) => a + b, 0) / levels.length) : undefined;
    const value = this.roomDrafts.get(section)?.value ?? average;
    const mixed = this.roomDrafts.get(section) === undefined && new Set(levels).size > 1;
    return html`<div class="room-controls" aria-busy=${String(busy)}>
      <button class="round" data-action="room-toggle"
        aria-label=${`${this.t(on ? "turnOff" : "turnOn")}: ${section.name}`}
        title=${this.t(on ? "turnOff" : "turnOn")}
        aria-pressed=${String(on)}
        ?disabled=${!ids.length || busy}
        @click=${(e: Event) => this.toggleRoom(section, e)}>
        <ha-icon .icon=${"mdi:power"}></ha-icon>
      </button>
      ${section.lights.some((l) => supportsBrightness(this.hass?.states[l.entity])) ? html`
        <label class="room-brightness">
          <span>${this.t("roomBrightness")}</span>
          <input type="range" data-control="room-brightness" min="0" max="100" step="1"
            aria-label=${`${this.t("roomBrightness")}: ${section.name}`}
            aria-valuetext=${value === undefined ? this.t("unknownBrightness") : formatPercent(this.hass, value)}
            .value=${live(String(value ?? 0))} ?disabled=${!dimmable.length || busy}
            @input=${(e: Event) => this.dimRoom(section, e, false)}
            @change=${(e: Event) => this.dimRoom(section, e, true)} />
        </label>
        <output>${busy ? this.t("pending") : value === undefined ? this.t("unknownBrightness") : mixed ? this.t("mixed") : formatPercent(this.hass, value)}</output>
      ` : nothing}
    </div>`;
  }
  private colorControls(light: LightConfig) {
    const entity = this.hass?.states[light.entity];
    if (!supportsColor(entity)) return nothing;
    const actual = hsColor(entity);
    const [hue, saturation] = this.colorDraft ?? actual ?? [0, 100];
    return html`<div class="color-controls">
      <div class="brightness-label"><span>${this.t("color")}</span>
        <span class="color-swatch" aria-hidden="true" style=${`background: hsl(${hue} 100% ${100 - saturation / 2}%);`}></span>
      </div>
      ${!actual && !this.colorDraft ? html`<span class="status">${this.t("unknownColor")}</span>` : nothing}
      <label>${this.t("hue")}
        <input type="range" class="hue" data-control="hue" min="0" max="360" step="1"
          .value=${live(String(hue))} aria-label=${this.t("hue")}
          ?disabled=${!this.enabled(light.entity)}
          @input=${(e: Event) => this.setColor(e, 0, false)}
          @change=${(e: Event) => this.setColor(e, 0, true)} />
      </label>
      <label>${this.t("saturation")}
        <input type="range" data-control="saturation" min="0" max="100" step="1"
          .value=${live(String(saturation))} aria-label=${this.t("saturation")}
          aria-valuetext=${formatPercent(this.hass, saturation)}
          ?disabled=${!this.enabled(light.entity)}
          @input=${(e: Event) => this.setColor(e, 1, false)}
          @change=${(e: Event) => this.setColor(e, 1, true)} />
      </label>
    </div>`;
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
        ></button>
      <button class="reading status" data-action="history" title=${historyStrings(this.hass).showHistory}
        aria-label=${`${historyStrings(this.hass).showHistory}: ${this.name(light)}`}
        @click=${(event: Event) => this.showHistory(light, event)}>${this.status(id)}</button>
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
          <button class="reading" data-action="brightness-history" title=${historyStrings(this.hass).showHistory}
            aria-label=${`${historyStrings(this.hass).showHistory}: ${this.t("brightness")}, ${this.name(light)}`}
            @click=${(event: Event) => this.showHistory(light, event)}>${brightness === undefined ? this.t("unknownBrightness") : formatPercent(this.hass, brightness)}</button>
        </div>` : nothing}
      </div>
    </div>`;
  }
  private dialog() {
    const light = this.selected;
    const entity = light ? this.hass?.states[light.entity] : undefined;
    const actual = entity?.state === "off" ? 0 : brightnessPercent(entity);
    const value = this.draft ?? actual;
    const confirmationConfig = this.confirmationSection ? { ...this.config, sections: [this.confirmationSection] } : this.config;
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
        ${light ? html`<button class="round" data-action="history" title=${historyStrings(this.hass).showHistory} aria-label=${historyStrings(this.hass).showHistory}
          @click=${(event: Event) => this.showHistory(light, event)}><ha-icon .icon=${"mdi:history"}></ha-icon></button>` : nothing}
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
          ? html`<p>${this.t("allOffPrompt").replace("{title}", this.confirmationSection?.name || this.config.title || this.t("title"))}</p>
              <div class="controls">
                <button class="action" data-action="cancel-all-off" autofocus
                  @click=${() => this.close()}>${this.t("cancel")}</button>
                <button class="action primary" data-action="confirm-all-off"
                  ?disabled=${!this.hass || !allOffTargets(confirmationConfig, this.hass).length || confirmationConfig.sections.some((s) => s.lights.some((l) => this.requests.pending(l.entity)))}
                  @click=${() => { const section = this.confirmationSection; this.close(); this.allOff(section); }}>${this.t("allOff")}</button>
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
              ${this.colorControls(light)}
              ${this.error()}
              <div class="controls">
                <button
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
                  ${s.show_controls ? this.roomControls(s) : nothing}
                  <div class="lights">
                    ${s.lights.map((l) => this.light(l))}
                  </div>
                </section>`,
            )
      }
      ${this.dialog()}
      ${this.historyView()}
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
