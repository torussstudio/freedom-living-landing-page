import { useMemo, useState } from 'react'
import { Dash, Kicker } from './Brand.jsx'
import { MAX_CARPET, PLANS, UNITS, unitLabel } from '../data/content.js'

export default function FloorPlans({ onAskAbout }) {
  const [floor, setFloor] = useState('F')
  const [onlyBal, setOnlyBal] = useState(false)
  const [cur, setCur] = useState('01')

  const units = useMemo(() => UNITS.filter((u) => u.floor === floor && (!onlyBal || u.bal)), [floor, onlyBal])
  const sel = units.find((u) => u.id === cur) ?? units[0]
  const plan = PLANS[floor]

  const pickFloor = (f) => { setFloor(f); if (f === 'G') setOnlyBal(false) }
  const toggleBal = () => { const next = !onlyBal; setOnlyBal(next); if (next) setFloor('F') }

  return (
    <section className="plans sec" id="plans">
      <div className="wrap">
        <Kicker count="07 / 11" className="rv">Floor plans</Kicker>
        <h2 className="h2 rv">Eighteen ways <em>to be at home.</em></h2>
        <Dash />
        <p className="lead rv" style={{ marginTop: 30 }}>
          Pick a home on the plan or from the list to see its areas. Floors one to three share one layout, so every upper-floor home exists three times over.
        </p>

        <div className="plans-top">
          <div className="seg" role="tablist" aria-label="Floor">
            <button role="tab" aria-selected={floor === 'F'} onClick={() => pickFloor('F')}>Floors 1–3 · 36 homes</button>
            <button role="tab" aria-selected={floor === 'G'} onClick={() => pickFloor('G')}>Ground · 6 homes</button>
          </div>
          <button className="tog" aria-pressed={onlyBal} onClick={toggleBal}>Only homes with a balcony</button>
        </div>

        <div className="plans-grid">
          <div className="plan-board">
            <div className="plan-img">
              <img src={plan.src} alt={plan.alt} />
              {units.map((u) => {
                const [l, t, w, h] = u.box
                return (
                  <button key={u.id} className={`hs${u.id === sel?.id ? ' on' : ''}`} aria-label={`Home ${unitLabel(u)}`}
                    style={{ left: `${l}%`, top: `${t}%`, width: `${w}%`, height: `${h}%` }} onClick={() => setCur(u.id)}>
                    <span>{u.id}</span>
                  </button>
                )
              })}
            </div>
            <div className="plan-cap"><span>{plan.cap}</span><span>Architect's drawing · highlights are indicative</span></div>
            <div className="unit-list" aria-label="Homes on this floor">
              {units.map((u) => (
                <button key={u.id} type="button" aria-pressed={u.id === sel?.id} onClick={() => setCur(u.id)}>
                  {u.id}<span className="b">{u.carpet} sq ft</span>
                </button>
              ))}
            </div>
          </div>

          <aside className="spec" aria-live="polite">
            {sel && (
              <>
                <div className="k">
                  <h3>{unitLabel(sel)}</h3>
                  <span className="where">{sel.floor === 'G' ? '1 home · ground floor' : '3 homes · one on each of floors 1–3'}</span>
                </div>
                <dl>
                  <div><dt>Carpet area (RERA)</dt><dd>{sel.carpet} <small>sq ft{sel.bal ? ' excl. balcony' : ''}</small></dd></div>
                  <div><dt>Super built-up</dt><dd>{sel.sba} <small>sq ft</small></dd></div>
                  <div><dt>Studio size</dt><dd style={{ fontSize: '1.35rem' }}>{sel.size}</dd></div>
                  <div><dt>Balcony</dt><dd style={{ fontSize: '1.35rem' }}>{sel.bal || '—'}</dd></div>
                </dl>
                <div>
                  <div className="kicker" style={{ fontSize: '.7rem', marginBottom: 10 }}>Carpet area vs the largest home</div>
                  <div className="bar"><i style={{ width: `${Math.round((sel.carpet / MAX_CARPET) * 100)}%` }} /></div>
                </div>
                <p className="note">Every studio has an attached toilet and a kitchenette. Detailed plans are shared on your visit.</p>
                <a className="btn" href="#visit" onClick={(e) => { e.preventDefault(); onAskAbout(unitLabel(sel)) }}>
                  Ask about {unitLabel(sel)} <span className="arr">→</span>
                </a>
              </>
            )}
          </aside>
        </div>
      </div>
    </section>
  )
}
