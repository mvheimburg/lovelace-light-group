const { chromium } = require("playwright");
const { spawn } = require("node:child_process");
const { mkdir } = require("node:fs/promises");
(async () => {
  const server = spawn(
    process.execPath,
    [
      "node_modules/vite/bin/vite.js",
      "--host",
      "127.0.0.1",
      "--port",
      "5198",
      "--strictPort",
    ],
    { stdio: "pipe" },
  );
  let browser;
  try {
    await new Promise((resolve, reject) => {
      server.stdout.on("data", (chunk) => {
        if (chunk.toString().includes("Local:")) resolve();
      });
      server.on("exit", (code) =>
        reject(new Error(`Preview server exited: ${code}`)),
      );
      server.on("error", reject);
    });
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({
      viewport: { width: 1580, height: 1050 },
      deviceScaleFactor: 1,
    });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("http://127.0.0.1:5198/demo/");
    await page.locator("light-group-card").first().locator("ha-card").waitFor();
    await page.evaluate(() => document.fonts.ready);
    await mkdir("docs", { recursive: true });
    await page.screenshot({
      path: "docs/light-group-card.png",
      fullPage: true,
    });
    await page.locator("#theme").click();
    await page.screenshot({
      path: "docs/light-group-dark.png",
      fullPage: true,
    });
    await page
      .locator("light-group-card")
      .first()
      .locator('[data-action="details"]')
      .first()
      .click();
    await page.screenshot({
      path: "docs/light-group-controls.png",
      fullPage: true,
    });
    await page.keyboard.press("Escape");
    await page.locator("#theme").click();
    await page.locator("#appearance").click();
    await page.locator("#schemes").click();
    await page.screenshot({
      path: "docs/light-group-schemes.png",
      fullPage: true,
    });
    await page.setViewportSize({ width: 360, height: 900 });
    await page.screenshot({
      path: "docs/light-group-mobile.png",
      fullPage: false,
    });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    );
    if (overflow) throw new Error("Mobile viewport overflows horizontally");
    await page.locator("light-group-card").first().locator('[data-action="history"]').first().click();
    await page.locator("light-group-card").first().locator('#history .history-chart').waitFor();
    await page.screenshot({ path: "docs/light-group-history-mobile.png", fullPage: false });
    const headerFits = await page.locator("light-group-card").first().locator('#history .history-top').evaluate((header) => header.scrollWidth <= header.clientWidth);
    if (!headerFits) throw new Error("History header overflows on mobile");
    await page.keyboard.press("Escape");
    await page.locator("#failure").click();
    await page
      .locator("light-group-card")
      .first()
      .locator('[data-action="toggle"]')
      .first()
      .click();
    await page
      .locator("light-group-card")
      .first()
      .locator('[role="alert"]')
      .first()
      .waitFor();
    await page.screenshot({
      path: "docs/light-group-error.png",
      fullPage: true,
    });
    await page.locator("#pending").click();
    await page
      .locator("light-group-card")
      .first()
      .locator('[data-action="toggle"]')
      .first()
      .click();
    await page.screenshot({
      path: "docs/light-group-pending.png",
      fullPage: true,
    });
    if (errors.length) throw new Error(errors.join("\n"));
    console.log(
      "Saved eight production-bundle previews; no browser errors or mobile overflow.",
    );
  } finally {
    await browser?.close();
    server.kill();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
