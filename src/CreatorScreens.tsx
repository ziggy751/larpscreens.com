import { useState } from "react";
import {
  Play,
  Video,
  BarChart3,
  Users,
  MessageSquare,
  Camera,
  Heart,
  ChevronRight,
  Music2,
  Search,
  X,
  Radio,
  Monitor,
  Settings,
  LayoutDashboard,
} from "lucide-react";
import { type ScreenProps, Plot, Stamp, n, short } from "./NativeUI";
const videoTitles = [
  "A week of small adventures",
  "The setup that changed everything",
  "Things I wish I knew sooner",
  "A quiet morning in the city",
];
function contentRows(p: ScreenProps) {
  const parts = [0.4, 0.28, 0.2, 0.12];
  let consumed = 0;
  return parts.map((part, i) => {
    const views = i === 3 ? p.s.views - consumed : Math.floor(p.s.views * part);
    consumed += views;
    return {
      title: videoTitles[i],
      views,
      likes: Math.floor(p.s.likes * part),
      hours: views * 0.045,
    };
  });
}
export function CreatorScreen(p: ScreenProps) {
  return p.kind === "youtube" ? (
    <Studio p={p} />
  ) : p.kind === "instagram" ? (
    <InstagramScreen p={p} />
  ) : p.kind === "streaming" ? (
    <Streaming p={p} />
  ) : (
    <TikTokScreen p={p} />
  );
}
function Content({
  p,
  onSelect,
}: {
  p: ScreenProps;
  onSelect: (i: number) => void;
}) {
  return (
    <div className="creator-content-table">
      <div className="content-head">
        <span>Content</span>
        <span>Views</span>
        <span>Likes</span>
        <span>Watch hours</span>
      </div>
      {contentRows(p).map((row, i) => (
        <button key={i} onClick={() => onSelect(i)}>
          <span>
            <i className={`video-thumb thumb-${i}`}>
              <Play size={15} />
              <small>{["8:24", "12:36", "6:18", "10:02"][i]}</small>
            </i>
            <strong>
              {row.title}
              <small>Fictional video · published {i + 1} days ago</small>
            </strong>
          </span>
          <span>{n(row.views)}</span>
          <span>{n(row.likes)}</span>
          <span>{n(row.hours)}</span>
        </button>
      ))}
    </div>
  );
}
function ContentDetail({
  p,
  index,
  onClose,
}: {
  p: ScreenProps;
  index: number;
  onClose: () => void;
}) {
  const row = contentRows(p)[index];
  return (
    <div className="native-dialog-backdrop">
      <section className="native-dialog content-detail">
        <button
          className="dialog-close"
          aria-label="Close content detail"
          onClick={onClose}
        >
          <X size={18} />
        </button>
        <div className={`detail-art thumb-${index}`}>
          <Play size={44} />
        </div>
        <h2>{row.title}</h2>
        <p>Fictional content performance · all data simulated</p>
        <div className="content-detail-metrics">
          <span>
            Views <b>{n(row.views)}</b>
          </span>
          <span>
            Likes <b>{n(row.likes)}</b>
          </span>
          <span>
            Watch hours <b>{n(row.hours)}</b>
          </span>
        </div>
        <Plot
          s={{
            ...p.s,
            history: p.s.history.map((h) => ({
              ...h,
              value: h.value * [0.4, 0.28, 0.2, 0.12][index],
            })),
          }}
          color={p.kind === "instagram" ? "#dc3c87" : "#4b9bf5"}
        />
      </section>
    </div>
  );
}
function Studio({ p }: { p: ScreenProps }) {
  const [tab, setTab] = useState("Analytics"),
    [section, setSection] = useState("Overview"),
    [selected, setSelected] = useState<number | null>(null),
    [query, setQuery] = useState("");
  return (
    <div className="studio-app">
      <Stamp exit={p.onExit} />
      <header className="studio-header">
        <strong>
          <span>
            <Play size={16} fill="white" />
          </span>{" "}
          Larp Studio
        </strong>
        <div>
          <Search size={17} />
          <input
            aria-label="Search channel content"
            placeholder="Search across your channel"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (e.target.value) setTab("Content");
            }}
          />
        </div>
        <span className="studio-avatar">
          {(p.profile || "AM").slice(0, 2).toUpperCase()}
        </span>
      </header>
      <div className="studio-layout">
        <aside className="studio-sidebar">
          <div className="channel-identity">
            {p.avatar ? (
              <img src={p.avatar} />
            ) : (
              <div className="channel-art">
                <Camera size={34} />
              </div>
            )}
            <b>Your channel</b>
            <span>{p.profile || "Alex Morgan"}</span>
          </div>
          {[
            { name: "Dashboard", icon: LayoutDashboard },
            { name: "Content", icon: Video },
            { name: "Analytics", icon: BarChart3 },
            { name: "Community", icon: MessageSquare },
          ].map((v) => (
            <button
              key={v.name}
              className={tab === v.name ? "selected" : ""}
              onClick={() => setTab(v.name)}
            >
              <v.icon size={20} />
              {v.name}
            </button>
          ))}
        </aside>
        <main className="studio-main">
          <h1>
            {tab === "Analytics"
              ? "Channel analytics"
              : tab === "Dashboard"
                ? "Channel dashboard"
                : tab === "Community"
                  ? "Channel community"
                  : "Channel content"}
          </h1>
          {tab === "Content" ? (
            <div className="filtered-content">
              <p>
                {query
                  ? `Results matching “${query}”`
                  : "Your published fictional videos"}
              </p>
              {contentRows(p).map(
                (r, i) =>
                  r.title.toLowerCase().includes(query.toLowerCase()) && (
                    <button
                      className="studio-video-result"
                      key={i}
                      onClick={() => setSelected(i)}
                    >
                      <span className={`video-thumb thumb-${i}`}>
                        <Play size={16} />
                      </span>
                      <b>{r.title}</b>
                      <span>{short(r.views)} views</span>
                      <ChevronRight size={15} />
                    </button>
                  ),
              )}
            </div>
          ) : tab === "Community" ? (
            <section className="studio-community">
              <h2>Recent comments</h2>
              {[
                "This was exactly what I needed.",
                "The cinematography is incredible!",
                "More videos like this please.",
              ].map((m, i) => (
                <article key={m}>
                  <span className="comment-avatar">
                    {["JD", "MK", "LW"][i]}
                  </span>
                  <div>
                    <b>@{["jordan", "mika", "lew"][i]}</b>
                    <p>{m}</p>
                    <button
                      onClick={() =>
                        p.notify("Demo reply noted — no message was sent")
                      }
                    >
                      Reply · demo
                    </button>
                  </div>
                </article>
              ))}
            </section>
          ) : (
            <>
              <div className="studio-tabs">
                {["Overview", "Content", "Audience", "Revenue"].map((v) => (
                  <button
                    key={v}
                    className={section === v ? "selected" : ""}
                    onClick={() => setSection(v)}
                  >
                    {v}
                  </button>
                ))}
                <span>Live simulated channel data</span>
              </div>
              <h2 className="studio-greeting">
                Your channel has received {n(p.s.views)} views.
              </h2>
              <div className="studio-analytics-row">
                <section className="studio-metrics-panel">
                  <div className="studio-metrics">
                    {(section === "Revenue"
                      ? [
                          ["Estimated revenue", p.money(p.s.revenue)],
                          ["RPM", p.money(4.2)],
                          ["Views", short(p.s.views)],
                        ]
                      : section === "Audience"
                        ? [
                            ["Subscribers", short(p.s.followers)],
                            ["Returning viewers", short(p.s.views * 0.21)],
                            ["Unique viewers", short(p.s.views * 0.62)],
                          ]
                        : [
                            ["Views", short(p.s.views)],
                            ["Watch time (hours)", short(p.s.views * 0.045)],
                            ["Subscribers", short(p.s.followers)],
                            ["Estimated revenue", p.money(p.s.revenue)],
                          ]
                    ).map(([k, v]) => (
                      <div key={k}>
                        <span>{k}</span>
                        <strong>{v}</strong>
                        <small>↑ Simulated performance</small>
                      </div>
                    ))}
                  </div>
                  <Plot s={p.s} color="#359dde" />
                </section>
                <aside className="studio-realtime">
                  <h2>Realtime</h2>
                  <span className="realtime-indicator">● Updating live</span>
                  <h1>{n(p.s.followers)}</h1>
                  <p>Subscribers</p>
                  <button onClick={() => setSection("Audience")}>
                    See live count
                  </button>
                  <hr />
                  <h3>{n(p.s.views)}</h3>
                  <p>Views · simulated session</p>
                  <div className="realtime-bars">
                    {p.s.history.slice(-30).map((h, i) => (
                      <i
                        key={i}
                        style={{
                          height: `${15 + Math.abs(Math.sin(h.time * 0.4)) * 65}px`,
                        }}
                      />
                    ))}
                  </div>
                  {contentRows(p)
                    .slice(0, 3)
                    .map((r, i) => (
                      <button
                        className="realtime-video"
                        key={i}
                        onClick={() => setSelected(i)}
                      >
                        <span>{r.title}</span>
                        <b>{short(r.views)}</b>
                      </button>
                    ))}
                </aside>
              </div>
              <section className="studio-content">
                <h2>Your top content in this period</h2>
                <Content p={p} onSelect={setSelected} />
              </section>
            </>
          )}
        </main>
      </div>
      {selected !== null && (
        <ContentDetail
          p={p}
          index={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
function InstagramScreen({ p }: { p: ScreenProps }) {
  const [tab, setTab] = useState("Overview"),
    [selected, setSelected] = useState<number | null>(null);
  return (
    <div className="instagram-app">
      <Stamp exit={p.onExit} />
      <aside className="instagram-rail">
        <div className="instagram-wordmark">Larp / social</div>
        {[
          { label: "Overview", icon: LayoutDashboard },
          { label: "Insights", icon: BarChart3 },
          { label: "Content", icon: Camera },
          { label: "Audience", icon: Users },
        ].map((v) => (
          <button
            key={v.label}
            className={tab === v.label ? "selected" : ""}
            onClick={() => setTab(v.label)}
          >
            <v.icon size={22} />
            <span>{v.label}</span>
          </button>
        ))}
        <div className="ig-rail-foot">
          Professional dashboard
          <br />
          Fictional creator profile
        </div>
      </aside>
      <main className="instagram-main">
        <header>
          <div>
            <small>PROFESSIONAL DASHBOARD</small>
            <h1>{tab === "Overview" ? "Your influence, in focus." : tab}</h1>
          </div>
          <span className="ig-date">Simulated insights</span>
        </header>
        <section className="ig-profile">
          <div className="ig-profile-ring">
            {p.avatar ? <img src={p.avatar} /> : <Camera size={35} />}
          </div>
          <div>
            <h2>@{p.profile || "alex.creates"}</h2>
            <p>{p.bio}</p>
            <span>Creator · Fictional account</span>
          </div>
          <div className="ig-profile-stats">
            <span>
              <b>48</b> posts
            </span>
            <span>
              <b>{short(p.s.followers)}</b> followers
            </span>
            <span>
              <b>842</b> following
            </span>
          </div>
        </section>
        {tab === "Content" ? (
          <div className="ig-posts">
            {contentRows(p).map((r, i) => (
              <button key={i} onClick={() => setSelected(i)}>
                <div className={`ig-photo thumb-${i}`}>
                  <Play size={28} />
                  <span>{short(r.views)}</span>
                </div>
                <b>{r.title}</b>
                <small>{short(r.likes)} likes · fictional post</small>
              </button>
            ))}
          </div>
        ) : (
          <>
            <div className="ig-metric-strip">
              {[
                ["Followers", n(p.s.followers)],
                ["Accounts reached", short(p.s.views * 0.8)],
                ["Accounts engaged", short(p.s.likes)],
                ["Profile visits", short(p.s.views * 0.06)],
              ].map(([k, v]) => (
                <div key={k}>
                  <span>{k}</span>
                  <h2>{v}</h2>
                  <small>↗ Simulated growth</small>
                </div>
              ))}
            </div>
            <div className="ig-insights-layout">
              <section className="ig-growth">
                <div>
                  <h2>
                    {tab === "Audience" ? "Audience growth" : "Follower growth"}
                  </h2>
                  <span>Daily observations</span>
                </div>
                <Plot s={p.s} color="#d63d87" />
                <div className="ig-growth-legend">
                  <span>● Followers</span>
                  <span>Fictional audience insights</span>
                </div>
              </section>
              <section className="ig-audience">
                <h2>Your audience</h2>
                <p>Top locations · fictional demographics</p>
                {[
                  ["Australia", 36],
                  ["United States", 28],
                  ["United Kingdom", 22],
                  ["Other", 14],
                ].map(([country, percent]) => (
                  <div key={country}>
                    <span>{country}</span>
                    <b>{percent}%</b>
                    <i>
                      <em style={{ width: `${percent}%` }} />
                    </i>
                  </div>
                ))}
              </section>
            </div>
            <section className="ig-content-section">
              <h2>
                Content you shared{" "}
                <button onClick={() => setTab("Content")}>
                  See all <ChevronRight size={14} />
                </button>
              </h2>
              <div className="ig-posts">
                {contentRows(p)
                  .slice(0, 3)
                  .map((r, i) => (
                    <button key={i} onClick={() => setSelected(i)}>
                      <div className={`ig-photo thumb-${i}`}>
                        <Camera size={28} />
                        <span>
                          <Heart size={14} /> {short(r.likes)}
                        </span>
                      </div>
                      <b>{r.title}</b>
                      <small>{short(r.views)} views · fictional post</small>
                    </button>
                  ))}
              </div>
            </section>
          </>
        )}
      </main>
      {selected !== null && (
        <ContentDetail
          p={p}
          index={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
function TikTokScreen({ p }: { p: ScreenProps }) {
  const [tab, setTab] = useState("Overview"),
    [selected, setSelected] = useState<number | null>(null),
    [metric, setMetric] = useState("Video views");
  const effectiveMetric =
    tab === "Followers" ? "Followers" : tab === "Engagement" ? "Likes" : metric;
  return (
    <div className="tiktok-app">
      <Stamp exit={p.onExit} />
      <aside className="tiktok-nav">
        <h2>
          <Music2 size={28} /> Larp Studio
        </h2>
        <p>CREATOR CENTER</p>
        {["Overview", "Content", "Followers", "Engagement"].map((v) => (
          <button
            key={v}
            onClick={() => setTab(v)}
            className={tab === v ? "selected" : ""}
          >
            {v === "Overview" ? (
              <BarChart3 size={18} />
            ) : v === "Content" ? (
              <Video size={18} />
            ) : (
              <Users size={18} />
            )}{" "}
            {v}
          </button>
        ))}
        <div className="tiktok-profile">
          <span>{(p.profile || "A")[0]}</span>
          <b>@{p.profile || "alex.creates"}</b>
          <small>Simulated creator account</small>
        </div>
      </aside>
      <main className="tiktok-main">
        <header>
          <div>
            <h1>Analytics</h1>
            <p>Understand your content. Find your next big moment.</p>
          </div>
          <span>DEMO ACCOUNT</span>
        </header>
        <div className="tiktok-tabs">
          {["Overview", "Content", "Followers", "Engagement"].map((v) => (
            <button
              className={tab === v ? "selected" : ""}
              key={v}
              onClick={() => setTab(v)}
            >
              {v}
            </button>
          ))}
        </div>
        {tab === "Content" ? (
          <Content p={p} onSelect={setSelected} />
        ) : (
          <>
            <div className="tiktok-stats">
              {[
                ["Video views", n(p.s.views)],
                ["Profile views", n(p.s.views * 0.06)],
                ["Likes", n(p.s.likes)],
                ["Followers", n(p.s.followers)],
              ].map(([k, v]) => (
                <button
                  key={k}
                  className={metric === k ? "selected" : ""}
                  onClick={() => setMetric(k)}
                >
                  <span>{k}</span>
                  <strong>{v}</strong>
                  <small>↗ Simulated session</small>
                </button>
              ))}
            </div>
            <section className="tiktok-graph">
              <h2>
                {tab === "Followers"
                  ? "Followers"
                  : tab === "Engagement"
                    ? "Likes"
                    : metric}
              </h2>
              <Plot
                s={{
                  ...p.s,
                  history: p.s.history.map((h) => ({
                    ...h,
                    value:
                      h.value *
                      (effectiveMetric === "Likes"
                        ? p.s.likes / p.s.views
                        : effectiveMetric === "Followers"
                          ? p.s.followers / p.s.views
                          : effectiveMetric === "Profile views"
                            ? 0.06
                            : 1),
                  })),
                }}
                color="#20bdcf"
              />
            </section>
            <div className="tiktok-lower">
              <section>
                <h2>Trending videos</h2>
                {contentRows(p)
                  .slice(0, 3)
                  .map((r, i) => (
                    <button
                      className="trending-video"
                      key={i}
                      onClick={() => setSelected(i)}
                    >
                      <span className={`tiktok-thumb thumb-${i}`}>
                        <Play size={16} />
                      </span>
                      <div>
                        <b>{r.title}</b>
                        <small>Demo video · {i + 1}d ago</small>
                      </div>
                      <strong>
                        {short(r.views)}
                        <small>views</small>
                      </strong>
                    </button>
                  ))}
              </section>
              <section className="tiktok-traffic">
                <h2>Traffic sources</h2>
                {[
                  ["For You", 68],
                  ["Personal profile", 18],
                  ["Following", 9],
                  ["Search", 5],
                ].map(([v, n]) => (
                  <div key={v}>
                    <span>{v}</span>
                    <b>{n}%</b>
                    <i style={{ width: `${n}%` }} />
                  </div>
                ))}
              </section>
            </div>
          </>
        )}
      </main>
      {selected !== null && (
        <ContentDetail
          p={p}
          index={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
function Streaming({ p }: { p: ScreenProps }) {
  const [tab, setTab] = useState("Stream Manager"),
    [chat, setChat] = useState(""),
    [messages, setMessages] = useState<string[]>([]);
  return (
    <div className="streaming-app">
      <Stamp exit={p.onExit} />
      <header className="stream-header">
        <strong>
          <Radio size={22} /> LARP BROADCAST
        </strong>
        <span className="stream-live">● SIMULATED LIVE</span>
        <span>{p.profile || "alexmorgan"} · creator dashboard</span>
      </header>
      <div className="stream-layout">
        <aside className="stream-nav">
          {["Stream Manager", "Analytics", "Community", "Activity"].map((v) => (
            <button
              className={tab === v ? "selected" : ""}
              key={v}
              onClick={() => setTab(v)}
            >
              {v === "Stream Manager" ? (
                <Monitor size={19} />
              ) : v === "Analytics" ? (
                <BarChart3 size={19} />
              ) : (
                <Users size={19} />
              )}{" "}
              {v}
            </button>
          ))}
        </aside>
        <main className="stream-main">
          <h1>{tab}</h1>
          <div className="stream-stats">
            {[
              ["Viewers", n(p.s.secondary || 1248)],
              ["Followers", short(p.s.followers)],
              [
                "Subscriptions",
                n(p.s.orders.filter((o) => o.amount === 5).length),
              ],
              ["Revenue", p.money(p.s.revenue)],
            ].map(([k, v]) => (
              <div key={k}>
                <span>{k}</span>
                <strong>{v}</strong>
              </div>
            ))}
          </div>
          {tab === "Stream Manager" ? (
            <div className="stream-workspace">
              <section className="stream-preview">
                <div className="stream-scene">
                  <div className="stream-scene-grid" />
                  <span className="stream-preview-badge">
                    PREVIEW · FICTIONAL BROADCAST
                  </span>
                  <div>
                    <Radio size={44} />
                    <h2>Good things are going live.</h2>
                    <p>Just chatting · A fictional creator stream</p>
                  </div>
                  <span className="stream-scene-footer">
                    ◉ {n(p.s.secondary || 1248)} viewers ·{" "}
                    {Math.floor(p.s.tick / 60)}:
                    {String(p.s.tick % 60).padStart(2, "0")}
                  </span>
                </div>
                <div className="stream-quick">
                  <h3>Quick actions</h3>
                  <button onClick={() => p.setRunning(!p.running)}>
                    {p.running ? "Pause" : "Resume"} simulation
                  </button>
                  <button
                    onClick={() => {
                      p.setS((s) => ({
                        ...s,
                        revenue: s.revenue + 5,
                        orders: [
                          {
                            id: Date.now(),
                            label: "New demo subscription",
                            amount: 5,
                            time: s.tick,
                          },
                          ...s.orders,
                        ],
                      }));
                      p.notify("New demo subscription · $5");
                    }}
                  >
                    Simulate subscription
                  </button>
                  <button
                    onClick={() => {
                      p.setS((s) => ({
                        ...s,
                        revenue: s.revenue + 15,
                        orders: [
                          {
                            id: Date.now(),
                            label: "Demo donation",
                            amount: 15,
                            time: s.tick,
                          },
                          ...s.orders,
                        ],
                      }));
                      p.notify("Demo donation · $15");
                    }}
                  >
                    Simulate donation
                  </button>
                </div>
              </section>
              <aside className="stream-chat">
                <h3>
                  Stream chat <MessageSquare size={16} />
                </h3>
                <div>
                  {[...messages, ...p.s.chat]
                    .slice(0, 14)
                    .reverse()
                    .map((m, i) => (
                      <p key={i}>
                        <b
                          style={{
                            color: ["#ba8bf2", "#73d4b5", "#e29dc6"][i % 3],
                          }}
                        >
                          {m.split(":")[0]}:
                        </b>{" "}
                        {m.split(":").slice(1).join(":")}
                      </p>
                    ))}
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (chat.trim()) {
                      setMessages((v) => [
                        `${p.profile || "you"}: ${chat}`,
                        ...v,
                      ]);
                      setChat("");
                    }
                  }}
                >
                  <input
                    aria-label="Simulated chat message"
                    value={chat}
                    onChange={(e) => setChat(e.target.value)}
                    placeholder="Send a fictional message"
                  />
                  <button>Chat</button>
                </form>
              </aside>
            </div>
          ) : tab === "Analytics" ? (
            <section className="stream-analytics">
              <h2>Live viewership</h2>
              <Plot s={p.s} color="#ab7ef4" />
            </section>
          ) : (
            <div className="stream-feed">
              <h2>
                {tab === "Community" ? "Community activity" : "Activity feed"}
              </h2>
              {p.s.orders.map((o, i) => (
                <article key={i}>
                  <Radio size={18} />
                  <b>{o.label}</b>
                  <span>{p.money(o.amount)}</span>
                  <small>{o.time}s</small>
                </article>
              ))}
            </div>
          )}
          <section className="stream-mini-chart">
            <h3>Concurrent viewers</h3>
            <Plot s={p.s} color="#a178e6" small />
          </section>
        </main>
      </div>
    </div>
  );
}
