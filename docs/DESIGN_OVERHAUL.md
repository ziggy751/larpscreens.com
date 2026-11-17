# Distinct application interfaces

## Visual sources and research

All 13 supplied images were inspected at their original 1440 × 900 size. The first eight illustrate financial/creator/business analytics using a shared scaffold; the latest brief explicitly asks to replace that shared scaffold with different application structures. The five added crypto references define separate discovery, extension wallet, desktop wallet, blue wallet, and exchange patterns.

Official-source requests were attempted for pump.fun, Phantom download, Exodus Desktop, Trust Wallet, Binance Wallet's feature guide, TradingView, Instagram help, TikTok's creator portal, YouTube analytics help, and Shopify Analytics. Every request received a proxy `403 Forbidden`. The existing live Workers URL was blocked by the same policy. No claim is made that current official authenticated interfaces or the live deployment were inspected.

| Supplied reference     | Implemented interface                                                                                             |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------- |
| 01 Stock portfolio     | White brokerage workspace, horizontal stock ticker, holdings table, selected-asset chart and order ticket         |
| 02 Crypto exchange     | Separate blue desktop asset manager, balance chart, asset table and trade page                                    |
| 03 Instagram analytics | Profile-centred light social workspace, pink insights, audience demographics and post gallery                     |
| 04 YouTube Studio      | Light creator studio, channel rail, segmented analytics, realtime panel and detailed content table                |
| 05 TikTok analytics    | Cyan creator analytics with metric selectors, rankings and short-video detail views                               |
| 06 Business sales      | Muted commerce admin with store navigation, product/order/customer pages, checkout and reports                    |
| 07 Website analytics   | Horizontal site navigation, realtime data, traffic sources, page-level charts and visitor map                     |
| 08 Streaming stats     | Dark broadcast workspace, fictional stream preview, interactive chat, subscriptions/donations and viewer graphs   |
| 09 Token discovery     | Dense green three-column listings, search/sort/watchlist, token detail and fictional trading                      |
| 10 Phantom style       | Compact purple wallet, scrollable asset list, account switcher, token detail, swap/send/receive simulations       |
| 11 Exodus style        | Wide desktop allocation ring, performance history, allocation table and exchange page                             |
| 12 Trust Wallet style  | Blue-header light wallet, network selector, asset details, activity and swaps                                     |
| 13 Binance style       | Dense yellow terminal, watchlist/order-book illustration, asset candles, resizable chart, order ticket and orders |

Application screens are real components. Reference images are not included in the website. Gallery thumbnails are captures of the running LarpScreens components, not the supplied reference images. Repeated Minimal/Professional cards are removed from the library; existing saved configurations using their IDs remain resolvable.

## Shared logic, separate presentation

`NativeScreens.tsx` dispatches to the independent layouts in `CryptoScreens.tsx`, `CreatorScreens.tsx`, and `WorkScreens.tsx`. Only low-level plot, ledger, icon, transaction logic, and state types are shared. `Dashboard.tsx` owns the editor, persistence, simulation timer, profile, save/reset, exports, and fullscreen lifecycle.

Full-screen presentation uses the browser Fullscreen API and a fixed full-viewport fallback. The selected application alone fills the screen. Global navigation and editing controls are hidden; application-specific navigation, trades, swaps, transfers and content views remain functional. The small fixed simulation badge provides an exit control. Escape exits the fallback even when an application button has focus. Changing fullscreen does not recreate simulation state.

Save Setup records the customised baseline, profile, chart history and simulation settings. Reset Activity restores it while removing subsequent actions; Reset Everything restores original defaults. Autosave runs at a bounded interval and flushes on unmount, including at 10× speed. Asset-price histories and portfolio histories stay separate and bounded to 64 observations. All financial activity remains fictional and has no wallet/network/payment integration.

## Validation

- Production TypeScript/Vite build and Cloudflare Workers dry-run.
- Fourteen engine tests: trades, conversion, transfer conservation, limit orders, revenue/order consistency, reversals, deterministic simulation, unique IDs, independent histories and bounded asset-price history.
- Browser flows: market and limit orders, cancellation, swaps, wallet search/details/account restore, network filtering, discovery trades, creator content, transfers/undo, business order/reset and saved setup/default reset.
- All 16 library entries: native fullscreen, visible simulation badge, hidden editor, and saved setup/reset.
- 48 fullscreen resize checks: each application at 1280×800, 1728×1117 and 390×844, plus reference captures at 1440×900.
- Unsupported-fullscreen fallback, Escape, high-speed autosave and restored progress.

Browser checks use installed Linux Chromium. Real MacBook Safari, physical trackpads, current third-party pixel equivalence and hardware-level 60 FPS are not verified. Native scrolling is retained and no wheel/touch gesture handlers intercept trackpad input. The exchange order book is illustrative simulated liquidity, not a matching engine or real quote feed.
