import { layoutVars } from "../hooks/layoutVars.js";
import { useEffect, useMemo, useRef, useState } from "react";
import { Dash, Kicker } from "./Brand.jsx";
import { FLOORS, PLANS, SPACES, UNITS, unitLabel } from "../data/content.js";
import { useLenis } from "../hooks/SmoothScroll.jsx";

/* ───────── icons ───────── */
const ico = {
  width: 30,
  height: 30,
  viewBox: "0 0 32 32",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};
const ICONS = {
  car: (
    <svg {...ico}>
      <path d="M5 19l2.4-6.2A3 3 0 0 1 10.2 11h11.6a3 3 0 0 1 2.8 1.8L27 19" />
      <rect x="4" y="19" width="24" height="6" rx="2" />
      <path d="M7 25v2M25 25v2" />
      <circle cx="9.5" cy="22" r="1" />
      <circle cx="22.5" cy="22" r="1" />
    </svg>
  ),
  home: (
    <svg {...ico}>
      <path d="M5 15L16 6l11 9" />
      <path d="M8 13v13h16V13" />
      <path d="M13.5 26v-6.5h5V26" />
    </svg>
  ),
  layers: (
    <svg {...ico}>
      <path d="M16 5l12 6-12 6-12-6 12-6z" />
      <path d="M4 16l12 6 12-6" />
      <path d="M4 21l12 6 12-6" />
    </svg>
  ),
  dine: (
    <svg {...ico}>
      <path d="M9 5v8a3 3 0 0 0 6 0V5M12 5v22" />
      <path d="M22 27V5c-2.8 1.5-4 4.5-4 8.5 0 2.5 1.5 3.5 4 3.5" />
    </svg>
  ),
  leaf: (
    <svg {...ico}>
      <path d="M6 26C6 14 13 7 27 6c0 13-7 20-19 20" />
      <path d="M6 26c4-6 8-9.5 13-12" />
    </svg>
  ),
};
const IconPlus = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
    <path
      d="M8 3v10M3 8h10"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);
const IconMinus = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
    <path
      d="M3 8h10"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);
const IconFull = ({ on }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    aria-hidden="true"
  >
    {on ? (
      <path d="M6 2v4H2M10 2v4h4M6 14v-4H2M10 14v-4h4" />
    ) : (
      <path d="M2 6V2h4M14 6V2h-4M2 10v4h4M14 10v4h-4" />
    )}
  </svg>
);

const MIN = 1,
  MAX = 3,
  STEP = 0.5;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/* ───────── zoomable, pannable plan with hotspots ───────── */
function PlanViewer({ plan, items, selId, onPick, labelOf, nameOf }) {
  const vp = useRef(null);
  const drag = useRef(null);
  const [z, setZ] = useState({ s: 1, x: 0, y: 0 });
  const [full, setFull] = useState(false);
  const lenis = useLenis();

  const fit = (s, x, y) => {
    const r = vp.current?.getBoundingClientRect();
    if (!r) return { s, x: 0, y: 0 };
    const mx = ((s - 1) * r.width) / 2,
      my = ((s - 1) * r.height) / 2;
    return { s, x: clamp(x, -mx, mx), y: clamp(y, -my, my) };
  };
  const zoom = (d) =>
    setZ((p) => {
      const s = clamp(p.s + d, MIN, MAX);
      return fit(s, (p.x * s) / p.s, (p.y * s) / p.s);
    });

  // fullscreen = fixed overlay (works on every browser, iOS included); Esc closes it
  useEffect(() => {
    if (!full) return;
    lenis?.stop();
    document.documentElement.classList.add("plan-full-open");
    const onKey = (e) => {
      if (e.key === "Escape") setFull(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      lenis?.start();
      document.documentElement.classList.remove("plan-full-open");
      window.removeEventListener("keydown", onKey);
    };
  }, [full, lenis]);
  useEffect(() => {
    setZ((p) => fit(p.s, p.x, p.y));
  }, [full]); // re-clamp after resizing

  // drag to pan (only once zoomed in); a small move threshold keeps hotspot clicks working
  const onDown = (e) => {
    if (z.s > 1)
      drag.current = {
        id: e.pointerId,
        sx: e.clientX,
        sy: e.clientY,
        x: z.x,
        y: z.y,
        moved: false,
      };
  };
  const onMove = (e) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.sx,
      dy = e.clientY - d.sy;
    if (!d.moved && Math.hypot(dx, dy) > 5) {
      d.moved = true;
      vp.current.setPointerCapture(e.pointerId);
    }
    if (d.moved) setZ((p) => fit(p.s, d.x + dx, d.y + dy));
  };
  const onUp = () => {
    setTimeout(() => {
      drag.current = null;
    }, 0);
  };
  const pick = (id) => {
    if (!drag.current?.moved) onPick(id);
  };

  return (
    <div
      className={`pv${full ? " is-full" : ""}`}
      data-lenis-prevent={full ? "" : undefined}
      role={full ? "dialog" : undefined}
      aria-modal={full || undefined}
      aria-label={full ? plan.alt : undefined}
    >
      <div
        ref={vp}
        className={`pv-vp${z.s > 1 ? " can-pan" : ""}${drag.current?.moved ? " panning" : ""}`}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <div
          className="pv-stage ![aspect-ratio:var(--layout-aspect-ratio)] ![transform:var(--layout-transform)]"
          ref={layoutVars({ "--s": z.s, "--layout-aspect-ratio": plan.ar, "--layout-transform": `translate(${z.x}px,${z.y}px) scale(${z.s})` })}
        >
          <img src={plan.src} alt={plan.alt} draggable="false" />
          {items.map((it) => {
            const [l, t, w, h] = it.box;
            return (
              <button
                key={it.id}
                type="button"
                className={(`hs${it.id === selId ? " on" : ""}`) + " ![left:var(--layout-left)] ![top:var(--layout-top)] ![width:var(--layout-width)] ![height:var(--layout-height)]"}
                aria-label={nameOf(it)}
                aria-pressed={it.id === selId}
                ref={layoutVars({ "--layout-left": `${l}%`, "--layout-top": `${t}%`, "--layout-width": `${w}%`, "--layout-height": `${h}%` })}
                onClick={() => pick(it.id)}
              >
                <span>{labelOf(it)}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="pv-ctl" role="group" aria-label="Plan controls">
        <button
          type="button"
          onClick={() => zoom(STEP)}
          disabled={z.s >= MAX}
          aria-label="Zoom in"
        >
          <IconPlus />
        </button>
        <button
          type="button"
          onClick={() => zoom(-STEP)}
          disabled={z.s <= MIN}
          aria-label="Zoom out"
        >
          <IconMinus />
        </button>
        <button
          type="button"
          onClick={() => setFull((f) => !f)}
          aria-label={full ? "Exit full screen" : "View full screen"}
        >
          <IconFull on={full} />
        </button>
      </div>
      {z.s > 1 && <span className="pv-hint">Drag to move around</span>}
    </div>
  );
}

/* ───────── the selected home/space, cropped from the drawing ───────── */
function PlanCrop({ plan, box, label }) {
  const C = 16 / 10,
    A = plan.ar,
    pad = 0.35;
  let [l, t, w, h] = box;
  let rw = w * (1 + pad * 2),
    rh = h * (1 + pad * 2);
  if ((rw * A) / rh < C) rw = (C * rh) / A;
  else rh = (rw * A) / C;
  const rl = clamp(l + w / 2 - rw / 2, 0, Math.max(0, 100 - rw)),
    rt = clamp(t + h / 2 - rh / 2, 0, Math.max(0, 100 - rh));
  const k = 100 / rw; // image width as a multiple of the frame width
  const cropVars = {
    "--layout-width": `${k * 100}%`,
    "--layout-left": `${-rl * k}%`,
    "--layout-top": `${(-rt * C * 100) / (rw * A)}%`,
  };
  return (
    <figure className="crop">
      <div className="crop-img ![width:var(--layout-width)] ![left:var(--layout-left)] ![top:var(--layout-top)]" ref={layoutVars(cropVars)}>
        <img src={plan.src} alt="" />
        <i className="![left:var(--layout-left)] ![top:var(--layout-top)] ![width:var(--layout-width)] ![height:var(--layout-height)]"
          ref={layoutVars({ "--layout-left": `${l}%`, "--layout-top": `${t}%`, "--layout-width": `${w}%`, "--layout-height": `${h}%` })}
        />
      </div>
      <figcaption>{label} · from the architect's plan</figcaption>
    </figure>
  );
}

/** true while the media query matches (client only, so the first render already has the right answer) */
function useMedia(q) {
  const [m, setM] = useState(() => typeof window !== "undefined" && window.matchMedia(q).matches);
  useEffect(() => {
    const mq = window.matchMedia(q);
    const on = () => setM(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [q]);
  return m;
}

export default function FloorPlans({ onAskAbout }) {
  const lenis = useLenis();
  const [floorK, setFloorK] = useState("F");
  const [onlyBal, setOnlyBal] = useState(false);
  const [cur, setCur] = useState("01");
  const tabs = useRef(null);
  const firstTabScroll = useRef(true);
  // phones & tablets: the levels are an accordion (one level open at a time) instead of a swipe strip
  const acc = useMedia("(max-width: 1023px)");
  const [openK, setOpenK] = useState("F");
  const accScroll = useRef(null);

  // On phones/tablets the level tabs are a swipe strip that starts at "Basement". Bring the
  // selected tab into view (sideways only, the page itself never moves).
  useEffect(() => {
    const strip = tabs.current;
    const el = strip?.querySelector('[aria-selected="true"]');
    if (!strip || !el || strip.scrollWidth <= strip.clientWidth) return;
    const sr = strip.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    strip.scrollTo({
      left: strip.scrollLeft + (er.left - sr.left) - (sr.width - er.width) / 2,
      behavior: firstTabScroll.current ? "auto" : "smooth",
    });
    firstTabScroll.current = false;
  }, [floorK]);

  const floor = FLOORS.find((f) => f.k === floorK);
  const plan = PLANS[floorK];
  const items = useMemo(() => {
    if (floor.kind === "spaces") return SPACES;
    if (floor.kind === "homes")
      return UNITS.filter((u) => u.floor === floorK && (!onlyBal || u.bal));
    return [];
  }, [floor, floorK, onlyBal]);
  const sel = items.find((u) => u.id === cur) ?? items[0];

  const pickFloor = (k) => {
    setFloorK(k);
    setOnlyBal(false);
    const f = FLOORS.find((x) => x.k === k);
    const first =
      f.kind === "spaces" ? SPACES[0] : UNITS.find((u) => u.floor === k);
    if (first) setCur(first.id);
  };

  const toggleLevel = (k) => {
    if (openK === k) {
      setOpenK(null);
      return;
    }
    pickFloor(k);
    setOpenK(k);
    accScroll.current = k;
  };
  // once the new level has opened (and the old one closed) bring its header just under the nav pill
  useEffect(() => {
    const k = accScroll.current;
    if (!k || openK !== k) return;
    accScroll.current = null;
    const el = document.getElementById(`facc-${k}`);
    if (!el) return;
    const t = setTimeout(() => {
      if (lenis) lenis.scrollTo(el, { offset: -84, duration: 0.9 });
      else el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
    return () => clearTimeout(t);
  }, [openK, lenis]);

  const isHome = floor.kind === "homes";
  const short = (u) => u.id; // label on the plan & chips
  const homeName = (u) => `Studio ${u.id}`;
  const nameOf = (it) =>
    isHome ? `${homeName(it)}, ${it.carpet} sq ft carpet area` : it.name;
  const badge = floorK === "F" ? "Floors 1 – 3" : floor.name;

  const ask = (e, what) => {
    e.preventDefault();
    onAskAbout(what);
  };

  const tabsEl = (

        <div
          className="ftabs rv"
          role="tablist"
          aria-label="Choose a level"
          ref={tabs}
        >
          {FLOORS.map((f) => (
            <button
              key={f.k}
              role="tab"
              id={`ftab-${f.k}`}
              aria-controls="fpanel"
              aria-selected={f.k === floorK}
              className="ftab"
              onClick={() => pickFloor(f.k)}
            >
              <span className="ftab-i">{ICONS[f.icon]}</span>
              <span className="ftab-t">
                <b>{f.name}</b>
                <small>{f.sub}</small>
              </span>
            </button>
          ))}
        </div>

  );
  const panel = (
<div
          className="plans-grid"
          id="fpanel"
          role="tabpanel"
          aria-labelledby={`ftab-${floorK}`}
        >
          {/* left: the drawing */}
          <div className="plan-board">
            <div className="pb-head">
              <h3>{floor.title}</h3>
              <span className="pb-pill">{floor.pill}</span>
              {floorK === "F" && (
                <button
                  type="button"
                  className="switch"
                  role="switch"
                  aria-checked={onlyBal}
                  onClick={() => setOnlyBal((v) => !v)}
                >
                  Only homes with a balcony <i aria-hidden="true" />
                </button>
              )}
            </div>

            {plan ? (
              <>
                <PlanViewer
                  key={floorK}
                  plan={plan}
                  items={items}
                  selId={sel?.id}
                  onPick={setCur}
                  labelOf={(it) =>
                    isHome
                      ? short(it)
                      : String(SPACES.indexOf(it) + 1).padStart(2, "0")
                  }
                  nameOf={nameOf}
                />
                <p className="plan-cap">
                  <span>{plan.cap}</span>
                  <span>
                    {floor.kind === "info"
                      ? "Layout is indicative"
                      : "Highlights are indicative"}
                  </span>
                </p>
                {floor.kind !== "info" && (
                  <div className="pick">
                    <span className="pick-l">
                      {isHome ? "Select a home" : "Select a space"}
                    </span>
                    <div className={`pick-list${isHome ? "" : " wide"}`}>
                      {items.map((it, i) => (
                        <button
                          key={it.id}
                          type="button"
                          aria-pressed={it.id === sel?.id}
                          aria-label={nameOf(it)}
                          onClick={() => setCur(it.id)}
                        >
                          {isHome ? (
                            short(it)
                          ) : (
                            <>
                              <em>{String(i + 1).padStart(2, "0")}</em>
                              {it.name}
                            </>
                          )}
                        </button>
                      ))}
                      {isHome && items.length === 0 && (
                        <span className="pick-none">
                          No homes match this filter.
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="plan-soon">
                <div className="soon-art" aria-hidden="true">
                  {ICONS[floor.icon]}
                </div>
                <div className="soon-copy">
                  <b>Detailed plan shared on your visit</b>
                  <p>{floor.text}</p>
                  <div className="chips">
                    {floor.chips.map((c) => {
                      const t = Array.isArray(c) ? c[0] : c
                      return <span key={t}>{t}</span>
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* right: details */}
          <aside className="spec" aria-live="polite">
            {isHome && sel && (
              <>
                <div className="k">
                  <h3>{homeName(sel)}</h3>
                  <span className="fbadge">
                    {ICONS.layers}
                    {badge}
                  </span>
                </div>
                <p className="spec-lead">
                  A well-planned studio with an attached toilet, kitchenette
                  {sel.bal ? " and its own balcony." : " and AC provision."}
                  <small>
                    {sel.floor === "G"
                      ? "One home on the ground floor."
                      : "Three homes, one on each of floors 1, 2 and 3."}
                  </small>
                </p>
                <dl>
                  <div>
                    <dt>Carpet area (RERA)</dt>
                    <dd>
                      {sel.carpet} <small>sq ft</small>
                    </dd>
                  </div>
                  <div>
                    <dt>Super built-up area</dt>
                    <dd>
                      {sel.sba.toLocaleString("en-IN")} <small>sq ft</small>
                    </dd>
                  </div>
                  <div>
                    <dt>Studio size</dt>
                    <dd>{sel.size}</dd>
                  </div>
                  <div>
                    <dt>Balcony</dt>
                    <dd>{sel.bal || <span className="muted">None</span>}</dd>
                  </div>
                </dl>
                <PlanCrop
                  key={`${floorK}-${sel.id}`}
                  plan={plan}
                  box={sel.box}
                  label={homeName(sel)}
                />
                <a
                  className="btn spec-cta"
                  href="#visit"
                  onClick={(e) => ask(e, `home ${unitLabel(sel)}`)}
                >
                  Enquire about {homeName(sel)} <span className="arr">→</span>
                </a>
              </>
            )}

            {floor.kind === "spaces" && sel && (
              <>
                <div className="k">
                  <h3>{sel.name}</h3>
                  <span className="fbadge">
                    {ICONS.dine}
                    {badge}
                  </span>
                </div>
                <p className="spec-lead">{sel.text}</p>
                <dl>
                  <div>
                    <dt>Where</dt>
                    <dd>{sel.where}</dd>
                  </div>
                  <div>
                    <dt>As drawn</dt>
                    <dd>{sel.drawn}</dd>
                  </div>
                  <div>
                    <dt>Level</dt>
                    <dd>Fourth floor</dd>
                  </div>
                  <div>
                    <dt>Lift access</dt>
                    <dd>Both lifts</dd>
                  </div>
                </dl>
                <PlanCrop
                  key={`${floorK}-${sel.id}`}
                  plan={plan}
                  box={sel.box}
                  label={sel.name}
                />
                <a
                  className="btn spec-cta"
                  href="#visit"
                  onClick={(e) =>
                    ask(e, `the fourth floor (${sel.name.toLowerCase()})`)
                  }
                >
                  Enquire about the fourth floor <span className="arr">→</span>
                </a>
              </>
            )}

            {floor.kind === "info" && (
              <>
                <div className="k">
                  <h3>{floor.name}</h3>
                  <span className="fbadge">
                    {ICONS[floor.icon]}
                    {floor.pill}
                  </span>
                </div>
                <p className="spec-lead">{floor.text}</p>
                <ul className="spec-list">
                  {floor.chips.map((c) =>
                    Array.isArray(c) ? (
                      <li key={c[0]} className="two">{c[0]}<small>{c[1]}</small></li>
                    ) : (
                      <li key={c}>{c}</li>
                    ),
                  )}
                </ul>
                <p className="note">
                  We'll walk you through this level in person when you visit.
                </p>
                <a
                  className="btn spec-cta"
                  href="#visit"
                  onClick={(e) => ask(e, `the ${floor.name.toLowerCase()}`)}
                >
                  Enquire about the {floor.name.toLowerCase()}{" "}
                  <span className="arr">→</span>
                </a>
              </>
            )}
          </aside>
        </div>
  );

  return (
    <section className="plans sec" id="plans">
      <div className="wrap">
        <Kicker className="rv">INSIDE FREEDOM LIVING</Kicker>
        <h2 className="h2 rv">
          Explore Freedom Living,{" "}
          <span className="hl-red">floor by floor.</span>
        </h2>
        <Dash />
        <p className="lead rv ![margin-top:30px]" >
          Freedom Living brings together 42 studio apartments, dining,
          recreation, and dedicated care facilities. Select a floor to explore
          its spaces, features, and apartment layouts.
        </p>

        {acc ? (
          <div className="facc">
            {[...FLOORS].reverse().map((f) => {
              const open = openK === f.k;
              const thumb = PLANS[f.k]?.src;
              return (
                <div key={f.k} className={`facc-item${open ? " open" : ""}`} id={`facc-${f.k}`}>
                  <button
                    type="button"
                    id={`ftab-${f.k}`}
                    className="facc-h"
                    aria-expanded={open}
                    aria-controls={open ? "fpanel" : undefined}
                    onClick={() => toggleLevel(f.k)}
                  >
                    <span className="facc-th">
                      {thumb ? <img src={thumb} alt="" loading="lazy" decoding="async" /> : ICONS[f.icon]}
                    </span>
                    <span className="facc-t">
                      <b>{f.name}</b>
                      <small>{f.sub}</small>
                    </span>
                    <i className="facc-pm" aria-hidden="true" />
                  </button>
                  {open && <div className="facc-body">{panel}</div>}
                </div>
              );
            })}
          </div>
        ) : (
          <>
            {tabsEl}
            {panel}
          </>
        )}
      </div>
    </section>
  );
}
