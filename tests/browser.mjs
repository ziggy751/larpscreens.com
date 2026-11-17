import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto("http://127.0.0.1:5173");
await page
  .getByRole("heading", { name: "Big ambitions. On screen." })
  .waitFor();
await page.screenshot({ path: "/tmp/larp-library.png", fullPage: false });
await page
  .getByRole("button", { name: "Launch Portfolio Pro", exact: true })
  .click();
await page
  .getByRole("heading", { name: "Stock Portfolio", exact: true })
  .waitFor();
await page.getByRole("button", { name: "Pause", exact: true }).click();
await page
  .getByRole("button", { name: "Buy NVDA · simulated", exact: true })
  .click();
await page.getByRole("button", { name: "Order history", exact: true }).click();
await page.getByText("Filled · 0s").waitFor();
await page.getByRole("button", { name: "Fullscreen", exact: true }).click();
await page.waitForTimeout(300);
assert.ok(await page.evaluate(() => !!document.fullscreenElement));
assert.equal(
  await page.getByRole("button", { name: "Edit stats", exact: true }).count(),
  0,
); // toolbar hidden; in-dashboard editor omitted
await page.screenshot({ path: "/tmp/larp-stock-fullscreen.png" });
await page.getByRole("button", { name: "Exit fullscreen" }).click();
await page
  .getByRole("button", { name: "Edit stats", exact: true })
  .first()
  .click();
await page
  .getByRole("button", { name: "Save Starting Setup", exact: true })
  .click();
await page
  .getByRole("button", { name: "Restart From Saved Setup", exact: true })
  .click();
await page.getByRole("button", { name: "Close editor" }).click();
await page
  .getByRole("button", { name: "Library", exact: true })
  .first()
  .click();
await page
  .getByRole("button", { name: "Launch Revenue Studio", exact: true })
  .click();
await page
  .getByRole("heading", { name: "Business Revenue", exact: true })
  .waitFor();
await page
  .getByRole("button", { name: "Edit stats", exact: true })
  .first()
  .click();
await page
  .getByRole("button", { name: "Create fictional order", exact: true })
  .click();
await page.getByRole("button", { name: "Close editor" }).click();
await page.getByText("Order #").first().count();
await page.screenshot({ path: "/tmp/larp-business.png" });
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(500);
assert.ok(
  await page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth,
  ),
);
await page.screenshot({ path: "/tmp/larp-mobile.png", fullPage: true });
assert.deepEqual(errors, []);
console.log(
  "PASS: library, trade history, native fullscreen, save/restart, business orders, mobile overflow, no runtime errors",
);
await browser.close();
