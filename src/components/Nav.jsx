import { useRef, useState } from 'react'
import { Logo } from './Brand.jsx'
import { NAV } from '../data/content.js'
import logoFull from '../assets/img/logo-full.webp'
import { useScrollFrame, useScrollTo } from '../hooks/SmoothScroll.jsx'

export default function Nav() {
  const [solid, setSolid] = useState(false)
  const [hide, setHide] = useState(false)
  const [mcta, setMcta] = useState(false)
  const lastY = useRef(0)
  const scrollTo = useScrollTo()

  useScrollFrame(() => {
    const y = window.scrollY
    const hero = document.querySelector('.hero')
    const heroEnd = (hero?.offsetHeight ?? 600) - 80
    setSolid(y > heroEnd)
    if (y > heroEnd + 200 && y > lastY.current + 4) setHide(true)
    else if (y < lastY.current - 4) setHide(false)
    lastY.current = y
    setMcta(y > window.innerHeight * 0.9)
  })

  const go = (e, href) => { e.preventDefault(); scrollTo(href) }

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
          <a className="btn" href="#visit" onClick={(e) => go(e, '#visit')}>Book a visit <span className="arr">→</span></a>
        </div>
      </header>
      <div className={`mcta${mcta ? ' show' : ''}`}>
        <a className="btn ghost" href="#plans" onClick={(e) => go(e, '#plans')}>Floor plans</a>
        <a className="btn" href="#visit" onClick={(e) => go(e, '#visit')}>Book a visit</a>
      </div>
    </>
  )
}
