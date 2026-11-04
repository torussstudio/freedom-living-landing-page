import { Dash, Kicker, Logo } from './Brand.jsx'
import { AMENITIES, CARE, CONTACT, CREDS, DAY, FAQ, STEPS } from '../data/content.js'
import mapImg from '../assets/img/map.webp'
import sketch from '../assets/img/sketch.webp'
import md from '../assets/img/md.webp'
import { useScrollTo } from '../hooks/SmoothScroll.jsx'

const pad = (n) => String(n).padStart(2, '0')

export function Care() {
  return (
    <section className="sec" id="care">
      <div className="wrap">
        <Kicker count="08 / 11" className="rv">Designed for senior living</Kicker>
        <h2 className="h2 rv">A home that considers <em>the years ahead.</em></h2>
        <Dash />
        <div className="care-grid rv">
          {CARE.map(([h, p]) => <div className="cg" key={h}><h3>{h}</h3><p>{p}</p></div>)}
        </div>
        <div className="amen">
          <h3 className="rv">Also built in</h3>
          <div className="chips rv">{AMENITIES.map((a) => <span key={a}>{a}</span>)}</div>
        </div>
      </div>
    </section>
  )
}

export function Day() {
  return (
    <section className="day sec" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <Kicker count="09 / 11" className="rv">A day, your way</Kicker>
        <h2 className="h2 rv">Fill it. <em>Or don't.</em></h2>
        <Dash />
        <div className="day-row">
          {DAY.map(([t, h, p, w], i) => (
            <div className="moment rv" style={{ '--d': `${i * 0.06}s` }} key={t}>
              <span className="dot">{t}</span><h3>{h}</h3><p>{p}</p><span className="where">{w}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg" aria-hidden="true" />
    </section>
  )
}

export function LocationProgress() {
  return (
    <section className="sec loc" style={{ paddingTop: 'clamp(40px,6vw,80px)' }}>
      <div className="wrap loc-grid">
        <div>
          <Kicker count="10 / 11" className="rv">Where we are</Kicker>
          <p className="loc-big rv">And importantly, all of this <em>without having to move far from Palakkad</em> and the life you already know.</p>
          <address className="rv">
            <b>Mattumantha Junction,</b><span>Malampuzha Road, Palakkad, Kerala</span>
            <span style={{ color: 'var(--ink-soft)' }}>Close to the city, in a peaceful neighbourhood.</span>
          </address>
          <div className="rv" style={{ marginTop: 28 }}>
            <a className="btn ghost" href={CONTACT.mapsUrl} target="_blank" rel="noopener noreferrer">Open in Google Maps <span className="arr">↗</span></a>
          </div>
        </div>
        <div className="map wipe">
          <img src={mapImg} alt="Map showing Freedom Living within 3 km of Palakkad town, railway station, KSRTC bus stand and Government Medical College Hospital" />
        </div>
      </div>

      <div className="wrap" style={{ marginTop: 'clamp(96px,12vw,170px)' }}>
        <div className="prog-grid">
          <div>
            <Kicker count="Oct 2026" className="rv">Construction update</Kicker>
            <h2 className="h2 rv">Already <em>taking shape.</em></h2>
            <Dash />
            <p className="lead rv" style={{ marginTop: 30 }}>Freedom Living has moved beyond the planning stage. The basement, ground floor and first floor are complete.</p>
          </div>
          <div className="prog-img wipe"><img src={sketch} alt="Sketch of the completed lower floors of the building" loading="lazy" /></div>
          <ul className="checks rv" aria-label="Construction status by level">
            <li className="todo"><span className="c" />Rooftop</li>
            <li className="todo"><span className="c" />Floors 2 to 4</li>
            <li className="done"><span className="c">✓</span>First floor</li>
            <li className="done"><span className="c">✓</span>Ground floor</li>
            <li className="done"><span className="c">✓</span>Basement</li>
            <li className="eta"><span><b>December 2027</b>Expected completion</span></li>
          </ul>
        </div>
      </div>
    </section>
  )
}

export function Vision() {
  return (
    <section className="vision sec" style={{ paddingBottom: 0 }}>
      <div className="wrap vision-grid">
        <div style={{ paddingBottom: 'clamp(64px,8vw,120px)' }}>
          <Kicker count="The vision" className="rv">Led by experience and community trust</Kicker>
          <p className="vq rv">In a society where people enjoy very little freedom, and even that fades as we grow older, this is my attempt to create a place where elders feel free, cared for, connected, and completely at home.</p>
          <div className="who rv">
            <b>Er. K. M. Rahamadulla</b>
            <span>Managing Director, Palghat Senior Living Ltd. · NIT Calicut alumnus, builder, chartered engineer and valuer</span>
          </div>
          <ul className="creds rv">
            {CREDS.map(([b, s], i) => <li key={i}><i>{pad(i + 1)}</i><div><b>{b}</b><span>{s}</span></div></li>)}
          </ul>
        </div>
        <div className="md wipe"><img src={md} alt="Portrait of Er. K. M. Rahamadulla" loading="lazy" /></div>
      </div>
    </section>
  )
}

export function FamiliesFaq() {
  return (
    <section className="sec" id="faq">
      <div className="wrap fam-grid">
        <div>
          <Kicker count="11 / 11" className="rv">For sons and daughters, near and far</Kicker>
          <h2 className="h2 rv">In Bengaluru, Dubai or Boston? <em>Your parents can still be home.</em></h2>
          <Dash />
          <ol className="steps rv">
            {STEPS.map(([b, p], i) => <li key={b}><i>{pad(i + 1)}</i><div><b>{b}</b><p>{p}</p></div></li>)}
          </ol>
        </div>
        <div className="rv">
          {FAQ.map(([q, a]) => (
            <details key={q}><summary>{q}<span className="pm" /></summary><div className="ans">{a}</div></details>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Footer() {
  const scrollTo = useScrollTo()
  const go = (e, h) => { e.preventDefault(); scrollTo(h) }
  return (
    <footer>
      <div className="wrap">
        <div className="foot">
          <div className="foot-top">
            <div><Logo /><p className="m">Live free. Age gracefully.</p></div>
            <div className="foot-cols">
              <div><h4>Visit</h4><p>Mattumantha Junction<br />Malampuzha Road, Palakkad</p></div>
              <div><h4>Talk to us</h4><p>{CONTACT.phone}</p><p>{CONTACT.email}</p></div>
              <div>
                <h4>Explore</h4>
                {[['#plans', 'Floor plans'], ['#building', 'The building'], ['#care', 'Care'], ['#visit', 'Book a visit']].map(([h, l]) => (
                  <a key={h} href={h} onClick={(e) => go(e, h)}>{l}</a>
                ))}
              </div>
            </div>
          </div>
          <div className="foot-base">
            <span>© 2026 Palghat Senior Living Ltd. · RERA No. <span className="pending">to be added</span></span>
            <span>Renders, plans and areas are indicative and may change during construction.</span>
          </div>
        </div>
      </div>
    </footer>
  )
}