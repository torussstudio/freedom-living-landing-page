import { useMemo, useState } from 'react'
import { Bird } from './Brand.jsx'
import { CONTACT } from '../data/content.js'

const WHO = [['Myself', 'Myself'], ['Myself and my spouse', 'Me & my spouse'], ['My parents', 'My parents'], ['A relative', 'A relative']]
const EMPTY = { name: '', phone: '', email: '', date: '', time: 'Morning', message: '' }

function CopyLine({ label, value }) {
  const [state, setState] = useState('Copy')
  const copy = async () => {
    try { await navigator.clipboard.writeText(value); setState('Copied') } catch { setState('Copy failed') }
    setTimeout(() => setState('Copy'), 1600)
  }
  return (
    <div className="cl">
      <div><small>{label}</small><span className="v">{value}</span></div>
      <button className="copy" type="button" onClick={copy}>{state}</button>
    </div>
  )
}

/**
 * Lead form. `mode` and `prefill` are controlled by App so the floor-plan
 * "Ask about …" button can switch the form to an enquiry about that home.
 * TODO (migration): send `lead` to the lead-routing endpoint / admin panel in onSubmit.
 */
export default function Visit({ mode, setMode, prefill }) {
  const [f, setF] = useState(EMPTY)
  const [who, setWho] = useState('Myself')
  const [errors, setErrors] = useState({})
  const [sent, setSent] = useState(null)
  const minDate = useMemo(() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10) }, [])

  // apply a prefill message coming from the floor plans (only if the field is empty)
  const [lastPrefill, setLastPrefill] = useState(null)
  if (prefill && prefill !== lastPrefill) {
    setLastPrefill(prefill)
    if (!f.message) setF((v) => ({ ...v, message: prefill }))
  }

  const set = (k) => (e) => setF((v) => ({ ...v, [k]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    const err = {}
    if (!f.name.trim()) err.name = 'Please tell us your name.'
    if (f.phone.replace(/\D/g, '').length < 10) err.phone = 'Enter a phone number with at least 10 digits.'
    setErrors(err)
    if (Object.keys(err).length) { document.getElementById(err.name ? 'f-name' : 'f-phone')?.focus(); return }
    const lead = { type: mode, ...f, date: mode === 'visit' ? f.date : '', time: mode === 'visit' ? f.time : '', for: who, at: new Date().toISOString() }
    console.log('Freedom Living lead', lead)
    setSent(lead)
  }

  const reset = () => { setF(EMPTY); setWho('Myself'); setErrors({}); setSent(null); setMode('visit') }

  return (
    <section className="visit grad on-grad sec" id="visit">
      <div className="wm" aria-hidden="true"><Bird /></div>
      <div className="wrap visit-grid">
        <div>
          <div className="kicker rv"><span className="count">Visit</span><span>Come feel. Come belong.</span></div>
          <h2 className="rv">See it <span>for yourself.</span></h2>
          <p className="lead rv">Walk the site, meet the team, and picture your mornings here. Tell us a little about yourself and we'll call to fix a time.</p>
          <div className="contact rv">
            <CopyLine label="Call or WhatsApp" value={CONTACT.phone} />
            <CopyLine label="Email" value={CONTACT.email} />
          </div>
        </div>

        <div className="rv" style={{ '--d': '.15s' }}>
          {sent ? (
            <div className="thanks">
              <span className="kicker">Received</span>
              <h3>Thank you, {sent.name.trim().split(' ')[0]}.</h3>
              <p>
                {sent.type === 'visit'
                  ? `We'll call you on ${sent.phone} to confirm a time${sent.date ? ' around ' + new Date(sent.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' }) : ''}.`
                  : `We'll get back to you on ${sent.phone} with an answer.`}
              </p>
              <div><button className="btn ghost" type="button" onClick={reset}>Send another</button></div>
            </div>
          ) : (
            <form className="f" noValidate onSubmit={submit}>
              <div className="seg" role="tablist" aria-label="Enquiry type" style={{ justifySelf: 'start' }}>
                <button type="button" role="tab" aria-selected={mode === 'visit'} onClick={() => setMode('visit')}>Book a visit</button>
                <button type="button" role="tab" aria-selected={mode === 'enquiry'} onClick={() => setMode('enquiry')}>Ask a question</button>
              </div>
              <div className="fr two">
                <div className="fld"><label htmlFor="f-name">Your name</label><input id="f-name" autoComplete="name" value={f.name} onChange={set('name')} /><span className="err">{errors.name}</span></div>
                <div className="fld"><label htmlFor="f-phone">Phone, with country code</label><input id="f-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+91" value={f.phone} onChange={set('phone')} /><span className="err">{errors.phone}</span></div>
              </div>
              <div className="fld"><label htmlFor="f-email">Email (optional)</label><input id="f-email" type="email" autoComplete="email" value={f.email} onChange={set('email')} /></div>
              <div className="fld">
                <span className="lb" id="who-l">This enquiry is for</span>
                <div className="opts" role="radiogroup" aria-labelledby="who-l">
                  {WHO.map(([v, l]) => <button key={v} type="button" className="opt" role="radio" aria-checked={who === v} onClick={() => setWho(v)}>{l}</button>)}
                </div>
              </div>
              {mode === 'visit' && (
                <div className="fr two">
                  <div className="fld"><label htmlFor="f-date">Preferred date</label><input id="f-date" type="date" min={minDate} value={f.date} onChange={set('date')} /></div>
                  <div className="fld"><label htmlFor="f-time">Preferred time</label>
                    <select id="f-time" value={f.time} onChange={set('time')}><option>Morning</option><option>Afternoon</option><option>Evening</option></select>
                  </div>
                </div>
              )}
              <div className="fld"><label htmlFor="f-msg">Anything we should know?</label><textarea id="f-msg" placeholder="Mobility needs, the home you have in mind, or a question" value={f.message} onChange={set('message')} /></div>
              <div className="go">
                <p className="fine">We'll only use your details to contact you about Freedom Living.</p>
                <button className="btn" type="submit">{mode === 'visit' ? 'Request my visit' : 'Send my question'} <span className="arr">→</span></button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
