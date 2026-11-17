import { chromium } from "@playwright/test";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import fs from "node:fs/promises";
import { screens, sizes } from "./screens.mjs";
const update = process.argv.includes("--update");
const official = process.argv.includes("--official");
if (update && official)
  throw Error("Official references cannot be generated from LarpScreens");
const out = `test-results/visual/${official ? "official" : "regression"}`;
await fs.mkdir(out, { recursive: true });
const baseline = "tests/visual/baselines";
await fs.mkdir(baseline, { recursive: true });
const rows = [];
let failures = 0,
  missing = 0;
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
try {
  for (const [name, id, source] of screens)
    for (const [width, height] of sizes) {
      const key = `${id}-${width}x${height}`;
      if (official) {
        try {
          await fs.access(`references/official/${key}.png`);
        } catch (e) {
          if (e.code !== "ENOENT") throw e;
          missing++;
          rows.push({
            id,
            width,
            height,
            source,
            status:
              "MISSING VERIFIED OFFICIAL SCREENSHOT — NO COMPARISON PERFORMED",
            ratio: null,
          });
          try {
            await fs.copyFile(
              `test-results/visual/regression/${key}-actual.png`,
              `${out}/${key}-actual.png`,
            );
          } catch {}
          console.log(key, "MISSING VERIFIED OFFICIAL SCREENSHOT");
          continue;
        }
      }

      const context = await browser.newContext({
        viewport: { width, height },
        deviceScaleFactor: 1,
        locale: "en-US",
        timezoneId: "UTC",
        reducedMotion: "reduce",
        colorScheme: "dark",
      });
      await context.addInitScript(() =>
        localStorage.setItem(
          "larp-settings",
          JSON.stringify({ enabled: false, seed: 42 }),
        ),
      );
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto(process.env.VISUAL_BASE_URL || "http://127.0.0.1:5173");
      await page
        .getByRole("button", { name: `Launch ${name}`, exact: true })
        .click();
      await page.locator(".native-capture>div").waitFor();
      await page
        .getByRole("button", { name: "Fullscreen", exact: true })
        .click();
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(150);
      if (!(await page.evaluate(() => !!document.fullscreenElement)))
        throw Error("Native fullscreen did not activate");
      const actual = await page.screenshot({ animations: "disabled" });
      await fs.writeFile(`${out}/${key}-actual.png`, actual);
      const reference = official
        ? `references/official/${key}.png`
        : `${baseline}/${key}.png`;
      let status = "";
      let ratio = null;
      if (update) {
        await fs.writeFile(reference, actual);
        status = "LOCAL BASELINE CAPTURED — NOT AN OFFICIAL REFERENCE";
      } else {
        try {
          const expected = PNG.sync.read(await fs.readFile(reference));
          const image = PNG.sync.read(actual);
          if (expected.width !== width || expected.height !== height)
            throw Error("Reference dimensions do not match the viewport");
          const diff = new PNG({ width, height });
          const count = pixelmatch(
            expected.data,
            image.data,
            diff.data,
            width,
            height,
            { threshold: 0.12 },
          );
          ratio = count / (width * height);
          await fs.writeFile(`${out}/${key}-diff.png`, PNG.sync.write(diff));
          await fs.copyFile(reference, `${out}/${key}-reference.png`);
          status =
            ratio > 0.001 ? "DIFFERENCES FOUND" : "LOCAL REGRESSION PASSED";
          if (official) status = "OFFICIAL COMPARISON REQUIRES HUMAN REVIEW";
          if (ratio > 0.001) failures++;
        } catch (e) {
          if (e.code === "ENOENT") {
            missing++;
            status = official
              ? "MISSING VERIFIED OFFICIAL SCREENSHOT"
              : "MISSING LOCAL BASELINE";
          } else throw e;
        }
      }
      if (errors.length) {
        failures++;
        status += "; BROWSER ERRORS: " + errors.join(", ");
      }
      rows.push({ id, width, height, source, status, ratio });
      await context.close();
      console.log(key, status, ratio ?? "");
    }
} finally {
  await browser.close();
}
await fs.writeFile(
  `${out}/report.json`,
  JSON.stringify(
    {
      mode: official ? "official" : "local-regression",
      failures,
      missing,
      rows,
    },
    null,
    2,
  ),
);
const escape = (s) =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll('"', "&quot;");
await fs.writeFile(
  `${out}/report.html`,
  `<!doctype html><meta charset="utf-8"><title>LarpScreens visual evidence</title><style>body{font:14px system-ui;background:#111;color:#ddd;margin:24px}section{border-top:1px solid #555;padding:18px 0}.images{display:flex;gap:10px}figure{margin:0;flex:1;min-width:0}img{width:100%}a{color:#9bd}small{color:#aaa}</style><h1>${official ? "Official reference comparisons" : "Local visual regression"}</h1><p>Local screenshots are never evidence of matching a real platform. Missing official references remain unverified. Pixel differences include simulated data and require human interpretation.</p>${rows
    .map((r) => {
      const k = `${r.id}-${r.width}x${r.height}`;
      return `<section><h2>${k}</h2><p>${escape(r.status)} ${r.ratio === null ? "" : (r.ratio * 100).toFixed(3) + "% differing pixels"}</p><small>Official source: ${r.source ? escape(r.source) : "No named platform specified"}</small><div class="images">${["reference", "actual", "diff"].map((type) => `<figure><figcaption>${type}</figcaption><img src="${k}-${type}.png" alt="${type} unavailable if no verified reference was supplied"></figure>`).join("")}</div></section>`;
    })
    .join("")}`,
);
if (failures || missing) process.exitCode = 1;
