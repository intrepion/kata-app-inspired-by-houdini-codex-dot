# Verification report

Verified 2026-11-10 against the local prototype. The initial QA worker did not publish; the later publication was verified on 2026-11-10.

## Passed

- `npm run check`: JavaScript syntax validation and **20/20 Node tests**.
- `npm run build`: dependency-free static output generated successfully.
- Browser-native suite at `http://127.0.0.1:4173/tests/browser.html`: **15/15 passed**, rerun after the final source/style refinements.
- Initial live Canvas produces nonblank pixels. An early timing-dependent test exposed an initial resize/render race; the resize callback now renders immediately, and the test waits for animation-frame readiness.
- Source selection and shape editing.
- Add-operator dialog opens, adds an operator, and closes.
- Bypass and enable update the selected operator.
- Moving operators earlier/later changes their displayed sequence index.
- Remove, undo restoration, and redo removal.
- Timeline scrub, rewind, and play/pause toggles.
- Palette and project-title edits; titles are text, not HTML.
- Help dialog opens and closes.
- Preset replacement reconstructs the expected chain.
- Canvas renderer produces a PNG data URL at 1600 × 1000.
- Best-effort autosave stores a valid project.
- Native **Save project** browser download completed. The downloaded JSON identified itself as `fluxgrove`, version 1, with title `Ember bloom`.
- The same downloaded project was selected through the native **Open** file chooser and restored successfully, creating an undoable load operation.
- Native **Export PNG** download completed. The downloaded file's PNG header reports **1600 × 1000** and the file is 1,067,251 bytes.
- Actual desktop app and narrow responsive UI were visually inspected. Screenshots are `docs/screenshots/desktop.jpg` and `docs/screenshots/narrow.jpg`.
- A 390px-wide tall iframe measured document `clientWidth` and `scrollWidth` both at 390px: no document-level horizontal overflow. The intentional node-chain scroller remains horizontal.

## Automated model coverage

Preset validity, all source shapes, finite point coordinates, deterministic seeds, changing time, bypass, noncommutative operator ordering, source/reorder boundary rules, supported format/version, node count/type/order validation, prototype-key rejection, numeric bounds, ID normalization, JSON round-trip, bounded immutable history, branching redo, palette interpolation, camera projection, and deterministic randomness.

## Screenshot method

Screenshots were taken from the running HTTP app through the supported cloud browser. The narrow capture shows two genuine 390px-wide embedded views of the same running app: its top workbench and its lower recipe/inspector. Browser scrollbars reduce the visible content width in these short frames. No mockup, external product screenshot, or generated art was substituted for app evidence.

The browser's direct full-page/clip capture method timed out; native tab screenshots worked. Source files were never opened as `file://` URLs.

## Remaining verification limits

- Chromium/cloud browser tested; Safari, Firefox, physical touch hardware, and assistive technology have not been tested.
- Playback toggle and scrubbing were verified, but sustained 30 FPS on low-end devices is not guaranteed or benchmarked.
- Import validation has extensive unit coverage; a separate native malformed-file selection was not exercised.
- PNG is a still export. There is no video export or physical simulation engine.
- Published runtime commit `045a75ec46b7d70fd39ff10c9a871e04282f4f60` passed checks, build, and GitHub Pages deployment in [run 42740821668](https://github.com/intrepion/kata-app-inspired-by-houdini-codex-dot/actions/runs/42740821668). Public Chromium smoke check passed on 2026-11-10: the point scene rendered and selecting Tidal threads changed the title, point count to 3,800, operator chain, and palette. The Tool Shed catalog and detail page passed local browser checks, including loaded screenshots and app/source/back links.
