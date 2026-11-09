import { setLayoutVars } from "../hooks/layoutVars.js";
import { useEffect, useRef } from 'react'
import { Dash, Kicker } from './Brand.jsx'
import archBuilding from '../assets/img/arch-building.webp'

const Stat = ({ big, unit, label, note, d }) => (
  <div className={`gstat rv${d ? " [--d:.1s]" : ""}`}>
    <div className="gtext">
      <b>{big}{unit && <small>{unit}</small>}</b>
      <span>{label}</span>
      <i>{note}</i>
    </div>
    <span className="conn" aria-hidden="true" />
  </div>
)

export default function Glance() {
  const grid = useRef(null)
  useEffect(() => {
    const g = grid.current
    if (!g) return
    const texts = [...g.querySelectorAll('.gtext')]
    const fit = () => {
      const w = (sel) => Math.max(0, ...[...g.querySelectorAll(sel)].map((t) => t.offsetWidth))
      const lw = w('.gstats.l .gtext'), rw = w('.gstats.r .gtext')
      setLayoutVars(g, { '--tw': `${Math.ceil(Math.max(lw, rw))}px` });
      setLayoutVars(g, { '--bal': `${Math.round((rw - lw) / 2)}px` });
    }
    fit()
    document.fonts?.ready.then(fit)
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(fit)
    texts.forEach((t) => ro.observe(t))
    return () => ro.disconnect()
  }, [])

  return (
    <section className="glance sec" id="building">
      <div className="wrap">
        <div className="glance-head">
          <div>
            <Kicker className="rv">Freedom Living at a glance</Kicker>
            <h2 className="h2 rv">The first <em>Freedom Living</em> community.</h2>
            <Dash />
          </div>
          <div className="pill-status rv">Status: <b>Under construction</b></div>
        </div>
        <div className="glance-grid" ref={grid}>
          <div className="gstats l">
            <Stat big="30" unit="cents" label="Site area" note="On Malampuzha Road, Palakkad" />
            <Stat big="42" label="Studio residences" note="Sizes vary by home" d=".1s" />
          </div>
          <div className="glance-img wipe">
            <img src={archBuilding} alt="Illustration of the Freedom Living building framed by a setting sun" />
          </div>
          <div className="gstats r">
            <Stat big="42,000" unit="sq ft" label="Built-up area" note="Across six levels and a rooftop" />
            <Stat big="Dec. 2027" label="Expected completion" note="Three levels already complete" d=".1s" />
          </div>
        </div>
      </div>
    </section>
  )
}