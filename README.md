# Freedom Living — landing page (React + Vite)

```bash
npm install
npm run dev      # local dev server
npm run build    # production build in /dist
```

## Structure
- `src/App.jsx` — page order; wraps everything in `<SmoothScroll>`
- `src/hooks/SmoothScroll.jsx` — Lenis smooth scrolling (`useLenis`, `useScrollTo`, `useScrollFrame`). Turned off for reduced-motion users. Tune `lerp` there (lower = floatier).
- `src/hooks/useReveal.js` — scroll reveal (`.rv`, `.wipe`, `.lm` classes)
- `src/components/` — one component per section (`Sections.jsx` holds the smaller ones)
- `src/data/content.js` — all copy, units, levels, FAQ, contact details and floor-plan hotspots
- `src/styles/global.css` — design tokens and all styles
- `src/assets/img/` — renders, plans and photos from the client deck/presentation

## Still to do
- Fonts: add the licensed Recife Display + Visby Round CF `.woff2` files to `public/fonts/` (names in `public/fonts/README.md`). Fraunces + Quicksand are fallbacks.
- Lead routing: `Visit.jsx` → `submit()` currently logs the lead; post it to the admin panel / backend.
- RERA number in the footer (`Sections.jsx` → `Footer`).
- Floor-plan hotspot boxes (`UNITS[].box` in `content.js`) were placed by eye; confirm against the final plans.
