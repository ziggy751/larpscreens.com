import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const b = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
p.on("pageerror", (e) => errors.push(e.message));
async function launch(name) {
  await p.goto("http://127.0.0.1:5173");
  await p.getByRole("button", { name: `Launch ${name}`, exact: true }).click();
  await p.locator(".native-capture>div").waitFor();
  await p.getByRole("button", { name: "Pause", exact: true }).click();
}
async function snapshot(id) {
  await p.waitForTimeout(400);
  return p.evaluate(
    (id) => JSON.parse(localStorage.getItem("larp-dashboard-" + id)),
    id,
  );
}
await launch("Binance-style Exchange");
let before = await snapshot("crypto-binance");
await p
  .getByRole("button", { name: "Buy BTC · simulated", exact: true })
  .click();
let after = await snapshot("crypto-binance");
assert.ok(after.cash < before.cash);
assert.equal(after.transactions.length, 1);
await p
  .locator(".terminal-watch>button")
  .filter({ hasText: "ETH/USD" })
  .click();
await p.locator(".trade-fields select").nth(1).selectOption("Limit");
const limitInput = p.locator(".trade-fields input").last();
await limitInput.fill("100");
await p
  .getByRole("button", { name: "Buy ETH · simulated", exact: true })
  .click();
after = await snapshot("crypto-binance");
assert.equal(after.limits[0].asset, 1);
assert.equal(after.limits[0].price, 100);
await p
  .locator(".terminal-header")
  .getByRole("button", { name: "Orders", exact: true })
  .click();
await p.getByRole("button", { name: "Cancel", exact: true }).click();
after = await snapshot("crypto-binance");
assert.equal(after.limits[0].status, "cancelled");
console.log(
  "PASS market execution, selected asset limit, cancellation, order records",
);
await launch("Phantom-style Wallet");
await p.getByRole("button", { name: "Swap", exact: true }).click();
before = await snapshot("crypto-phantom");
await p
  .getByRole("button", { name: "Convert · simulated", exact: true })
  .click();
after = await snapshot("crypto-phantom");
assert.ok(after.quantities[0] < before.quantities[0]);
assert.ok(after.quantities[1] > before.quantities[1]);
assert.ok(Math.abs(after.value - before.value) < 1e-6);
await p.getByRole("button", { name: "Close wallet action" }).click();
await p.getByRole("textbox", { name: "Search wallet assets" }).fill("sol");
assert.equal(await p.locator(".wallet-token").count(), 1);
await p.locator(".wallet-token").click();
await p.getByRole("button", { name: "Close asset detail" }).click();
await p.getByLabel("Demo wallet account").selectOption("2");
await p.getByLabel("Demo wallet account").selectOption("1");
after = await snapshot("crypto-phantom");
assert.deepEqual(
  after.quantities,
  before.quantities.map((q, i) =>
    i === 0
      ? q - 0.01
      : i === 1
        ? q + (0.01 * before.prices[0]) / before.prices[1]
        : q,
  ),
);
console.log(
  "PASS wallet swap conservation, search, asset details, account restoration",
);
await launch("Trust-style Wallet");
await p.getByLabel("Network", { exact: true }).selectOption("Solana");
assert.equal(await p.locator(".wallet-token").count(), 1);
await p.getByRole("button", { name: "Activity", exact: true }).click();
await p.getByRole("button", { name: "Tokens", exact: true }).click();
console.log("PASS network filtering and wallet tabs");
await launch("Token Discovery");
await p.getByLabel("Search fictional tokens").fill("moon");
assert.equal(await p.locator(".token-listing").count(), 3);
await p.locator(".token-open").first().click();
await p.getByRole("heading", { name: "MOON / USD" }).waitFor();
await p
  .getByRole("button", { name: "Buy MOON · simulated", exact: true })
  .click();
assert.equal((await snapshot("crypto-discovery")).transactions.length, 1);
console.log("PASS discovery search, token detail, fictional token purchase");
for (const [name, nav, button, close] of [
  ["Channel Studio", ".studio-sidebar", "Content", "Close content detail"],
  ["Creator Insights", ".instagram-rail", "Content", "Close content detail"],
  ["Viral Analytics", ".tiktok-nav", "Content", "Close content detail"],
]) {
  await launch(name);
  await p
    .locator(nav)
    .getByRole("button", { name: button, exact: true })
    .click();
  await p
    .locator(
      name === "Channel Studio"
        ? ".studio-video-result"
        : name === "Creator Insights"
          ? ".ig-posts>button"
          : ".creator-content-table>button",
    )
    .first()
    .click();
  await p.getByRole("button", { name: close }).click();
  console.log("PASS content navigation and detailed fictional post", name);
}
await launch("Private Banking");
before = await snapshot("6-0");
await p
  .locator(".bank-main>header")
  .getByRole("button", { name: "Transfer", exact: true })
  .click();
await p
  .getByRole("button", { name: "Transfer · simulated", exact: true })
  .click();
after = await snapshot("6-0");
assert.equal(after.cash, before.cash - 1000);
assert.equal(after.savings, before.savings + 1000);
await p
  .locator(".bank-nav")
  .getByRole("button", { name: "Transactions", exact: true })
  .click();
await p.getByRole("button", { name: "Undo", exact: true }).click();
after = await snapshot("6-0");
assert.equal(after.cash, before.cash);
console.log("PASS bank transfer, transaction history, undo conservation");
await launch("Revenue Studio");
await p
  .getByRole("button", { name: "Place fictional order", exact: true })
  .click();
after = await snapshot("2-0");
assert.equal(after.revenue, 249);
assert.equal(after.orders.length, 1);
await p
  .locator(".commerce-nav")
  .getByRole("button", { name: /Orders/ })
  .click();
await p.getByRole("button", { name: "Reset order", exact: true }).click();
after = await snapshot("2-0");
assert.equal(after.revenue, 0);
console.log(
  "PASS fictional checkout, orders navigation, individual order reset",
);
await p
  .getByRole("button", { name: "Edit stats", exact: true })
  .first()
  .click();
await p.getByLabel("Starting cash / checking balance").fill("100000");
await p.getByRole("button", { name: "Save Setup", exact: true }).click();
await p.getByLabel("Starting cash / checking balance").fill("15");
await p.getByRole("button", { name: "Reset Activity", exact: true }).click();
assert.equal(
  await p.getByLabel("Starting cash / checking balance").inputValue(),
  "100000",
);
await p.getByRole("button", { name: "Reset Everything", exact: true }).click();
assert.equal(
  await p.getByLabel("Starting cash / checking balance").inputValue(),
  "48650",
);
console.log("PASS edited cash, saved baseline, reset activity, default reset");
assert.deepEqual(errors, []);
await b.close();
