import { NativeScreen } from "./NativeScreens";
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
import { toPng } from "html-to-image";
import {
  defaultSettings,
  createState,
  step,
  transfer,
  trade,
  rebase,
  type Kind,
  type Settings,
  type State,
} from "./engine";
type Template = {
  variant?: string;
  id: string;
  kind: Kind;
  name: string;
  color: string;
};
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
  const [chartDraft, setChartDraft] = useState("");
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
  const lastOrder = useRef(s.orders[0]?.id);
  useEffect(() => {
    const order = s.orders[0];
    if (order && order.id !== lastOrder.current) {
      lastOrder.current = order.id;
      notify(`${order.label} · ${money(order.amount)}`);
    }
  }, [s.orders[0]?.id]);
  const [running, setRunning] = useState(true),
    [editing, setEditing] = useState(false),
    [full, setFull] = useState(false),
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
    setS(createState(t.kind, defaultSettings.seed));
    setSettings({ ...defaultSettings });
    setCurrency(defaultSettings.currency);
    setChartDraft("");
    setProfile("");
    setBio("Fictional creator account");
    setAvatar("");
    localStorage.removeItem(storeKey + "-starting");
    notify("Original default setup restored");
  };
  const latestState = useRef(s);
  latestState.current = s;
  useEffect(() => {
    const persist = () => {
      try {
        localStorage.setItem(storeKey, JSON.stringify(latestState.current));
      } catch {}
    };
    const timer = setInterval(persist, 250);
    return () => {
      clearInterval(timer);
      persist();
    };
  }, [storeKey]);
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
  useEffect(() => {
    document.body.classList.toggle("simulation-presenting", full);
    return () => document.body.classList.remove("simulation-presenting");
  }, [full]);
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
      if (e.key === "Escape") {
        if (document.fullscreenElement) document.exitFullscreen();
        setFull(false);
        return;
      }
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
      <div className="native-capture" ref={capture}>
        <NativeScreen
          s={s}
          setS={setS}
          kind={t.kind}
          variant={t.variant}
          money={money}
          notify={notify}
          profile={profile}
          bio={bio}
          avatar={avatar}
          full={full}
          running={running}
          setRunning={setRunning}
          settings={c}
          onExit={() => {
            if (document.fullscreenElement) document.exitFullscreen();
            setFull(false);
          }}
        />
      </div>
      {!full && (
        <div className="native-editor-bar">
          <button onClick={() => setRunning(!running)}>
            {running ? "Pause" : "Resume"}
          </button>
          <label>
            Live Simulation{" "}
            <input
              type="checkbox"
              checked={live}
              onChange={(e) => setLive(e.target.checked)}
            />
          </label>
          <label>
            Speed{" "}
            <select
              value={c.speed}
              onChange={(e) => patch("speed", +e.target.value)}
            >
              {[0.5, 1, 2, 5, 10].map((v) => (
                <option key={v} value={v}>
                  {v}×
                </option>
              ))}
            </select>
          </label>
          <label>
            Scenario{" "}
            <select
              value={c.scenario}
              onChange={(e) => patch("scenario", e.target.value)}
            >
              {["Slow Growth", "Normal", "Viral", "Market Crash"].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          <button onClick={() => setEditing(true)}>Edit stats</button>
        </div>
      )}
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
                    JSON.stringify({
                      state: baseline,
                      settings: c,
                      profile,
                      bio,
                      avatar,
                    }),
                  );
                  localStorage.setItem(storeKey, JSON.stringify(s));
                  onSave();
                  notify("Starting setup saved");
                }}
              >
                Save Setup
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
                    setCurrency(saved.settings.currency);
                    setProfile(saved.profile ?? profile);
                    setBio(saved.bio ?? bio);
                    setAvatar(saved.avatar ?? avatar);
                    notify("Restarted from saved starting setup");
                  } catch {
                    notify("Could not load starting setup");
                  }
                }}
              >
                Reset Activity
              </button>
              <button onClick={reset}>Reset Everything</button>
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
            {market && (
              <label>
                Portfolio asset value
                <input
                  type="number"
                  min="0"
                  step=".01"
                  value={Number(s.value.toFixed(2))}
                  onChange={(e) => {
                    const target = Number(e.target.value);
                    if (!Number.isFinite(target) || target < 0) return;
                    const quantities =
                      s.value > 0
                        ? s.quantities.map((q) => (q * target) / s.value)
                        : s.quantities.map((_, i) =>
                            i === 0 ? target / s.prices[0] : 0,
                          );
                    setS((p) => ({
                      ...p,
                      quantities,
                      value: target,
                      initial: target,
                      startingWealth: target + p.cash,
                    }));
                  }}
                />
              </label>
            )}
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
            <label>
              Historical chart values (comma-separated; 2–64 values)
              <textarea
                value={chartDraft}
                onChange={(e) => setChartDraft(e.target.value)}
                placeholder="120, 125, 119, 130"
              />
            </label>
            <button
              onClick={() => {
                const values = chartDraft
                  .split(",")
                  .map((v) => Number(v.trim()));
                if (
                  values.length < 2 ||
                  values.length > 64 ||
                  values.some((v) => !Number.isFinite(v) || v < 0)
                ) {
                  notify("Use 2–64 nonnegative numeric chart values");
                  return;
                }
                const last = market
                  ? s.value
                  : t.kind === "banking"
                    ? s.cash
                    : t.kind === "business"
                      ? s.revenue
                      : t.kind === "instagram"
                        ? s.followers
                        : s.views;
                values[values.length - 1] = last;
                setS((p) => ({
                  ...p,
                  assetHistory: market
                    ? p.prices.map((price) =>
                        values.map((v) => (v / (last || 1)) * price),
                      )
                    : p.assetHistory,
                  history: values.map((v, i) => ({
                    time: i - values.length + 1,
                    value: v,
                    open: i ? values[i - 1] : v,
                    close: v,
                    high: Math.max(v, i ? values[i - 1] : v),
                    low: Math.min(v, i ? values[i - 1] : v),
                  })),
                }));
                notify(
                  "Chart history updated; latest point matches current total",
                );
              }}
            >
              Apply chart data
            </button>
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
