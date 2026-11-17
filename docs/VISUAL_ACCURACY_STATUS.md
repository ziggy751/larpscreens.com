# Visual accuracy status

## Work completed

- Removed prominent LarpScreens names from application headers, retaining branding on the library/editor.
- Changed the persistent in-application disclosure to **Demo Simulation**.
- Added deterministic Playwright captures at 1440×900, 1512×982, 1728×1117, and 1920×1080 for all 16 dashboard entries.
- Added PNG pixel comparisons, reference/actual/difference outputs, and an HTML/JSON comparison report.
- Kept local visual regressions separate from official reference comparisons. Missing official screenshots fail the official comparison command.

## External blocker

Requests to pump.fun, Phantom's download page, Exodus Desktop, Trust Wallet, Binance Wallet, TradingView, Instagram Help, TikTok Creator Portal, YouTube analytics help, and Shopify Analytics all returned `Tunnel connection failed: 403 Forbidden` through this environment's network proxy. Existing illustrative mockups do not establish the real products' current layouts, fonts, or spacing. No authenticated platform session was accessed.

Consequently, **none of the 16 interfaces has a verified official screenshot comparison**. Further platform-specific pixel-accuracy redesign and iterative official-reference correction remain blocked. The local regression passes must not be described as pixel-perfect platform matches.

Banking, collections, and custom dashboards also lack a named target platform. Exact reference selection for those interfaces remains unspecified.

## Reproduce

With `npm run dev` running:

- `npm run test:visual:update`: deliberately records local LarpScreens regression baselines.
- `npm run test:visual`: compares all 64 cases against those local baselines.
- `npm run test:visual:official`: attempts official comparisons; fails while genuine reference screenshots are absent.

Reports are written to `visual-tests/regression/report.html` and `visual-tests/official/report.html` (with JSON reports beside them). Do not update local baselines merely to hide an unexpected difference: inspect the generated screenshots first.

## Executed checks

The production build, fourteen accounting tests and the interactive browser flow suite passed. A first capture pass generated 64 local fixtures, followed by a separate screenshot-and-pixel-comparison pass. The official comparison command reported 64 missing genuine references and exited with failure, as intended; this is an outstanding blocker, not a passing test.

## Required access change

Official platform domains and the deployed website domain have now been added to the restricted network configuration draft, preserving the package-manager presets. This draft save does not change runtime access. Review and save the changes in environment settings, then publish the environment. Probe requests after the draft save still returned proxy HTTP 403. Genuine reference collection and comparison cycles must resume after the network update applies. No redesign should begin before those images are inspected.
