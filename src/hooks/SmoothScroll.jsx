import { createContext, useContext, useEffect, useRef, useState } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const LenisCtx = createContext(null)
export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Lenis smooth scrolling for the whole page. Skipped for reduced-motion users.
 *  Lenis is driven by the GSAP ticker so ScrollTrigger animations stay in sync with it. */
export function SmoothScroll({ children }) {
  const [lenis, setLenis] = useState(null)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const l = new Lenis({
      lerp: 0.085,          // lower = floatier
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.4,
    })
    l.on('scroll', ScrollTrigger.update)
    const tick = (time) => l.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    setLenis(l)
    return () => { gsap.ticker.remove(tick); l.destroy(); setLenis(null) }
  }, [])

  return <LenisCtx.Provider value={lenis}>{children}</LenisCtx.Provider>
}

export const useLenis = () => useContext(LenisCtx)

/** Smoothly scroll to a selector/element, with an offset for the fixed nav. */
export function useScrollTo() {
  const lenis = useLenis()
  return (target, offset = -70) => {
    const el = typeof target === 'string' ? document.querySelector(target) : target
    if (!el) return
    if (lenis) lenis.scrollTo(el, { offset, duration: 1.6 })
    else el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  }
}

/** Run `fn` on every scroll frame (Lenis-driven when available) and on resize. */
export function useScrollFrame(fn) {
  const lenis = useLenis()
  const ref = useRef(fn)
  ref.current = fn
  useEffect(() => {
    let ticking = false
    const run = () => ref.current()
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => { run(); ticking = false })
    }
    if (lenis) lenis.on('scroll', run)
    else window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', run)
    window.addEventListener('load', run)
    run()
    return () => {
      if (lenis) lenis.off('scroll', run)
      else window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', run)
      window.removeEventListener('load', run)
    }
  }, [lenis])
}
