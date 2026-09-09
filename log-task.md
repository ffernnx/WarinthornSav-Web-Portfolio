# Task Log — fern-web (Warinthorn Savetamornkul Portfolio)

This file is the permanent working memory for this project. Every task, file
change, and response is recorded here. **At the start of any new session, read
this file first to restore context.**

---

## Project snapshot (updated 2026-09-08 — Entry 8, SPA overhaul)

**What it is:** A one-page portfolio for Warinthorn Savetamornkul (UX/UI
designer + interactive multimedia student, Mahidol University ICT), "white
canvas + pastel paint" theme. Since Entry 8 it is a **Single Page
Application**: `index.html` is a shell, `main.js` fetches `data.json` and
renders everything. Vanilla JS (native ES module), no framework, no build.
Must be served over HTTP so `fetch()` works — `python3 -m http.server 8080`.

**Not a git repository** (per environment info).

### File structure (post-Entry-8 — ONLY these files)
- `index.html` — minimal shell: `<head>` (meta/OG/favicon → `style.css`) +
  `<body>` containing `<div id="app"><noscript>…</noscript></div>` +
  `<script type="module" src="main.js">`. No section markup.
- `style.css` — ALL styling in one file: the former `css/style.css` followed
  by the former `css/responsive.css` (merged verbatim under a "RESPONSIVE"
  divider) + a `.load-error` block for the fetch-failure state. Design tokens,
  every section, nav, hero, lightbox, scroll-top, 3 breakpoints (1080/820/480).
- `main.js` — the whole SPA engine (see "How the SPA works" below).
- `data.json` — ALL content as strict JSON (root of repo). Keys: `profile`
  (name, eyebrow, roles, tagline, resumeUrl, photo, education{}, about),
  `nav[]`, `projects[7]` (id, image, title, role, type, categories[],
  achievement|null, description, placeholder, layout), `artworks[7]`
  (id, image, title, size), `experience[5]` (title, org, note|null),
  `skills[6]` (category, items[]), `activities[4]`, `certifications[3]`,
  `contact` (brand, email, socials[]).
- `assets/` — unchanged. `images/profile.jpg` + `icons/favicon.svg` exist;
  `images/projects/` & `images/artworks/` are empty (painted placeholders
  render). `og:image` `assets/images/share-image.jpg` still missing.
- `README.md`, `log-task.md`.
- **DELETED in Entry 8:** `css/` (style.css, responsive.css), `js/` (main.js,
  interactions.js, animations.js), `data/portfolio.js` and the `data/` dir.

### How the SPA works (`main.js`)
1. `boot()` runs on module load → `await fetch("data.json")`. On failure it
   writes a `.load-error` panel into `#app` (tells you to serve over HTTP).
2. `renderApp(#app, data)` sets `#app.innerHTML` to: skip-link + `navMarkup` +
   `<main id="main-content">` + hero/about/work/creative/experience/skills/
   activities/certifications/contact section markup + `</main>` +
   `lightboxMarkup` + `scrollTopMarkup` + `footerMarkup`. All builders are
   pure `data → HTML string` functions. Décor SVGs live in the `DECO` const.
3. Then hydration + behaviour init (same set/order as the old multi-file boot):
   `hydrateWork` (image fallback + card→lightbox + `initWorkFilter`),
   `hydrateCreative`, `setFooterYear`, then `initNav`, `initScrollReveal`,
   `initParallaxDecor`, `initBrushTrail`, `initProjectTilt`,
   `initProfilePhoto`, `initLightbox`, `initScrollTop`.
   `initNav` now selects `#main-content section[id]` (was `main section[id]`).

### Key behaviours / mechanisms (unchanged in substance)
- **Lightbox:** shared `#lightbox`, opened by click / Enter / Space on any
  project card or artwork tile; closes via ✕ / backdrop / Escape; restores
  focus; locks scroll (`body.modal-open`).
- **Image fallback:** `<img data-fallback-seed data-fallback-label>` → seeded
  painted SVG (`paintedPlaceholder`) on `error`. `mediaSrc(item, kind)` =
  `item.image || assets/images/<kind>/<id>.png`. Profile photo → "ADD YOUR
  PHOTO" painted frame on error.
- **Work filter:** category pills from `projects[].categories`, toggles
  `.is-hidden`.
- **Scroll-to-top:** `#scroll-top`, `.is-visible` past ~1 viewport,
  `initScrollTop()`.
- **Accessibility:** skip link, semantic landmarks, `aria-hidden` +
  `pointer-events:none` décor, `:focus-visible`, `prefers-reduced-motion`,
  touch guards.
- **Responsive:** ≤1080 → 2-col grids; ≤820 (mobile) → every card grid strictly
  1 col + nav dropdown + hero stacks/centres; ≤480 → phone rhythm, full-width
  CTAs, portrait frame scaled (not stripped).

### Open placeholders (intentional, not bugs)
- `profile.resumeUrl` = `"#"`; `contact.socials[].href` all `"#"`.
- Project/artwork images absent → painted placeholders.
- `assets/images/share-image.jpg` (OG) missing.
- Certificate images/links not wired.

---

## Interaction log

### Entry 1
- **Timestamp:** 2026-09-07 23:31:57 +07
- **My Command:** Read and analyze the entire repository to understand its
  structure, logic, and context. Do not change any code yet. Establish a strict
  rule: from now on, every task / file modification / response must be recorded
  in detail in `log-task.md` (timestamp, the command given, and the
  action/response with reasoning and files touched). This log is the permanent
  memory and must be read first when resuming or after context loss. Then:
  (1) acknowledge the repo is understood, (2) initialize `log-task.md` logging
  this first instruction, (3) confirm readiness for the next command.
- **My Action/Response:**
  - Read every file in the repo: `README.md`, `index.html`, `data/portfolio.js`,
    `js/main.js`, `js/interactions.js`, `js/animations.js`, `css/style.css`,
    `css/responsive.css`, and listed the `assets/` tree.
  - Built the project snapshot above (structure, mechanisms, and a list of
    known discrepancies found during review — recorded for future reference,
    no code changed).
  - Created this file, `log-task.md`, with the project snapshot and this first
    log entry.
  - No source files were modified.
  - Responded to confirm: repo understood, log initialized, ready for the next
    command.

### Entry 2
- **Timestamp:** 2026-09-07 23:41:50 +07
- **My Command:** Update the CSS to fix three Hero profile-image issues:
  (1) Mobile — profile image sits too close to the top / nav bar; add vertical
  spacing so it breathes below the nav. (2) Desktop — the profile image scales
  up/down when the window is resized; make its size completely fixed (static)
  on desktop. (3) Small mobile (<480px) — the image becomes a circle; remove
  the circular `border-radius: 50%` so it stays square/rectangular like on
  larger screens. Then explain which selectors were changed and log this as
  Entry 2.
- **My Action/Response:**
  - **Files modified:** `css/style.css`, `css/responsive.css`. No JS/HTML
    changes.
  - **`css/style.css`** — added a new `@media (min-width: 821px)` block right
    after the base `.portrait-stack` rule:
    - `.hero-grid` → `grid-template-columns: minmax(0, 1.35fr) 320px;` — the
      portrait grid track is pinned to a fixed 320px on desktop instead of the
      fluid `0.85fr`, which was what made the image shrink/grow on resize.
    - `.portrait-stack` → `width: 320px;` (was `min(320px, 100%)`), so the
      frame + image render at an identical fixed size at every desktop width.
      Below 821px the tablet/mobile rules take over as before.
  - **`css/responsive.css` — `@media (max-width: 820px)` block:**
    - Added `.hero { padding-top: 7rem; }` (was inheriting the base `5rem`) so
      the stacked hero clears the fixed pill nav.
    - `.hero-portrait` → added `margin-top: var(--space-3);` for extra space
      above the portrait (it's `order: -1`, so it's the first visible block).
  - **`css/responsive.css` — `@media (max-width: 480px)` block:**
    - `.hero` → `padding-top: 9rem;` (was `7.5rem`) — more clearance below the
      nav on phones.
    - `.portrait-stack` → `width: min(200px, 62vw);` (was `min(180px, 60vw)`)
      and added `margin-top: var(--space-2);`.
    - `.portrait-frame` → changed `aspect-ratio: 1 / 1` → `3 / 4` and
      `border-radius: 50%` → `6px`, so the portrait stays a rectangle
      consistent with larger screens. Kept `transform: none`,
      `box-shadow: none`, and the softened `border-color: #cfcfcf` (deliberate
      mobile simplification — the rotate/coral-shadow flourish stays
      desktop/tablet only). Updated the accompanying comment.
    - `.portrait-frame-back` stays `display: none` and `.portrait-frame::before`
      (the "tape" mark) stays hidden on phones — only the shape was requested.
  - **Selectors touched (summary):** `.hero`, `.hero-grid`, `.hero-portrait`,
    `.portrait-stack`, `.portrait-frame` (across the base file's new
    `min-width: 821px` query and the existing `max-width: 820px` /
    `max-width: 480px` queries in `responsive.css`).
  - Reported completion to the user with the selector-level explanation.

### Entry 3
- **Timestamp:** 2026-09-07 23:50:05 +07
- **My Command:** Global mobile UI & layout consistency refactor. Mobile UI
  feels broken and jumps around on resize. Refactor the layout structure
  (clean Flexbox/Grid, remove conflicting media queries) while keeping the
  original design concept and "white canvas + pastel paint" theme. Specific
  pain points: (1) unstable nav — elements change size / shift on mobile;
  (2) profile image bounces during resize; (3) Resume/Contact buttons flip
  between centered and left-aligned — pick one firm approach; (4) "scroll"
  indicator overlaps other elements — fix positioning/z-index; (5) the
  <480px breakpoint is drastically different (frame/border disappears, image
  frame becomes a different style) — scale the existing frame down instead of
  removing/rewriting it. Ensure a smooth Desktop → Tablet → Mobile transition.
  Log as the next entry.
- **My Action/Response:**
  - **Files modified:** `css/style.css`, `css/responsive.css`. `css/responsive.css`
    was fully rewritten (cleaned + restructured). No JS/HTML changes.
  - **Layout logic changed:**
    1. **Nav stability.** Root cause was the nav using the fluid
       `--gutter` (`clamp(2.5rem, 9vw, 10rem)`) as its left/right inset, so
       the bar width + internal spacing drifted continuously while resizing,
       compounded by three different `.brand` sizes and two different pill
       paddings. Fix: desktop base keeps `--gutter` (so the pill still aligns
       with content) but now also has `gap: var(--space-2)`. Tablet + phone
       pin the nav to a **constant** side inset (`--space-3`, then `--space-2`)
       with one fixed pill padding and one fixed `.brand` size per breakpoint.
       The dropdown `.nav-links` is anchored to a constant offset
       (`4.75rem` / `4.5rem`) matching the nav's side inset. Result: the bar
       only changes at breakpoints, never mid-drag.
    2. **Profile image jump.** Was `width: min(320px,100%)` →
       `max-width: 260px` → `width: min(200px, 62vw)` across breakpoints — two
       of those are viewport-relative, hence the bounce. Fix: `.portrait-stack`
       base is now a fixed `width: 320px; max-width: 100%`; desktop pins the
       grid track to `minmax(0,1.35fr) 320px` (fixed portrait column); tablet
       is a fixed `260px`; phone is `min(220px, 68vw)` (only mild vw so it
       still fits the narrowest phones). `.hero-portrait` already uses
       `display:flex; align-items:center; justify-content:center`, so the
       stack is centred predictably with no margin hacks
       (removed `margin-inline:auto` / `margin-top`).
    3. **Button alignment — one firm rule.** Desktop/tablet: buttons sit in a
       left→centre flex row (`.hero-ctas { justify-content:center }` on tablet
       where the whole hero is centred; left on desktop where the hero is
       left-aligned). Phone (≤480): **full-width stacked** —
       `.hero-ctas { flex-direction:column; align-items:stretch; width:100%;
       max-width:20rem }` and `.hero-ctas .btn { width:100% }`. Removed the old
       ambiguous `justify-content:center` + `flex:0 1 auto` combo.
    4. **Scroll indicator overlap.** `.scroll-cue` base now has
       `z-index: 1` + `pointer-events: none` and its offset moved from
       `bottom: var(--space-4)` → `var(--space-3)`. It is a desktop-only
       affordance, so it is `display:none` from ≤820px down (where the stacked
       hero content would otherwise collide with it).
    5. **≤480px frame consistency.** Removed the old phone rules that stripped
       the portrait: no more `border-radius:50%` / `aspect-ratio:1/1` swap,
       no more `.portrait-frame-back { display:none }`,
       `.portrait-frame::before { display:none }`,
       `box-shadow:none`, `transform:none`, grey border, or the
       `.portrait-frame:hover` reset. The phone now inherits the full base
       frame (ink border, 3/4 ratio, `6px` radius, `rotate(-3deg)`, coral
       drop-shadow, tape mark, offset back-frame) and only **scales it down**:
       `border-width: 2px`, `box-shadow: 9px 9px 0 var(--coral)` (was 14px),
       back-frame `translate(7px,7px)` (was 10px), tape `::before` 48×16px
       (was 64×22px).
  - **Cleanup of conflicting / dead media queries in `responsive.css`:**
    - Removed `.contact-links { grid-template-columns: 1fr }` (≤820) — dead:
      `#contact-links` no longer exists in the HTML (Contact was rewritten as
      static `.contact-grid` markup; `renderContact()` is dead code).
    - Removed the ≤480 `.wrap { width: min(100%, calc(100% - 2*var(--gutter))) }`
      override — it was a functional no-op vs. the base `.wrap` rule.
    - Consolidated the four separate ≤480 single-column grid rules
      (`.work-grid`, `.art-grid`, `.activity-board`, `.skills-grid`,
      `.cert-list`) into one selector list.
    - Rewrote the file header to document the three-breakpoint model and the
      "resize only, never restructure" principle.
  - **`css/style.css` edits (base rules):** added `gap: var(--space-2)` to
    `.site-nav`; changed `.portrait-stack` to fixed `width:320px;
    max-width:100%`; simplified the `@media (min-width:821px)` block to just the
    fixed grid track; added `z-index:1` + `pointer-events:none` to `.scroll-cue`
    and tightened its `bottom` offset.
  - **Selectors touched (summary):** `.site-nav`, `.brand`, `.nav-toggle`,
    `.nav-links` (+`.is-open`, `a`, `li + li`), `.hero`, `.hero-grid`,
    `.hero-copy`, `.hero-name`, `.hero-roles`, `.hero-ctas` (+`.btn`),
    `.hero-portrait`, `.portrait-stack`, `.portrait-frame`
    (+`-back`, `::before`), `.scroll-cue`, plus the unchanged-behaviour
    section grids.
  - Reported completion to the user with the layout-logic summary.

### Entry 4
> Note: the user labelled this "Entry 3" in the prompt, but Entry 3 already
> exists (the mobile layout refactor). This is logged as Entry 4 to keep the
> history linear.
- **Timestamp:** 2026-09-08 00:04:51 +07
- **My Command:** Professional UI polish + mobile finalization:
  (1) Global strict 1-column for ALL card layouts on mobile (<820px); keep
  multi-column on desktop. (2) Projects: CSS truncation (`-webkit-line-clamp`
  + ellipsis) on descriptions for uniform card height, and a NEW Grid/List
  view toggle (JS + CSS). (3) Creative & Art works: fix the broken mobile card
  layout / text overlap (strict 1-column, image and text breathe, no overlap).
  (4) Skills: force 1-column on mobile, wider category containers, better tag
  spacing. (5) NEW floating "Scroll to Top" button (HTML/CSS/JS) — appears
  after scrolling, smooth-scrolls to top. (6) General polish at my discretion.
  Log the task with the toggle + scroll logic detailed.
- **Files touched:**
  - `index.html` — added the `.work-controls` wrapper containing `#work-filter`
    plus a new `#work-viewtoggle` (two `.view-btn` buttons, Grid / List, with
    inline SVG icons, `role="group"`, `aria-pressed`). Added the floating
    `<button class="scroll-top" id="scroll-top">` (up-arrow SVG) just before
    `<footer>`. Fixed a pre-existing structural bug: the missing `</main>`
    close tag (footer + lightbox were nested inside `<main>`); `</main>` now
    closes right after the Contact section. Tag balance verified.
  - `css/style.css` — (a) `.work-controls` flex row (space-between, wraps),
    moved the old `.work-filter { margin-bottom }` onto it; new
    `.work-viewtoggle` / `.view-btn` pill-segmented-control styles (active =
    solid ink, matches filter pills). (b) `.project-body { flex: 1 }`,
    `.project-body h3` → `-webkit-line-clamp: 2`, `.project-desc` →
    `-webkit-line-clamp: 3` (both `display:-webkit-box` + `overflow:hidden`)
    for uniform card height. (c) `.work-grid.is-list` compact list view: card
    becomes `flex-direction: row`, tilt transform disabled, visual becomes a
    fixed `clamp(96px,28vw,168px)` 1:1 thumbnail, body vertically centred,
    desc clamps to 2 lines, hover hint hidden. (d) new
    `.scroll-top` block — see logic below.
  - `css/responsive.css` — full rewrite (kept from Entry 3, extended):
    * ≤820px: one selector list forces `grid-template-columns: 1fr` on
      `.work-grid`, `.work-grid.is-list`, `.art-grid`, `.skills-grid`,
      `.activity-board`, `.cert-list`, `.contact-grid` — strict single column,
      no exceptions. `.section-head` also stacks (column, flex-start).
    * ≤820px Art works: `.art-piece` switches from an aspect-ratio overlay
      card to an in-flow column — `.visual-media` becomes
      `position: relative; aspect-ratio: 4/3` (was `position:absolute;inset:0`)
      and `.art-piece h3` becomes `position: static`, transparent, padded
      below the image. No absolutely-positioned text → no overlap.
    * ≤820px Skills: full-width cards (from the 1fr rule) with
      `padding: var(--space-3)`, `.skill-card ul { gap: 0.55rem 0.5rem }`,
      bigger tags (`0.82rem`, `0.42em 0.95em`) so they aren't cramped.
    * ≤480px: list-view thumbnail shrinks to 92px, lightbox padding reduced,
      `.scroll-top` shrinks to 42px. Removed the now-redundant per-grid
      single-column rules (handled by the ≤820 list) and the old
      `.section-head` phone-only rule.
- **Grid / List toggle — logic (`js/main.js` → `initWorkView()`):**
  - Pure CSS-state toggle: the only thing JS does is add/remove the class
    `is-list` on `#work-grid` and keep the two buttons' `is-active` /
    `aria-pressed` in sync. All layout differences live in the
    `.work-grid.is-list` CSS rules.
  - Click is delegated on `#work-viewtoggle`; `e.target.closest(".view-btn")`
    → `apply(btn.dataset.view)`.
  - Preference persists in `localStorage` under key `fern:work-view`
    (`"grid"` | `"list"`), read on init and re-applied; every `localStorage`
    call is wrapped in try/catch so a blocked-storage context still works for
    the session. Invalid/absent value falls back to `"grid"`.
  - Category filtering is unaffected — it only toggles `.is-hidden` on cards,
    which is independent of the view class. Wired in `main.js` boot after
    `initLightbox()`.
- **Floating Scroll-to-Top — logic (`js/interactions.js` → `initScrollTop()`,
  called from `main.js` boot):**
  - Button markup is always in the DOM; CSS keeps it `opacity:0;
    visibility:hidden` (out of the tab order) until JS adds `.is-visible`.
  - `scroll` listener is `{ passive: true }` and rAF-throttled via a `ticking`
    flag (same pattern as the nav/​parallax code). On each frame it toggles
    `.is-visible` when `window.scrollY > threshold`, where
    `threshold = min(innerHeight * 0.9, 640)` — roughly one viewport.
  - Click → `window.scrollTo({ top: 0, behavior: "smooth" })`, or `"auto"`
    when `prefers-reduced-motion: reduce` matches. CSS also flattens the
    button's trans/ transition under reduced-motion.
  - `update()` runs once on init so the initial state is correct after a
    reload at a scrolled position.
- **General polish applied:** added `</main>` (structural fix); project cards
  now equalise height via `flex:1` body + clamped text; `.work-controls`
  gives the filter/toggle row consistent rhythm; lightbox gets tighter
  padding on phones; scroll-to-top respects reduced motion.
- **Verification:** `node --check` passes on all three JS files; CSS brace
  counts balanced (style.css 246/246, responsive.css 60/60); HTML tag balance
  checked (main/section/div/button/ul/li/svg all matched); page serves 200 and
  contains the new nodes. No headless browser available in this environment
  for a visual screenshot pass.
- Reported completion to the user.

### Entry 5
- **Timestamp:** 2026-09-08 00:10:40 +07
- **My Command:** Changed mind — remove the Projects "Grid / List View" toggle
  feature entirely (the one added in Entry 4). Clean up HTML/JS/CSS: remove the
  toggle button, all JS listeners/state/functions for grid↔list switching, and
  every CSS style created for the list-view layout. Projects must permanently
  default to the standard card grid, keeping the strict 1-column mobile rule.
  Log as the next entry.
- **Files cleaned up:**
  - `index.html` — removed the `<div class="work-controls">` wrapper and the
    `<div id="work-viewtoggle">` with its two `.view-btn` (Grid / List) buttons
    and inline SVG icons. Restored the original flat markup:
    `#work-filter` directly followed by `#work-grid` inside the section
    `.wrap`. (Tag balance re-checked: main/section/div/button/ul/li/svg all
    matched; `<button>` count dropped 5 → 3 — the remaining three are the nav
    toggle, lightbox close, and scroll-to-top.)
  - `js/main.js` — deleted the entire `initWorkView()` function (event
    delegation on `#work-viewtoggle`, the `is-list` class toggle, the
    `aria-pressed` sync, and the `localStorage["fern:work-view"]`
    read/write/persist logic) and removed its `initWorkView();` call from the
    boot sequence. `initScrollTop()` (separate feature) is untouched.
  - `css/style.css` — removed the `.work-controls`, `.work-viewtoggle`,
    `.view-btn` (+ `+ .view-btn`, `svg`, `.is-active`, `:hover`) rule set and
    the entire `.work-grid.is-list ...` block (row card, fixed thumbnail,
    tilt-disable, 2-line desc, hidden hint). Restored `.work-filter` to its
    original standalone form **with** `margin-bottom: var(--space-3)` (that
    margin had been moved onto `.work-controls`).
  - `css/responsive.css` — removed `.work-grid.is-list` from the ≤820px
    "strict 1-column" selector list, deleted the ≤820px
    `.work-controls { justify-content: flex-start }` rule, and deleted the
    ≤480px `.work-grid.is-list .project-visual` / `.project-body` overrides.
- **Kept intentionally (NOT part of the toggle):**
  - `.project-desc` `-webkit-line-clamp: 3` + `.project-body h3`
    `-webkit-line-clamp: 2` truncation, and `.project-body { flex: 1 }` — these
    were the separate "truncate project text for uniform card height" request
    from the same Entry 4 prompt and improve the default grid. Left in place.
  - The floating scroll-to-top button (`#scroll-top`, `.scroll-top`,
    `initScrollTop()`) — a different feature, still wanted.
  - The global strict-1-column-on-mobile rule and all other Entry 4 polish.
- **Default state:** Projects render only via `renderProjects()` into
  `#work-grid`, whose CSS is `grid-template-columns: repeat(2, 1fr)` on desktop
  (base), `1fr` at ≤820px. No JS touches the grid layout any more. Category
  filtering (`renderWorkFilter` / `applyWorkFilter` → `.is-hidden`) and
  `initProjectTilt()` still work unchanged.
- **Verification:** `grep` for `work-view|viewtoggle|view-btn|is-list|
    initWorkView|work-controls|fern:work-view` across `index.html css/ js/`
    returns nothing. `node --check` passes on `main.js` + `interactions.js`.
    CSS braces balanced (style.css 233/233, responsive.css 57/57). HTML tags
    balanced.
- Reported completion to the user.

### Entry 6
- **Timestamp:** 2026-09-08 00:13:25 +07
- **My Command:** "Where and how do I insert the image links for my works?"
  User is ready to add real Project/Artwork images. Asked to: point out where
  in `data/portfolio.js` the paths go (with an example snippet); say where the
  physical files belong under `assets/`; and — since the objects had **no**
  dedicated image property — add one to the schema. Requirement: frontend
  rendering (`js/main.js`) must handle the new field without breaking the
  seeded-SVG placeholders for items that still lack an image. Log if code
  changes.
- **Code changed → logging. Files updated:**
  - **`data/portfolio.js`** — added an `image: null` property to **every**
    object in `projects` (7) and `artworks` (7), placed right after `id` so the
    insert point is obvious. Added a large `/* ADDING REAL IMAGES */` comment
    block above `export const projects` documenting: `null` = placeholder, a
    string path = real picture; where files go
    (`assets/images/projects/`, `assets/images/artworks/`); accepted formats
    (png/jpg/jpeg/webp/external URL); and the `<id>.png` auto-pickup shortcut.
    Reformatted the artwork objects that were one-liners so they take the new
    field cleanly.
  - **`js/main.js`** — added a `mediaSrc(item, kind)` helper:
    `return item.image || \`assets/images/${kind}/${item.id}.png\`;`
    Swapped the 4 hard-coded path expressions to use it:
    `renderProjects()` `<img src>` → `escapeAttr(mediaSrc(p, "projects"))`;
    `openProjectLightbox()` `imgSrc` → `mediaSrc(p, "projects")`;
    `renderArtworks()` `<img src>` → `escapeAttr(mediaSrc(a, "artworks"))`;
    `openArtworkLightbox()` `imgSrc` → `mediaSrc(a, "artworks")`.
    Placeholder behaviour is unchanged: the `<img>` still carries
    `data-fallback-seed` / `data-fallback-label`, and `attachImageFallback()`
    still swaps in `paintedPlaceholder()` on the `error` event — so
    `image: null` (→ non-existent `<id>.png`) or a wrong path both fall back to
    the seeded SVG, exactly as before.
  - **`README.md`** — updated the "Project images" / "Artwork images" bullets
    under "Where to add real assets" to describe the `image` field instead of
    the old filename-only convention.
- **Answer given to the user:**
  - **Data structure:** in `data/portfolio.js`, set the `image` field on the
    matching object, e.g.
    `{ id: "legaltech", image: "assets/images/projects/legaltech.jpg", title: … }`
    and `{ id: "mu-bus", image: "assets/images/artworks/mu-bus.jpg", title: … }`.
  - **File location:** `assets/images/projects/` and `assets/images/artworks/`
    (both folders already exist, currently only a `.gitkeep`).
  - **Missing fields:** added — every object now has `image` (defaulting to
    `null`).
- **Verification:** `node --check` passes on `js/main.js` and
  `data/portfolio.js`. Path resolution grep confirms all 4 call sites use
  `mediaSrc`.

### Entry 7
- **Timestamp:** 2026-09-08 00:20:40 +07
- **My Command:** The central "scroll" text indicator is still visible on
  desktop — remove it completely from all screen sizes. Delete the HTML
  element, clean up its CSS / animation / any JS, and verify the removal does
  not affect the floating "Scroll to Top" button added earlier.
- **Files modified:**
  - **`index.html`** — deleted the hero `<div class="scroll-cue"
    aria-hidden="true">` block (the `<span>scroll</span>` + `<span
    class="line">` animated tick), which sat just before `</section>` in
    `#hero`. Tag balance re-checked (span 2/2, div 38/38, section 9/9, all OK).
  - **`css/style.css`** — removed the `.scroll-cue` rule (absolute-positioned
    centred flex column), the `.scroll-cue .line` rule, and the
    `@keyframes cue` animation (the only thing that referenced it). Braces
    balanced 227/227.
  - **`css/responsive.css`** — removed the `.scroll-cue { display: none; }`
    override from the ≤820px block (no longer needed — element is gone).
    Braces balanced 56/56.
  - **JS:** nothing to change — the cue was pure HTML/CSS, no script ever
    referenced it. (The two `addEventListener("scroll", …)` hits in
    `interactions.js` are the nav scroll-state and the scroll-to-top button,
    both unrelated.)
- **"Scroll to Top" button — confirmed unaffected:** different, separate code —
  `#scroll-top` button in `index.html` (line ~229), `.scroll-top` /
  `.scroll-top.is-visible` / `:hover` / `svg` / reduced-motion rules in
  `css/style.css` (~line 1337), and `initScrollTop()` in `js/interactions.js`
  (called from `js/main.js`). None of it shares a name or selector with
  `.scroll-cue`; grep for `scroll-cue` / `keyframes cue` now returns nothing
  while all `scroll-top` references are intact.
- **Verification:** grep clean for `scroll-cue` and `keyframes cue` across
  `index.html css/ js/`; CSS braces balanced; HTML tags balanced; scroll-top
  wiring verified present.
- Reported completion to the user.

### Entry 8 — COMPLETE ARCHITECTURE OVERHAUL (SPA)
- **Timestamp:** 2026-09-08 00:32:42 +07
- **My Command:** Throw away the scattered file structure and rebuild as a
  clean minimal SPA. Requirements: (1) only 3 core files — `index.html`
  (minimal shell, no hardcoded sections, just `<div id="app">`), `style.css`
  (ALL CSS consolidated from style.css + responsive.css, design system +
  mobile fixes kept), `main.js` (ALL JS consolidated — animations,
  interactions, rendering — as the SPA engine). (2) Migrate data: delete
  `data/portfolio.js`, create `data.json` (strict JSON), `main.js` must
  `fetch('data.json')` on init and generate the UI from it. (3) Function as a
  real SPA — main.js renders every section dynamically after the fetch
  resolves. (4) Delete all old redundant JS/CSS files. Log with the new file
  structure + how the SPA fetches data.
- **New file tree (root):** `index.html`, `style.css`, `main.js`, `data.json`,
  `README.md`, `log-task.md`, `assets/`. Nothing else.
- **DELETED:** `css/style.css`, `css/responsive.css`, `css/` dir;
  `js/main.js`, `js/interactions.js`, `js/animations.js`, `js/` dir;
  `data/portfolio.js`, `data/` dir. (`rm -rf css js data/portfolio.js` +
  `rmdir data`.)
- **`index.html` (new, 33 lines):** doctype + `<head>` (charset, viewport,
  title, description, 4 OG tags, favicon → **relative** `assets/icons/...`,
  `<link rel="stylesheet" href="style.css">`) + `<body>` containing only
  `<div id="app"><noscript>…</noscript></div>` and
  `<script type="module" src="main.js">`. All the former section markup,
  décor SVGs, the static contact block, the lightbox, the scroll-top button
  and the footer are GONE from HTML — `main.js` builds them.
- **`data.json` (new, root, strict JSON — validated with `JSON.parse`):**
  every object from the old `data/portfolio.js` converted. Added
  `profile.eyebrow` ("Portfolio · Mahidol University, ICT") and
  `profile.photo` ("assets/images/profile.jpg") so the hero is fully
  data-driven. `contact` reshaped to `{ brand, email, socials[] }` to match
  what the redesigned contact section actually renders (Instagram / LinkedIn /
  Resume / CV pills + `ffern8634@gmail.com`); the old unused
  email/linkedin/github/behance example.com object is dropped. `achievement`
  and `note` are explicit `null` where absent. `about` is now one plain
  pre-collapsed string.
- **`style.css` (new, consolidated):** former `css/style.css` verbatim, then a
  `/* RESPONSIVE … */` divider, then former `css/responsive.css` body verbatim
  (its 15-line header comment dropped). Added a `.load-error` block (styles the
  fetch-failure panel). Fixed two stale comments (`animations.js` →
  `initScrollReveal() in main.js`; `data/portfolio.js` → `data.json`).
  Braces balanced (283 pairs → grew to 284 with `.load-error`). All earlier
  responsive/mobile fixes preserved unchanged.
- **`main.js` (new, ~930 lines, single native ES module, no imports/exports):**
  consolidates the old `main.js` + `interactions.js` + `animations.js`.
  Sections:
  1. `paintedPlaceholder` generator (PALETTE / WASH / hashString) — unchanged.
  2. helpers: `escapeAttr`, new `escapeHtml` (for the error panel),
     `mediaSrc(item, kind)`, `attachImageFallback(root)`.
  3. `DECO` const — the 8 décor `<svg class="deco" data-parallax>` marks,
     copied verbatim from the old HTML, keyed by section.
  4. pure template builders (`navMarkup`, `heroMarkup`, `aboutMarkup`,
     `projectCard`/`workMarkup`, `artPiece`/`creativeMarkup`,
     `experienceMarkup`, `skillsMarkup`, `activitiesMarkup`,
     `certificationsMarkup`, `contactMarkup`, `lightboxMarkup`,
     `scrollTopMarkup`, `footerMarkup`) — each `data → HTML string`.
     Brand = first word of `profile.name` + `.`; quick-links reuse `data.nav`.
  5. lightbox (`openLightbox`/`closeLightbox`/`initLightbox` +
     `projectLightbox`/`artworkLightbox`).
  6. hydration: `hydrateWork` (image fallback, card→lightbox listeners,
     `initWorkFilter`+`applyWorkFilter`), `hydrateCreative`,
     `initProfilePhoto`, `setFooterYear`.
  7. behaviours copied verbatim from the old files (minus `export`):
     `initNav` (only change: selector `#main-content section[id]`),
     `initScrollReveal`, `initParallaxDecor`, `initBrushTrail`,
     `initProjectTilt`, `initScrollTop`.
  8. **bootstrap** — this is the SPA data flow:
     ```
     async function boot() {
       const app = document.getElementById("app");
       const res = await fetch("data.json", { cache: "no-cache" });
       if (!res.ok) throw new Error(`HTTP ${res.status}`);
       const data = await res.json();
       renderApp(app, data);          // app.innerHTML = [ …markup… ].join("")
     }                                 // then hydrate + init*
     boot();  // catch → render .load-error panel telling the user to use http://
     ```
     `renderApp` builds one big innerHTML string (skip-link + nav + `<main
     id="main-content">` + 9 sections + `</main>` + lightbox + scroll-top +
     footer), assigns it once, then runs the hydrate/init sequence in the same
     order as the pre-SPA boot.
- **`README.md`:** rewritten for the 3-file SPA — new structure diagram,
  "How the SPA works" section, `data.json` editing guide, image/asset guide
  pointing at JSON fields, responsive-model summary.
- **Verification (no browser/jsdom available):**
  - `node --check main.js` passes; `JSON.parse(data.json)` passes (also over
    HTTP).
  - A `vm`-sandbox harness (stubbed window/document/fetch/IntersectionObserver)
    loaded `main.js` and ran every `*Markup(data)` builder against the real
    `data.json`: no `undefined`/`null`/`NaN` in output; all 9 section ids
    present; `#work-grid`, `#art-grid`, `#lightbox`, `#scroll-top` present;
    exactly 7 `.project-card` + 7 `.art-piece`; `data-parallax` + `data-reveal`
    present; email + name present.
  - Assembled full SPA output tag-balance: section 9/9, div 62/62, article
    20/20, figure 7/7, button 3/3, ul 10/10, li 61/61, span 39/39, a 18/18,
    svg 12/12, h1 1/1, h2 7/7, h3 35/35.
  - Local `python3 -m http.server`: `/`, `/index.html`, `/style.css`,
    `/main.js`, `/data.json` all return 200; `style.css` still has its 10
    `@media` blocks.
  - grep for stale paths (`css/…`, `js/…`, `data/portfolio…`, `../data`) —
    only 2 harmless CSS comment hits, both fixed.
- Reported completion to the user.
