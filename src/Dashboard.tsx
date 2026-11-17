import {
  useState,
  useEffect,
  useRef,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  ArrowLeft,
  Download,
  Maximize2,
  X,
  Play,
  Pause,
  RotateCcw,
  Settings2,
  FolderOpen,
  ChevronRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { BusinessDesk } from "./BusinessDesk";
import { TradeDesk } from "./TradeDesk";
import { toPng } from "html-to-image";
import {
  createState,
  step,
  transfer,
  trade,
  rebase,
  undoTransaction,
  type Kind,
  type Settings,
  type State,
} from "./engine";
type Template = { id: string; kind: Kind; name: string; color: string };
const designs: Record<
  Kind,
  {
    title: string;
    subtitle: string;
    accent: string;
    chart: string;
    labels: string[];
  }
> = {
  stocks: {
    title: "Stock Portfolio",
    subtitle: "Investment overview · fictional holdings",
    accent: "#00dbb2",
    chart: "Portfolio performance",
    labels: ["Portfolio value", "Total return", "Invested"],
  },
  crypto: {
    title: "Crypto Exchange",
    subtitle: "Crypto price and asset simulation",
    accent: "#aa9bff",
    chart: "Market performance",
    labels: ["Total assets", "Bitcoin", "Ethereum"],
  },
  instagram: {
    title: "Creator Analytics",
    subtitle: "Social media insights · fictional account",
    accent: "#f268bf",
    chart: "Follower growth",
    labels: ["Followers", "Accounts reached", "Interactions"],
  },
  youtube: {
    title: "Video Channel Studio",
    subtitle: "Creator statistics · fictional channel",
    accent: "#ff4d60",
    chart: "Views over time",
    labels: ["Subscribers", "Views", "Est. revenue"],
  },
  tiktok: {
    title: "Short Video Analytics",
    subtitle: "Viral growth simulation",
    accent: "#2ed1e4",
    chart: "Views and reach",
    labels: ["Followers", "Video views", "Total likes"],
  },
  business: {
    title: "Business Revenue",
    subtitle: "Ecommerce dashboard · simulated orders",
    accent: "#60a5fa",
    chart: "Revenue over time",
    labels: ["Revenue", "Orders", "Customers"],
  },
  analytics: {
    title: "Website Analytics",
    subtitle: "Traffic and visitors · simulated sessions",
    accent: "#ffbc54",
    chart: "Traffic over time",
    labels: ["Active users", "Page views", "Conversions"],
  },
  streaming: {
    title: "Streaming Analytics",
    subtitle: "Live channel stats · simulated viewers",
    accent: "#8f7aff",
    chart: "Live viewership",
    labels: ["Live viewers", "Followers", "Subscribers"],
  },
  banking: {
    title: "Private Banking",
    subtitle: "Personal finance · fictional accounts",
    accent: "#00dbb2",
    chart: "Checking account balance",
    labels: ["Total balance", "Checking", "Savings"],
  },
  luxury: {
    title: "Private Collection",
    subtitle: "Luxury assets · fictional collection",
    accent: "#d6c29a",
    chart: "Collection valuation",
    labels: ["Collection value", "Properties", "Collectibles"],
  },
  custom: {
    title: "Custom Analytics",
    subtitle: "Your workspace · fictional metrics",
    accent: "#60a5fa",
    chart: "Performance over time",
    labels: ["Followers", "Video views", "Total likes"],
  },
};
export function Dashboard({
  template: t,
  settings: c,
  setSettings,
  live,
  setLive,
  onBack,
  onSave,
  notify: externalNotify,
}: {
  template: Template;
  settings: Settings;
  setSettings: Dispatch<SetStateAction<Settings>>;
  live: boolean;
  setLive: (v: boolean) => void;
  onBack: () => void;
  onSave: () => void;
  notify: (s: string) => void;
  comparison?: string | null;
  setComparison?: (s: string | null) => void;
}) {
  const [message, setMessage] = useState("");
  const notify = (text: string) => {
    setMessage(text);
    externalNotify(text);
  };
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 3500);
    return () => clearTimeout(timer);
  }, [message]);
  const d = designs[t.kind],
    market = t.kind === "stocks" || t.kind === "crypto";
  const storeKey = "larp-dashboard-" + t.id;
  const [s, setS] = useState<State>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(storeKey) || "null");
      return stored &&
        Array.isArray(stored.history) &&
        stored.history.length &&
        stored.prices?.length === 5
        ? stored
        : createState(t.kind, c.seed);
    } catch {
      return createState(t.kind, c.seed);
    }
  });
  const [running, setRunning] = useState(true),
    [editing, setEditing] = useState(false),
    [full, setFull] = useState(false),
    [tab, setTab] = useState("Overview"),
    [range, setRange] = useState("1D"),
    [candles, setCandles] = useState(false),
    [amount, setAmount] = useState(250),
    [qty, setQty] = useState(1),
    [asset, setAsset] = useState(0),
    [currency, setCurrency] = useState(c.currency),
    [profile, setProfile] = useState(
      () => localStorage.getItem(storeKey + "-profile") || "",
    ),
    [bio, setBio] = useState(
      () =>
        localStorage.getItem(storeKey + "-bio") || "Fictional creator account",
    ),
    [avatar, setAvatar] = useState(
      () => localStorage.getItem(storeKey + "-avatar") || "",
    );
  const root = useRef<HTMLDivElement>(null),
    capture = useRef<HTMLDivElement>(null);
  const money = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: market ? 2 : 0,
    }).format(n);
  const num = (n: number) => Math.floor(n).toLocaleString();
  const patch = (key: keyof Settings, v: number | string | boolean) =>
    setSettings((p) => ({ ...p, [key]: v }));
  const reset = () => {
    setS(createState(t.kind, c.seed));
    notify("Simulation reset to its starting state");
  };
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(storeKey, JSON.stringify(s));
    }, 300);
    return () => clearTimeout(timer);
  }, [s, storeKey]);
  useEffect(() => {
    localStorage.setItem(storeKey + "-profile", profile);
    localStorage.setItem(storeKey + "-bio", bio);
    localStorage.setItem(storeKey + "-avatar", avatar);
  }, [profile, bio, avatar, storeKey]);
  useEffect(() => {
    if (!running || !live || !c.enabled) return;
    const interval = setInterval(() => {
      if (!document.hidden) setS((p) => step(p, t.kind, c));
    }, 1000 / c.speed);
    return () => clearInterval(interval);
  }, [running, live, c, t.kind]);
  const present = async () => {
    setEditing(false);
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }
    try {
      await root.current?.requestFullscreen();
      setFull(true);
    } catch {
      setFull(true);
      notify("Browser fullscreen unavailable; using full-window presentation");
    }
  };
  useEffect(() => {
    const handle = () => setFull(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handle);
    return () => document.removeEventListener("fullscreenchange", handle);
  }, []);
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (
        ["INPUT", "SELECT", "TEXTAREA", "BUTTON"].includes(
          (e.target as HTMLElement).tagName,
        )
      )
        return;
      if (e.code === "Space") {
        e.preventDefault();
        setRunning((r) => !r);
      }
      if (e.key.toLowerCase() === "r") reset();
      if (e.key.toLowerCase() === "f") present();
      if (e.key === "Escape") setFull(false);
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [c.seed, t.kind]);
  const exportImage = async () => {
    try {
      if (!capture.current) return;
      const png = await toPng(capture.current, {
        pixelRatio: 2,
        backgroundColor: "#090e15",
      });
      const a = document.createElement("a");
      a.href = png;
      a.download = "LarpScreens-SIMULATION.png";
      a.click();
    } catch {
      notify("Screenshot export failed. Please try again.");
    }
  };
  useEffect(() => {
    const value = market
      ? s.value
      : t.kind === "banking"
        ? s.cash
        : t.kind === "business"
          ? s.revenue
          : t.kind === "instagram"
            ? s.followers
            : ["youtube", "tiktok", "custom"].includes(t.kind)
              ? s.views
              : null;
    if (value !== null)
      setS((p) =>
        p.history.at(-1)?.value === value
          ? p
          : {
              ...p,
              history: p.history.map((h, i) =>
                i === p.history.length - 1
                  ? {
                      ...h,
                      value,
                      close: value,
                      high: Math.max(h.high, value),
                      low: Math.min(h.low, value),
                    }
                  : h,
              ),
            },
      );
  }, [s.value, s.cash, s.revenue, s.followers, s.views, market, t.kind]);
  const symbols =
    t.kind === "crypto"
      ? ["BTC", "ETH", "SOL", "XRP", "DOGE"]
      : ["NVDA", "AAPL", "MSFT", "TSLA", "AMZN"];
  const profit = s.value + s.cash - (s.startingWealth ?? s.initial + s.cash);
  const returnPercent = (profit / ((s.startingWealth ?? s.initial) || 1)) * 100;
  const numbers =
    t.kind === "stocks"
      ? [money(s.value), `${returnPercent.toFixed(2)}%`, money(s.initial)]
      : t.kind === "crypto"
        ? [money(s.value), money(s.prices[0]), money(s.prices[1])]
        : t.kind === "business"
          ? [money(s.revenue), num(s.orders.length), num(s.customers)]
          : t.kind === "banking"
            ? [money(s.cash + s.savings), money(s.cash), money(s.savings)]
            : t.kind === "streaming"
              ? [
                  num(s.secondary || 1248),
                  num(s.followers),
                  num(s.orders.filter((o) => o.amount === 5).length),
                ]
              : t.kind === "analytics"
                ? [
                    num(s.secondary || 842),
                    num(s.views),
                    num(Math.floor(s.views * 0.031)),
                  ]
                : t.kind === "youtube"
                  ? [num(s.followers), num(s.views), money(s.revenue)]
                  : t.kind === "instagram"
                    ? [
                        num(s.followers),
                        num(Math.floor(s.views * 0.8)),
                        num(s.likes),
                      ]
                    : t.kind === "luxury"
                      ? [money(s.value), money(s.cash), money(s.savings)]
                      : [num(s.followers), num(s.views), num(s.likes)];
  const sub =
    t.kind === "stocks"
      ? [
          `${money(profit)} since opening`,
          `${money(profit)} all time`,
          `${s.quantities.filter((q) => q > 0).length} assets`,
        ]
      : t.kind === "business"
        ? [
            `${s.orders.length} recorded orders`,
            `${money(s.orders.length ? s.revenue / s.orders.length : 0)} avg. order`,
            `${money(s.mrr)} recurring / month`,
          ]
        : t.kind === "banking"
          ? [
              "Fictional accounts",
              "Transfers update balances",
              "No random balance changes",
            ]
          : ["Fictional data", "Simulated activity", "Simulation only"];
  const points = s.history.slice(
    -({ "1D": 64, "1W": 48, "1M": 32, "1Y": 16 }[range] || 64),
  );
  const activity = market
    ? symbols
        .slice(0, 4)
        .map((name, i) => [
          name,
          `${((s.prices[i] / createState(t.kind, c.seed).prices[i] - 1) * 100).toFixed(2)}%`,
        ])
    : t.kind === "business"
      ? s.orders
          .slice(0, 4)
          .map((o) => [`Order #${o.id}`, `+${money(o.amount)}`])
      : t.kind === "youtube" || t.kind === "tiktok"
        ? [
            ["Video A", num(Math.floor(s.views * 0.4))],
            ["Video B", num(Math.floor(s.views * 0.28))],
            ["Video C", num(Math.floor(s.views * 0.2))],
            [
              "Video D",
              num(
                s.views -
                  Math.floor(s.views * 0.4) -
                  Math.floor(s.views * 0.28) -
                  Math.floor(s.views * 0.2),
              ),
            ],
          ]
        : t.kind === "instagram"
          ? [
              ["Reel views", num(s.views)],
              ["Profile visits", num(Math.floor(s.views * 0.06))],
              ["Likes", num(s.likes)],
              ["Engagement", `${((s.likes / s.views) * 100).toFixed(2)}%`],
            ]
          : t.kind === "analytics"
            ? [
                ["Direct", "42%"],
                ["Search", "31%"],
                ["Social", "19%"],
                ["Other", "8%"],
              ]
            : t.kind === "streaming"
              ? [
                  ["New followers", num(s.followers - 128450)],
                  [
                    "Subscriptions",
                    num(s.orders.filter((o) => o.amount === 5).length),
                  ],
                  ["Donations", money(s.revenue)],
                  [
                    "Peak viewers",
                    num(Math.max(1248, ...s.history.map((p) => p.value))),
                  ],
                ]
              : [
                  ["Checking", money(s.cash)],
                  ["Savings", money(s.savings)],
                  ["Transactions", num(s.transactions.length)],
                ];
  return (
    <div
      className={`ref-dashboard ${full ? "ref-fullscreen" : ""}`}
      ref={root}
      style={{ "--ref-accent": d.accent } as React.CSSProperties}
    >
      <div className="ref-tools">
        <button onClick={onBack}>
          <ArrowLeft size={15} /> Library
        </button>
        <span>{t.name}</span>
        <div />
        <button
          onClick={() => {
            localStorage.setItem(storeKey, JSON.stringify(s));
            onSave();
          }}
        >
          <FolderOpen size={15} /> Save
        </button>
        <button onClick={exportImage} aria-label="Export simulation PNG">
          <Download size={15} />
        </button>
        <button onClick={() => setEditing(!editing)}>
          <Settings2 size={15} /> Edit stats
        </button>
        <button onClick={present}>
          <Maximize2 size={15} /> Fullscreen
        </button>
      </div>
      <div className="reference-frame" ref={capture}>
        <aside className="reference-nav">
          <h2>LARPSCREENS</h2>
          <small>SIMULATED DATA</small>
          <nav>
            {[
              "Overview",
              "Analytics",
              market ? "Portfolio" : "Content",
              "Activity",
              "Settings",
            ].map((n) => (
              <button
                className={tab === n ? "selected" : ""}
                key={n}
                onClick={() => {
                  if (n === "Settings") {
                    if (!full) setEditing(true);
                    else setTab("Analytics");
                  } else setTab(n);
                }}
              >
                {n}
              </button>
            ))}
          </nav>
          <button className="ref-exit" onClick={onBack}>
            <ArrowLeft size={16} /> Library
          </button>
        </aside>
        <main className="reference-main">
          <header className="reference-header">
            <div>
              <h1>{d.title}</h1>
              <p>{d.subtitle}</p>
            </div>
            <span className="demo-mode">SIMULATION</span>
            {full && (
              <button
                className="exit-full"
                aria-label="Exit fullscreen"
                onClick={() => {
                  if (document.fullscreenElement) document.exitFullscreen();
                  setFull(false);
                }}
              >
                <X size={18} />
              </button>
            )}
          </header>
          {profile && (
            <div className="ref-profile">
              {avatar && <img src={avatar} alt="Fictional profile" />}
              <div>
                <b>{profile}</b>
                <p>{bio}</p>
              </div>
            </div>
          )}
          {tab === "Activity" ? (
            <section className="ref-panel activity-history">
              <h2>Simulated activity</h2>
              {[...s.transactions, ...s.orders].slice(0, 30).map((o, i) => (
                <div className="ref-activity-row" key={i}>
                  <span>
                    {o.label} · #{o.id}
                  </span>
                  <b>{money(o.amount)}</b>
                  <small>{o.time}s</small>
                  {o.effect && (
                    <button
                      onClick={() => {
                        const next = undoTransaction(s, o.id);
                        if (next === s)
                          notify(
                            "Cannot reverse this transaction with the current balances",
                          );
                        else setS(next);
                      }}
                    >
                      Undo transaction
                    </button>
                  )}
                  {s.orders.includes(o) && (
                    <button
                      onClick={() =>
                        setS((p) => ({
                          ...p,
                          revenue: Math.max(0, p.revenue - o.amount),
                          customers: Math.max(0, p.customers - 1),
                          mrr: o.label.includes("subscription")
                            ? Math.max(0, p.mrr - o.amount)
                            : p.mrr,
                          orders: p.orders.filter((x) => x.id !== o.id),
                        }))
                      }
                    >
                      Reset order
                    </button>
                  )}
                </div>
              ))}
              {!s.transactions.length && !s.orders.length && (
                <p>
                  No transactions yet. Start the simulation or create a demo
                  transaction.
                </p>
              )}
            </section>
          ) : tab === "Portfolio" || tab === "Content" ? (
            <section className="ref-panel">
              <h2>{market ? "Fictional holdings" : "Content performance"}</h2>
              <div className="ref-table">
                <div className="ref-table-row head">
                  <span>Asset / content</span>
                  <span>Price / views</span>
                  <span>Shares / engagement</span>
                  <span>Value</span>
                </div>
                {market
                  ? s.prices.map((p, i) => (
                      <div className="ref-table-row" key={i}>
                        <b>{symbols[i]}</b>
                        <span>{money(p)}</span>
                        <span>{num(s.quantities[i])}</span>
                        <b>{money(p * s.quantities[i])}</b>
                      </div>
                    ))
                  : activity.map(([label, value], i) => (
                      <div className="ref-table-row" key={i}>
                        <span>{label}</span>
                        <b>{value}</b>
                        <span>{((s.likes / s.views) * 100).toFixed(2)}%</span>
                        <span>Simulated</span>
                      </div>
                    ))}
              </div>
            </section>
          ) : (
            <>
              <div className="reference-stats">
                {d.labels.map((label, i) => (
                  <section className="ref-stat" key={label}>
                    <p>{label}</p>
                    <strong>{numbers[i]}</strong>
                    <small>{sub[i]}</small>
                  </section>
                ))}
              </div>
              <div className="reference-chart-row">
                <section className="ref-panel reference-chart">
                  <div className="ref-chart-heading">
                    <h2>{d.chart}</h2>
                    <div>
                      {market && (
                        <button
                          className={candles ? "selected" : ""}
                          onClick={() => setCandles(!candles)}
                        >
                          Candles
                        </button>
                      )}
                      {["1D", "1W", "1M", "1Y"].map((v) => (
                        <button
                          className={v === range ? "selected" : ""}
                          onClick={() => setRange(v)}
                          key={v}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="reference-graph">
                    {market && candles ? (
                      <svg
                        viewBox="0 0 760 260"
                        className="ref-candles"
                        preserveAspectRatio="none"
                      >
                        {points.map((p, i) => {
                          const min = Math.min(...points.map((p) => p.low)),
                            max = Math.max(...points.map((p) => p.high));
                          const y = (v: number) =>
                            245 - ((v - min) / (max - min || 1)) * 230;
                          return (
                            <g
                              key={p.time}
                              stroke={p.close >= p.open ? d.accent : "#ff6476"}
                              fill={p.close >= p.open ? d.accent : "#ff6476"}
                            >
                              <line
                                x1={((i + 0.5) * 760) / points.length}
                                x2={((i + 0.5) * 760) / points.length}
                                y1={y(p.high)}
                                y2={y(p.low)}
                              />
                              <rect
                                x={((i + 0.2) * 760) / points.length}
                                y={Math.min(y(p.open), y(p.close))}
                                width={(0.6 * 760) / points.length}
                                height={Math.max(
                                  1,
                                  Math.abs(y(p.open) - y(p.close)),
                                )}
                              />
                            </g>
                          );
                        })}
                      </svg>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={points}
                          margin={{ left: 3, right: 3, top: 18, bottom: 7 }}
                        >
                          <CartesianGrid vertical={false} stroke="#303844" />
                          <YAxis
                            hide
                            domain={["dataMin", "dataMax"]}
                            padding={{ top: 35, bottom: 35 }}
                          />
                          <Tooltip
                            labelFormatter={() => "Fictional observation"}
                            formatter={(v) =>
                              market ||
                              t.kind === "business" ||
                              t.kind === "banking"
                                ? money(Number(v))
                                : num(Number(v))
                            }
                            contentStyle={{
                              background: "#141d2a",
                              border: "1px solid #344355",
                              borderRadius: 6,
                            }}
                          />
                          <Area
                            type="linear"
                            dataKey="value"
                            stroke={d.accent}
                            strokeWidth={2.8}
                            fill="transparent"
                            isAnimationActive={running && c.enabled}
                            animationDuration={Math.min(400, 800 / c.speed)}
                            animationEasing="linear"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </section>
                <section className="ref-panel reference-activity">
                  <h2>Recent activity</h2>
                  {activity.length ? (
                    activity.map(([label, value], i) => (
                      <div className="ref-activity-row" key={i}>
                        <span>{label}</span>
                        <b className={value.startsWith("-") ? "negative" : ""}>
                          {value}
                        </b>
                      </div>
                    ))
                  ) : (
                    <p className="ref-empty">
                      Orders will appear here when a simulated sale occurs.
                    </p>
                  )}
                </section>
              </div>
            </>
          )}
          {t.kind === "business" && (
            <BusinessDesk s={s} setS={setS} money={money} notify={notify} />
          )}
          {(market || t.kind === "banking") && (
            <TradeDesk
              s={s}
              setS={setS}
              symbols={symbols}
              money={money}
              notify={notify}
              bank={t.kind === "banking"}
            />
          )}
          <section className="ref-panel reference-controls">
            <h2>Dashboard controls</h2>
            <div className="ref-control-line">
              <button
                className="ref-live"
                role="switch"
                aria-checked={live}
                onClick={() => setLive(!live)}
              >
                Live Simulation: <b>{live ? "ON" : "OFF"}</b>
              </button>
              <label>
                Speed:{" "}
                <select
                  value={c.speed}
                  onChange={(e) => patch("speed", +e.target.value)}
                >
                  {[0.5, 1, 2, 5, 10].map((v) => (
                    <option value={v} key={v}>
                      {v}x
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Scenario:{" "}
                <select
                  value={c.scenario}
                  onChange={(e) => patch("scenario", e.target.value)}
                >
                  {["Slow Growth", "Normal", "Viral", "Market Crash"].map(
                    (v) => (
                      <option key={v}>{v}</option>
                    ),
                  )}
                </select>
              </label>
              {!full && (
                <button onClick={() => setEditing(true)}>Edit stats</button>
              )}
              <button onClick={() => setRunning((v) => !v)}>
                {running ? <Pause size={15} /> : <Play size={15} />}{" "}
                {running ? "Pause" : "Start / Resume"}
              </button>
              <button title="Reset simulation" onClick={reset}>
                <RotateCcw size={16} />
              </button>
            </div>
          </section>
          {tab === "Analytics" && (
            <section className="ref-panel ref-extra">
              <h2>Detailed analytics</h2>
              <div className="ref-detail-grid">
                <div>
                  <p>Simulation time</p>
                  <strong>{s.tick}s</strong>
                </div>
                <div>
                  <p>Estimated revenue</p>
                  <strong>{money(s.revenue)}</strong>
                </div>
                <div>
                  <p>Engagement rate</p>
                  <strong>{((s.likes / s.views) * 100).toFixed(2)}%</strong>
                </div>
              </div>
              {t.kind === "analytics" && (
                <div className="ref-map">
                  <svg viewBox="0 0 500 210">
                    <path
                      fill="#2d4052"
                      d="M30 40l60-20 52 16 15 37-30 25-20 65-25-36-5-45-35-7zm150-8 44-15 10 30-30 18zm40 47 45-19 40 30-20 64-22 35-25-60zm65-45 62-20 108 24 22 42-35 20-28-17-24 43-31-34-52-16zm112 114 45-12 30 37-42 11-23-12z"
                    />
                    {s.visitors.map((v) => (
                      <circle
                        key={v.id}
                        cx={v.x * 5}
                        cy={v.y * 2}
                        r="4"
                        fill={d.accent}
                      />
                    ))}
                  </svg>
                </div>
              )}
              {t.kind === "streaming" &&
                s.chat.map((message, i) => <p key={i}>{message}</p>)}
            </section>
          )}
          <div className="ref-disclaimer">
            SIMULATION · All accounts, balances and activity are fictional ·{" "}
            {s.tick}s elapsed
          </div>
        </main>
      </div>
      {message && full && (
        <div className="ref-notification" role="status">
          {message}
        </div>
      )}
      {editing && (
        <div className="ref-editor-backdrop" onClick={() => setEditing(false)}>
          <aside className="ref-editor" onClick={(e) => e.stopPropagation()}>
            <button
              className="close"
              onClick={() => setEditing(false)}
              aria-label="Close editor"
            >
              <X size={20} />
            </button>
            <h2>Simulation settings</h2>
            <div className="setup-actions">
              <button
                onClick={() => {
                  const baseline = rebase(s);
                  localStorage.setItem(
                    storeKey + "-starting",
                    JSON.stringify({ state: baseline, settings: c }),
                  );
                  localStorage.setItem(storeKey, JSON.stringify(s));
                  onSave();
                  notify("Starting setup saved");
                }}
              >
                Save Starting Setup
              </button>
              <button
                onClick={() => {
                  try {
                    const saved = JSON.parse(
                      localStorage.getItem(storeKey + "-starting") || "null",
                    );
                    if (!saved) {
                      notify("Save a starting setup first");
                      return;
                    }
                    setS(saved.state);
                    setSettings(saved.settings);
                    notify("Restarted from saved starting setup");
                  } catch {
                    notify("Could not load starting setup");
                  }
                }}
              >
                Restart From Saved Setup
              </button>
              <button onClick={reset}>Reset Simulation</button>
            </div>
            <p>All changes apply to fictional data only.</p>
            <label>
              Name / username
              <input
                value={profile}
                onChange={(e) => setProfile(e.target.value)}
              />
            </label>
            <label>
              Bio
              <input value={bio} onChange={(e) => setBio(e.target.value)} />
            </label>
            <label>
              Profile image
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f && f.size < 3000000) {
                    const r = new FileReader();
                    r.onload = () => setAvatar(String(r.result));
                    r.readAsDataURL(f);
                  } else notify("Choose an image under 3 MB");
                }}
              />
            </label>
            <label>
              Savings balance
              <input
                type="number"
                min="0"
                value={s.savings}
                onChange={(e) =>
                  setS({ ...s, savings: Math.max(0, +e.target.value) })
                }
              />
            </label>
            <label>
              Starting cash / checking balance
              <input
                type="number"
                min="0"
                value={s.cash}
                onChange={(e) =>
                  setS({ ...s, cash: Math.max(0, +e.target.value) })
                }
              />
            </label>
            <label>
              Currency
              <select
                value={currency}
                onChange={(e) => {
                  setCurrency(e.target.value);
                  patch("currency", e.target.value);
                }}
              >
                {["USD", "AUD", "EUR", "GBP"].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
            <label className="inline-label">
              Enable animations
              <input
                type="checkbox"
                checked={c.enabled}
                onChange={(e) => patch("enabled", e.target.checked)}
              />
            </label>
            {["streaming", "analytics"].includes(t.kind) && (
              <label>
                {t.kind === "streaming" ? "Live viewers" : "Active visitors"}
                <input
                  type="number"
                  min="0"
                  value={s.secondary}
                  onChange={(e) =>
                    setS({ ...s, secondary: Math.max(0, +e.target.value) })
                  }
                />
              </label>
            )}
            <label>
              Growth rate: {c.growth.toFixed(1)}x
              <input
                type="range"
                min="0"
                max="5"
                step=".1"
                value={c.growth}
                onChange={(e) => patch("growth", +e.target.value)}
              />
            </label>
            {market && (
              <>
                <label>
                  Volatility: {c.volatility.toFixed(1)}x
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step=".1"
                    value={c.volatility}
                    onChange={(e) => patch("volatility", +e.target.value)}
                  />
                </label>
                <h3>Holdings</h3>
                {s.prices.map((p, i) => (
                  <div className="holding-editor" key={i}>
                    <b>{symbols[i]}</b>
                    <label>
                      Price
                      <input
                        type="number"
                        min=".01"
                        value={p}
                        onChange={(e) => {
                          const prices = s.prices.map((x, j) =>
                            i === j ? Math.max(0.01, +e.target.value) : x,
                          );
                          setS({
                            ...s,
                            prices,
                            value: prices.reduce(
                              (v, p, j) => v + p * s.quantities[j],
                              0,
                            ),
                            history: s.history.map((h, i) =>
                              i === s.history.length - 1
                                ? {
                                    ...h,
                                    value: prices.reduce(
                                      (v, p, j) => v + p * s.quantities[j],
                                      0,
                                    ),
                                  }
                                : h,
                            ),
                          });
                        }}
                      />
                    </label>
                    <label>
                      Quantity
                      <input
                        type="number"
                        min="0"
                        value={s.quantities[i]}
                        onChange={(e) => {
                          const quantities = s.quantities.map((x, j) =>
                            i === j ? Math.max(0, +e.target.value) : x,
                          );
                          setS({
                            ...s,
                            quantities,
                            value: s.prices.reduce(
                              (v, p, j) => v + p * quantities[j],
                              0,
                            ),
                          });
                        }}
                      />
                    </label>
                  </div>
                ))}
                <h3>Fictional trade</h3>
                <label>
                  Asset
                  <select
                    value={asset}
                    onChange={(e) => setAsset(+e.target.value)}
                  >
                    {symbols.map((x, i) => (
                      <option value={i} key={x}>
                        {x}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Quantity
                  <input
                    type="number"
                    min="1"
                    value={qty}
                    onChange={(e) => setQty(Math.max(0, +e.target.value))}
                  />
                </label>
                <div className="editor-actions">
                  {[1, -1].map((sign) => (
                    <button
                      key={sign}
                      onClick={() => {
                        const next = trade(s, asset, qty * sign);
                        if (next === s)
                          notify("Invalid quantity or insufficient balance");
                        else {
                          setS(next);
                          notify("Demo trade recorded");
                        }
                      }}
                    >
                      {sign === 1 ? "Buy" : "Sell"}
                    </button>
                  ))}
                </div>
              </>
            )}
            {t.kind === "banking" ? (
              <>
                <label>
                  Transfer amount
                  <input
                    type="number"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(+e.target.value)}
                  />
                </label>
                <button
                  onClick={() => {
                    const next = transfer(s, amount);
                    if (next === s)
                      notify("Enter an amount within your checking balance");
                    else {
                      setS(next);
                      notify("Fictional transfer recorded");
                    }
                  }}
                >
                  Transfer checking → savings
                </button>
              </>
            ) : (
              !market &&
              t.kind !== "business" && (
                <>
                  {(["followers", "views", "likes"] as const).map((key) => (
                    <label key={key}>
                      {key}
                      <input
                        type="number"
                        min="0"
                        value={s[key]}
                        onChange={(e) =>
                          setS({ ...s, [key]: Math.max(0, +e.target.value) })
                        }
                      />
                    </label>
                  ))}
                </>
              )
            )}
            {t.kind === "business" && (
              <>
                <p>
                  Revenue is always derived from recorded orders. Editing
                  opening revenue records an opening demo order.
                </p>
                <label>
                  Opening revenue
                  <input
                    type="number"
                    min="0"
                    value={s.revenue}
                    onChange={(e) => {
                      const revenue = Math.max(0, +e.target.value);
                      setS({
                        ...s,
                        revenue,
                        orders: revenue
                          ? [
                              {
                                id: 0,
                                label: "Opening demo revenue",
                                amount: revenue,
                                time: 0,
                              },
                            ]
                          : [],
                        customers: revenue ? 1 : 0,
                        mrr: 0,
                      });
                    }}
                  />
                </label>
                <label>
                  Demo order amount
                  <input
                    type="number"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(+e.target.value)}
                  />
                </label>
                <button
                  onClick={() => {
                    if (amount <= 0 || !Number.isFinite(amount)) return;
                    setS((p) => ({
                      ...p,
                      revenue: p.revenue + amount,
                      customers: p.customers + 1,
                      orders: [
                        {
                          id: Math.max(1000, ...p.orders.map((o) => o.id)) + 1,
                          label: "Manual demo order",
                          amount,
                          time: p.tick,
                        },
                        ...p.orders,
                      ],
                    }));
                    notify("Demo order recorded");
                  }}
                >
                  Create fictional order
                </button>
              </>
            )}
            <div className="editor-actions">
              <button onClick={reset}>Reset all</button>
              <button onClick={onSave}>Save dashboard</button>
            </div>
            <p className="muted">
              F fullscreen · Space pause/resume · R reset · Esc exit. Simulation
              state autosaves on this device.
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}
