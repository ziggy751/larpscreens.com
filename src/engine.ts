export type Kind =
  | "stocks"
  | "crypto"
  | "instagram"
  | "tiktok"
  | "youtube"
  | "business"
  | "banking"
  | "streaming"
  | "analytics"
  | "luxury"
  | "custom";
export type Settings = {
  speed: number;
  growth: number;
  volatility: number;
  scenario: string;
  enabled: boolean;
  name: string;
  currency: string;
  seed: number;
};
export type LimitOrder = {
  id: number;
  asset: number;
  quantity: number;
  price: number;
  status: "pending" | "filled" | "cancelled";
  time: number;
};
export type Event = {
  id: number;
  label: string;
  amount: number;
  time: number;
  effect?: { deltas: number[]; cash: number; savings: number; basis: number };
};
export type State = {
  tick: number;
  prices: number[];
  quantities: number[];
  initial: number;
  startingWealth?: number;
  value: number;
  secondary: number;
  followers: number;
  views: number;
  likes: number;
  revenue: number;
  customers: number;
  mrr: number;
  orders: Event[];
  transactions: Event[];
  cash: number;
  savings: number;
  history: {
    time: number;
    value: number;
    open: number;
    close: number;
    high: number;
    low: number;
  }[];
  chat: string[];
  visitors: { x: number; y: number; id: number }[];
  rng: number;
  limits?: LimitOrder[];
};
export const defaultSettings: Settings = {
  speed: 1,
  growth: 1,
  volatility: 1,
  scenario: "Normal",
  enabled: true,
  name: "Alex Morgan",
  currency: "USD",
  seed: 42,
};
const basePrices = [142.87, 228.26, 418.5, 342.32, 218.94];
export function random(s: State) {
  s.rng = (Math.imul(1664525, s.rng) + 1013904223) >>> 0;
  return s.rng / 4294967296;
}
export function createState(kind: Kind, seed = 42): State {
  const prices =
    kind === "crypto" ? [97420, 2736, 198.4, 2.68, 0.253] : [...basePrices];
  const quantities =
    kind === "crypto"
      ? [4.2, 65, 320, 18000, 25000]
      : [1800, 700, 380, 420, 355];
  const initial = prices.reduce((a, p, i) => a + p * quantities[i], 0);
  const s: State = {
    tick: 0,
    prices,
    quantities,
    initial,
    startingWealth: initial + 48650,
    value: initial,
    secondary: 0,
    followers: 128450,
    views: 2847280,
    likes: 184520,
    revenue: 0,
    customers: 0,
    mrr: 0,
    orders: [],
    transactions: [],
    cash: 48650,
    savings: 125000,
    history: [],
    chat: [],
    visitors: [],
    rng: seed,
  };
  let v =
    kind === "stocks" || kind === "crypto"
      ? initial
      : kind === "banking"
        ? s.cash
        : kind === "streaming"
          ? 1248
          : kind === "analytics"
            ? 842
            : 128450;
  for (let i = 0; i < 64; i++) {
    const open = v;
    v *= 1 + (random(s) - 0.46) * 0.008;
    s.history.push({
      time: i - 63,
      value: v,
      open,
      close: v,
      high: Math.max(open, v) * 1.001,
      low: Math.min(open, v) * 0.999,
    });
  }
  const target =
    kind === "stocks" || kind === "crypto"
      ? initial
      : kind === "banking"
        ? s.cash
        : kind === "business"
          ? 0
          : kind === "streaming"
            ? 1248
            : kind === "analytics"
              ? 842
              : kind === "instagram"
                ? s.followers
                : kind === "luxury"
                  ? s.value
                  : s.views;
  const factor = target / (s.history[63].value || 1);
  s.history = s.history.map(
    (h) =>
      Object.fromEntries(
        Object.entries(h).map(([k, v]) => [
          k,
          k === "time"
            ? v
            : kind === "banking" || kind === "business" || kind === "luxury"
              ? target
              : v * factor,
        ]),
      ) as State["history"][number],
  );
  return s;
}
export function transfer(s: State, amount: number): State {
  if (!Number.isFinite(amount) || amount <= 0 || amount > s.cash) return s;
  return {
    ...s,
    cash: s.cash - amount,
    savings: s.savings + amount,
    transactions: [
      {
        id: s.transactions.length + 1,
        label: "Transfer to savings",
        amount: -amount,
        time: s.tick,
        effect: {
          deltas: s.prices.map(() => 0),
          cash: -amount,
          savings: amount,
          basis: 0,
        },
      },
      ...s.transactions,
    ],
  };
}
export function trade(s: State, index: number, quantity: number): State {
  if (
    !Number.isInteger(index) ||
    index < 0 ||
    index >= s.prices.length ||
    !Number.isFinite(quantity) ||
    quantity === 0 ||
    s.quantities[index] + quantity < 0
  )
    return s;
  const cost = s.prices[index] * quantity;
  if (cost > s.cash) return s;
  const quantities = s.quantities.map((q, i) =>
    i === index ? q + quantity : q,
  );
  return {
    ...s,
    quantities,
    cash: s.cash - cost,
    initial: s.initial + cost,
    value: s.prices.reduce((a, p, i) => a + p * quantities[i], 0),
    transactions: [
      {
        id: s.tick + Date.now(),
        label: `${quantity > 0 ? "Buy" : "Sell"} ${Math.abs(quantity).toFixed(6)} units · asset ${index + 1}`,
        amount: -cost,
        time: s.tick,
        effect: {
          deltas: s.prices.map((_, i) => (i === index ? quantity : 0)),
          cash: -cost,
          savings: 0,
          basis: cost,
        },
      },
      ...s.transactions,
    ],
  };
}
export function step(prev: State, kind: Kind, c: Settings): State {
  const s: State = {
    ...prev,
    prices: [...prev.prices],
    orders: [...prev.orders],
    transactions: [...prev.transactions],
    chat: [...prev.chat],
  };
  s.tick++;
  const r = () => random(s);
  const growth =
    c.growth *
    (c.scenario === "Viral" ? 12 : c.scenario === "Slow Growth" ? 0.2 : 1);
  const market = kind === "stocks" || kind === "crypto";
  let val = prev.history.at(-1)!.value;
  if (market) {
    const common =
      (r() - 0.5) * 0.0018 * c.volatility +
      (c.scenario === "Market Crash" ? -0.0025 * c.volatility : 0);
    s.prices = s.prices.map((p) =>
      Math.max(0.01, p * (1 + common + (r() - 0.5) * 0.003 * c.volatility)),
    );
    s.value = s.prices.reduce((a, p, i) => a + p * s.quantities[i], 0);
    s.limits = (prev.limits || []).map((order) => {
      if (order.status !== "pending") return order;
      const p = s.prices[order.asset];
      if (order.quantity > 0 ? p <= order.price : p >= order.price) {
        const result = trade(s, order.asset, order.quantity);
        if (result !== s) {
          Object.assign(s, result);
          return { ...order, status: "filled" as const };
        }
      }
      return order;
    });
    val = s.value;
  } else if (["instagram", "tiktok", "youtube", "custom"].includes(kind)) {
    const wave = 0.2 + Math.pow(Math.sin(s.tick / 19), 2) * 1.8;
    const views = Math.floor((r() * 70 + 12) * growth * wave);
    s.views += views;
    s.followers += Math.floor(views * (kind === "instagram" ? 0.09 : 0.012));
    if (s.tick % 4 === 0) s.likes += Math.floor(views * 0.14);
    s.revenue += ((kind === "youtube" ? 4.2 : 0.65) * views) / 1000;
    val = kind === "instagram" ? s.followers : s.views;
  } else if (kind === "business") {
    if (r() < Math.min(0.8, 0.13 * growth)) {
      const amount = Math.round((29 + r() * 420) * 100) / 100;
      const subscription = r() < 0.3;
      s.orders = [
        {
          id: s.tick,
          label: subscription
            ? "Studio plan · subscription"
            : ["Essential kit", "Pro collection", "Digital bundle"][
                Math.floor(r() * 3)
              ],
          amount,
          time: s.tick,
        },
        ...s.orders,
      ];
      s.revenue += amount;
      s.customers++;
      if (subscription) s.mrr += amount;
    }
    s.value = s.revenue;
    val = s.revenue;
  } else if (kind === "banking") {
    val = s.cash;
  } else if (kind === "streaming") {
    s.secondary = Math.max(
      15,
      Math.round((prev.secondary || 1248) + (r() - 0.48) * 100 * growth),
    );
    if (s.tick % 6 === 0) s.followers += Math.floor(r() * 4 * growth);
    if (s.tick % 3 === 0)
      s.chat = [
        [
          "nova: this looks incredible",
          "pixelwave: hello from Sydney!",
          "alex: what a stream ✨",
          "milo: let’s go!",
          "luna: love the setup",
        ][Math.floor(r() * 5)],
        ...s.chat,
      ].slice(0, 8);
    if (r() < 0.05 * growth) {
      const amount = r() < 0.5 ? 5 : 15;
      s.revenue += amount;
      s.orders = [
        {
          id: s.tick,
          label: amount === 5 ? "New demo subscription" : "Demo donation",
          amount,
          time: s.tick,
        },
        ...s.orders,
      ];
    }
    val = s.secondary;
  } else if (kind === "analytics") {
    s.secondary = Math.max(
      1,
      Math.round((prev.secondary || 842) + (r() - 0.48) * 80 * growth),
    );
    s.views += Math.floor(s.secondary * 0.03);
    s.visitors = [
      { x: 10 + r() * 80, y: 15 + r() * 65, id: s.tick },
      ...prev.visitors,
    ].slice(0, 14);
    val = s.secondary;
  } else {
    val = prev.value;
  }
  const open = prev.history.at(-1)!.close;
  s.history = [
    ...prev.history.slice(-63),
    {
      time: s.tick,
      value: val,
      open,
      close: val,
      high: Math.max(open, val) * (1 + r() * 0.001),
      low: Math.min(open, val) * (1 - r() * 0.001),
    },
  ];
  return s;
}

export function placeLimit(
  s: State,
  asset: number,
  quantity: number,
  price: number,
): State {
  if (
    !Number.isInteger(asset) ||
    asset < 0 ||
    asset >= s.prices.length ||
    !Number.isFinite(quantity) ||
    quantity === 0 ||
    !Number.isFinite(price) ||
    price <= 0
  )
    return s;
  if (
    (quantity > 0 && quantity * price > s.cash) ||
    (quantity < 0 && -quantity > s.quantities[asset])
  )
    return s;
  return {
    ...s,
    limits: [
      ...(s.limits || []),
      {
        id: Date.now(),
        asset,
        quantity,
        price,
        status: "pending",
        time: s.tick,
      },
    ],
  };
}
export function convert(
  s: State,
  from: number,
  to: number,
  quantity: number,
): State {
  if (
    from === to ||
    !Number.isInteger(from) ||
    !Number.isInteger(to) ||
    from < 0 ||
    to < 0 ||
    from >= s.prices.length ||
    to >= s.prices.length ||
    !Number.isFinite(quantity) ||
    quantity <= 0 ||
    quantity > s.quantities[from]
  )
    return s;
  const quantities = [...s.quantities];
  const amount = quantity * s.prices[from];
  quantities[from] -= quantity;
  quantities[to] += amount / s.prices[to];
  return {
    ...s,
    quantities,
    value: s.prices.reduce((a, p, i) => a + p * quantities[i], 0),
    transactions: [
      {
        id: Date.now(),
        label: `Convert ${quantity} units · asset ${from + 1} → ${to + 1}`,
        amount: 0,
        time: s.tick,
        effect: {
          deltas: quantities.map((q, i) => q - s.quantities[i]),
          cash: 0,
          savings: 0,
          basis: 0,
        },
      },
      ...s.transactions,
    ],
  };
}
export function rebase(s: State): State {
  const value = s.prices.reduce((a, p, i) => a + p * s.quantities[i], 0);
  return {
    ...s,
    tick: 0,
    history: s.history.map((h) => ({
      ...h,
      open: s.history.at(-1)!.value,
      close: s.history.at(-1)!.value,
      value: s.history.at(-1)!.value,
      high: s.history.at(-1)!.value,
      low: s.history.at(-1)!.value,
    })),
    value,
    initial: value,
    startingWealth: value + s.cash,
    orders:
      s.revenue > 0
        ? [{ id: 0, label: "Opening demo revenue", amount: s.revenue, time: 0 }]
        : [],
    transactions: [],
    limits: [],
    chat: [],
    visitors: [],
  };
}

export function undoTransaction(s: State, id: number): State {
  const event = s.transactions.find((e) => e.id === id);
  if (!event?.effect) return s;
  const e = event.effect;
  const quantities = s.quantities.map((q, i) => q - e.deltas[i]);
  if (
    quantities.some((q) => q < -0.0000001) ||
    s.cash - e.cash < 0 ||
    s.savings - e.savings < 0
  )
    return s;
  return {
    ...s,
    quantities,
    cash: s.cash - e.cash,
    savings: s.savings - e.savings,
    initial: s.initial - e.basis,
    value: s.prices.reduce((v, p, i) => v + p * quantities[i], 0),
    transactions: s.transactions.filter((t) => t.id !== id),
  };
}
