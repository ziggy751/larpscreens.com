import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const b = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto("http://127.0.0.1:5173");
await p
  .getByRole("button", { name: "Launch Phantom-style Wallet", exact: true })
  .click();
await p.locator(".native-capture>div").waitFor();
await p.evaluate(() => {
  Element.prototype.requestFullscreen = () =>
    Promise.reject(new Error("Test unsupported fullscreen"));
});
await p.getByRole("button", { name: "Fullscreen", exact: true }).click();
await p.locator("body.simulation-presenting").waitFor();
assert.equal(await p.evaluate(() => document.fullscreenElement), null);
assert.deepEqual(await p.locator(".ref-dashboard").boundingBox(), {
  x: 0,
  y: 0,
  width: 1440,
  height: 900,
});
assert.equal(await p.locator(".sidebar").isVisible(), false);
await p
  .locator(".wallet-actions")
  .getByRole("button", { name: "Swap", exact: true })
  .click();
await p.getByRole("button", { name: "Close wallet action" }).click();
await p.keyboard.press("Escape");
assert.equal(await p.locator("body.simulation-presenting").count(), 0);
await p.locator(".native-editor-bar select").first().selectOption("10");
await p.waitForTimeout(900);
const state = await p.evaluate(() =>
  JSON.parse(localStorage.getItem("larp-dashboard-crypto-phantom")),
);
assert.ok(state.tick >= 3);
await p.getByRole("button", { name: "Library", exact: true }).first().click();
await p
  .getByRole("button", { name: "Launch Phantom-style Wallet", exact: true })
  .click();
await p.locator(".native-capture>div").waitFor();
const restored = await p.evaluate(() =>
  JSON.parse(localStorage.getItem("larp-dashboard-crypto-phantom")),
);
assert.ok(restored.tick >= state.tick);
console.log(
  "PASS fallback viewport isolation, Escape after button focus, high-speed autosave, restored progress",
);
await b.close();
