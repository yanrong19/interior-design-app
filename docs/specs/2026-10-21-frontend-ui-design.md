# Interior Design App — Frontend UI (v1) Design

Source briefs: `interior_designer_website_strategy.md` (product), `claude-skills-interior-design-website.md` (quality checklist).

## Product
DIY interior design tool. Users learn (Knowledge Base), browse (Catalog), and plan rooms (Planner). Frontend only; sample data; no backend, auth, persistence or 3D.

## Stack
React 18 + Vite + TypeScript. react-router for routes. CSS Modules + design tokens as CSS variables. No UI kit.

## Visual system (revised after installing Taste + Impeccable skills)
- Colors (brand kept): Paper `#F9F9FB`, Charcoal `#1A1A1A`, Slate `#64748B` (text uses `#5D6B7E` for 4.5:1). One added accent, Eucalyptus `#2F5D50`, for the main data element, selection and the closing field. App frame tint `#EEF0EC`.
- Type: Work Sans only (dealt by Taste), 300 for display, 400/500/600 for UI.
- Home: Taste direction `split-stage` (seed 494199188): sticky crossfading photo beside a reading column, then a live room checker, a wall of rule tiles, a pinned how-it-works, and a closing "Name your room" dialog. Square corners.
- App screens: Taste style `framed-sheet` (seed 590691962): tinted L-frame around a white sheet, 16px radius, no shadows. Planner uses the builder layout.
- Dropped from v0 (flagged as AI tells by both skills): mono labels, hairline decoration, numbered pins, clay accent, display serif.
- Imagery: Unsplash hotlinks with neutral fallback on load error.
- Checks: `node .claude/skills/taste-skill/scripts/lint.mjs` and `inspect.mjs` (`--app` for app screens): 0 FAIL on all four routes.

## Routes
| Route | Screen |
|---|---|
| `/` | Home: split hero (copy + before/after slider), intent search with pills, inspiration cards, hotspot room demo |
| `/knowledge` | Knowledge Base: accordion sidebar (Room Type, Styles, Color & Light, Spatial Rules), style matrix, guide article with hotspot room |
| `/catalog` | Catalog: filter sidebar, product grid, detail panel (dimensions, care, pairings) |
| `/planner` | Planner: left asset library (drag), center SVG floor plan (move/rotate/delete, Daylight/Evening), right assistant (rules for selection, violations flagged), bottom swatch drawer |

## Data
Typed sample data in `src/data/`: styles, products, materials, rules, kb articles, hotspots, images. Backend later replaces these modules.

## Quality
Visible focus rings; keyboard-operable slider, pins, accordion, drawer; `prefers-reduced-motion`; AA contrast; lazy images with fixed aspect ratios; responsive to 375px. Planner on narrow screens shows notice + read-only plan.

## Motion pass (Motion + Lenis), from the user's reference images
- Packages: `motion` (React animation) and `lenis` (smooth scroll on Home and the Knowledge Base only). GSAP and Swiper skipped as overlapping; three.js / React Three Fiber deferred to a possible 2D/3D Planner view.
- Home hero: full-screen pinned sequence of four rooms. Scrolling flips an 8×5 grid of tiles in shuffled order to reveal the next room (4×7 on phones). The headline steps aside after the first room; each later room names itself in large type. Room indicators at the bottom jump to a room.
- Type: Instrument Serif for display headings (one italic line per heading, per the references), Work Sans for text and app UI.
- Scroll motion: word-by-word heading reveals, wipe-in image reveals, gentle parallax, numbers counting up, a reading-progress line.
- Gallery: "Rooms to learn from", style filter, draggable strip with arrows and progress, card opens into a full view (shared-element animation) with rules and pieces.
- Navigation: Home header hides on scroll down and returns on scroll up; app sidebar highlight slides between items; route changes cross-fade (Planner opens without the rise).
- App screens get feedback motion only: catalog rows glide on filter, detail panel cross-fades, Planner notices slide.
- Reduced motion: no pinning, no tiles, no smooth scroll, no transforms; content shown in place.
