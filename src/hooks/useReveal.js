import { useEffect } from 'react'

/** Adds `.in` to reveal elements as they approach the viewport (they stay visible at rest). */
export function useReveal(selector = '.rv,.wipe,.lm,.glance-grid') {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) }
      }),
      { rootMargin: '0px 0px 12% 0px' }
    )
    document.querySelectorAll(selector).forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [selector])
}
