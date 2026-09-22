import { it, expect, vi, afterEach } from "vitest";
import { Requests } from "../src/requests";
const states = (state = "off", brightness = 128) => ({
  "light.a": { entity_id: "light.a", state, attributes: { brightness } },
});
function deferred() {
  let resolve!: () => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<void>((a, b) => {
    resolve = a;
    reject = b;
  });
  return { promise, resolve, reject };
}
afterEach(() => vi.useRealTimers());
it("requires service and state, in either order, and blocks duplicate requests", async () => {
  const d = deferred();
  const r = new Requests(vi.fn());
  expect(r.start(["light.a"], { state: "off" }, () => d.promise)).toBe(true);
  const send = vi.fn();
  expect(r.start(["light.a"], { state: "off" }, send)).toBe(false);
  expect(send).not.toHaveBeenCalled();
  r.reconcile(states());
  expect(r.pending("light.a")).toBe(true);
  d.resolve();
  await d.promise;
  await Promise.resolve();
  expect(r.pending("light.a")).toBe(false);
  r.start(["light.a"], { state: "on" }, async () => {});
  await Promise.resolve();
  expect(r.pending("light.a")).toBe(true);
  r.reconcile(states("on"));
  expect(r.pending("light.a")).toBe(false);
});
it("waits for all bulk members and brightness rounding confirmation", async () => {
  const r = new Requests(vi.fn());
  r.start(["light.a", "light.b"], { state: "off" }, async () => {});
  await Promise.resolve();
  r.reconcile(states());
  expect(r.pending("light.a")).toBe(true);
  r.reconcile({
    ...states(),
    "light.b": { entity_id: "light.b", state: "off", attributes: {} },
  });
  expect(r.pending("light.a")).toBe(false);
  r.start(["light.a"], { state: "on", brightnessPct: 50 }, async () => {});
  await Promise.resolve();
  r.reconcile(states("on", 128));
  expect(r.pending("light.a")).toBe(false);
});
it("rejects, times out and ignores stale rejection after reset", async () => {
  vi.useFakeTimers();
  const r = new Requests(vi.fn(), 100);
  const d = deferred();
  r.start(["light.a"], { state: "off" }, () => d.promise);
  r.reset();
  d.reject(new Error("old"));
  await d.promise.catch(() => {});
  await Promise.resolve();
  expect(r.error).toBeUndefined();
  r.start(["light.a"], { state: "off" }, async () => {
    throw new Error("denied");
  });
  await Promise.resolve();
  await Promise.resolve();
  expect(r.error).toBe("failed");
  expect(r.errorDetail).toBe("denied");
  expect(r.pending("light.a")).toBe(false);
  r.start(["light.a"], { state: "off" }, async () => {});
  await vi.advanceTimersByTimeAsync(101);
  expect(r.error).toBe("timeout");
  expect(r.pending("light.a")).toBe(false);
});
it("handles synchronous throws and zero brightness without stale brightness attributes", async () => {
  const r = new Requests(vi.fn());
  r.start(["light.a"], { state: "off" }, () => {
    throw new Error("sync");
  });
  expect(r.error).toBe("failed");
  r.start(["light.a"], { state: "off", brightnessPct: 0 }, async () => {});
  await Promise.resolve();
  r.reconcile(states("off", 128));
  expect(r.pending("light.a")).toBe(false);
});

it("waits for color rather than merely the on state and handles hue wraparound", async () => {
  const r = new Requests(vi.fn());
  r.start(["light.a"], { state: "on", hsColor: [359, 80], previousHsColor: [120, 80] }, async () => {});
  await Promise.resolve();
  r.reconcile({ "light.a": { ...states("on")["light.a"], attributes: { hs_color: [120, 80] } } });
  expect(r.pending("light.a")).toBe(true);
  r.reconcile({ "light.a": { ...states("on")["light.a"], attributes: { hs_color: [1, 80] } } });
  expect(r.pending("light.a")).toBe(false);
});

it("accepts HA's reported color after conversion to an XY light's gamut", async () => {
  const r = new Requests(vi.fn());
  r.start(["light.a"], { state: "on", hsColor: [300, 100], previousHsColor: [120, 80] }, async () => {});
  await Promise.resolve();
  r.reconcile({ "light.a": { ...states("on")["light.a"], attributes: { hs_color: [120, 80] } } });
  expect(r.pending("light.a")).toBe(true);
  r.reconcile({ "light.a": { ...states("on")["light.a"], attributes: { hs_color: [299.754, 95.686] } } });
  expect(r.pending("light.a")).toBe(false);
});

it("accepts the first reported converted color when an off light had no color attributes", async () => {
  const r = new Requests(vi.fn());
  r.start(["light.a"], { state: "on", hsColor: [300, 100] }, async () => {});
  await Promise.resolve();
  r.reconcile(states("on"));
  expect(r.pending("light.a")).toBe(true);
  r.reconcile({ "light.a": { ...states("on")["light.a"], attributes: { hs_color: [299.754, 95.686] } } });
  expect(r.pending("light.a")).toBe(false);
});
