import { Fragment, useRef, useState } from 'react'
import { Kicker } from './Brand.jsx'
import render087 from '../assets/img/render-087.webp'
import seniors from '../assets/img/seniors.webp'
import valley from '../assets/img/valley.webp'
import { prefersReducedMotion, useScrollFrame, useScrollTo } from '../hooks/SmoothScroll.jsx'

/* The sentence, as tokens: plain words, an accent word, or an inline photo pill. */
const TOKENS = [
  'A home of your own', { pic: render087 }, 'with care just downstairs, friends for evening tea',
  { pic: seniors, pos: '40% 40%' }, 'and the hills of', { em: 'Palakkad' }, { pic: valley }, 'still outside your window.',
].flatMap((t) => (typeof t === 'string' ? t.split(' ').map((w) => ({ w })) : [t]))

export default function Statement() {
  const ref = useRef(null)
  const [lit, setLit] = useState(0)
  const scrollTo = useScrollTo()

  useScrollFrame(() => {
    const el = ref.current
    if (!el) return
    if (prefersReducedMotion()) return setLit(TOKENS.length)
    const r = el.getBoundingClientRect(), vh = window.innerHeight
    const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.3)))
    setLit(Math.ceil(p * TOKENS.length))
  })

  return (
    <section className="statement sec">
      <div className="wrap">
        <Kicker count="02 / 11" className="rv">Why Freedom Living</Kicker>
        <p id="stmt" ref={ref} style={{ marginTop: 44 }}>
          {TOKENS.map((t, i) => {
            const cls = `w${i < lit ? ' on' : ''}`
            const node = t.pic
              ? <span className={`pic ${cls}`}><img src={t.pic} alt="" style={t.pos ? { objectPosition: t.pos } : undefined} /></span>
              : t.em ? <em className={cls}>{t.em}</em>
              : <span className={cls}>{t.w}</span>
            return <Fragment key={i}>{i > 0 && ' '}{node}</Fragment>
          })}
        </p>
        <div className="row rv">
          <p className="lead">Most places for elders begin with a list of rules. <b>Freedom Living begins with you:</b> your mornings, your visitors, your own front door.</p>
          <a className="btn ghost" href="#idea" onClick={(e) => { e.preventDefault(); scrollTo('#idea') }}>How it works <span className="arr">→</span></a>
        </div>
      </div>
    </section>
  )
}
