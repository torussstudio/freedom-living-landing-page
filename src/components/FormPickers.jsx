import { useEffect, useRef, useState } from 'react'

/* Custom date + time pickers for the visit form (replace the native <input type=date> / <select>). */

const Svg = ({ children, size = 20, ...p }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>{children}</svg>
)
const IcoCalendar = (p) => <Svg {...p}><rect x="3.5" y="5" width="17" height="15.5" rx="2.5" /><path d="M3.5 10h17M8 3v4M16 3v4M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01" /></Svg>
const IcoClock = (p) => <Svg {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></Svg>
const IcoChevron = (p) => <Svg strokeWidth="2.2" {...p}><path d="m6.5 9.5 5.5 5.5 5.5-5.5" /></Svg>
const IcoLeft = (p) => <Svg strokeWidth="2.2" {...p}><path d="m14.5 6-6 6 6 6" /></Svg>
const IcoRight = (p) => <Svg strokeWidth="2.2" {...p}><path d="m9.5 6 6 6-6 6" /></Svg>
const IcoCheck = (p) => <Svg strokeWidth="2.4" {...p}><path d="m5 12.5 4.5 4.5L19 7.5" /></Svg>
const IcoSunrise = (p) => <Svg {...p}><path d="M5 17a7 7 0 0 1 14 0M2.5 17h19M12 3.5V7M5.2 8.7l1.6 1.6M18.8 8.7l-1.6 1.6M9 20.5h6" /></Svg>
const IcoSun = (p) => <Svg {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" /></Svg>
const IcoSunset = (p) => <Svg {...p}><path d="M5 17a7 7 0 0 1 14 0M2.5 17h19M12 10V3.5M9 6.5l3 3.5 3-3.5M9 20.5h6" /></Svg>

/* ---------- date helpers (local time, no UTC shifts) ---------- */
const pad = (n) => String(n).padStart(2, '0')
export const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const fromISO = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d) }
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
const sameDay = (a, b) => a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DOW = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const fmtDate = (iso) => { if (!iso) return ''; const d = fromISO(iso); return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getFullYear()}` }

/* close on outside click / Escape */
function useDismiss(ref, open, close) {
  useEffect(() => {
    if (!open) return
    const down = (e) => { if (ref.current && !ref.current.contains(e.target)) close() }
    const key = (e) => { if (e.key === 'Escape') { close(true) } }
    document.addEventListener('pointerdown', down)
    document.addEventListener('keydown', key)
    return () => { document.removeEventListener('pointerdown', down); document.removeEventListener('keydown', key) }
  }, [ref, open, close])
}

/* ======================= Date picker ======================= */
export function DatePicker({ id, value, onChange, min, invalid, placeholder = 'Select a date' }) {
  const wrap = useRef(null)
  const btn = useRef(null)
  const grid = useRef(null)
  const minD = fromISO(min)
  const [open, setOpen] = useState(false)
  const [view, setView] = useState(() => { const d = value ? fromISO(value) : minD; return new Date(d.getFullYear(), d.getMonth(), 1) })
  const [focus, setFocus] = useState(() => (value ? fromISO(value) : minD))

  const close = (refocus) => { setOpen(false); if (refocus === true) btn.current?.focus() }
  useDismiss(wrap, open, close)

  const toggle = () => {
    if (!open) {
      const d = value ? fromISO(value) : minD
      setFocus(d); setView(new Date(d.getFullYear(), d.getMonth(), 1))
    }
    setOpen((o) => !o)
  }

  // keep keyboard focus on the active day while the calendar is open
  useEffect(() => {
    if (open) grid.current?.querySelector(`[data-day="${toISO(focus)}"]`)?.focus({ preventScroll: true })
  }, [open, focus])

  const pick = (d) => { onChange(toISO(d)); close(true) }
  const move = (n) => {
    let d = addDays(focus, n)
    if (d < minD) d = minD
    setFocus(d)
    if (d.getMonth() !== view.getMonth() || d.getFullYear() !== view.getFullYear()) setView(new Date(d.getFullYear(), d.getMonth(), 1))
  }
  const onKey = (e) => {
    const k = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key]
    if (k) { e.preventDefault(); move(k) }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (focus >= minD) pick(focus) }
  }

  const canPrev = view > new Date(minD.getFullYear(), minD.getMonth(), 1)
  const shift = (n) => {
    const v = new Date(view.getFullYear(), view.getMonth() + n, 1)
    setView(v)
    const f = new Date(v.getFullYear(), v.getMonth(), Math.min(focus.getDate(), 28))
    setFocus(f < minD ? minD : f)
  }

  const first = view.getDay()
  const days = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate()
  const cells = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => new Date(view.getFullYear(), view.getMonth(), i + 1))]
  const selected = value ? fromISO(value) : null
  const today = new Date()

  return (
    <div className="fpick" ref={wrap}>
      <button
        ref={btn} id={id} type="button"
        className={`ctl ico date${value ? '' : ' empty'}`}
        aria-haspopup="dialog" aria-expanded={open} aria-invalid={invalid}
        onClick={toggle}
      >
        <IcoCalendar size={22} className="lead-ico" />
        <span className="shown">{value ? fmtDate(value) : placeholder}</span>
        <IcoChevron className="chev" />
      </button>

      {open && (
        <div className="pop cal" role="dialog" aria-label="Choose a visit date">
          <div className="cal-head">
            <button type="button" className="cal-nav" onClick={() => shift(-1)} disabled={!canPrev} aria-label="Previous month"><IcoLeft size={18} /></button>
            <b aria-live="polite">{MONTHS[view.getMonth()]} <span>{view.getFullYear()}</span></b>
            <button type="button" className="cal-nav" onClick={() => shift(1)} aria-label="Next month"><IcoRight size={18} /></button>
          </div>
          <div className="cal-dow" aria-hidden="true">{DOW.map((d) => <span key={d}>{d}</span>)}</div>
          <div className="cal-grid" role="grid" ref={grid} onKeyDown={onKey}>
            {cells.map((d, i) => d ? (
              <button
                key={i} type="button" data-day={toISO(d)}
                className={`cal-day${sameDay(d, today) ? ' today' : ''}`}
                disabled={d < minD}
                aria-selected={sameDay(d, selected)}
                tabIndex={sameDay(d, focus) ? 0 : -1}
                aria-label={d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                onClick={() => pick(d)}
              >{d.getDate()}</button>
            ) : <span key={i} />)}
          </div>
          <p className="cal-note">We'll call to confirm the exact time.</p>
        </div>
      )}
    </div>
  )
}

/* ======================= Time select ======================= */
const SLOTS = [['Morning', IcoSunrise], ['Afternoon', IcoSun], ['Evening', IcoSunset]]

export function TimeSelect({ id, value, onChange }) {
  const wrap = useRef(null)
  const btn = useRef(null)
  const list = useRef(null)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)

  const close = (refocus) => { setOpen(false); if (refocus === true) btn.current?.focus() }
  useDismiss(wrap, open, close)

  const toggle = () => { if (!open) setActive(Math.max(0, SLOTS.findIndex(([v]) => v === value))); setOpen((o) => !o) }
  useEffect(() => { if (open) list.current?.children[active]?.focus({ preventScroll: true }) }, [open, active])

  const pick = (v) => { onChange(v); close(true) }
  const onKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => (a + 1) % SLOTS.length) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => (a - 1 + SLOTS.length) % SLOTS.length) }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(SLOTS[active][0]) }
    else if (e.key === 'Tab') close()
  }
  const onBtnKey = (e) => { if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && !open) { e.preventDefault(); toggle() } }

  return (
    <div className="fpick" ref={wrap}>
      <button
        ref={btn} id={id} type="button" className="ctl ico"
        aria-haspopup="listbox" aria-expanded={open}
        onClick={toggle} onKeyDown={onBtnKey}
      >
        <IcoClock size={22} className="lead-ico" />
        <span className="shown">{value}</span>
        <IcoChevron className="chev" />
      </button>

      {open && (
        <ul className="pop menu" role="listbox" aria-label="Preferred time" ref={list} onKeyDown={onKey}>
          {SLOTS.map(([v, Icon], i) => (
            <li
              key={v} role="option" tabIndex={-1}
              aria-selected={v === value}
              className={i === active ? 'on' : ''}
              onMouseEnter={() => setActive(i)}
              onClick={() => pick(v)}
            >
              <Icon size={22} /> <span>{v}</span> {v === value && <IcoCheck size={18} className="tick" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
