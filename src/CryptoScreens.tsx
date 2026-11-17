import { useState, useRef } from "react";
import {
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  Wallet,
  History,
  Star,
  ChevronRight,
  Globe,
  Shield,
  Compass,
  Coins,
  SlidersHorizontal,
  X,
} from "lucide-react";
import {
  type ScreenProps,
  Plot,
  Ledger,
  AssetIcon,
  coins,
  symbols,
  assetColors,
  short,
  Stamp,
} from "./NativeUI";
import { TradeDesk } from "./TradeDesk";
import { createState, type State } from "./engine";
export function CryptoScreen(p: ScreenProps) {
  switch (p.variant) {
    case "discovery":
      return <Discovery p={p} />;
    case "phantom":
    case "trust":
      return <WalletScreen p={p} trust={p.variant === "trust"} />;
    case "exodus":
      return <Exodus p={p} />;
    case "binance":
      return <Terminal p={p} />;
    default:
      return <ExchangePortfolio p={p} />;
  }
}
function WalletScreen({ p, trust }: { p: ScreenProps; trust: boolean }) {
  const [tab, setTab] = useState("Tokens"),
    [query, setQuery] = useState(""),
    [detail, setDetail] = useState<number | null>(null),
    [action, setAction] = useState(""),
    [account, setAccount] = useState(
      () => localStorage.getItem(`larp-wallet-${p.variant}-selected`) || "1",
    ),
    [network, setNetwork] = useState("All networks");
  const accounts = useRef<Record<string, State>>({});
  const switchAccount = (id: string) => {
    accounts.current[account] = p.s;
    localStorage.setItem(
      `larp-wallet-${p.variant}-${account}`,
      JSON.stringify(p.s),
    );
    let next = accounts.current[id];
    if (!next) {
      try {
        next = JSON.parse(
          localStorage.getItem(`larp-wallet-${p.variant}-${id}`) || "null",
        );
      } catch {}
    }
    p.setS(next || createState("crypto", Number(id) * 42));
    setAccount(id);
    localStorage.setItem(`larp-wallet-${p.variant}-selected`, id);
    p.notify(`Demo account ${id} selected`);
  };
  return (
    <div
      className={`native-wallet-stage ${trust ? "trust-stage" : "phantom-stage"}`}
    >
      <Stamp exit={p.onExit} />
      <div
        className={`native-wallet ${trust ? "trust-wallet" : "phantom-wallet"}`}
      >
        <header>
          {trust ? <Shield size={22} /> : <span className="ghost-mark">◕</span>}
          <select
            aria-label="Demo wallet account"
            value={account}
            onChange={(e) => switchAccount(e.target.value)}
          >
            {["1", "2", "3"].map((a) => (
              <option key={a} value={a}>
                {p.profile || "Wallet"} {a}
              </option>
            ))}
          </select>
          <button
            aria-label="Show wallet activity"
            onClick={() => setTab(tab === "Activity" ? "Tokens" : "Activity")}
          >
            <History size={19} />
          </button>
        </header>
        <div className="wallet-balance">
          <span>{trust ? "TOTAL VALUE" : "TOTAL BALANCE"}</span>
          <h1>{p.money(p.s.value)}</h1>
          <p>
            {p.money(p.s.value - p.s.initial)}{" "}
            <small>({((p.s.value / p.s.initial - 1) * 100).toFixed(2)}%)</small>
          </p>
        </div>
        <div className="wallet-actions">
          {[
            { label: "Send", icon: ArrowUpRight },
            { label: "Receive", icon: ArrowDownLeft },
            { label: "Swap", icon: ArrowLeftRight },
            ...(trust ? [{ label: "Buy", icon: Coins }] : []),
          ].map((a) => (
            <button key={a.label} onClick={() => setAction(a.label)}>
              <a.icon size={19} />
              {a.label}
            </button>
          ))}
        </div>
        <div className="wallet-tabs">
          {["Tokens", "Activity"].map((t) => (
            <button
              key={t}
              className={tab === t ? "selected" : ""}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
          {trust && (
            <select
              aria-label="Network"
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
            >
              <option>All networks</option>
              <option>Bitcoin</option>
              <option>Ethereum</option>
              <option>Solana</option>
            </select>
          )}
        </div>
        {tab === "Activity" ? (
          <Ledger p={p} />
        ) : (
          <>
            <div className="wallet-search">
              <Search size={15} />
              <input
                aria-label="Search wallet assets"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search your tokens"
              />
            </div>
            <div className="wallet-token-list">
              {coins.map(
                (name, i) =>
                  (name + symbols[i])
                    .toLowerCase()
                    .includes(query.toLowerCase()) &&
                  (network === "All networks" || network === name) && (
                    <button
                      className="wallet-token"
                      key={name}
                      onClick={() => setDetail(i)}
                    >
                      <AssetIcon i={i} />
                      <div>
                        <b>{name}</b>
                        <small>
                          {p.s.quantities[i].toLocaleString(undefined, {
                            maximumFractionDigits: 5,
                          })}{" "}
                          {symbols[i]}
                        </small>
                      </div>
                      <div>
                        <b>{p.money(p.s.quantities[i] * p.s.prices[i])}</b>
                        <small
                          className={
                            p.s.prices[i] <
                            (p.s.assetHistory?.[i]?.[0] || p.s.prices[i])
                              ? "negative"
                              : "positive"
                          }
                        >
                          {p.money(p.s.prices[i])}
                        </small>
                      </div>
                    </button>
                  ),
              )}
            </div>
          </>
        )}
        <footer className="wallet-bottom">
          <button aria-label="Wallet home" onClick={() => setTab("Tokens")}>
            <Wallet size={22} />
          </button>
          <button aria-label="Swap tokens" onClick={() => setAction("Swap")}>
            <ArrowLeftRight size={22} />
          </button>
          <button
            aria-label="Wallet history"
            onClick={() => setTab("Activity")}
          >
            <History size={22} />
          </button>
          <button
            aria-label="Explore assets"
            onClick={() => {
              setTab("Tokens");
              setQuery("");
            }}
          >
            <Compass size={22} />
          </button>
        </footer>
        <small className="wallet-fictional">
          Fictional assets · no wallet connection
        </small>
      </div>
      {detail !== null && (
        <div className="native-dialog-backdrop">
          <section className="native-dialog">
            <button
              className="dialog-close"
              aria-label="Close asset detail"
              onClick={() => setDetail(null)}
            >
              <X size={18} />
            </button>
            <AssetIcon i={detail} />
            <h2>{coins[detail]}</h2>
            <h1>{p.money(p.s.prices[detail])}</h1>
            <Plot
              s={p.s}
              asset={detail}
              color={trust ? "#1b6bff" : "#ae97ff"}
            />
            <p>
              You hold {p.s.quantities[detail].toLocaleString()}{" "}
              {symbols[detail]} ·{" "}
              {p.money(p.s.quantities[detail] * p.s.prices[detail])}
            </p>
            <button
              className="native-primary"
              onClick={() => {
                setDetail(null);
                setAction("Swap");
              }}
            >
              Swap asset
            </button>
          </section>
        </div>
      )}
      {action && (
        <div className="native-dialog-backdrop">
          <section className="native-dialog wallet-trade">
            <button
              className="dialog-close"
              aria-label="Close wallet action"
              onClick={() => setAction("")}
            >
              <X size={18} />
            </button>
            <h2>{action} · fictional assets</h2>
            <p>
              {action === "Send"
                ? "Send assets to the demo cash account. No external transfers."
                : action === "Receive"
                  ? "Receive assets using your fictional cash balance. No deposit address or real funds."
                  : "Swap or trade only simulated holdings."}
            </p>
            <TradeDesk
              key={action}
              s={p.s}
              setS={p.setS}
              symbols={symbols}
              money={p.money}
              notify={p.notify}
              defaultMode={
                action === "Swap"
                  ? "Convert"
                  : action === "Send"
                    ? "Sell"
                    : "Buy"
              }
            />
          </section>
        </div>
      )}
    </div>
  );
}
function Exodus({ p }: { p: ScreenProps }) {
  const [tab, setTab] = useState("Portfolio"),
    [selected, setSelected] = useState<number | null>(null);
  let start = 0;
  const stops = p.s.prices
    .map((price, i) => {
      const next =
        start + ((price * p.s.quantities[i]) / (p.s.value || 1)) * 100;
      const stop = `${assetColors[i]} ${start}% ${next}%`;
      start = next;
      return stop;
    })
    .join(",");
  return (
    <div className="exodus-app">
      <Stamp exit={p.onExit} />
      <header className="exodus-header">
        <strong>
          <span>✕</span> LARP / EXODUS STUDY
        </strong>
        <nav>
          {["Portfolio", "Exchange", "Activity"].map((t) => (
            <button
              className={tab === t ? "selected" : ""}
              key={t}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </nav>
        <span>Personal portfolio</span>
      </header>
      {tab === "Activity" ? (
        <Ledger p={p} />
      ) : tab === "Exchange" ? (
        <div className="exodus-exchange">
          <h1>Make your next move.</h1>
          <TradeDesk
            s={p.s}
            setS={p.setS}
            symbols={symbols}
            money={p.money}
            notify={p.notify}
            defaultMode="Convert"
          />
        </div>
      ) : (
        <>
          <div className="exodus-overview">
            <div
              className="allocation-ring"
              style={{ background: `conic-gradient(${stops})` }}
            >
              <div>
                <small>PORTFOLIO VALUE</small>
                <h1>{p.money(p.s.value)}</h1>
                <p>{p.s.prices.length} assets · simulated</p>
              </div>
            </div>
            <div className="exodus-performance">
              <span>PORTFOLIO PERFORMANCE</span>
              <h2>Your assets, in perspective.</h2>
              <Plot s={p.s} color="#a47bfd" />
              <div className="exodus-summary">
                <span>
                  Available cash <b>{p.money(p.s.cash)}</b>
                </span>
                <span>
                  Total assets <b>{p.s.prices.length}</b>
                </span>
              </div>
            </div>
          </div>
          <section className="exodus-assets">
            <header>
              <h2>Your assets</h2>
              <span>Allocation · Price · Balance</span>
            </header>
            {coins.map((name, i) => (
              <button
                className={`exodus-asset ${selected === i ? "selected" : ""}`}
                key={name}
                onClick={() => setSelected(selected === i ? null : i)}
              >
                <AssetIcon i={i} />
                <b style={{ color: assetColors[i] }}>{symbols[i]}</b>
                <span>{name}</span>
                <span>
                  {(
                    ((p.s.quantities[i] * p.s.prices[i]) / p.s.value) *
                    100
                  ).toFixed(1)}
                  %
                  <i
                    style={{
                      width: `${((p.s.quantities[i] * p.s.prices[i]) / p.s.value) * 100}%`,
                      background: assetColors[i],
                    }}
                  />
                </span>
                <span>{p.money(p.s.prices[i])}</span>
                <strong>{p.money(p.s.prices[i] * p.s.quantities[i])}</strong>
                <ChevronRight size={17} />
              </button>
            ))}
          </section>
          {selected !== null && (
            <section className="exodus-detail">
              <h2>{coins[selected]} asset details</h2>
              <Plot s={p.s} asset={selected} color={assetColors[selected]} />
              <button onClick={() => setTab("Exchange")}>
                Exchange {symbols[selected]} <ArrowLeftRight size={15} />
              </button>
            </section>
          )}
        </>
      )}
    </div>
  );
}
const fakeNames = ["MOON", "WAVE", "MINT", "NOVA", "PIXEL"];
function Discovery({ p }: { p: ScreenProps }) {
  const [tab, setTab] = useState("Discover"),
    [query, setQuery] = useState(""),
    [sort, setSort] = useState("Activity"),
    [selected, setSelected] = useState<number | null>(null),
    [watch, setWatch] = useState<number[]>(() => {
      try {
        return JSON.parse(
          localStorage.getItem("larp-token-watchlist") || "[0,2]",
        );
      } catch {
        return [0, 2];
      }
    });
  const toggle = (i: number) => {
    const next = watch.includes(i)
      ? watch.filter((x) => x !== i)
      : [...watch, i];
    setWatch(next);
    localStorage.setItem("larp-token-watchlist", JSON.stringify(next));
  };
  const indices = [0, 1, 2, 3, 4]
    .filter(
      (i) =>
        fakeNames[i].toLowerCase().includes(query.toLowerCase()) &&
        (tab !== "Watchlist" || watch.includes(i)),
    )
    .sort((a, b) =>
      sort === "Price"
        ? p.s.prices[b] - p.s.prices[a]
        : sort === "Name"
          ? fakeNames[a].localeCompare(fakeNames[b])
          : b - a,
    );
  return (
    <div className="discovery-app">
      <Stamp exit={p.onExit} />
      <header className="discovery-header">
        <strong>
          ◉ TOKEN DISCOVERY <small>/ DEMO</small>
        </strong>
        <nav>
          {["Discover", "Watchlist", "Activity"].map((v) => (
            <button
              className={tab === v ? "selected" : ""}
              key={v}
              onClick={() => {
                setTab(v);
                setSelected(null);
              }}
            >
              {v}
            </button>
          ))}
        </nav>
        <span className="market-pulse">● Market simulation</span>
      </header>
      <div className="discovery-tools">
        <div>
          <Search size={16} />
          <input
            aria-label="Search fictional tokens"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search fictional tokens…"
          />
        </div>
        <select
          aria-label="Sort token listings"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option>Activity</option>
          <option>Price</option>
          <option>Name</option>
        </select>
        <span>
          Vol. {p.money(p.s.prices.reduce((a, v) => a + v, 0) * 128)} ·{" "}
          {p.s.tick}s elapsed
        </span>
      </div>
      {tab === "Activity" ? (
        <Ledger p={p} />
      ) : selected !== null ? (
        <div className="token-detail">
          <button onClick={() => setSelected(null)}>← Back to discovery</button>
          <div className="token-detail-title">
            <AssetIcon i={selected} />
            <h1>{fakeNames[selected]} / USD</h1>
            <strong>{p.money(p.s.prices[selected])}</strong>
            <button onClick={() => toggle(selected)}>
              <Star
                size={16}
                fill={watch.includes(selected) ? "currentColor" : "none"}
              />
            </button>
          </div>
          <Plot s={p.s} asset={selected} color="#42e3aa" candles />
          <TradeDesk
            s={p.s}
            setS={p.setS}
            symbols={fakeNames}
            money={p.money}
            notify={p.notify}
            defaultAsset={selected}
          />
          <Ledger p={p} />
        </div>
      ) : (
        <div className="discovery-columns">
          {["Newly discovered", "Active today", "Trending tokens"].map(
            (title, column) => (
              <section key={title}>
                <header>
                  <h2>{title}</h2>
                  <span>{indices.length} pairs</span>
                </header>
                {[...indices]
                  .sort((a, b) =>
                    column === 1
                      ? p.s.prices[b] - p.s.prices[a]
                      : column === 2
                        ? a - b
                        : 0,
                  )
                  .map((i) => (
                    <article className="token-listing" key={i}>
                      <button
                        className="token-open"
                        onClick={() => setSelected(i)}
                      >
                        <div className={`token-art token-art-${i}`}>
                          <span>{["☾", "≈", "✦", "✺", "▦"][i]}</span>
                        </div>
                        <div>
                          <h3>
                            {fakeNames[i]}{" "}
                            <small>
                              {
                                [
                                  "moonrise",
                                  "wave protocol",
                                  "mint garden",
                                  "supernova",
                                  "pixel world",
                                ][i]
                              }
                            </small>
                          </h3>
                          <p>
                            <span className="token-age">
                              {12 + i * 7 + p.s.tick}s
                            </span>{" "}
                            · {p.money(p.s.prices[i])}
                          </p>
                          <div className="token-metrics">
                            <span>
                              MC <b>{short(p.s.prices[i] * 1000000)}</b>
                            </span>
                            <span>
                              VOL{" "}
                              <b>{short(p.s.prices[i] * (24 + p.s.tick))}</b>
                            </span>
                            <span>
                              TX <b>{218 + i * 79 + p.s.tick}</b>
                            </span>
                          </div>
                          <div className="bonding">
                            <i style={{ width: `${35 + i * 12}%` }} />
                          </div>
                        </div>
                      </button>
                      <button
                        className="token-star"
                        aria-label={`Watch ${fakeNames[i]}`}
                        onClick={() => toggle(i)}
                      >
                        <Star
                          size={14}
                          fill={watch.includes(i) ? "currentColor" : "none"}
                        />
                      </button>
                    </article>
                  ))}
              </section>
            ),
          )}
        </div>
      )}
      <div className="discovery-status">
        ● Engine connected · all listings are fictional · no real token launches
      </div>
    </div>
  );
}
function Terminal({ p }: { p: ScreenProps }) {
  const [tab, setTab] = useState("Trade"),
    [asset, setAsset] = useState(0),
    [query, setQuery] = useState("");
  return (
    <div className="terminal-app">
      <Stamp exit={p.onExit} />
      <header className="terminal-header">
        <strong>
          <span>▰</span> LARP EXCHANGE
        </strong>
        <nav>
          {["Markets", "Trade", "Wallet", "Orders"].map((v) => (
            <button
              key={v}
              className={tab === v ? "selected" : ""}
              onClick={() => setTab(v)}
            >
              {v}
            </button>
          ))}
        </nav>
        <span>Demo trading environment</span>
      </header>
      {tab === "Orders" ? (
        <div className="terminal-orders">
          <h1>Order & transaction history</h1>
          <Ledger p={p} />
        </div>
      ) : tab === "Wallet" ? (
        <div className="terminal-orders">
          <h1>
            Spot wallet <small>{p.money(p.s.value + p.s.cash)}</small>
          </h1>
          <div className="exchange-holdings">
            {coins.map((name, i) => (
              <button
                key={name}
                onClick={() => {
                  setAsset(i);
                  setTab("Trade");
                }}
              >
                <AssetIcon i={i} />
                <span>
                  {name}
                  <small>
                    {p.s.quantities[i].toLocaleString(undefined, {
                      maximumFractionDigits: 6,
                    })}{" "}
                    {symbols[i]}
                  </small>
                </span>
                <b>{p.money(p.s.quantities[i] * p.s.prices[i])}</b>
              </button>
            ))}
          </div>
          <p>Available cash: {p.money(p.s.cash)}</p>
        </div>
      ) : (
        <div className="terminal-grid">
          <aside className="terminal-watch">
            <h3>Markets</h3>
            <div className="terminal-search">
              <Search size={14} />
              <input
                aria-label="Search trading pairs"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search pairs"
              />
            </div>
            <div className="pair-head">
              <span>Pair</span>
              <span>Last price</span>
            </div>
            {symbols.map(
              (name, i) =>
                name.toLowerCase().includes(query.toLowerCase()) && (
                  <button
                    className={i === asset ? "selected" : ""}
                    key={name}
                    onClick={() => {
                      setAsset(i);
                      setTab("Trade");
                    }}
                  >
                    <span>
                      <Star size={11} />
                      {name}/USD
                    </span>
                    <b>{p.money(p.s.prices[i])}</b>
                  </button>
                ),
            )}
            <div className="order-book">
              <h3>
                Order book <small>SIMULATED</small>
              </h3>
              <div className="book-columns">
                <span>Price (USD)</span>
                <span>Amount</span>
                <span>Total</span>
              </div>
              {Array.from({ length: 9 }, (_, i) => (
                <div className="book-row ask" key={i}>
                  <span>
                    {(p.s.prices[asset] * (1 + 0.0001 * (9 - i))).toFixed(2)}
                  </span>
                  <span>
                    {(Math.abs(Math.sin(i + p.s.tick / 11)) * 2).toFixed(4)}
                  </span>
                  <i style={{ width: `${30 + ((i * 17) % 60)}%` }} />
                </div>
              ))}
              <h2>
                {p.s.prices[asset].toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}
              </h2>
              {Array.from({ length: 9 }, (_, i) => (
                <div className="book-row bid" key={i}>
                  <span>
                    {(p.s.prices[asset] * (1 - 0.0001 * (i + 1))).toFixed(2)}
                  </span>
                  <span>
                    {(Math.abs(Math.cos(i + p.s.tick / 13)) * 2).toFixed(4)}
                  </span>
                  <i style={{ width: `${30 + ((i * 13) % 60)}%` }} />
                </div>
              ))}
            </div>
          </aside>
          <section className="terminal-center">
            <div className="pair-banner">
              <h1>{symbols[asset]} / USD</h1>
              <strong>{p.money(p.s.prices[asset])}</strong>
              <span>
                24h high{" "}
                <b>
                  {p.money(
                    Math.max(
                      ...(p.s.assetHistory?.[asset] || [p.s.prices[asset]]),
                    ),
                  )}
                </b>
              </span>
              <span>
                24h low{" "}
                <b>
                  {p.money(
                    Math.min(
                      ...(p.s.assetHistory?.[asset] || [p.s.prices[asset]]),
                    ),
                  )}
                </b>
              </span>
            </div>
            <div className="terminal-resize">
              <Plot s={p.s} asset={asset} color="#f4c531" candles />
            </div>
            <div className="terminal-portfolio">
              <h3>
                Portfolio performance <span>{p.money(p.s.value)}</span>
              </h3>
              <Plot s={p.s} color="#eabe24" small />
            </div>
            <div className="terminal-recent">
              <h3>Recent trades · fictional</h3>
              {p.s.transactions.slice(0, 3).map((t, i) => (
                <div key={i}>
                  <span>{t.label}</span>
                  <b>{p.money(t.amount)}</b>
                  <span>{t.time}s</span>
                </div>
              ))}
            </div>
          </section>
          <aside className="terminal-ticket">
            <TradeDesk
              key={asset}
              s={p.s}
              setS={p.setS}
              symbols={symbols}
              money={p.money}
              notify={p.notify}
              defaultAsset={asset}
            />
            <section>
              <h3>Spot balance</h3>
              <p>
                Available cash <b>{p.money(p.s.cash)}</b>
              </p>
              <p>
                {symbols[asset]} holdings{" "}
                <b>{p.s.quantities[asset].toFixed(6)}</b>
              </p>
              <p>
                Portfolio assets <b>{p.money(p.s.value)}</b>
              </p>
            </section>
          </aside>
        </div>
      )}
    </div>
  );
}

function ExchangePortfolio({ p }: { p: ScreenProps }) {
  const [tab, setTab] = useState("Portfolio"),
    [asset, setAsset] = useState(0);
  return (
    <div className="exchange-portfolio-app">
      <Stamp exit={p.onExit} />
      <aside>
        <h2>◈ Larp Assets</h2>
        {["Portfolio", "Trade", "Activity"].map((v) => (
          <button
            key={v}
            onClick={() => setTab(v)}
            className={tab === v ? "selected" : ""}
          >
            {v === "Portfolio" ? (
              <Wallet size={20} />
            ) : v === "Trade" ? (
              <ArrowLeftRight size={20} />
            ) : (
              <History size={20} />
            )}{" "}
            {v}
          </button>
        ))}
        <small>Simulated digital assets</small>
      </aside>
      <main>
        <header>
          <div>
            <small>YOUR DIGITAL ASSETS</small>
            <h1>{tab === "Portfolio" ? "Crypto portfolio" : tab}</h1>
          </div>
        </header>
        {tab === "Activity" ? (
          <Ledger p={p} />
        ) : tab === "Trade" ? (
          <TradeDesk
            key={asset}
            s={p.s}
            setS={p.setS}
            symbols={symbols}
            money={p.money}
            notify={p.notify}
            defaultAsset={asset}
          />
        ) : (
          <>
            <section className="exchange-balance">
              <span>Total portfolio value</span>
              <h1>{p.money(p.s.value)}</h1>
              <div>
                <span>
                  Available cash <b>{p.money(p.s.cash)}</b>
                </span>
                <span>
                  Assets <b>{p.s.prices.length}</b>
                </span>
              </div>
              <Plot s={p.s} color="#7c9dff" />
            </section>
            <section className="exchange-assets">
              <h2>Your assets</h2>
              {coins.map((name, i) => (
                <button
                  key={name}
                  onClick={() => {
                    setAsset(i);
                    setTab("Trade");
                  }}
                >
                  <AssetIcon i={i} />
                  <div>
                    <b>{name}</b>
                    <small>
                      {p.s.quantities[i].toLocaleString()} {symbols[i]}
                    </small>
                  </div>
                  <span>{p.money(p.s.prices[i])}</span>
                  <strong>{p.money(p.s.prices[i] * p.s.quantities[i])}</strong>
                  <ChevronRight size={17} />
                </button>
              ))}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
