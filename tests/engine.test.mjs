import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createState,
  step,
  trade,
  transfer,
  convert,
  placeLimit,
  rebase,
  defaultSettings,
} from "../src/engine.ts";
const close = (a, b) => assert.ok(Math.abs(a - b) < 0.000001, `${a} != ${b}`);
test("buy then sell conserves cash + assets and records both actions", () => {
  const s = createState("crypto");
  const n = trade(s, 0, 0.1);
  close(n.cash, s.cash - s.prices[0] * 0.1);
  close(n.quantities[0], s.quantities[0] + 0.1);
  close(n.cash + n.value, s.cash + s.value);
  const sold = trade(n, 0, -0.1);
  close(sold.cash, s.cash);
  close(sold.value, s.value);
  assert.equal(sold.transactions.length, 2);
});
test("reject invalid, overdrawn, and over-sold trades", () => {
  const s = createState("stocks");
  for (const [i, q] of [
    [0, 1e9],
    [0, -1e9],
    [-1, 1],
    [5, 1],
    [0, 0],
    [0, NaN],
  ])
    assert.equal(trade(s, i, q), s);
});
test("conversion conserves total asset and cash value", () => {
  const s = createState("crypto"),
    n = convert(s, 0, 1, 1);
  close(n.value, s.value);
  close(n.cash, s.cash);
  close(n.quantities[1], s.quantities[1] + s.prices[0] / s.prices[1]);
  assert.equal(n.transactions.length, 1);
  assert.equal(convert(s, 0, 0, 1), s);
});
test("bank balances stay fixed without transactions; transfers conserve total", () => {
  let s = createState("banking");
  const start = s.cash;
  for (let i = 0; i < 100; i++) s = step(s, "banking", defaultSettings);
  close(s.cash, start);
  assert.ok(s.history.every((p) => p.value === start));
  const n = transfer(s, 1000);
  close(n.cash, start - 1000);
  close(n.cash + n.savings, s.cash + s.savings);
  assert.equal(n.transactions.length, 1);
  assert.equal(transfer(s, Infinity), s);
  assert.equal(transfer(s, -2), s);
});
test("every revenue increase has a recorded order", () => {
  let s = createState("business");
  for (let i = 0; i < 400; i++) s = step(s, "business", defaultSettings);
  assert.ok(s.orders.length > 0);
  close(
    s.revenue,
    s.orders.reduce((a, o) => a + o.amount, 0),
  );
  assert.equal(s.customers, s.orders.length);
});
test("market chart and portfolio equal quantity times price on every tick", () => {
  let s = createState("stocks");
  let down = false,
    up = false;
  for (let i = 0; i < 200; i++) {
    const prev = s.value;
    s = step(s, "stocks", defaultSettings);
    close(
      s.value,
      s.prices.reduce((v, p, j) => v + p * s.quantities[j], 0),
    );
    close(s.history.at(-1).value, s.value);
    up ||= s.value > prev;
    down ||= s.value < prev;
  }
  assert.ok(up && down);
  assert.equal(s.history.length, 64);
});
test("limit orders fill at matching market and only once", () => {
  let s = createState("stocks");
  s = placeLimit(s, 0, 2, s.prices[0] * 2);
  s = step(s, "stocks", defaultSettings);
  assert.equal(s.limits[0].status, "filled");
  assert.equal(s.transactions.length, 1);
  s = step(s, "stocks", defaultSettings);
  assert.equal(s.transactions.length, 1);
});
test("followers increase naturally, deterministic reset restores sequence", () => {
  let a = createState("instagram"),
    b = createState("instagram");
  for (let i = 0; i < 100; i++) {
    a = step(a, "instagram", defaultSettings);
    b = step(b, "instagram", defaultSettings);
  }
  assert.deepEqual(a, b);
  assert.ok(a.followers > 128450);
  assert.equal(a.history.at(-1).value, a.followers);
});
test("saved baseline clears actions, preserves balances and holdings", () => {
  const s = trade(createState("crypto"), 0, 0.1),
    n = rebase(s);
  assert.deepEqual(n.quantities, s.quantities);
  assert.equal(n.cash, s.cash);
  assert.equal(n.transactions.length, 0);
  assert.equal(n.tick, 0);
});
test("individual transactions can be reversed without creating money", async () => {
  const { undoTransaction } = await import("../src/engine.ts");
  const s = createState("crypto");
  const bought = trade(s, 0, 0.1);
  const undone = undoTransaction(bought, bought.transactions[0].id);
  close(undone.cash, s.cash);
  close(undone.value, s.value);
  assert.equal(undone.transactions.length, 0);
  const moved = transfer(s, 1000);
  const restored = undoTransaction(moved, moved.transactions[0].id);
  close(restored.cash, s.cash);
  close(restored.savings, s.savings);
});
test("profit includes cash and remains unchanged by buying or selling", () => {
  let s = createState("stocks");
  s = step(s, "stocks", defaultSettings);
  const profit = s.value + s.cash - s.startingWealth;
  const bought = trade(s, 0, 1);
  close(bought.value + bought.cash - bought.startingWealth, profit);
  const sold = trade(bought, 0, -10);
  close(sold.value + sold.cash - sold.startingWealth, profit);
});
test("independent dashboard histories do not reuse one identical price pattern", () => {
  assert.notDeepEqual(
    createState("stocks").history.map(
      (h) => h.value / createState("stocks").initial,
    ),
    createState("crypto").history.map(
      (h) => h.value / createState("crypto").initial,
    ),
  );
});
test("per-asset history follows prices and stays bounded", () => {
  let s = createState("crypto");
  for (let i = 0; i < 100; i++) s = step(s, "crypto", defaultSettings);
  s.prices.forEach((p, i) => {
    close(s.assetHistory[i].at(-1), p);
    assert.equal(s.assetHistory[i].length, 64);
  });
});
test("rapid transaction IDs remain unique and reversals remove only one action", async () => {
  const { undoTransaction } = await import("../src/engine.ts");
  let s = createState("stocks");
  s = trade(s, 0, 1);
  s = trade(s, 1, 1);
  s = transfer(s, 100);
  assert.equal(new Set(s.transactions.map((t) => t.id)).size, 3);
  const next = undoTransaction(s, s.transactions[0].id);
  assert.equal(next.transactions.length, 2);
});
