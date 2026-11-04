import { useCallback, useEffect, useRef } from 'react'
import { prefersReducedMotion, useScrollFrame } from '../hooks/SmoothScroll.jsx'
import { SLIDES } from '../data/content.js'

/** Pinned horizontal gallery: vertical scroll drives the track sideways (desktop only). */
export default function Gallery() {
  const section = useRef(null)
  const track = useRef(null)
  const bar = useRef(null)
  const pinned = useRef(false)

  /* Fit the whole pinned frame (header + renders + captions + progress bar) inside the
     viewport: measure what the header etc. take, give every render the height that is left,
     then size the scroll distance from the resulting track width. */
  const size = useCallback(() => {
    const s = section.current, t = track.current
    if (!s || !t) return
    const sticky = s.firstElementChild
    pinned.current = window.innerWidth >= 900 && !prefersReducedMotion()
    if (pinned.current) {
      const cs = getComputedStyle(sticky)
      const stickyH = sticky.clientHeight
      const head = sticky.querySelector('.hgal-head').offsetHeight
      const prog = sticky.querySelector('.hgal-progress').offsetHeight
      const cap = t.querySelector('figcaption')
      const capH = cap ? cap.offsetHeight + parseFloat(getComputedStyle(cap).marginTop) : 40
      const gap = parseFloat(cs.rowGap) || 0
      const avail = stickyH - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - head - prog - gap * 2 - capH
      s.style.setProperty('--ph', `${Math.round(Math.min(720, Math.max(180, avail)))}px`)
      const extra = t.scrollWidth - window.innerWidth
      s.style.height = `${stickyH + Math.max(0, extra)}px`
    } else {
      s.style.height = ''
      s.style.removeProperty('--ph')
      t.style.transform = ''
    }
  }, [])

  useEffect(() => {
    size()
    window.addEventListener('resize', size)
    window.addEventListener('load', size)
    document.fonts?.ready.then(size)   // header height changes once the web fonts land
    return () => { window.removeEventListener('resize', size); window.removeEventListener('load', size) }
  }, [size])

  useScrollFrame(() => {
    if (!pinned.current) return
    const s = section.current, t = track.current
    const r = s.getBoundingClientRect()
    const total = s.offsetHeight - s.firstElementChild.clientHeight
    const p = Math.min(1, Math.max(0, -r.top / total))
    t.style.transform = `translate3d(${-p * (t.scrollWidth - window.innerWidth)}px,0,0)`
    bar.current.style.width = `${p * 100}%`
  })

  return (
    <section className="hgal" ref={section} aria-label="Architectural renders">
      <div className="hgal-sticky">
        <div className="wrap hgal-head">
          <div>
            <div className="kicker"><span className="count">05 / 11</span><span>The building</span></div>
            <h2 className="h2">Warm walls, <em>wide balconies.</em></h2>
          </div>
          <p>Architect's renders of Freedom Living from every side. Scroll to walk around the building.</p>
        </div>
        <div className="track" ref={track}>
          {SLIDES.map((s) => (
            <figure className={`slide${s.tall ? ' tall' : ''}`} key={s.title}>
              <div className="ph"><img src={s.src} alt={s.alt} loading="lazy" style={s.pos ? { objectPosition: s.pos } : undefined} onLoad={size} /></div>
              <figcaption><b>{s.title}</b><span>{s.note}</span></figcaption>
            </figure>
          ))}
        </div>
        <div className="wrap"><div className="hgal-progress"><i ref={bar} /></div></div>
      </div>
    </section>
  )
}