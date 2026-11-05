import { useRef, useState } from 'react'
import { Dash } from './Brand.jsx'
import { LEVELS } from '../data/content.js'
import { useScrollFrame } from '../hooks/SmoothScroll.jsx'

/* One line icon per level, keyed by the level code in content.js (R, 4, 1–3, G, B).
   24×24, stroke = currentColor, so the badge colour drives them. */
const ico = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }
const LEVEL_ICONS = {
  // Rooftop: open sky, a sun on the horizon
  R: (
    <svg {...ico}>
      <path d="M3 17h18M6 20.5h12" />
      <path d="M7.5 17a4.5 4.5 0 0 1 9 0" />
      <path d="M12 7.5v2M5.6 10.4l1.4 1.4M18.4 10.4 17 11.8M2.8 13.6h1.8M19.4 13.6h1.8" />
    </svg>
  ),
  // Fourth floor: dining, a plate with fork and knife
  4: (
    <svg {...ico}>
      <circle cx="12" cy="12.5" r="4.6" />
      <circle cx="12" cy="12.5" r="2.2" />
      <path d="M3 3.5v4a1.5 1.5 0 0 0 3 0v-4M4.5 9v11.5" />
      <path d="M21 3.5c-1.6.8-2.4 2.8-2.4 5.6V12h2.4v8.5" />
    </svg>
  ),
  // Floors one to three: private homes
  '1–3': (
    <svg {...ico}>
      <path d="M3 11 12 4l9 7" />
      <path d="M5.5 9.3V20h13V9.3" />
      <path d="M10 20v-5.2h4V20" />
    </svg>
  ),
  // Ground floor: where care lives, a heart with a medical cross
  G: (
    <svg {...ico}>
      <path d="M12 20.2s-7.5-4.6-7.5-10.4A4.1 4.1 0 0 1 12 7.4a4.1 4.1 0 0 1 7.5 2.4c0 5.8-7.5 10.4-7.5 10.4Z" />
      <path d="M12 10.2v5.2M9.4 12.8h5.2" />
    </svg>
  ),
  // Basement: arrivals and parking, a car
  B: (
    <svg {...ico}>
      <path d="M5.2 17H3.5v-4l2-5.2h13l2 5.2v4h-1.7" />
      <path d="M9.4 17h5.2M3.8 12.6h16.4" />
      <circle cx="7.3" cy="17" r="2" />
      <circle cx="16.7" cy="17" r="2" />
    </svg>
  ),
}

export default function Levels() {
  const list = useRef(null)
  const [active, setActive] = useState(-1)

  /* The rail runs from the centre of the first dot to the centre of the last dot (nothing below it).
     The red fill follows a trigger line at 60% of the screen and reaches each dot exactly as that
     dot switches on, so it stops on the last dot instead of running to the end of the list. */
  useScrollFrame(() => {
    const el = list.current
    if (!el) return
    const nodes = el.querySelectorAll(':scope > li > .node')
    if (!nodes.length) return
    const vh = window.innerHeight
    const trigger = vh * 0.6
    const top = el.getBoundingClientRect().top
    const centre = (n) => { const r = n.getBoundingClientRect(); return r.top + r.height / 2 }
    const first = centre(nodes[0])
    const last = centre(nodes[nodes.length - 1])
    const len = Math.max(0, last - first)
    const fill = Math.min(len, Math.max(0, trigger - first))
    el.style.setProperty('--t0', `${first - top}px`)
    el.style.setProperty('--len', `${len}px`)
    el.style.setProperty('--fill', `${fill}px`)
    let a = -1
    nodes.forEach((n, i) => { if (centre(n) <= trigger) a = i })
    setActive((prev) => (prev === a ? prev : a))
  })

  return (
    <section className="levels" aria-labelledby="lvh">
      <div className="lv-left grad on-grad">
        <div className="in-stick">
          <div className="kicker"><span>Level by level</span></div>
          <h2 className="h2" id="lvh">One address. A whole life, stacked gently.</h2>
          <Dash />
          <p className="lead">Homes in the middle, food and friends above, care at the front door, and the sky on the roof.</p>
          <div className="lift">
            <b>Lifts to every level</b>
            <span>A passenger lift from basement to rooftop and a stretcher lift from the ground floor up, both with automatic rescue devices. Two staircases connect every level.</span>
          </div>
        </div>
      </div>
      <div className="lv-right">
        <ol className="tl" ref={list}>
          {LEVELS.map((l, i) => (
            <li key={l.k} className={i <= active ? 'on' : undefined}>
              <span className="node" />
              <div className="lvl"><span className="lv-ico">{LEVEL_ICONS[l.k]}</span><h3>{l.name}</h3></div>
              <p>{l.text}</p>
              <div className="chips">{l.chips.map((c) => <span key={c}>{c}</span>)}</div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}