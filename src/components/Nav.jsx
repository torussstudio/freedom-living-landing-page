import { useEffect, useRef, useState } from 'react'
import { Logo } from './Brand.jsx'
import { NAV, CONTACT } from '../data/content.js'
import logoFull from '../assets/img/logo-full.webp'
import { useScrollFrame, useScrollTo } from '../hooks/SmoothScroll.jsx'
import { useModal } from '../hooks/useModal.js'

export default function Nav({ onBook }) {
  const [solid, setSolid] = useState(false)
  const [hide, setHide] = useState(false)
  const [mcta, setMcta] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const { panel, closeBtn, trap } = useModal(open)
  const lastY = useRef(0)
  const heroEnd = useRef(520)
  const scrollTo = useScrollTo()

  // measure the hero once (and when it resizes) instead of on every scroll frame
  useEffect(() => {
    const hero = document.querySelector('.hero')
    const measure = () => { heroEnd.current = (hero?.offsetHeight ?? 600) - 80 }
    measure()
    const ro = hero && typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null
    ro?.observe(hero)
    return () => ro?.disconnect()
  }, [])

  useScrollFrame(() => {
    const y = window.scrollY
    const end = heroEnd.current
    setSolid(y > end)
    if (y > end + 200 && y > lastY.current + 4) setHide(true)
    else if (y < lastY.current - 4) setHide(false)
    lastY.current = y
    setMcta(y > window.innerHeight * 0.9)
  })

  const go = (e, href) => { e.preventDefault(); scrollTo(href) }
  const book = (e) => { e.preventDefault(); onBook ? onBook() : scrollTo('#visit') }

  // mobile menu: Esc closes it; opening it notes which section the reader is in
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])
  useEffect(() => {
    const close = () => window.innerWidth > 980 && setOpen(false)
    window.addEventListener('resize', close)
    return () => window.removeEventListener('resize', close)
  }, [])
  const openMenu = () => {
    let a = -1
    NAV.forEach(([href], i) => {
      const el = document.querySelector(href)
      if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.4) a = i
    })
    setActive(a)
    setOpen(true)
  }
  // close first so the page can scroll again, then travel to the section
  const menuGo = (e, href) => { e.preventDefault(); setOpen(false); setTimeout(() => scrollTo(href), 80) }
  const menuBook = (e) => { e.preventDefault(); setOpen(false); setTimeout(() => (onBook ? onBook() : scrollTo('#visit')), 200) }

  return (
    <>
      <header className={`nav${solid ? ' solid' : ''}${hide ? ' hide' : ''}`}>
        <div className="wrap">
          <a className="nav-brand" href="#top" aria-label="Freedom Living, back to top" onClick={(e) => go(e, '#top')}>
            <Logo />
            {/* full-colour logo (same as footer) once the bar turns solid */}
            <img className="nav-logo-full" src={logoFull} alt="" aria-hidden="true" width="900" height="245" decoding="async" />
          </a>
          <ul>
            {NAV.map(([href, label]) => (
              <li key={href}><a href={href} onClick={(e) => go(e, href)}>{label}</a></li>
            ))}
          </ul>
          <a className="btn nav-book" href="#visit" onClick={book}>Book a visit <span className="arr">→</span></a>
          <button type="button" className="mbtn" aria-label="Open menu" aria-expanded={open} aria-controls="mnav" onClick={openMenu}>
            <span className="mbtn-i" aria-hidden="true"><i /><i /></span>
          </button>
        </div>
      </header>
      <div
        id="mnav"
        className={`mnav${open ? ' open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        aria-hidden={!open}
        inert={open ? undefined : ''}
        ref={panel}
        data-lenis-prevent
        onKeyDown={trap}
      >
        <div className="mnav-sun" aria-hidden="true" />
        <span className="bird mnav-bird" aria-hidden="true" />
        <div className="mnav-bar">
          <Logo />
          <button type="button" className="mnav-x" ref={closeBtn} aria-label="Close menu" onClick={() => setOpen(false)}>
            <span aria-hidden="true"><i /><i /></span>
          </button>
        </div>
        <ol className="mnav-list">
          {NAV.map(([href, label], i) => (
            <li key={href} style={{ '--i': i }} className={i === active ? 'on' : undefined}>
              <a href={href} onClick={(e) => menuGo(e, href)}>
                <small>{String(i + 1).padStart(2, '0')}</small>
                <span>{label}</span>
              </a>
            </li>
          ))}
        </ol>
        <div className="mnav-foot" style={{ '--i': NAV.length }}>
          <a className="mnav-book" href="#visit" onClick={menuBook}>Book a visit <span aria-hidden="true">→</span></a>
          <a className="mnav-call" href={`tel:${CONTACT.phone.replace(/\s/g, '')}`} aria-label={`Call ${CONTACT.phone}`}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" /></svg>
          </a>
        </div>
      </div>
      <div className={`mcta${mcta ? ' show' : ''}`}>
        <a className="btn ghost" href="#plans" onClick={(e) => go(e, '#plans')}>Floor plans</a>
        <a className="btn" href="#visit" onClick={book}>Book a visit</a>
      </div>
    </>
  )
}
