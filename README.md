# Freedom Living

```sh
npm install
npm run dev
```

Production build: `npm run build`. The existing review build is available with
`npm run build:single`. `npm run format` runs Prettier over `src/`.

## Leads

Every form (visit, question, call-back pop-up, investor enquiry) posts to `api/lead.js`
(Vercel function), which adds a row to the **Landing Page Leads** tab of the Freedom Living
Lead Sheet and emails the team. Setup: [`docs/lead-sheet-setup.md`](docs/lead-sheet-setup.md);
variables: [`.env.example`](.env.example). `npm run dev` does not run `/api`; use `vercel dev`.

## Code layout

- `src/components/`: one file per page section; `LeadModal`, `InvestorModal` and `FloorPlans` /
  `Visit` are code-split (see `LazySection.jsx`). `formKit.jsx` and `hooks/useModal.js` hold the
  form / modal pieces they share.
- `src/hooks/`: `SmoothScroll.jsx` (Lenis + a single scroll bus, `useScrollFrame`),
  `useHeavyFx.js` (GSAP text and scroll animations, selector based), `useReveal.js`,
  `layoutVars.js` (runtime CSS variables set with `el.style.setProperty`).
- `src/styles/`: `index.css` imports `sections/*.css` in order. Order matters: files 17 and up
  are follow-up tweaks that deliberately override the sections before them. Tailwind's reset is
  off and Tailwind is only used for the utility classes written directly in JSX (`utilities.css`).
- `src/data/content.js`: copy and data.
