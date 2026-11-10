import { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { prefersReducedMotion } from './SmoothScroll.jsx'

gsap.registerPlugin(ScrollTrigger, SplitText)

const EXPO = 'expo.out'
const q = (sel) => [...document.querySelectorAll(sel)]

/**
 * "Heavy" text + scroll animations for the 5 priority spots:
 *   1. Hero headline + lead paragraph
 *   2. Idea section: scroll-scrubbed headline, photo zoom, pillar icons drawing themselves
 *   3. Glance: heading mask, building iris reveal, stats slide-in + connector lines
 *   4. Gallery: heading mask + inner image parallax
 *   5. Footer: tagline + logo reveal
 * Everything is selector-based, so no component needs editing. Skipped for reduced-motion users.
 */
export function useHeavyFx() {
  useEffect(() => {
    if (prefersReducedMotion()) return

    const isMobile = window.matchMedia('(max-width: 768px)').matches
    const restore = [] // things GSAP can't revert on its own
    const html = document.documentElement
    html.classList.add('fx')

    /* masked line-by-line rise (re-splits itself on resize / font load) */
    const lines = (els, { stagger = 0.12, duration = 1.5, start = 'top 88%' } = {}) =>
      els.forEach((el) => {
        el.classList.remove('rv') // the old fade-up would fight with this
        let played = false // a re-split (font load / resize) must not replay a finished reveal
        SplitText.create(el, {
          type: 'lines',
          mask: 'lines',
          maskClass: 'fx-mask',
          autoSplit: true,
          onSplit(self) {
            if (played) return
            return gsap.from(self.lines, {
              yPercent: 112,
              duration,
              ease: EXPO,
              stagger,
              onComplete: () => { played = true },
              scrollTrigger: { trigger: el, start, once: true },
            })
          },
        })
      })

    /* words go from dim to full colour as you scroll through the heading */
    const scrub = (els) =>
      els.forEach((el) => {
        el.classList.remove('rv')
        SplitText.create(el, {
          type: 'words',
          autoSplit: true,
          onSplit(self) {
            return gsap.fromTo(
              self.words,
              { opacity: 0.14 },
              {
                opacity: 1,
                ease: 'none',
                stagger: { each: 0.1 },
                scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 52%', scrub: 0.6 },
              },
            )
          },
        })
      })

    const ctx = gsap.context(() => {
      /* ───────── 1. HERO ───────── */
      const heroWords = q('.hero .hw > span')
      if (heroWords.length) {
        gsap.fromTo(
          heroWords,
          { yPercent: 118, rotate: 6 },
          { yPercent: 0, rotate: 0, duration: 1.9, ease: EXPO, stagger: 0.13, delay: 0.25 },
        )
      }
      const heroLead = q('.hero .lead-4')
      heroLead.forEach((p) => p.classList.remove('rv'))
      const heroLines = q('.hero .lead-4 .ln')
      if (heroLines.length) {
        gsap.fromTo(
          heroLines,
          { y: 34, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.5, ease: EXPO, stagger: 0.12, delay: 1.0 },
        )
      }

      /* ───────── 2. IDEA ───────── */
      scrub(q('.idea-h2'))

      q('.idea-photo img').forEach((img) => {
        gsap.fromTo(
          img,
          { scale: 1.22 },
          {
            scale: 1,
            ease: 'none',
            scrollTrigger: { trigger: img.closest('.idea-photo'), start: 'top bottom', end: 'bottom 35%', scrub: 0.8 },
          },
        )
      })

      q('.pillar svg').forEach((svg) => {
        const shapes = [...svg.querySelectorAll('path,rect,circle')]
        if (!shapes.length) return
        gsap.set(shapes, {
          strokeDasharray: (i, t) => t.getTotalLength(),
          strokeDashoffset: (i, t) => t.getTotalLength(),
        })
        gsap.to(shapes, {
          strokeDashoffset: 0,
          duration: 2.2,
          ease: 'power2.inOut',
          stagger: 0.06,
          scrollTrigger: { trigger: svg, start: 'top 90%', once: true },
          onComplete: () => gsap.set(shapes, { clearProps: 'strokeDasharray,strokeDashoffset' }),
        })
      })

      /* ───────── 3. GLANCE ───────── */
      lines(q('.glance-head .h2'))

      /* building: the sun-arch opens like an iris as you scroll, image rises into place */
      q('.glance-img').forEach((box) => {
        box.classList.remove('wipe') // old CSS clip wipe would fight with this
        const img = box.querySelector('img')
        gsap.fromTo(
          box,
          { clipPath: 'circle(0% at 50% 58%)' },
          {
            clipPath: 'circle(78% at 50% 58%)',
            ease: 'none',
            scrollTrigger: { trigger: box, start: 'top 90%', end: 'top 35%', scrub: 0.8 },
            onComplete: () => gsap.set(box, { clearProps: 'clipPath' }),
          },
        )
        if (img) {
          gsap.fromTo(
            img,
            { yPercent: 10, scale: 1.2 },
            {
              yPercent: 0,
              scale: 1,
              ease: 'none',
              scrollTrigger: { trigger: box, start: 'top 90%', end: 'bottom 45%', scrub: 0.8 },
            },
          )
        }
      })

      /* stats slide in from the sides, connector lines draw towards the building */
      const side = (sel, dir) =>
        q(sel).forEach((stat, i) => {
          const text = stat.querySelector('.gtext')
          const conn = stat.querySelector('.conn')
          const tl = gsap.timeline({
            scrollTrigger: { trigger: stat, start: 'top 88%', once: true },
            delay: i * 0.15,
          })
          if (text) tl.fromTo(text, { x: dir * -70, opacity: 0 }, { x: 0, opacity: 1, duration: 1.6, ease: EXPO }, 0)
          if (conn) {
            tl.fromTo(
              conn,
              { scaleX: 0, transformOrigin: dir > 0 ? '0% 50%' : '100% 50%' },
              { scaleX: 1, duration: 1.4, ease: 'power3.inOut', clearProps: 'transform' },
              0.35,
            )
          }
        })
      side('.gstats.l .gstat', 1)
      side('.gstats.r .gstat', -1)

      /* ───────── 4. GALLERY ───────── */
      lines(q('.hgal-head .h2'))

      const imgs = q('.hgal .slide .ph img')
      if (!isMobile && imgs.length) {
        gsap.set(imgs, { scale: 1.22 })
        const setX = imgs.map((img) => gsap.quickSetter(img, 'x', 'px'))
        const drift = () => {
          const vw = window.innerWidth
          const rects = imgs.map((img) => img.parentElement.getBoundingClientRect()) // read all
          rects.forEach((r, i) => setX[i](-((r.left + r.width / 2 - vw / 2) / vw) * r.width * 0.09)) // then write
        }
        ScrollTrigger.create({
          trigger: '.hgal',
          start: 'top bottom',
          end: 'bottom top',
          onUpdate: drift,
          onRefresh: drift,
        })
      }

      /* ───────── 5. FOOTER ───────── */
      lines(q('.ft-tag'), { start: 'top 95%' })
      const logo = q('.ft-logo')
      if (logo.length) {
        gsap.fromTo(
          logo,
          { clipPath: 'inset(100% 0% 0% 0%)', yPercent: 30 },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            yPercent: 0,
            duration: 1.9,
            ease: EXPO,
            scrollTrigger: { trigger: '.ft', start: 'top 85%', once: true },
            onComplete: () => gsap.set(logo, { clearProps: 'clipPath,transform' }),
          },
        )
      }
    })

    /* layout shifts (gallery height, fonts, images) move every trigger, so re-measure */
    const refresh = () => ScrollTrigger.refresh()
    window.addEventListener('load', refresh)
    document.fonts?.ready.then(refresh)
    let t
    const main = document.querySelector('main')
    const ro = typeof ResizeObserver !== 'undefined' && main
      ? new ResizeObserver(() => { clearTimeout(t); t = setTimeout(refresh, 250) })
      : null
    ro?.observe(main)

    return () => {
      clearTimeout(t)
      ro?.disconnect()
      window.removeEventListener('load', refresh)
      ctx.revert()
      restore.forEach((fn) => fn())
      html.classList.remove('fx')
    }
  }, [])
}
