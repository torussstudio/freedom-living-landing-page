import { useRef, useState } from 'react'
import { Dash } from './Brand.jsx'
import { LEVELS } from '../data/content.js'
import { useScrollFrame } from '../hooks/SmoothScroll.jsx'

export default function Levels() {
  const list = useRef(null)
  const [fill, setFill] = useState(0)
  const [active, setActive] = useState(-1)

  useScrollFrame(() => {
    const el = list.current
    if (!el) return
    const vh = window.innerHeight
    const r = el.getBoundingClientRect()
    setFill(Math.min(1, Math.max(0, (vh * 0.6 - r.top) / r.height)))
    let a = -1
    el.querySelectorAll(':scope > li').forEach((li, i) => { if (li.getBoundingClientRect().top < vh * 0.6) a = i })
    setActive(a)
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
        <ol className="tl" ref={list} style={{ '--h': `${fill * 100}%` }}>
          {LEVELS.map((l, i) => (
            <li key={l.k} className={i <= active ? 'on' : undefined}>
              <span className="node" />
              <div className="lvl"><b>{l.k}</b><h3>{l.name}</h3></div>
              <p>{l.text}</p>
              <div className="chips">{l.chips.map((c) => <span key={c}>{c}</span>)}</div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}