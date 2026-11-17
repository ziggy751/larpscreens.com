# LarpScreens

A local-first collection of fictional, interactive dashboard simulations built with React, TypeScript, Vite, Tailwind CSS, Recharts, and Motion. No real accounts, payments, trades, or market feeds are connected.

## Develop

Requires Node.js 24 and npm. From this checkout:

```sh
npm ci --cache /tmp/larp-npm-cache
npm run dev
```

Vite serves port 5173. `npm run build` type-checks and creates `dist/`; `npm run preview` serves the production build.

## Verify

```sh
npm test
npm run test:browser
```

The browser smoke test uses `/usr/bin/chromium` and a running Vite server. It checks trading, history, native fullscreen, saved starting setups, business orders, responsive resizing, and browser errors. Engine tests verify cash/asset conservation, transfers, conversion, limit fills, revenue/order consistency, chart totals, deterministic simulation, and reversal of transactions.

## Workflow

Choose a dashboard from the searchable library. Use Edit stats to configure balances, holdings, prices, profiles, metrics, currency, speed, and scenarios. Save Setup stores a reusable baseline. Reset Activity restores that baseline and clears subsequent actions. Reset Everything returns to the original seeded demo and default settings. Transactions can be reversed individually from Activity if current balances permit it.

Use Fullscreen (or F) for native browser fullscreen with permanent simulation labelling. Trading, transfers, navigation, history, and chart controls remain available. Escape exits. Space pauses/resumes; R resets. Editor controls are hidden during fullscreen. If the browser denies native fullscreen, a full-window fallback is used.

Dashboard state, profiles, favourites, configurations, and settings persist in this browser's localStorage. My dashboards supports rename, duplicate, delete, and JSON import/export. PNG exports include simulation markings. Currency changes formatting only; no live foreign-exchange conversion is performed.

## Design and scope

The 13 supplied design references guide 16 distinct application interfaces, including five separate wallet/discovery/trading designs. The library omits repeated layout variants while retaining compatibility with their saved IDs. See [design and validation notes](docs/DESIGN_OVERHAUL.md). Official platform research and live-site inspection were blocked by network policy; exact current third-party interfaces are not verified.

Simulation observations use one bounded timer per active dashboard and retain 64 chart samples. Prices have shared market movement and asset-specific changes. Market/limit orders and conversion update holdings and cash. Pending limits execute only when price and funds/holdings permit; there is no fees, slippage, leverage, or exchange-grade order-book model. Business revenue follows recorded orders; bank balances change only through edits or explicit transfers. Simulated histories are synthetic, not actual historical data. Performance on real MacBook Safari hardware has not been benchmarked.

## Deploy to Cloudflare

The app files must be committed and pushed to the branch Cloudflare builds. A local working tree is not visible to Cloudflare.

Use Node.js 24 (pinned by `.node-version`). Keep the build root at the repository root, where `package.json` lives.

For **Cloudflare Workers Builds**:

- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
- Build root: repository root (leave the path blank)
- `wrangler.jsonc` serves `dist` as a static single-page application. No Worker server script is required.

For **Cloudflare Pages**:

- Framework: Vite / React
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: repository root (leave the path blank)
- Do not add a Workers deploy command to a Pages project.

Cloudflare should install dependencies from `package-lock.json`. If automatic installation is disabled, use `npm ci && npm run build` as the build command. No app secrets or backend services are required.

Run `npm run deploy:check` for a local, non-publishing Workers deployment validation. `npm run deploy` performs a real deployment and needs Cloudflare authentication; it is not part of local setup.

## Visual checks

Run the Vite server, then `npm run test:visual` to compare all 16 interfaces at the four requested desktop sizes. Local baselines are explicitly LarpScreens regression fixtures, not official platform references. Use `npm run test:visual:update` only after reviewing intended visual changes. HTML/JSON reports and PNG differences are generated under `test-results/visual/regression`.

`npm run test:visual:official` is separate and fails when genuine official reference screenshots are unavailable. Its report is under `test-results/visual/official`. See [visual accuracy status](docs/VISUAL_ACCURACY_STATUS.md) for the research blocker and outstanding platform comparisons.
