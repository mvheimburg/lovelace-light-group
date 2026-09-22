import { css } from "lit";
import { colorSchemeStyles } from "./color-schemes";
export const styles = [
  colorSchemeStyles,
  css`
    :host {
      display: block;
      color: var(--primary-text-color, #262d38);
      font-family: var(--paper-font-body1_-_font-family, system-ui, sans-serif);
      --lg-surface: var(
        --ha-card-background,
        var(--card-background-color, #fff)
      );
      --lg-pill: var(--secondary-background-color, #f1f3f6);
      --lg-accent: var(--bubble-accent-color, var(--primary-color, #507b9b));
      --lg-radius: var(--ha-card-border-radius, 16px);
      --lg-muted: var(--secondary-text-color, #626976);
    }
    :host([appearance="bubble"]) {
      --lg-surface: var(
        --bubble-main-background-color,
        var(--ha-card-background, var(--card-background-color, #fff))
      );
      --lg-pill: var(
        --bubble-secondary-background-color,
        var(--secondary-background-color, #f1f3f6)
      );
      --lg-radius: var(--bubble-border-radius, 28px);
    }
    * {
      box-sizing: border-box;
    }
    ha-card {
      display: block;
      padding: 16px;
      background: var(--lg-surface);
      border-radius: var(--lg-radius);
      border: 1px solid var(--ha-card-border-color, var(--divider-color, #ddd));
      box-shadow: var(--ha-card-box-shadow, none);
    }
    :host([appearance="bubble"]) ha-card {
      border: var(--bubble-border, none);
      box-shadow: var(--bubble-box-shadow, var(--ha-card-box-shadow, none));
    }
    button,
    input,
    select {
      font: inherit;
      color: inherit;
    }
    button {
      cursor: pointer;
      border: 0;
      background: none;
      min-height: 44px;
    }
    button:disabled {
      cursor: default;
      opacity: 0.55;
    }
    button:focus-visible,
    input:focus-visible,
    select:focus-visible {
      outline: 3px solid var(--primary-color, #507b9b);
      outline-offset: 3px;
    }
    button:hover:not(:disabled) {
      filter: brightness(0.96);
    }
    header {
      display: flex;
      gap: 8px;
      align-items: center;
      flex-wrap: wrap;
      margin-bottom: 16px;
    }
    h2,
    h3,
    p {
      margin: 0;
    }
    h2 {
      font-size: 17px;
      font-weight: 650;
      line-height: 1.4;
      overflow-wrap: anywhere;
    }
    .heading {
      display: flex;
      align-items: center;
      gap: 10px;
      flex: 1;
      min-width: 90px;
    }
    .heading ha-icon {
      flex: none;
      color: var(--lg-muted);
    }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-left: auto;
    }
    .round {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: none;
      background: var(--lg-pill);
    }
    .all-off {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      border-radius: 22px;
      padding: 0 12px;
      background: var(--lg-pill);
    }
    ha-icon {
      --mdc-icon-size: 21px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
    }
    section + section {
      margin-top: 22px;
    }
    .section-heading {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0 4px 10px;
    }
    h3 {
      font-size: 14px;
      font-weight: 650;
      overflow-wrap: anywhere;
    }
    .section-heading ha-icon {
      color: var(--lg-muted);
    }
    .lights {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 170px), 1fr));
      gap: 8px 12px;
    }
    .light {
      display: flex;
      align-items: center;
      gap: 2px;
      padding: 5px;
      border-radius: 30px;
      min-width: 0;
      background: var(--lg-pill);
    }
    .light[data-state="on"] {
      background: color-mix(in srgb, var(--lg-accent) 19%, var(--lg-pill));
    }
    .light[data-state="on"] .symbol {
      color: var(--lg-accent);
    }
    .symbol {
      background: color-mix(in srgb, var(--lg-surface) 85%, transparent);
      color: var(--lg-muted);
    }
    .light[data-state="unavailable"] {
      opacity: 0.65;
    }
    .light[data-state="unavailable"] .label {
      color: var(--lg-muted);
    }
    .label {
      min-width: 0;
      flex: 1;
      text-align: left;
      padding: 3px 8px;
      border-radius: 18px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 2px;
    }
    .name {
      font-size: 13px;
      font-weight: 600;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 100%;
    }
    .status {
      font-size: 11px;
      color: var(--lg-muted);
    }
    .light[aria-busy="true"] {
      outline: 1px dashed var(--lg-accent);
    }
    .hint {
      font-size: 14px;
      line-height: 1.6;
      color: var(--lg-muted);
    }
    .error {
      padding: 10px 12px;
      margin: 12px 0;
      color: var(--error-color, #bd2635);
      background: color-mix(
        in srgb,
        var(--error-color, #bd2635) 8%,
        var(--lg-surface)
      );
      border-radius: 12px;
      font-size: 13px;
      line-height: 1.5;
      overflow-wrap: anywhere;
    }
    dialog {
      color: inherit;
      background: var(--lg-surface);
      border: 1px solid var(--divider-color, #ddd);
      border-radius: var(--lg-radius);
      width: min(440px, calc(100vw - 32px));
      max-height: calc(100dvh - 32px);
      padding: 20px;
      box-shadow: 0 16px 60px #0005;
    }
    dialog::backdrop {
      background: rgb(0 0 0 / 0.4);
    }
    dialog header {
      margin-bottom: 18px;
    }
    dialog .heading {
      display: block;
    }
    dialog .status {
      font-size: 13px;
    }
    dialog p {
      line-height: 1.65;
    }
    dialog .controls {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      flex-wrap: wrap;
      margin-top: 20px;
    }
    .action {
      padding: 0 16px;
      border-radius: 22px;
      background: var(--lg-pill);
    }
    .primary {
      background: color-mix(in srgb, var(--lg-accent) 24%, var(--lg-surface));
      color: var(--primary-text-color, #262d38);
    }
    .brightness {
      display: grid;
      gap: 16px;
      margin-top: 24px;
    }
    .brightness-label {
      display: flex;
      justify-content: space-between;
      gap: 12px;
    }
    .brightness input {
      width: 100%;
      min-height: 44px;
      accent-color: var(--lg-accent);
      margin: 0;
    }
    .brightness output {
      font-variant-numeric: tabular-nums;
    }
    @media (max-width: 400px) {
      ha-card {
        padding: 12px;
      }
      .header-actions {
        gap: 4px;
      }
      .all-off {
        padding: 0 10px;
      }
      .lights {
        gap: 8px;
      }
      .name {
        font-size: 12px;
      }
    }
  `,
];
