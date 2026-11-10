import { useEffect } from 'react'

/**
 * Adds `.in` to reveal elements as they approach the viewport (they stay visible at rest).
 * Sections that mount later (lazy-loaded ones) are picked up as they are added to <main>.
 */
export function useReveal(selector = '.rv,.wipe,.lm,.glance-grid') {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) }
      }),
      { rootMargin: '0px 0px 12% 0px' }
    )
    const watch = (root) => {
      if (root.matches?.(selector)) io.observe(root)
      root.querySelectorAll(selector).forEach((el) => io.observe(el))
    }
    watch(document)

    const main = document.querySelector('main')
    const mo = main
      ? new MutationObserver((muts) => muts.forEach((m) => m.addedNodes.forEach((n) => n.nodeType === 1 && watch(n))))
      : null
    mo?.observe(main, { childList: true }) // direct children only: that is where lazy sections appear

    return () => { io.disconnect(); mo?.disconnect() }
  }, [selector])
}
