# Freedom Living

```sh
npm install
npm run dev
```

Production build: `npm run build`. The existing review build is available with
`npm run build:single`.

## Tailwind styling

- Tailwind CSS 3.4 is compiled through PostCSS; no CDN or runtime Tailwind compiler.
- `src/styles/tailwind.css` is the single styling entry point. Component rules use
  Tailwind `@apply`, with exact arbitrary values where the design needs them.
- The original selectors, media/container queries, cascade order, font files,
  keyframes, and design values are preserved. Preflight is disabled intentionally.
- Former inline presentation styles are Tailwind classes in the components.
- `src/hooks/layoutVars.js` supplies only runtime CSS variables for measured scroll
  positions, gallery progress, plan zoom/pan, and hotspot/crop geometry. Tailwind
  utilities consume those variables. Components do not write inline style attributes.
  Modern browsers use a constructed stylesheet; older browsers use a runtime
  variable stylesheet as a compatibility fallback.
- Native `@font-face` descriptors remain because loading local fonts requires them.
  Keyframe styling is expressed with Tailwind `@apply`.

Keep exact arbitrary values and source order when editing: rounding them to the
default spacing scale, enabling Preflight, or reordering overlapping rules can
change the design. Complete class names must be present in source for Tailwind's
scanner; use runtime variables for continuous calculated values.

All images, videos, fonts, copy, content data, and the lead API are unchanged.
