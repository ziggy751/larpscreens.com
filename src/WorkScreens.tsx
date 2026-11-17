import { useState } from "react";
import {
  Search,
  TrendingUp,
  ArrowUpRight,
  ShoppingBag,
  Users,
  Home,
  Package,
  BarChart3,
  Globe,
  Landmark,
  ArrowLeftRight,
  CreditCard,
  Wallet,
  ChevronRight,
  Plus,
  Building2,
} from "lucide-react";
import {
  type ScreenProps,
  Plot,
  Ledger,
  Stamp,
  AssetIcon,
  n,
  short,
} from "./NativeUI";
import { TradeDesk } from "./TradeDesk";
import { BusinessDesk } from "./BusinessDesk";
export function WorkScreen(p: ScreenProps) {
  return p.kind === "stocks" ? (
    <Stocks p={p} />
  ) : p.kind === "business" ? (
    <Commerce p={p} />
  ) : p.kind === "banking" ? (
    <Bank p={p} />
  ) : (
    <Analytics p={p} />
  );
}
const stockNames = ["NVIDIA", "Apple", "Microsoft", "Tesla", "Amazon"],
  stockSymbols = ["NVDA", "AAPL", "MSFT", "TSLA", "AMZN"];
function Stocks({ p }: { p: ScreenProps }) {
  const [tab, setTab] = useState("Investing"),
    [asset, setAsset] = useState<number | null>(null),
    [query, setQuery] = useState("");
  const profit =
    p.s.value + p.s.cash - (p.s.startingWealth || p.s.initial + p.s.cash);
  return (
    <div className="stocks-app">
      <Stamp exit={p.onExit} />
      <header className="stocks-header">
        <strong>
          <TrendingUp size={23} /> Investing
        </strong>
        <div>
          <Search size={16} />
          <input
            aria-label="Search stocks"
            placeholder="Search stocks and companies"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <nav>
          {["Investing", "Portfolio", "History"].map((v) => (
            <button
              className={tab === v ? "selected" : ""}
              key={v}
              onClick={() => setTab(v)}
            >
              {v}
            </button>
          ))}
        </nav>
      </header>
      <div className="stock-ticker">
        {stockSymbols.map((v, i) => (
          <button key={v} onClick={() => setAsset(i)}>
            {v} <b>{p.money(p.s.prices[i])}</b>
            <span>
              {(
                (p.s.prices[i] / (p.s.assetHistory?.[i]?.[0] || p.s.prices[i]) -
                  1) *
                100
              ).toFixed(2)}
              %
            </span>
          </button>
        ))}
      </div>
      <main className="stocks-main">
        {tab === "History" ? (
          <>
            <h1>Investment activity</h1>
            <Ledger p={p} />
          </>
        ) : (
          <>
            <section className="stock-performance">
              <div className="stock-value">
                <small>
                  {asset === null ? "Investing portfolio" : stockNames[asset]}
                </small>
                <h1>
                  {p.money(asset === null ? p.s.value : p.s.prices[asset])}
                </h1>
                <p className={profit < 0 ? "negative" : "positive"}>
                  {p.money(profit)} <span>total simulated return</span>
                </p>
              </div>
              <Plot
                s={p.s}
                asset={asset ?? undefined}
                color="#00a86b"
                candles={asset !== null}
              />
              <div className="stock-buying-power">
                <span>Buying power</span>
                <b>{p.money(p.s.cash)}</b>
              </div>
              {tab === "Portfolio" && (
                <div className="stock-allocation">
                  <h2>Portfolio allocation</h2>
                  {stockNames.map((name, i) => (
                    <div key={name}>
                      <span>{name}</span>
                      <i
                        style={{
                          width: `${((p.s.prices[i] * p.s.quantities[i]) / p.s.value) * 100}%`,
                        }}
                      />
                      <b>
                        {(
                          ((p.s.prices[i] * p.s.quantities[i]) / p.s.value) *
                          100
                        ).toFixed(1)}
                        %
                      </b>
                    </div>
                  ))}
                </div>
              )}
              <section className="stock-holdings">
                <h2>Your investments</h2>
                <div className="stock-table-head">
                  <span>Company</span>
                  <span>Price</span>
                  <span>Shares</span>
                  <span>Market value</span>
                </div>
                {stockNames.map(
                  (v, i) =>
                    (v + stockSymbols[i])
                      .toLowerCase()
                      .includes(query.toLowerCase()) && (
                      <button
                        key={v}
                        className={asset === i ? "selected" : ""}
                        onClick={() => setAsset(asset === i ? null : i)}
                      >
                        <span>
                          <i className={`company-mark company-${i}`}>
                            {stockSymbols[i][0]}
                          </i>
                          <b>
                            {v}
                            <small>{stockSymbols[i]}</small>
                          </b>
                        </span>
                        <span>{p.money(p.s.prices[i])}</span>
                        <span>{p.s.quantities[i].toLocaleString()}</span>
                        <b>{p.money(p.s.quantities[i] * p.s.prices[i])}</b>
                      </button>
                    ),
                )}
              </section>
            </section>
            <aside className="stock-right">
              <section className="stock-order">
                <TradeDesk
                  key={asset ?? 0}
                  s={p.s}
                  setS={p.setS}
                  symbols={stockSymbols}
                  money={p.money}
                  notify={p.notify}
                  defaultAsset={asset ?? 0}
                />
              </section>
              <section className="stock-market-note">
                <h3>Market overview</h3>
                <p>All prices and market activity are simulated.</p>
                {["S&P demo index", "Technology demo", "Global demo"].map(
                  (v, i) => (
                    <div key={v}>
                      <span>{v}</span>
                      <b>{(p.s.prices[i] * 30).toFixed(2)}</b>
                    </div>
                  ),
                )}
              </section>
            </aside>
          </>
        )}
      </main>
    </div>
  );
}
function Commerce({ p }: { p: ScreenProps }) {
  const [tab, setTab] = useState("Analytics"),
    [view, setView] = useState("Overview");
  const totals = [0.45, 0.32, 0.23];
  return (
    <div className="commerce-app">
      <Stamp exit={p.onExit} />
      <header className="commerce-header">
        <strong>
          <ShoppingBag size={21} /> Commerce
        </strong>
        <div>
          <Search size={16} />
          <span>Your fictional store</span>
        </div>
        <span>
          {p.profile || "Morgan Goods"} <small>DEMO STORE</small>
        </span>
      </header>
      <div className="commerce-layout">
        <aside className="commerce-nav">
          {[
            { name: "Home", icon: Home },
            { name: "Orders", icon: ShoppingBag },
            { name: "Products", icon: Package },
            { name: "Customers", icon: Users },
            { name: "Analytics", icon: BarChart3 },
          ].map((v) => (
            <button
              className={tab === v.name ? "selected" : ""}
              key={v.name}
              onClick={() => setTab(v.name)}
            >
              <v.icon size={17} />
              {v.name}
              {v.name === "Orders" && <span>{p.s.orders.length}</span>}
            </button>
          ))}
          <div className="commerce-channel">
            <small>SALES CHANNELS</small>
            <p>
              <Globe size={15} /> Online store · demo
            </p>
          </div>
        </aside>
        <main className="commerce-main">
          <header>
            <div>
              <h1>{tab === "Home" ? "Welcome back" : tab}</h1>
              <p>
                {tab === "Analytics"
                  ? "Understand how your business is performing."
                  : "Your fictional store, at a glance."}
              </p>
            </div>
            <span>Simulated session</span>
          </header>
          {tab === "Orders" ? (
            <>
              <BusinessDesk
                s={p.s}
                setS={p.setS}
                money={p.money}
                notify={p.notify}
              />
              <section className="commerce-box">
                <h2>All orders</h2>
                <Ledger p={p} orders />
              </section>
            </>
          ) : tab === "Products" ? (
            <section className="commerce-box">
              <h2>Product performance</h2>
              {[
                "Essential kit",
                "Pro collection",
                "Digital bundle",
                "Studio plan",
              ].map((product) => {
                const orders = p.s.orders.filter((o) =>
                  o.label.includes(product),
                );
                return (
                  <div className="commerce-product" key={product}>
                    <Package size={24} />
                    <div>
                      <b>{product}</b>
                      <small>{orders.length} recorded orders</small>
                    </div>
                    <strong>
                      {p.money(orders.reduce((a, o) => a + o.amount, 0))}
                    </strong>
                  </div>
                );
              })}
            </section>
          ) : tab === "Customers" ? (
            <section className="commerce-box">
              <h2>
                Customers <small>{p.s.customers}</small>
              </h2>
              {p.s.orders.slice(0, 20).map((o, i) => (
                <div className="commerce-product" key={i}>
                  <Users size={20} />
                  <div>
                    <b>Demo customer {i + 1}</b>
                    <small>Fictional profile · order #{o.id}</small>
                  </div>
                  <strong>{p.money(o.amount)}</strong>
                </div>
              ))}
              {!p.s.customers && (
                <p>Customers appear when fictional orders are recorded.</p>
              )}
            </section>
          ) : (
            <>
              <div className="commerce-view-tabs">
                {["Overview", "Reports"].map((v) => (
                  <button
                    className={view === v ? "selected" : ""}
                    onClick={() => setView(v)}
                    key={v}
                  >
                    {v}
                  </button>
                ))}
                <span>Live demo data · no payment processing</span>
              </div>
              <div className="commerce-summary">
                {[
                  ["Total sales", p.money(p.s.revenue)],
                  ["Orders", n(p.s.orders.length)],
                  ["Customers", n(p.s.customers)],
                  [
                    "Average order value",
                    p.money(
                      p.s.orders.length ? p.s.revenue / p.s.orders.length : 0,
                    ),
                  ],
                ].map(([k, v]) => (
                  <div key={k}>
                    <span>{k}</span>
                    <h2>{v}</h2>
                    <small>From recorded demo orders</small>
                  </div>
                ))}
              </div>
              <div className="commerce-dashboard-grid">
                <section className="commerce-box sales-over-time">
                  <header>
                    <h2>Total sales over time</h2>
                    <b>{p.money(p.s.revenue)}</b>
                  </header>
                  <Plot s={p.s} color="#17846b" />
                </section>
                <section className="commerce-box">
                  <h2>Sales breakdown</h2>
                  <p>Recorded transactions by product</p>
                  {[
                    "Essential kit",
                    "Pro collection",
                    "Digital bundle",
                    "Studio plan",
                  ].map((product) => {
                    const total = p.s.orders
                      .filter((o) => o.label.includes(product))
                      .reduce((a, o) => a + o.amount, 0);
                    return (
                      <div className="commerce-breakdown" key={product}>
                        <span>{product}</span>
                        <b>{p.money(total)}</b>
                        <i
                          style={{
                            width: `${(total / (p.s.revenue || 1)) * 100}%`,
                          }}
                        />
                      </div>
                    );
                  })}
                  <div className="commerce-mrr">
                    <span>Monthly recurring revenue</span>
                    <strong>{p.money(p.s.mrr)}</strong>
                  </div>
                </section>
              </div>
              {view === "Reports" ? (
                <section className="commerce-box">
                  <h2>Order report</h2>
                  <Ledger p={p} orders />
                </section>
              ) : (
                <>
                  <div className="commerce-dashboard-grid">
                    <section className="commerce-box">
                      <h2>Recent orders</h2>
                      {p.s.orders.length ? (
                        p.s.orders.slice(0, 5).map((o, i) => (
                          <button
                            className="commerce-recent"
                            key={i}
                            onClick={() => setTab("Orders")}
                          >
                            <b>#{o.id}</b>
                            <span>{o.label}</span>
                            <small>Paid · demo</small>
                            <strong>{p.money(o.amount)}</strong>
                          </button>
                        ))
                      ) : (
                        <p>No orders yet. Create a fictional order below.</p>
                      )}
                    </section>
                    <section className="commerce-box commerce-note">
                      <ShoppingBag size={30} />
                      <h2>Good things are in store.</h2>
                      <p>
                        Every sale creates a matching order. Your revenue,
                        customers and subscriptions update together.
                      </p>
                      <button onClick={() => setTab("Orders")}>
                        View all orders <ChevronRight size={14} />
                      </button>
                    </section>
                  </div>
                  <BusinessDesk
                    s={p.s}
                    setS={p.setS}
                    money={p.money}
                    notify={p.notify}
                  />
                </>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
function Bank({ p }: { p: ScreenProps }) {
  const [tab, setTab] = useState("Overview"),
    [transfer, setTransfer] = useState(false);
  return (
    <div className="bank-app">
      <Stamp exit={p.onExit} />
      <aside className="bank-nav">
        <h2>
          <Landmark size={24} /> Private Banking
        </h2>
        <small>PRIVATE FINANCE · DEMO</small>
        {["Overview", "Accounts", "Transactions"].map((v) => (
          <button
            key={v}
            className={tab === v ? "selected" : ""}
            onClick={() => setTab(v)}
          >
            {v === "Overview" ? (
              <Home size={18} />
            ) : v === "Accounts" ? (
              <Wallet size={18} />
            ) : (
              <ArrowLeftRight size={18} />
            )}{" "}
            {v}
          </button>
        ))}
        <div>
          Personal workspace
          <br />
          No real banking connection
        </div>
      </aside>
      <main className="bank-main">
        <header>
          <div>
            <small>YOUR PERSONAL FINANCE</small>
            <h1>Good morning, {p.profile || "Alex"}.</h1>
            <p>A clear view of your fictional finances.</p>
          </div>
          <button onClick={() => setTransfer(!transfer)}>
            <ArrowLeftRight size={16} /> Transfer
          </button>
        </header>
        {tab === "Transactions" ? (
          <section className="bank-box">
            <h2>Transaction history</h2>
            <Ledger p={p} />
          </section>
        ) : (
          <>
            <div className="bank-top-grid">
              <section className="bank-total">
                <span>TOTAL BALANCE</span>
                <h1>{p.money(p.s.cash + p.s.savings)}</h1>
                <p>Across 2 fictional accounts</p>
                <div>
                  <span>
                    Checking <b>{p.money(p.s.cash)}</b>
                  </span>
                  <span>
                    Savings <b>{p.money(p.s.savings)}</b>
                  </span>
                </div>
              </section>
              <section className="bank-card">
                <div>
                  <strong>DEMO CARD</strong>
                  <CreditCard size={28} />
                </div>
                <span>FICTIONAL DEMO CARD</span>
                <h2>••••　••••　••••　DEMO</h2>
                <div>
                  <b>{p.profile || "Alex Morgan"}</b>
                  <small>NOT A PAYMENT CARD</small>
                </div>
              </section>
            </div>
            {tab === "Accounts" ? (
              <div className="bank-accounts">
                {[
                  ["Checking account", p.s.cash],
                  ["Savings account", p.s.savings],
                ].map(([name, value]) => (
                  <section className="bank-box" key={name}>
                    <Wallet size={25} />
                    <h2>{name}</h2>
                    <strong>{p.money(Number(value))}</strong>
                    <p>
                      Fictional account · balances change only on transactions.
                    </p>
                    <button onClick={() => setTransfer(true)}>
                      Transfer funds
                    </button>
                  </section>
                ))}
              </div>
            ) : (
              <div className="bank-lower">
                <section className="bank-box">
                  <h2>Balance history</h2>
                  <Plot s={p.s} color="#2345a1" />
                </section>
                <section className="bank-box">
                  <h2>Recent activity</h2>
                  {p.s.transactions.length ? (
                    p.s.transactions.slice(0, 5).map((t, i) => (
                      <div className="bank-transaction" key={i}>
                        <span>↗</span>
                        <div>
                          <b>{t.label}</b>
                          <small>Simulated transfer · {t.time}s</small>
                        </div>
                        <strong>{p.money(t.amount)}</strong>
                      </div>
                    ))
                  ) : (
                    <div className="bank-no-activity">
                      <ArrowLeftRight size={25} />
                      <p>Your balances stay still until you move them.</p>
                      <button onClick={() => setTransfer(true)}>
                        Make a demo transfer
                      </button>
                    </div>
                  )}
                </section>
              </div>
            )}
          </>
        )}
        {transfer && (
          <section className="bank-transfer">
            <TradeDesk
              bank
              s={p.s}
              setS={p.setS}
              symbols={stockSymbols}
              money={p.money}
              notify={p.notify}
            />
          </section>
        )}
      </main>
    </div>
  );
}
function Analytics({ p }: { p: ScreenProps }) {
  const [tab, setTab] = useState("Overview"),
    [page, setPage] = useState("/");
  const collection = p.kind === "luxury";
  return (
    <div className={`analytics-app ${collection ? "collection-app" : ""}`}>
      <Stamp exit={p.onExit} />
      <header>
        <strong>
          <Globe size={22} /> {collection ? "Collections" : "Analytics"}
        </strong>
        <nav>
          {["Overview", "Realtime", "Pages", "Sources"].map((v) => (
            <button
              key={v}
              className={tab === v ? "selected" : ""}
              onClick={() => setTab(v)}
            >
              {v}
            </button>
          ))}
        </nav>
        <span>
          {p.profile || "morgan.studio"} <small>FICTIONAL PROPERTY</small>
        </span>
      </header>
      <main>
        <div className="analytics-title">
          <h1>
            {collection
              ? "Private collection"
              : tab === "Realtime"
                ? "Live visitors"
                : tab}
          </h1>
          <span className="analytics-live">
            ● {n(p.s.secondary || 842)} current visitors · simulated
          </span>
        </div>
        <div className="analytics-metrics">
          {(collection
            ? [
                ["Collection value", p.money(p.s.value)],
                ["Properties", p.money(p.s.cash)],
                ["Collectibles", p.money(p.s.savings)],
              ]
            : [
                ["Visitors", short(p.s.views * 0.65)],
                ["Page views", short(p.s.views)],
                ["Active now", n(p.s.secondary || 842)],
                ["Conversions", n(p.s.views * 0.031)],
              ]
          ).map(([k, v]) => (
            <div key={k}>
              <span>{k}</span>
              <strong>{v}</strong>
            </div>
          ))}
        </div>
        {tab === "Pages" ? (
          <section className="analytics-panel">
            <h2>Pages</h2>
            {["/", "/journal", "/shop", "/about"].map((v, i) => (
              <button
                className="analytics-page-row"
                key={v}
                onClick={() => setPage(v)}
              >
                <b>{v}</b>
                <span>
                  {short(p.s.views * [0.45, 0.25, 0.2, 0.1][i])} page views
                </span>
                <ChevronRight size={15} />
              </button>
            ))}
            <h3>{page} · page performance</h3>
            <Plot s={p.s} color="#8977ea" />
          </section>
        ) : (
          <>
            <section className="analytics-panel analytics-chart">
              <h2>{collection ? "Collection value" : "Realtime visitors"}</h2>
              <Plot s={p.s} color="#8977ea" />
            </section>
            <div className="analytics-lower">
              <section className="analytics-panel">
                <h2>{tab === "Sources" ? "Traffic sources" : "Top sources"}</h2>
                {[
                  ["Direct", 42],
                  ["Google", 31],
                  ["Social", 19],
                  ["Other", 8],
                ].map(([name, v]) => (
                  <div className="analytics-source" key={name}>
                    <span>{name}</span>
                    <b>{short((p.s.views * Number(v)) / 100)}</b>
                    <i style={{ width: `${v}%` }} />
                  </div>
                ))}
              </section>
              <section className="analytics-panel">
                <h2>Visitors around the world</h2>
                <svg className="analytics-map" viewBox="0 0 500 210">
                  <path
                    fill="currentColor"
                    d="M30 40l60-20 52 16 15 37-30 25-20 65-25-36-5-45-35-7zm150-8 44-15 10 30-30 18zm40 47 45-19 40 30-20 64-22 35-25-60zm65-45 62-20 108 24 22 42-35 20-28-17-24 43-31-34-52-16zm112 114 45-12 30 37-42 11-23-12z"
                  />
                  {p.s.visitors.map((v) => (
                    <circle
                      key={v.id}
                      cx={v.x * 5}
                      cy={v.y * 2}
                      r="4"
                      fill="#9f8afa"
                    />
                  ))}
                </svg>
              </section>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
