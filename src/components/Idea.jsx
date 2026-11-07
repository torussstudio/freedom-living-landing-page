import { Dash, Kicker } from './Brand.jsx'
import renderSunset from '../assets/img/render-sunset.webp'
import { PILLARS } from '../data/content.js'

const ICONS = {
  home: (<><rect x="10" y="12" width="44" height="46" /><path d="M6 12h52M24 6h8v6" /><rect x="16" y="20" width="8" height="8" /><rect x="28" y="20" width="8" height="8" /><rect x="16" y="34" width="8" height="8" /><rect x="28" y="34" width="8" height="8" /><path d="M42 58V22h8v36M42 40h8" /></>),
  ease: (<><path d="M8 30 32 8l24 22" /><path d="M14 26v32h36V26" /><path d="M32 18l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9v-6z" /><path d="M28 27l3 3 5-6" /><circle cx="24" cy="44" r="4" /><circle cx="40" cy="44" r="4" /><path d="M18 58c0-5 3-8 6-8s6 3 6 8M34 58c0-5 3-8 6-8s6 3 6 8" /></>),
  community: (<><path d="M10 18h44v38H10z" /><path d="M8 18l4-10h40l4 10" /><path d="M12 18c0 3 3 4 5 4s5-1 5-4c0 3 3 4 5 4s5-1 5-4c0 3 3 4 5 4s5-1 5-4c0 3 3 4 5 4s5-1 5-4" /><circle cx="32" cy="40" r="11" /><path d="M32 33v7l5 3" /></>),
  care: (<><circle cx="18" cy="10" r="5" /><path d="M12 24c0-5 3-8 6-8s6 3 6 8v12h-4v20h-4V36h-4z" /><path d="M24 26h10" /><circle cx="44" cy="16" r="5" /><path d="M38 30c0-5 3-8 6-8s6 4 6 9v9h-12z" /><circle cx="40" cy="50" r="8" /><path d="M34 40h18l2 10" /><circle cx="56" cy="56" r="2" /></>),
}

export default function Idea() {
  return (
    <section className="sec" id="idea" style={{ paddingTop: 0, paddingBottom: 'clamp(16px,2.5vw,40px)' }}>
      <div className="wrap idea-grid">
        <div className="stick">
          <Kicker className="rv">The Freedom Living idea</Kicker>
          <h2 className="h2 rv">Independence when you want it. <em>Support when you need it.</em></h2>
          <Dash />
          <p className="lead rv" style={{ marginTop: 30 }}>
            Designed from the ground up for senior living, rather than an ordinary apartment block adapted later. Four things, under one roof.
          </p>
          <div className="idea-photo wipe">
            <img src={renderSunset} alt="Freedom Living building at sunset, architectural render" style={{ objectPosition: '62% 50%' }} />
          </div>
        </div>
        <div>
          {PILLARS.map((p) => (
            <article className="pillar rv" key={p.key}>
              <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">{ICONS[p.key]}</svg>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}