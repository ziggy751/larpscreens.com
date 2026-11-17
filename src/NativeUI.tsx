import { useState, type Dispatch, type SetStateAction } from "react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  type State,
  type Kind,
  type Settings,
  undoTransaction,
} from "./engine";
export type ScreenProps = {
  s: State;
  setS: Dispatch<SetStateAction<State>>;
  kind: Kind;
  variant?: string;
  money: (n: number) => string;
  notify: (s: string) => void;
  profile: string;
  bio: string;
  avatar: string;
  full: boolean;
  onExit: () => void;
  running: boolean;
  setRunning: (v: boolean) => void;
  settings: Settings;
};
export const coins = ["Bitcoin", "Ethereum", "Solana", "XRP", "Dogecoin"];
export const symbols = ["BTC", "ETH", "SOL", "XRP", "DOGE"];
export const assetColors = [
  "#f9ab3b",
  "#6581e4",
  "#a382ed",
  "#51b1dd",
  "#80c98c",
];
export const n = (v: number) => Math.floor(v).toLocaleString();
export const short = (v: number) =>
  new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(v);
export function Stamp({ exit }: { exit: () => void }) {
  return (
    <div className="native-stamp">
      <span>SIMULATION · LarpScreens</span>
      <button aria-label="Exit fullscreen" onClick={exit}>
        ↙
      </button>
    </div>
  );
}
export function Plot({
  s,
  color = "#31c8aa",
  asset,
  candles = false,
  small = false,
}: {
  s: State;
  color?: string;
  asset?: number;
  candles?: boolean;
  small?: boolean;
}) {
  const [period, setPeriod] = useState("1D");
  const [hover, setHover] = useState<number | null>(null);
  const [mode, setMode] = useState(candles);
  const count = (
    { "1H": 12, "1D": 32, "1W": 48, "1M": 64 } as Record<string, number>
  )[period];
  const values =
    asset === undefined
      ? s.history.map((h) => h.value)
      : s.assetHistory?.[asset] ||
        s.history.map((h) => (h.value / (s.value || 1)) * s.prices[asset]);
  const data = values
    .slice(-count)
    .map((v, i, a) => ({
      value: i === a.length - 1 && asset !== undefined ? s.prices[asset] : v,
      open: i ? a[i - 1] : v,
    }));
  const lo = Math.min(...data.flatMap((d) => [d.value, d.open])),
    hi = Math.max(...data.flatMap((d) => [d.value, d.open]));
  const y = (v: number) => 240 - ((v - lo) / (hi - lo || 1)) * 210;
  return (
    <div className={`native-plot ${small ? "small" : ""}`}>
      <div className="plot-tools">
        <div>
          {["1H", "1D", "1W", "1M"].map((v) => (
            <button
              className={period === v ? "selected" : ""}
              key={v}
              onClick={() => setPeriod(v)}
            >
              {v}
            </button>
          ))}
        </div>
        {candles && (
          <button
            className={mode ? "selected" : ""}
            onClick={() => setMode(!mode)}
          >
            {mode ? "Candles" : "Line"}
          </button>
        )}
        <small>
          {hover !== null
            ? data[hover]?.value.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })
            : "Simulated observations"}
        </small>
      </div>
      <div className="native-graph" onMouseLeave={() => setHover(null)}>
        {mode ? (
          <svg
            viewBox="0 0 800 260"
            preserveAspectRatio="none"
            role="img"
            aria-label="Interactive simulated candlestick chart"
            onMouseMove={(e) =>
              setHover(
                Math.min(
                  data.length - 1,
                  Math.floor(
                    ((e.clientX -
                      e.currentTarget.getBoundingClientRect().left) /
                      e.currentTarget.getBoundingClientRect().width) *
                      data.length,
                  ),
                ),
              )
            }
          >
            {[30, 80, 130, 180, 230].map((v) => (
              <line key={v} x1="0" x2="800" y1={v} y2={v} stroke="#ffffff12" />
            ))}
            {data.map((p, i) => {
              const c = p.value >= p.open ? "#18bc9b" : "#f65b72";
              return (
                <g
                  key={i}
                  stroke={c}
                  fill={c}
                  opacity={hover === null || hover === i ? 1 : 0.65}
                >
                  <line
                    x1={((i + 0.5) * 800) / data.length}
                    x2={((i + 0.5) * 800) / data.length}
                    y1={Math.min(y(p.value), y(p.open)) - 7}
                    y2={Math.max(y(p.value), y(p.open)) + 7}
                  />
                  <rect
                    x={((i + 0.18) * 800) / data.length}
                    y={Math.min(y(p.value), y(p.open))}
                    width={(0.64 * 800) / data.length}
                    height={Math.max(2, Math.abs(y(p.value) - y(p.open)))}
                  />
                </g>
              );
            })}
            {hover !== null && (
              <line
                x1={((hover + 0.5) * 800) / data.length}
                x2={((hover + 0.5) * 800) / data.length}
                y1="0"
                y2="260"
                stroke="#ffffff50"
                strokeDasharray="3 3"
              />
            )}
          </svg>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 15, right: 10, left: 0, bottom: 5 }}
            >
              <CartesianGrid
                vertical={false}
                stroke="currentColor"
                strokeOpacity={0.08}
              />
              <YAxis
                hide
                domain={["dataMin", "dataMax"]}
                padding={{ top: 30, bottom: 20 }}
              />
              <Tooltip
                labelFormatter={() => "Simulation"}
                contentStyle={{
                  background: "#20252d",
                  border: "1px solid #444",
                  borderRadius: 5,
                  color: "#fff",
                }}
                formatter={(v) =>
                  Number(v).toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })
                }
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                fill={color}
                fillOpacity={0.06}
                strokeWidth={2}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
      <div className="plot-axis">
        <span>Earlier</span>
        <span>{s.tick}s elapsed</span>
        <span>Now</span>
      </div>
    </div>
  );
}
export function Ledger({
  p,
  orders = false,
}: {
  p: ScreenProps;
  orders?: boolean;
}) {
  const events = orders ? p.s.orders : p.s.transactions;
  return (
    <div className="native-ledger">
      <div className="ledger-head">
        <b>{orders ? "Order" : "Transaction"}</b>
        <b>Amount</b>
        <b>Status</b>
        <b>Action</b>
      </div>
      {events.map((e, i) => (
        <div className="ledger-row" key={`${e.id}-${i}`}>
          <span>
            {e.label}
            <small>Simulation time · {e.time}s</small>
          </span>
          <b>{p.money(e.amount)}</b>
          <small>Completed · demo</small>
          {e.effect ? (
            <button
              onClick={() => {
                const next = undoTransaction(p.s, e.id);
                if (next === p.s)
                  p.notify("Current balances do not allow reversal");
                else {
                  p.setS(next);
                  p.notify("Fictional transaction reversed");
                }
              }}
            >
              Undo
            </button>
          ) : orders ? (
            <button
              onClick={() =>
                p.setS((s) => ({
                  ...s,
                  revenue: Math.max(0, s.revenue - e.amount),
                  customers: Math.max(0, s.customers - 1),
                  mrr: e.label.includes("subscription")
                    ? Math.max(0, s.mrr - e.amount)
                    : s.mrr,
                  orders: s.orders.filter((x) => x.id !== e.id),
                }))
              }
            >
              Reset order
            </button>
          ) : (
            <span />
          )}
        </div>
      ))}
      {!events.length && (
        <p className="native-empty">
          No fictional {orders ? "orders" : "transactions"} yet.
        </p>
      )}
      {!orders &&
        (p.s.limits || []).map((o) => (
          <div className="ledger-row" key={o.id}>
            <span>
              {o.quantity > 0 ? "Buy" : "Sell"} {Math.abs(o.quantity)}{" "}
              {symbols[o.asset]}
              <small>Limit @ {p.money(o.price)}</small>
            </span>
            <b>{p.money(Math.abs(o.quantity) * o.price)}</b>
            <small>{o.status}</small>
            {o.status === "pending" && (
              <button
                onClick={() =>
                  p.setS((s) => ({
                    ...s,
                    limits: s.limits?.map((x) =>
                      x.id === o.id ? { ...x, status: "cancelled" } : x,
                    ),
                  }))
                }
              >
                Cancel
              </button>
            )}
          </div>
        ))}
    </div>
  );
}
export function AssetIcon({ i }: { i: number }) {
  return (
    <span
      className="native-asset-icon"
      style={{ background: assetColors[i], color: i === 0 ? "#fff" : "#fff" }}
    >
      {["₿", "Ξ", "◎", "×", "Ð"][i]}
    </span>
  );
}
