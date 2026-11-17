import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
p.on("pageerror", (e) => errors.push(e.message));
const screens = [
  ["Portfolio Pro", "stocks"],
  ["Crypto Terminal", "crypto"],
  ["Token Discovery", "discovery"],
  ["Phantom-style Wallet", "phantom"],
  ["Exodus-style Portfolio", "exodus"],
  ["Trust-style Wallet", "trust"],
  ["Binance-style Exchange", "binance"],
  ["Creator Insights", "instagram"],
  ["Channel Studio", "youtube"],
  ["Viral Analytics", "tiktok"],
  ["Revenue Studio", "business"],
  ["Private Banking", "banking"],
  ["Stream Control", "streaming"],
  ["Traffic Analytics", "analytics"],
  ["Collection House", "luxury"],
  ["Your Workspace", "custom"],
];
for (const [name, id] of screens) {
  await p.goto("http://127.0.0.1:5173");
  await p.getByRole("button", { name: `Launch ${name}`, exact: true }).click();
  await p.locator(".native-capture>div").waitFor();
  await p.getByRole("button", { name: "Pause", exact: true }).click();
  await p.getByRole("button", { name: "Fullscreen", exact: true }).click();
  await p.waitForTimeout(200);
  assert.ok(
    await p.evaluate(() => !!document.fullscreenElement),
    id + " native fullscreen",
  );
  assert.equal(await p.locator(".native-stamp:visible").count(), 1);
  assert.equal(
    await p.getByRole("button", { name: "Edit stats", exact: true }).count(),
    0,
  );
  await p.screenshot({ path: `/tmp/larp-overhaul-shots/${id}.png` });
  for (const [width, height] of [
    [1280, 800],
    [1728, 1117],
    [390, 844],
  ]) {
    await p.setViewportSize({ width, height });
    await p.waitForTimeout(150);
    const overflow = await p.evaluate(
      () => document.documentElement.scrollWidth > innerWidth + 1,
    );
    if (overflow)
      console.log(
        "OVERFLOW",
        id,
        width,
        await p.evaluate(() =>
          [...document.querySelectorAll(".native-capture *")]
            .filter((e) => e.getBoundingClientRect().right > innerWidth + 2)
            .map((e) => [
              e.tagName,
              e.className,
              Math.round(e.getBoundingClientRect().right),
            ])
            .slice(0, 7),
        ),
      );
    assert.equal(overflow, false, id + " responsive " + width);
  }
  await p.getByRole("button", { name: "Exit fullscreen", exact: true }).click();
  await p
    .getByRole("button", { name: "Edit stats", exact: true })
    .first()
    .click();
  await p.getByRole("button", { name: "Save Setup", exact: true }).click();
  await p.getByRole("button", { name: "Reset Activity", exact: true }).click();
  await p.getByRole("button", { name: "Close editor", exact: true }).click();
  await p.setViewportSize({ width: 1440, height: 900 });
  console.log("PASS", id);
}
assert.deepEqual(errors, []);
console.log(
  "PASS: all 16 applications, 48 responsive fullscreens, native fullscreen, editor isolation, saved setup/reset, zero page errors",
);
await browser.close();
