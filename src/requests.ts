import { brightnessPercent, hsColor } from "./model";
import type { HassEntity } from "./types";
export type Expected = { state: "on" | "off"; brightnessPct?: number; hsColor?: [number, number]; previousHsColor?: [number, number] };
interface Request {
  ids: string[];
  expected: Expected;
  sent: boolean;
  confirmed: boolean;
  timer: ReturnType<typeof setTimeout>;
}
/** Tracks acknowledgements only. HA owns device state; no state is synthesized here. */
export class Requests {
  private active = new Set<Request>();
  error: "failed" | "timeout" | undefined;
  errorDetail: string | undefined;
  constructor(
    private changed: () => void,
    private timeoutMs = 10000,
  ) {}
  pending(id: string): boolean {
    return [...this.active].some((r) => r.ids.includes(id));
  }
  start(
    ids: string[],
    expected: Expected,
    send: () => Promise<unknown>,
  ): boolean {
    if (!ids.length || ids.some((id) => this.pending(id))) return false;
    this.error = undefined;
    this.errorDetail = undefined;
    const request: Request = {
      ids: [...new Set(ids)],
      expected: { ...expected },
      sent: false,
      confirmed: false,
      timer: setTimeout(() => {
        if (!this.active.has(request)) return;
        this.error = "timeout";
        this.finish(request);
      }, this.timeoutMs),
    };
    this.active.add(request);
    this.changed();
    const failed = (error: unknown) => {
      if (!this.active.has(request)) return;
      this.error = "failed";
      this.errorDetail =
        error instanceof Error
          ? error.message
          : typeof error === "object" && error !== null && "message" in error
            ? String(error.message)
            : typeof error === "string"
              ? error
              : undefined;
      this.finish(request);
    };
    try {
      Promise.resolve(send()).then(() => {
        if (!this.active.has(request)) return;
        request.sent = true;
        if (request.confirmed) this.finish(request);
      }, failed);
    } catch (error) {
      failed(error);
    }
    return true;
  }
  reconcile(states: Record<string, HassEntity>): void {
    for (const request of this.active) {
      request.confirmed = request.ids.every((id) => {
        const state = states[id];
        const expected = request.expected;
        if (state?.state !== expected.state) return false;
        if (expected.hsColor) {
          const actual = hsColor(state);
          if (!actual) return false;
          const hueDelta = Math.abs(actual[0] - expected.hsColor[0]);
          // Accept the requested color or an authoritative changed color.
          // HA/device gamut conversion can differ substantially from requested HS.
          const matches = Math.abs(actual[1] - expected.hsColor[1]) <= 3 &&
            (expected.hsColor[1] <= 3 || Math.min(hueDelta, 360 - hueDelta) <= 3);
          const changed = !expected.previousHsColor ||
            actual.some((value, index) => Math.abs(value - expected.previousHsColor![index]) > 0.01);
          if (!matches && !changed) return false;
        }
        if (expected.brightnessPct === undefined || expected.state === "off")
          return true;
        const actual = brightnessPercent(state);
        return (
          actual !== undefined && Math.abs(actual - expected.brightnessPct) <= 1
        );
      });
      if (request.sent && request.confirmed) this.finish(request);
    }
  }
  private finish(request: Request): void {
    clearTimeout(request.timer);
    this.active.delete(request);
    this.changed();
  }
  reset(): void {
    for (const r of this.active) clearTimeout(r.timer);
    this.active.clear();
    this.error = undefined;
    this.errorDetail = undefined;
    this.changed();
  }
}
