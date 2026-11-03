import { useRef } from 'react'
import { Bird } from './Brand.jsx'
import seniors from '../assets/img/seniors.webp'
import { prefersReducedMotion, useScrollFrame, useScrollTo } from '../hooks/SmoothScroll.jsx'

export default function Hero() {
  const img = useRef(null)
  const scrollTo = useScrollTo()

  useScrollFrame(() => {
    if (!img.current || prefersReducedMotion()) return
    const p = Math.min(1, Math.max(0, window.scrollY / window.innerHeight))
    img.current.style.transform = `scale(${1.12 - p * 0.12}) translateY(${p * 30}px)`
  })

  const go = (e, href) => { e.preventDefault(); scrollTo(href) }

  return (
    <section className="hero grad on-grad" aria-labelledby="h1">
      <div className="wm" aria-hidden="true"><Bird /></div>
      <div className="hero-grid">
        <div>
          <div className="kicker rv"><span className="count">Palakkad</span><span>Senior living apartments</span></div>
          <h1 id="h1">
            <span className="lm"><span>Live free.</span></span>
            <span className="lm" style={{ '--d': '.12s' }}><span className="l2">Age gracefully.</span></span>
          </h1>
          <p className="lead rv" style={{ '--d': '.3s' }}>
            Independence when you want it. Support when you need it. Forty-two private studio homes with meals, nursing
            and palliative care under one roof, without moving away from Palakkad and the life you already know.
          </p>
          <div className="hero-cta rv" style={{ '--d': '.45s' }}>
            <a className="btn cream" href="#visit" onClick={(e) => go(e, '#visit')}>Book a visit <span className="arr">→</span></a>
            <a className="btn line" href="#plans" onClick={(e) => go(e, '#plans')}>Explore the homes</a>
          </div>
        </div>

        <div className="arch-wrap rv" style={{ '--d': '.2s' }}>
          <span className="arc-line two" aria-hidden="true" />
          <span className="arc-line" aria-hidden="true" />
          <div className="arch">
            <img ref={img} src={seniors} alt="Four seniors sharing tea and conversation on a garden terrace at sunset" />
          </div>
          <div className="status">Status: <b>Under construction</b></div>
          <div className="seal" aria-hidden="true">
            <svg viewBox="0 0 120 120">
              <defs><path id="circ" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" /></defs>
              <text fontFamily="Quicksand,sans-serif" fontSize="10.5" fontWeight="700" letterSpacing="3.6" fill="currentColor">
                <textPath href="#circ">LIVE FREE · AGE GRACEFULLY · </textPath>
              </text>
            </svg>
            <Bird />
          </div>
        </div>
      </div>

      <div className="hero-stats">
        <div className="wrap">
          <div className="s"><b>42</b><span>Private studio homes</span></div>
          <div className="s"><b>24×7</b><span>Nursing &amp; emergency support</span></div>
          <div className="s"><b>6 + roof</b><span>Levels, plus a rooftop</span></div>
          <div className="s"><b>Dec 2027</b><span>Expected completion</span></div>
        </div>
      </div>
    </section>
  )
}
