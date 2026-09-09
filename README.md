# Warinthorn Savetamornkul — Portfolio

A one-page portfolio built as a "white canvas + pastel paint" digital
studio. It is a **Single Page Application**: `index.html` is just a shell,
`main.js` fetches `data.json` and renders the whole site into `#app`.
Plain HTML5, CSS3 and vanilla JavaScript. No framework, no build step.

## Run it locally

`main.js` uses `fetch('data.json')`, so the site must be served over
`http://` (opening `index.html` with `file://` blocks the fetch). Any
static server works:

```bash
cd fern-web
python3 -m http.server 8080
# then open http://localhost:8080
```

or, with Node installed:

```bash
npx serve .
```

No build step, bundler, or `npm install` is required.

## Project structure

```
fern-web/
├── index.html      Minimal shell — <head> + <div id="app"></div> + <script>
├── style.css       ALL styling: design tokens, every section, responsive rules
├── main.js         The SPA engine: fetch data.json → render DOM → wire behaviour
├── data.json       ALL content — the single place to edit (strict JSON)
└── assets/
    ├── images/
    │   ├── profile.jpg     Hero portrait
    │   ├── projects/        One image per project (see "Adding images")
    │   └── artworks/        One image per artwork
    ├── icons/               favicon.svg
    ├── textures/            Optional paper/canvas textures
    └── fonts/               Optional self-hosted font files
```

Only **three core files** run the site: `index.html`, `style.css`,
`main.js` — plus `data.json` for content and `assets/` for media.

## How the SPA works

1. `index.html` loads `style.css` and `<script type="module" src="main.js">`.
2. On load, `main.js` calls `boot()` → `await fetch('data.json')`.
3. On success, `renderApp(#app, data)` builds the entire DOM from the JSON —
   nav, hero, about, projects, artworks, experience, skills, activities,
   certifications, contact, the shared lightbox, the floating scroll-to-top
   button and the footer — then hydrates interactivity (project filter,
   lightbox, scroll reveal, parallax décor, cursor trail, card tilt,
   scroll-to-top, nav scroll-spy / mobile menu).
4. On failure (e.g. opened via `file://`), `#app` shows a friendly error
   telling you to serve it over HTTP.

## Editing content

Everything text-based lives in **`data.json`**: `profile`, `nav`,
`projects`, `artworks`, `experience`, `skills`, `activities`,
`certifications`, `contact`. Edit the JSON and reload — `main.js` re-renders
from it. You never need to touch `index.html` or `main.js` for normal
content updates. It is strict JSON: double-quoted keys/strings, no comments,
no trailing commas.

## Adding images

- **Hero portrait** — replace `assets/images/profile.jpg` (path is
  `profile.photo` in `data.json`). Until a real photo loads, a painted
  placeholder labelled "ADD YOUR PHOTO" shows instead.
- **Project / artwork images** — put the file in `assets/images/projects/`
  or `assets/images/artworks/`, then set the `image` field on that object
  in `data.json`, e.g.
  `"image": "assets/images/projects/legaltech.jpg"`
  (`.png` / `.jpg` / `.webp` / an external URL all work). Leaving
  `"image": null` keeps the abstract painted placeholder. Shortcut: a file
  named exactly `<id>.png` in the right folder is picked up even with
  `"image": null`.
- **Resume link** — `profile.resumeUrl` in `data.json` (currently `"#"`).
- **Contact links** — `contact.socials[].href` and `contact.email` in
  `data.json` (socials are placeholder `"#"` values).
- **Favicon / OG share image** — `assets/icons/favicon.svg` is a placeholder
  mark; `assets/images/share-image.jpg` (referenced in `index.html`'s
  `og:image`) does not exist yet.

## Project & artwork lightbox

Clicking (or pressing Enter/Space on) any project card or artwork tile opens
a shared lightbox overlay showing the full image plus its details. It closes
via the ✕ button, a backdrop click, or Escape, and returns keyboard focus to
whatever triggered it. Body scroll is locked while it's open.

## Accessibility & performance notes

- Semantic landmarks (`header`, `nav`, `main`, `section`, `footer`) and a
  "Skip to content" link are rendered by `main.js`.
- Decorative SVGs use `aria-hidden="true"` and `pointer-events: none`
  (`.deco`) so they never intercept focus/clicks or clutter screen readers.
- Keyboard focus states are visible (`:focus-visible`).
- `prefers-reduced-motion` disables scroll-reveal transitions, parallax and
  the cursor brush trail, and makes scroll-to-top jump instantly.
- The cursor "brush trail" and pointer parallax are disabled on touch /
  `hover: none` devices.
- Scroll reveal and nav scroll-spy use `IntersectionObserver`; pointer and
  scroll effects are `requestAnimationFrame`-throttled and passive.

## Responsive model

`style.css` is desktop-first with three breakpoints:

- **≤1080px** — large content grids step down to 2 columns.
- **≤820px** — mobile: every card grid becomes strictly 1 column, the nav
  collapses to a dropdown menu, the hero stacks to one centred column.
- **≤480px** — phone rhythm: hero CTAs go full-width, the portrait frame
  scales down (keeping its style, not stripping it).

## Known placeholders (intentional)

- Hero portrait photo, project/artwork visuals (painted placeholders show
  until real files are added).
- Certificate images/links.
- Contact social URLs and the résumé link.
- Favicon and Open Graph share image.
