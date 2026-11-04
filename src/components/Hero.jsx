import { useCallback, useEffect, useRef, useState } from 'react'
import { Bird } from './Brand.jsx'
import seniors from '../assets/img/seniors.webp'
import { prefersReducedMotion, useLenis, useScrollFrame, useScrollTo } from '../hooks/SmoothScroll.jsx'

/* ───────────────────────────── YOUR FILM ─────────────────────────────
   Drop the video into /public/videos/ and it plays automatically.
     hero.mp4   (H.264, required)      hero.webm (optional, smaller on Chrome/Firefox)
   Tips: 16:9, 1920×1080, 8–20 seconds, loops seamlessly, no audio needed
   (it autoplays muted; visitors can switch sound on), under ~8 MB.
   Until the file exists the poster image below is shown instead.            */
const FILM = {
  mp4: '/videos/hero.mp4',
  webm: '/videos/hero.webm',
  poster: seniors,
}

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const lerp = (a, b, t) => a + (b - a) * t
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

const PlayIcon = () => <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" /></svg>
const PauseIcon = () => <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><rect x="6" y="5" width="4.2" height="14" rx="1.2" /><rect x="13.8" y="5" width="4.2" height="14" rx="1.2" /></svg>
const SoundOn = () => <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4Z" fill="currentColor" /><path d="M15.5 9a4.2 4.2 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11" /></svg>
const SoundOff = () => <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4Z" fill="currentColor" /><path d="m16 9.5 5 5M21 9.5l-5 5" /></svg>

export default function Hero() {
  const lenis = useLenis()
  const scrollTo = useScrollTo()
  const pin = useRef(null)
  const stage = useRef(null)
  const slot = useRef(null)
  const film = useRef(null)
  const vid = useRef(null)
  const intro = useRef(0)
  const userPaused = useRef(false)
  const reduced = useRef(prefersReducedMotion())
  const [go, setGo] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)

  /* One function drives everything: where the film sits (inline pill → full screen),
     how much the headline fades, and when the controls appear. */
  const update = useCallback(() => {
    const P = pin.current, S = stage.current, sl = slot.current, f = film.current, v = vid.current
    if (!P || !S || !sl || !f) return
    const sr = S.getBoundingClientRect()
    const pb = P.getBoundingClientRect()
    const W = sr.width, H = sr.height
    const still = reduced.current
    const run = Math.max(1, P.offsetHeight - H)
    const p = still ? 0 : clamp(-pb.top / (run * 0.8))   // last 20% of the runway holds the full-screen film
    const e = ease(p)

    S.style.setProperty('--t', String(1 - clamp((p - 0.03) / 0.3)))
    S.style.setProperty('--ui', String(clamp((p - 0.82) / 0.18)))
    S.style.setProperty('--p', p.toFixed(3))
    const ui = p > 0.82 ? '1' : '0'
    if (S.dataset.ui !== ui) S.dataset.ui = ui
    const pinned = pb.top <= 0 && pb.bottom > H ? 'on' : 'off'
    if (document.documentElement.dataset.heroPin !== pinned) document.documentElement.dataset.heroPin = pinned

    if (!still) {
      const pr = sl.getBoundingClientRect()
      const k = intro.current
      const bw = pr.width * k, bh = pr.height * k
      const bx = pr.left - sr.left + (pr.width - bw) / 2
      const by = pr.top - sr.top + (pr.height - bh) / 2
      f.style.left = `${lerp(bx, 0, e)}px`
      f.style.top = `${lerp(by, 0, e)}px`
      f.style.width = `${lerp(bw, W, e)}px`
      f.style.height = `${lerp(bh, H, e)}px`
      f.style.borderRadius = `${lerp(bh / 2, 0, e)}px`

      // save battery: pause the film once the hero is well out of view
      if (v) {
        const away = pb.bottom < -40 || pb.top > window.innerHeight + 40
        if (away && !v.paused) v.pause()
        else if (!away && v.paused && !userPaused.current) v.play().catch(() => {})
      }
    }
  }, [])

  useScrollFrame(update)

  useEffect(() => {
    const v = vid.current
    if (v) v.muted = true
    const t = setTimeout(() => setGo(true), 80)
    let raf
    if (reduced.current) {
      intro.current = 1
      update()
    } else {
      const start = performance.now() + 650
      const tick = (now) => {
        const k = clamp((now - start) / 1400)
        intro.current = 1 - Math.pow(1 - k, 4)
        update()
        if (k < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }
    document.fonts?.ready.then(update)   // headline width shifts once the web fonts land
    return () => {
      clearTimeout(t)
      cancelAnimationFrame(raf)
      delete document.documentElement.dataset.heroPin
    }
  }, [update])

  const go2 = (e, href) => { e.preventDefault(); scrollTo(href) }

  // the round "scroll to watch" button: glide to the point where the film is full screen
  const watch = () => {
    const P = pin.current, S = stage.current
    if (!P || !S) return
    const y = window.scrollY + P.getBoundingClientRect().top + (P.offsetHeight - S.offsetHeight) * 0.8
    if (lenis) lenis.scrollTo(y, { duration: 2.2 })
    else window.scrollTo({ top: y, behavior: 'smooth' })
  }

  const togglePlay = () => {
    const v = vid.current
    if (!v) return
    if (v.paused) { userPaused.current = false; v.play().catch(() => {}) }
    else { userPaused.current = true; v.pause() }
  }
  const toggleSound = () => { const v = vid.current; if (v) v.muted = !v.muted }

  const rm = reduced.current

  return (
    <section className={`hero grad on-grad${rm ? ' rm' : ''}${go ? ' go' : ''}`} aria-labelledby="h1">
      <div className="hero-pin" ref={pin}>
        <div className="hero-stage" ref={stage} data-ui="0">
          <div className="wm" aria-hidden="true"><Bird /></div>

          <div className="hero-copy">
            <div className="hero-top">
              <div className="kicker rv"><span className="count">Palakkad</span><span>Senior living apartments</span></div>
              <div className="h-status rv" style={{ '--d': '.15s' }}><i aria-hidden="true" />Status: <b>Under construction</b></div>
            </div>

            <h1 id="h1" aria-label="Live free. Age gracefully.">
              <span className="hl" aria-hidden="true">
                <span className="hw"><span style={{ '--d': '.05s' }}>Live</span></span>{' '}
                <span className="slot" ref={slot} />{' '}
                <span className="hw"><span style={{ '--d': '.2s' }}>free.</span></span>
              </span>
              <span className="hl l2" aria-hidden="true">
                <span className="hw"><span style={{ '--d': '.34s' }}>Age</span></span>{' '}
                <span className="hw"><span style={{ '--d': '.46s' }}>gracefully.</span></span>
              </span>
            </h1>

            <div className="hero-bottom">
              <div>
                <p className="lead rv" style={{ '--d': '.5s' }}>
                  Independence when you want it. Support when you need it. Forty-two private studio homes with meals, nursing
                  and palliative care under one roof, without moving away from Palakkad and the life you already know.
                </p>
                <div className="hero-cta rv" style={{ '--d': '.62s' }}>
                  <a className="btn cream" href="#visit" onClick={(e) => go2(e, '#visit')}>Book a visit <span className="arr">→</span></a>
                  <a className="btn line" href="#plans" onClick={(e) => go2(e, '#plans')}>Explore the homes</a>
                </div>
              </div>
              {!rm && (
                <button type="button" className="cue rv" style={{ '--d': '.75s' }} onClick={watch} aria-label="Scroll to watch the film">
                  <svg className="cue-ring" viewBox="0 0 120 120" aria-hidden="true">
                    <defs><path id="cue-circ" d="M60,60 m-47,0 a47,47 0 1,1 94,0 a47,47 0 1,1 -94,0" /></defs>
                    <text fontFamily="Quicksand,sans-serif" fontSize="10.5" fontWeight="700" letterSpacing="3.4" fill="currentColor">
                      <textPath href="#cue-circ">SCROLL TO WATCH · THE FILM · </textPath>
                    </text>
                  </svg>
                  <svg className="cue-arr" viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 4v15M6 13.5l6 6 6-6" /></svg>
                </button>
              )}
            </div>
          </div>

          {/* the film: starts as the pill inside the headline, grows to full screen on scroll */}
          <div className="film" ref={film}>
            <video
              ref={vid}
              muted
              loop
              playsInline
              autoPlay={!rm}
              controls={rm}
              preload="auto"
              poster={FILM.poster}
              disablePictureInPicture
              aria-label="Film: life at Freedom Living"
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onVolumeChange={(e) => setMuted(e.currentTarget.muted)}
            >
              <source src={FILM.mp4} type="video/mp4" />
              <source src={FILM.webm} type="video/webm" />
            </video>
            {!rm && (
              <div className="film-ui">
                <button type="button" className="fbtn" onClick={togglePlay} aria-label={playing ? 'Pause film' : 'Play film'}>{playing ? <PauseIcon /> : <PlayIcon />}</button>
                <button type="button" className="fbtn" onClick={toggleSound} aria-label={muted ? 'Turn sound on' : 'Turn sound off'}>{muted ? <SoundOff /> : <SoundOn />}</button>
              </div>
            )}
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