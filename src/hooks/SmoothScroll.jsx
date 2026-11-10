import { createContext, useContext, useEffect, useRef, useState } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const LenisCtx = createContext(null)
const BusCtx = createContext(null)

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * One scroll bus for the whole page. Components subscribe with `useScrollFrame`; the bus owns
 * the only scroll / resize / load listeners and runs every subscriber in a single pass, instead
 * of each component attaching (and re-attaching) its own.
 */
function createBus() {
  const subs = new Set()
  const run = () => subs.forEach((fn) => fn())
  let raf = 0
  const onNativeScroll = () => {
    if (raf) return
    raf = requestAnimationFrame(() => { raf = 0; run() })
  }
  return {
    subscribe(fn) {
      subs.add(fn)
      fn()
      return () => subs.delete(fn)
    },
    /** Hook the bus up to Lenis when it exists, to plain scrolling otherwise. */
    attach(lenis) {
      if (lenis) lenis.on('scroll', run)
      else window.addEventListener('scroll', onNativeScroll, { passive: true })
      window.addEventListener('resize', run)
      window.addEventListener('load', run)
      run()
      return () => {
        if (lenis) lenis.off('scroll', run)
        else window.removeEventListener('scroll', onNativeScroll)
        window.removeEventListener('resize', run)
        window.removeEventListener('load', run)
        cancelAnimationFrame(raf)
        raf = 0
      }
    },
  }
}

/** Lenis smooth scrolling for the whole page. Skipped for reduced-motion users.
 *  Lenis is driven by the GSAP ticker so ScrollTrigger animations stay in sync with it. */
export function SmoothScroll({ children }) {
  const [lenis, setLenis] = useState(null)
  const bus = useRef(null)
  if (!bus.current) bus.current = createBus()

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

  useEffect(() => bus.current.attach(lenis), [lenis])

  return (
    <BusCtx.Provider value={bus.current}>
      <LenisCtx.Provider value={lenis}>{children}</LenisCtx.Provider>
    </BusCtx.Provider>
  )
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

/** Run `fn` on every scroll frame (Lenis-driven when available) and on resize / load. */
export function useScrollFrame(fn) {
  const bus = useContext(BusCtx)
  const ref = useRef(fn)
  ref.current = fn
  useEffect(() => bus.subscribe(() => ref.current()), [bus])
}
