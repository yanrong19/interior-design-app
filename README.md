# Roomwright: interior design app (frontend)

A DIY interior design tool: learn the rules of a room, find pieces that fit them, and plan your own room on a floor plan. Frontend only, with sample data; no backend yet.

## Screens

- **Home** (`/`): cinematic pinned hero with a tile-grid transition between rooms, search by room, style and budget, a live room-size checker, room-rule tiles, and a "Rooms to learn from" gallery.
- **Knowledge base** (`/knowledge`): guides by room type, style, colour and light, and spatial rules, with clickable markers on room photos.
- **Catalog** (`/catalog`): filter pieces by room, category, style and price; detail panel with sizes, care and pairings.
- **Planner** (`/planner`): drag furniture onto a floor plan, rotate and nudge it, check clearances live, switch daylight/evening light, try materials, undo/redo, and save in the browser.

## Stack

React 18, Vite, TypeScript, react-router, CSS Modules. Motion for animation and Lenis for smooth scrolling on reading pages. Every animation respects the "reduce motion" setting.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:5173. Build with `npm run build`.

## Notes

- Product names, prices and sizes in `src/data/` are placeholders.
- Photos are Unsplash hotlinks (Unsplash licence); swap in your own.
- "Roomwright" is a placeholder name.
- Design decisions are recorded in `docs/specs/`.
