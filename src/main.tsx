import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  Search,
  Command,
  LayoutGrid,
  Star,
  FolderOpen,
  Settings2,
  ChevronDown,
  ChevronRight,
  Plus,
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  X,
  TrendingUp,
  Bitcoin,
  Camera as Instagram,
  Video as Youtube,
  Music2,
  Briefcase,
  Landmark,
  Gamepad2,
  Gem,
  Globe,
  SlidersHorizontal,
  Check,
  Sun,
  Moon,
  Download,
  Copy,
  Trash2,
  Monitor,
  Activity,
  Heart,
  Radio,
  Upload,
} from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, Tooltip, YAxis } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { toPng } from "html-to-image";
import {
  createState,
  step,
  transfer,
  trade,
  defaultSettings,
  type Kind,
  type Settings,
  type State,
} from "./engine";
import "./style.css";
const Dashboard = React.lazy(() =>
  import("./Dashboard").then((m) => ({ default: m.Dashboard })),
);
const cats = [
  { id: "all", label: "All simulations", icon: LayoutGrid },
  { id: "stocks", label: "Stocks & investments", icon: TrendingUp },
  { id: "crypto", label: "Cryptocurrency", icon: Bitcoin },
  { id: "instagram", label: "Instagram & social", icon: Instagram },
  { id: "video", label: "TikTok & YouTube", icon: Youtube },
  { id: "business", label: "Business & revenue", icon: Briefcase },
  { id: "banking", label: "Banking & finance", icon: Landmark },
  { id: "streaming", label: "Gaming & streaming", icon: Gamepad2 },
  { id: "luxury", label: "Luxury lifestyle", icon: Gem },
  { id: "analytics", label: "Website analytics", icon: Globe },
  { id: "custom", label: "Custom dashboards", icon: SlidersHorizontal },
];
const templates: {
  kind: Kind;
  name: string;
  desc: string;
  tag: string;
  color: string;
  icon: typeof TrendingUp;
}[] = [
  {
    kind: "stocks",
    name: "Portfolio Pro",
    desc: "Your portfolio. A bigger picture.",
    tag: "POPULAR",
    color: "#b1ed80",
    icon: TrendingUp,
  },
  {
    kind: "instagram",
    name: "Creator Insights",
    desc: "Watch your influence grow.",
    tag: "TRENDING",
    color: "#d99cdd",
    icon: Instagram,
  },
  {
    kind: "business",
    name: "Revenue Studio",
    desc: "Build your next big success.",
    tag: "POPULAR",
    color: "#a9a2fa",
    icon: Briefcase,
  },
  {
    kind: "crypto",
    name: "Crypto Terminal",
    desc: "A new perspective on digital assets.",
    tag: "LIVE",
    color: "#eab477",
    icon: Bitcoin,
  },
  {
    kind: "youtube",
    name: "Channel Studio",
    desc: "Your next million views starts here.",
    tag: "NEW",
    color: "#ec8b8d",
    icon: Youtube,
  },
  {
    kind: "analytics",
    name: "Traffic Analytics",
    desc: "Every visit tells a story.",
    tag: "LIVE",
    color: "#87cbdc",
    icon: Globe,
  },
  {
    kind: "banking",
    name: "Private Banking",
    desc: "A little more financial freedom.",
    tag: "",
    color: "#c3c8d6",
    icon: Landmark,
  },
  {
    kind: "streaming",
    name: "Stream Control",
    desc: "Your audience. In real time.",
    tag: "NEW",
    color: "#b0a1ec",
    icon: Gamepad2,
  },
  {
    kind: "tiktok",
    name: "Viral Analytics",
    desc: "Made for your breakout moment.",
    tag: "TRENDING",
    color: "#81daca",
    icon: Music2,
  },
  {
    kind: "luxury",
    name: "Collection House",
    desc: "An extraordinary collection.",
    tag: "",
    color: "#d6c29a",
    icon: Gem,
  },
  {
    kind: "custom",
    name: "Your Workspace",
    desc: "A dashboard as unique as you.",
    tag: "",
    color: "#a7b6d3",
    icon: SlidersHorizontal,
  },
];
const allTemplates = templates
  .flatMap((t, i) =>
    [
      t,
      ...["Minimal", "Professional"].map((v, j) => ({
        ...t,
        name: `${t.name} ${v}`,
        tag: j === 0 ? "" : "NEW",
        desc:
          j === 0
            ? "Clarity in every detail."
            : "Designed for the bigger picture.",
      })),
    ].map((t, j) => ({ ...t, id: `${i}-${j}` })),
  )
  .sort((a, b) => Number(a.id.split("-")[1]) - Number(b.id.split("-")[1]));
const compact = (n: number) =>
  Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
function read<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") ?? fallback;
  } catch {
    return fallback;
  }
}
function Spark({
  color = "#b1ed80",
  seed = 1,
}: {
  color?: string;
  seed?: number;
}) {
  let v = 45;
  const pts = Array.from({ length: 40 }, (_, i) => {
    v += Math.sin(i * seed + 1) * 9 - 1.2;
    return `${i * 8},${Math.max(8, Math.min(86, v))}`;
  }).join(" ");
  return (
    <svg className="spark" viewBox="0 0 312 100" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`g${seed}`} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor={color} stopOpacity=".16" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`M0,100 L${pts.replaceAll(" ", " L")} L312,100 Z`}
        fill={`url(#g${seed})`}
      />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" />
    </svg>
  );
}
function Preview({
  kind,
  color,
  index,
}: {
  kind: Kind;
  color: string;
  index: number;
}) {
  return (
    <div
      className={`preview ${kind}`}
      style={{ "--accent": color } as React.CSSProperties}
    >
      <div className="mini-nav">
        <span className="mini-logo">
          {kind === "instagram"
            ? "◎"
            : kind === "business"
              ? "◈"
              : kind === "youtube"
                ? "▶"
                : "◒"}{" "}
          <b>
            {kind === "stocks"
              ? "folio"
              : kind === "instagram"
                ? "insights"
                : kind === "business"
                  ? "studio"
                  : kind === "crypto"
                    ? "coinbase"
                    : kind === "youtube"
                      ? "Studio"
                      : "overview"}
          </b>
        </span>
        <span>
          Overview　 Analytics　 <i>●</i>
        </span>
      </div>
      <div className="mini-body">
        <div className="mini-title">
          {kind === "stocks" || kind === "crypto"
            ? "Total portfolio value"
            : kind === "instagram"
              ? "Total followers"
              : kind === "business"
                ? "Total revenue"
                : kind === "youtube"
                  ? "Channel views"
                  : kind === "banking"
                    ? "Available balance"
                    : "Your overview"}
        </div>
        <div className="mini-value">
          {kind === "instagram"
            ? "128,450"
            : kind === "youtube"
              ? "2,847,280"
              : kind === "streaming"
                ? "1,248"
                : kind === "analytics"
                  ? "24,892"
                  : "$847,392"}
          <small>
            {["stocks", "crypto", "business"].includes(kind) ? ".84" : ""}
          </small>
          <span>↗ 12.8%</span>
        </div>
        {kind === "business" ? (
          <div className="mini-bars">
            {Array.from({ length: 27 }, (_, i) => (
              <i key={i} style={{ height: `${20 + ((i * 13) % 60) + i}px` }} />
            ))}
          </div>
        ) : (
          <Spark color={color} seed={index + 1} />
        )}
        <div className="mini-bottom">
          <span>
            {kind === "instagram" ? "Profile visits" : "Today’s return"}
            <b>{kind === "instagram" ? "24,892" : "+$12,847.32"}</b>
          </span>
          <span>
            {kind === "instagram" ? "Engagement rate" : "Total return"}
            <b>{kind === "instagram" ? "4.82%" : "+25.37%"}</b>
          </span>
          <span>
            {kind === "business" ? "Orders" : "Performance"}
            <b>{kind === "business" ? "1,284" : "+18.42%"}</b>
          </span>
        </div>
      </div>
      <span className="mini-simulation">FICTIONAL DATA</span>
    </div>
  );
}
type Saved = {
  id: string;
  template: string;
  name: string;
  settings: Settings;
  state?: State;
};
function App() {
  const [page, setPage] = useState("all");
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>(() =>
    read("larp-favorites", []),
  );
  const [saved, setSaved] = useState<Saved[]>(() => read("larp-saved", []));
  const [settings, setSettings] = useState<Settings>(() => ({
    ...defaultSettings,
    ...read("larp-settings", {}),
  }));
  const [live, setLive] = useState(true);
  const [light, setLight] = useState(false);
  const [sort, setSort] = useState("Featured");
  const [notice, setNotice] = useState("");
  const [preferences, setPreferences] = useState(false);
  const [compare, setCompare] = useState<string | null>(null);
  const [importError, setImportError] = useState("");
  const [seedOffset, setSeedOffset] = useState(0);
  const file = useRef<HTMLInputElement>(null);
  useEffect(() => {
    localStorage.setItem("larp-favorites", JSON.stringify(favorites));
  }, [favorites]);
  useEffect(() => {
    localStorage.setItem("larp-saved", JSON.stringify(saved));
  }, [saved]);
  useEffect(() => {
    localStorage.setItem("larp-settings", JSON.stringify(settings));
  }, [settings]);
  useEffect(() => {
    if (notice) {
      const t = setTimeout(() => setNotice(""), 3000);
      return () => clearTimeout(t);
    }
  }, [notice]);
  const toggleFavorite = (id: string) =>
    setFavorites((f) =>
      f.includes(id) ? f.filter((x) => x !== id) : [...f, id],
    );
  const current = allTemplates.find((t) => t.id === active);
  const list = allTemplates
    .filter(
      (t) =>
        (page === "all" ||
          (page === "favorites" && favorites.includes(t.id)) ||
          (page === "video" && ["youtube", "tiktok"].includes(t.kind)) ||
          page === t.kind) &&
        `${t.name} ${t.desc}`.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "A–Z"
        ? a.name.localeCompare(b.name)
        : sort === "Newest"
          ? b.id.localeCompare(a.id)
          : 0,
    );
  const save = () => {
    if (!current) return;
    setSaved((s) => [
      ...s,
      {
        id: crypto.randomUUID(),
        template: current.id,
        name: `${current.name} ${s.length + 1}`,
        settings: { ...settings },
        state: read("larp-dashboard-" + current.id, undefined),
      },
    ]);
    setNotice("Dashboard saved to your collection");
  };
  const exportConfig = () => {
    const blob = new Blob(
      [JSON.stringify({ version: 1, saved, settings }, null, 2)],
      { type: "application/json" },
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "larpscreens.json";
    a.click();
    URL.revokeObjectURL(a.href);
  };
  return (
    <div className={`app ${light ? "light" : ""}`}>
      <aside className="sidebar">
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setActive(null);
            setPage("all");
          }}
        >
          <div className="brand-mark">
            <Monitor size={21} />
          </div>
          LarpScreens<span>®</span>
        </a>
        <div className="workspace-label">WORKSPACE</div>
        <button
          className={!active && page === "all" ? "nav active" : "nav"}
          onClick={() => {
            setPage("all");
            setActive(null);
          }}
        >
          <LayoutGrid size={17} /> All simulations{" "}
          <span className="count">33</span>
        </button>
        <button
          className={`nav ${page === "favorites" ? "active" : ""}`}
          onClick={() => {
            setPage("favorites");
            setActive(null);
          }}
        >
          <Star size={17} /> Favourites{" "}
          <span className="count">{favorites.length}</span>
        </button>
        <button
          className={`nav ${page === "saved" ? "active" : ""}`}
          onClick={() => {
            setPage("saved");
            setActive(null);
          }}
        >
          <FolderOpen size={17} /> My dashboards
        </button>
        <div className="workspace-label categories-label">CATEGORIES</div>
        {cats.slice(1).map((c) => (
          <button
            key={c.id}
            className={`nav ${page === c.id ? "active" : ""}`}
            onClick={() => {
              setPage(c.id);
              setActive(null);
            }}
          >
            <c.icon size={17} />
            {c.label}
          </button>
        ))}
        <div className="sidebar-bottom">
          <div className="little-card">
            <div className="orb">✧</div>
            <strong>
              A little imagination.
              <br />
              Endless possibilities.
            </strong>
            <p>
              Make your next big thing
              <br />
              feel a little more real.
            </p>
            <button
              onClick={() => {
                setPage("all");
                setActive(null);
                setSearch("Professional");
              }}
            >
              Explore presets <ArrowUpRight size={14} />
            </button>
          </div>
          <button className="nav" onClick={() => setPreferences(true)}>
            <Settings2 size={17} /> Settings & preferences
          </button>
          <div className="user">
            <div className="avatar">AM</div>
            <div>
              Alex Morgan<small>Personal workspace</small>
            </div>
            <button title="Preferences" onClick={() => setPreferences(true)}>
              <ChevronDown size={15} />
            </button>
          </div>
        </div>
      </aside>
      <div className="shell">
        <header className="topbar">
          <div className="breadcrumb">
            Workspace <ChevronRight size={13} />
            <span>
              {current
                ? current.name
                : page === "saved"
                  ? "My dashboards"
                  : cats.find((c) => c.id === page)?.label || "Favourites"}
            </span>
          </div>
          <div className="top-actions">
            <span className="demo-pill">
              <span /> Fictional data. Real possibilities.
            </span>
            <button title="Toggle theme" onClick={() => setLight(!light)}>
              {light ? <Moon size={17} /> : <Sun size={17} />}
            </button>
            <div className="avatar tiny">AM</div>
          </div>
        </header>
        {!current ? (
          <main>
            <div className="heading-row">
              <div className="eyebrow">
                <span /> YOUR NEXT REALITY STARTS HERE
              </div>
              <span className="outline-label">THE SIMULATION LIBRARY</span>
            </div>
            <div className="title-row">
              <div>
                <h1>
                  {page === "saved"
                    ? "Your own little universe."
                    : page === "favorites"
                      ? "The ones you love."
                      : "Big ambitions. On screen."}
                </h1>
                <p>
                  Extraordinary dashboards. Entirely your world. Pick a screen
                  and make it yours.
                </p>
              </div>
              <button
                className="primary"
                onClick={() => {
                  setActive("0-0");
                  setNotice(
                    "Customise your dashboard with the controls on the right",
                  );
                }}
              >
                <Plus size={16} /> Create dashboard
              </button>
            </div>
            <section className="hero">
              <div className="hero-copy">
                <div className="pill">
                  <span /> BUILT TO FEEL REAL
                </div>
                <h2>
                  Don’t just imagine it.
                  <br />
                  <em>Step into it.</em>
                </h2>
                <p>
                  Your portfolio. Your audience. Your next big thing.
                  <br />
                  Bring it all to life with beautifully realistic simulations.
                </p>
                <button onClick={() => setActive("0-0")}>
                  Find your screen <ArrowRight size={16} />
                </button>
                <div className="hero-foot">
                  <span>
                    <Check size={12} /> Fully customisable
                  </span>
                  <span>
                    <Check size={12} /> Live simulations
                  </span>
                  <span>
                    <Check size={12} /> Made for fullscreen
                  </span>
                </div>
              </div>
              <div className="hero-visual">
                <div className="floating-tag">
                  <span /> Your world, in motion <Activity size={13} />
                </div>
                <div className="hero-screen">
                  <Preview kind="stocks" color="#b1ed80" index={0} />
                </div>
                <div className="float-stat">
                  <div className="float-icon">
                    <TrendingUp size={18} />
                  </div>
                  <div>
                    Today’s return
                    <strong>
                      +$12,847.32 <span>↗ 1.54%</span>
                    </strong>
                  </div>
                </div>
                <div className="hero-glow" />
              </div>
              <span className="hero-watermark">
                SIMULATION / NOT REAL FINANCIAL DATA
              </span>
            </section>
            <div className="library-heading">
              <div>
                <h3>
                  {page === "saved"
                    ? "Saved dashboards"
                    : page === "all"
                      ? "Explore the collection"
                      : page === "favorites"
                        ? "Your favourites"
                        : cats.find((c) => c.id === page)?.label ||
                          "Collection"}{" "}
                  <span>{page === "saved" ? saved.length : list.length}</span>
                </h3>
                <p>A screen for every version of you.</p>
              </div>
              <div className="live-control">
                <span className={live ? "live-dot" : ""} />
                <span>Live Simulation</span>
                <button
                  aria-label="Live Simulation"
                  role="switch"
                  aria-checked={live}
                  className={`switch ${live ? "on" : ""}`}
                  onClick={() => setLive(!live)}
                >
                  <i />
                </button>
              </div>
            </div>
            <div className="filter-row">
              <div className="filter-tabs">
                {[
                  { id: "all", label: "All screens" },
                  { id: "stocks", label: "Finance" },
                  { id: "instagram", label: "Social media" },
                  { id: "business", label: "Business" },
                  { id: "streaming", label: "Lifestyle" },
                ].map((c) => (
                  <button
                    className={page === c.id ? "selected" : ""}
                    onClick={() => setPage(c.id)}
                    key={c.id}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
              <div className="search">
                <Search size={15} />
                <input
                  placeholder="Search simulations..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <kbd>⌘ K</kbd>
              </div>
              <select
                aria-label="Sort simulations"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option>Featured</option>
                <option>Newest</option>
                <option>A–Z</option>
              </select>
            </div>
            {page === "saved" ? (
              <>
                <div className="save-tools">
                  <button onClick={exportConfig}>
                    <Download size={15} /> Export collection
                  </button>
                  <button onClick={() => file.current?.click()}>
                    <Upload size={15} /> Import
                  </button>
                  <input
                    ref={file}
                    type="file"
                    accept="application/json"
                    hidden
                    onChange={async (e) => {
                      try {
                        const data = JSON.parse(
                          await e.target.files![0].text(),
                        );
                        if (
                          data.version !== 1 ||
                          !Array.isArray(data.saved) ||
                          data.saved.some(
                            (x: Saved) =>
                              !allTemplates.some((t) => t.id === x.template) ||
                              typeof x.name !== "string" ||
                              !x.settings ||
                              !Number.isFinite(x.settings.speed),
                          )
                        )
                          throw Error();
                        setSaved(data.saved);
                        setImportError("");
                        setNotice("Collection imported");
                      } catch {
                        setImportError(
                          "Invalid configuration file. Please import a LarpScreens export.",
                        );
                      }
                    }}
                  />
                  {importError && <span>{importError}</span>}
                </div>
                <div className="grid">
                  {saved.map((s) => (
                    <article className="saved-card" key={s.id}>
                      <input
                        aria-label="Dashboard name"
                        value={s.name}
                        onChange={(e) =>
                          setSaved((v) =>
                            v.map((x) =>
                              x.id === s.id
                                ? { ...x, name: e.target.value }
                                : x,
                            ),
                          )
                        }
                      />
                      <p>
                        {allTemplates.find((t) => t.id === s.template)?.name}
                      </p>
                      <button
                        onClick={() => {
                          setSettings(s.settings);
                          if (s.state)
                            localStorage.setItem(
                              "larp-dashboard-" + s.template,
                              JSON.stringify(s.state),
                            );
                          setActive(s.template);
                        }}
                      >
                        <Play size={15} /> Open
                      </button>
                      <button
                        title="Duplicate"
                        onClick={() =>
                          setSaved((v) => [
                            ...v,
                            {
                              ...s,
                              id: crypto.randomUUID(),
                              name: s.name + " copy",
                            },
                          ])
                        }
                      >
                        <Copy size={15} />
                      </button>
                      <button
                        title="Delete"
                        onClick={() =>
                          setSaved((v) => v.filter((x) => x.id !== s.id))
                        }
                      >
                        <Trash2 size={15} />
                      </button>
                    </article>
                  ))}
                </div>
                {!saved.length && (
                  <div className="empty">
                    Your next creation belongs here. Open a simulation and
                    choose Save dashboard.
                  </div>
                )}
              </>
            ) : (
              <div className="grid">
                {list.map((t, i) => (
                  <motion.article
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.035, 0.3) }}
                    className="template-card"
                    key={t.id}
                  >
                    <button
                      className="preview-button"
                      aria-label={`Launch ${t.name}`}
                      onClick={() => setActive(t.id)}
                    >
                      <Preview kind={t.kind} color={t.color} index={i} />
                      <div className="launch-overlay">
                        <Play size={16} fill="currentColor" /> Launch simulation
                      </div>
                    </button>
                    <div className="card-info">
                      <div className="card-title">
                        <div
                          className="template-icon"
                          style={{ color: t.color }}
                        >
                          <t.icon size={18} />
                        </div>
                        <h4>{t.name}</h4>
                        {t.tag && (
                          <span
                            className={`tag ${t.tag === "NEW" ? "new" : ""}`}
                          >
                            {t.tag}
                          </span>
                        )}
                        <button
                          title="Favourite"
                          className={favorites.includes(t.id) ? "is-fav" : ""}
                          onClick={() => toggleFavorite(t.id)}
                        >
                          <Star
                            size={16}
                            fill={
                              favorites.includes(t.id) ? "currentColor" : "none"
                            }
                          />
                        </button>
                      </div>
                      <p>{t.desc}</p>
                      <div className="card-footer">
                        <span>
                          <i /> Interactive simulation
                        </span>
                        <button onClick={() => setActive(t.id)}>
                          Open screen <ArrowUpRight size={13} />
                        </button>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            )}
            {page !== "saved" && !list.length && (
              <div className="empty">
                No screens found. Try another search or add a favourite.
              </div>
            )}
            <footer>
              <div className="brand mini">
                <Monitor size={16} /> LarpScreens
              </div>
              <span>A little fictional. A lot of possibility.</span>
              <span>All data is simulated. Always.</span>
            </footer>
          </main>
        ) : (
          <React.Suspense
            fallback={<div className="empty">Opening simulation…</div>}
          >
            <Dashboard
              key={current.id + seedOffset}
              template={current}
              settings={settings}
              setSettings={setSettings}
              live={live}
              setLive={setLive}
              onBack={() => {
                setActive(null);
                setCompare(null);
              }}
              onSave={save}
              notify={setNotice}
              comparison={compare}
              setComparison={setCompare}
            />
          </React.Suspense>
        )}
      </div>
      <AnimatePresence>
        {notice && (
          <motion.div
            className="toast"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Check size={17} />
            {notice}
          </motion.div>
        )}
      </AnimatePresence>
      {preferences && (
        <div className="modal-backdrop" onClick={() => setPreferences(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setPreferences(false)}>
              <X size={18} />
            </button>
            <h2>Your workspace</h2>
            <p>Make yourself at home.</p>
            <label>
              Appearance
              <select
                value={light ? "light" : "dark"}
                onChange={(e) => setLight(e.target.value === "light")}
              >
                <option value="dark">Midnight Black</option>
                <option value="light">Clean White</option>
              </select>
            </label>
            <label>
              Currency
              <select
                value={settings.currency}
                onChange={(e) =>
                  setSettings({ ...settings, currency: e.target.value })
                }
              >
                <option>USD</option>
                <option>AUD</option>
                <option>EUR</option>
                <option>GBP</option>
              </select>
            </label>
            <p className="muted">
              Keyboard shortcuts: F fullscreen · Space pause · R reset · Esc
              exit
            </p>
            <button
              onClick={() => {
                setSettings(defaultSettings);
                setSeedOffset((x) => x + 1);
                setNotice("Preferences reset");
              }}
            >
              Reset preferences
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
