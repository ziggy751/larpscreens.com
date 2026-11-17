# Official reference evidence — currently unavailable

Official screenshot comparison is **not complete**. All official source requests attempted in this task returned a network proxy `403 Forbidden`. The earlier illustrative reference pack and LarpScreens screenshots are not genuine platform screenshots and must not be used as official references.

For each application, obtain a genuine screenshot from the official product or official documentation, with its source URL, capture/release date, desktop viewport, and visible page/navigation state. Do not capture private account information. Banking, luxury collections, and custom dashboards need a named platform before exact visual equivalence can be evaluated.

Expected filenames: `<screen>-<width>x<height>.png`, with dimensions 1440×900, 1512×982, 1728×1117, and 1920×1080. `tests/visual/screens.mjs` lists screen IDs and official research destinations.

`npm run test:visual:official` writes side-by-side actual/reference/difference images and a report to `test-results/visual`. Missing references fail the command rather than passing or being silently skipped. Pixel similarity alone does not prove equivalent layout or interactions: simulated content differences and simulation disclosure must be reviewed by a person.

Local regression baselines in `tests/visual/baselines` serve a separate purpose: detecting unintended changes to LarpScreens. They are never evidence of matching an official platform.
