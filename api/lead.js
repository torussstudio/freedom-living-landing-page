import nodemailer from 'nodemailer'

/**
 * POST /api/lead  (Vercel serverless function)
 * Sends two emails through the Freedom Living Gmail account:
 *   1. the lead details to the team
 *   2. a confirmation to the visitor (only if they gave an email)
 *
 * Environment variables (Vercel → Project → Settings → Environment Variables):
 *   GMAIL_USER          pslfreedomliving@gmail.com
 *   GMAIL_APP_PASSWORD  16-character Google app password (not the normal password)
 *   LEAD_TO             optional, comma-separated team inboxes (defaults to GMAIL_USER)
 */

const BRAND = 'Freedom Living'
const PHONE = '+91 94470 70977'

const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
const clip = (s, n) => String(s ?? '').trim().slice(0, n)
const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)

const niceDate = (iso) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso || '')) return ''
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
}

const row = (k, v) => v
  ? `<tr><td style="padding:8px 14px 8px 0;color:#7a6f63;font-size:13px;white-space:nowrap;vertical-align:top">${esc(k)}</td><td style="padding:8px 0;color:#2a1a1c;font-size:15px">${esc(v).replace(/\n/g, '<br>')}</td></tr>`
  : ''

const shell = (inner) => `<!doctype html><html><body style="margin:0;background:#f6f1e6;padding:24px 12px;font-family:Arial,Helvetica,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fffdf8;border-radius:16px;padding:28px">
<tr><td>${inner}</td></tr></table>
<p style="font-size:12px;color:#9a8f83;margin:16px 0 0">${BRAND} · Mattumantha Junction, Malampuzha Road, Palakkad</p>
</td></tr></table></body></html>`

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false, error: 'Method not allowed' })
  }

  const { GMAIL_USER, GMAIL_APP_PASSWORD, LEAD_TO } = process.env
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    console.error('lead: GMAIL_USER / GMAIL_APP_PASSWORD not set')
    return res.status(500).json({ ok: false, error: 'Mail is not configured' })
  }

  let body = req.body
  if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = {} } }
  body = body || {}

  // honeypot: real people never fill this hidden field, bots usually do
  if (body.company) return res.status(200).json({ ok: true })

  const type = body.type === 'enquiry' ? 'enquiry' : 'visit'
  const lead = {
    name: clip(body.name, 80),
    phone: clip(body.phone, 20),
    email: clip(body.email, 120),
    for: clip(body.for, 40),
    date: clip(body.date, 10),
    time: clip(body.time, 20),
    topic: clip(body.topic, 60),
    message: clip(body.message, 2000),
  }

  if (!lead.name || !/^\+91 \d{10}$/.test(lead.phone)) return res.status(400).json({ ok: false, error: 'Name and a 10-digit phone number are required.' })
  if (type === 'visit' && !niceDate(lead.date)) return res.status(400).json({ ok: false, error: 'Please pick a visit date.' })
  if (lead.email && !isEmail(lead.email)) lead.email = ''

  const first = lead.name.split(/\s+/)[0]
  const when = niceDate(lead.date)
  const received = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' })
  const waLink = `https://wa.me/91${lead.phone.slice(-10)}`

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD.replace(/\s/g, '') },
  })

  /* 1. team notification */
  const teamSubject = type === 'visit'
    ? `New site visit: ${lead.name} · ${when}${lead.time ? ' · ' + lead.time : ''}`
    : `New enquiry: ${lead.name} · ${lead.topic || 'General'}`

  const teamHtml = shell(`
    <p style="margin:0 0 6px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#d52f3a;font-weight:bold">${type === 'visit' ? 'Site visit request' : 'Question from the website'}</p>
    <h1 style="margin:0 0 18px;font-size:22px;color:#2a1a1c;font-weight:normal">${esc(lead.name)}</h1>
    <table role="presentation" cellpadding="0" cellspacing="0">
      ${row('Phone', lead.phone)}
      ${row('Email', lead.email)}
      ${type === 'visit' ? row('Enquiry for', lead.for) + row('Visit date', when) + row('Time', lead.time) : row('Topic', lead.topic)}
      ${row(type === 'visit' ? 'Note' : 'Question', lead.message)}
      ${row('Received', received)}
    </table>
    <p style="margin:22px 0 0">
      <a href="tel:${esc(lead.phone.replace(/\s/g, ''))}" style="display:inline-block;background:#d52f3a;color:#fff;text-decoration:none;padding:10px 18px;border-radius:999px;font-size:14px;font-weight:bold;margin:0 8px 8px 0">Call ${esc(first)}</a>
      <a href="${waLink}" style="display:inline-block;background:#25a244;color:#fff;text-decoration:none;padding:10px 18px;border-radius:999px;font-size:14px;font-weight:bold;margin:0 0 8px">WhatsApp</a>
    </p>`)

  const teamText = [
    type === 'visit' ? 'SITE VISIT REQUEST' : 'QUESTION FROM THE WEBSITE',
    `Name: ${lead.name}`, `Phone: ${lead.phone}`, lead.email && `Email: ${lead.email}`,
    type === 'visit' ? `For: ${lead.for}\nDate: ${when}\nTime: ${lead.time}` : `Topic: ${lead.topic}`,
    lead.message && `${type === 'visit' ? 'Note' : 'Question'}: ${lead.message}`,
    `Received: ${received}`,
  ].filter(Boolean).join('\n')

  /* 2. visitor confirmation */
  const custSubject = type === 'visit' ? `Your visit to ${BRAND}` : `We've received your question · ${BRAND}`
  const custHtml = shell(`
    <h1 style="margin:0 0 14px;font-size:24px;color:#2a1a1c;font-weight:normal">Thank you, ${esc(first)}.</h1>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#4a3a20">
      ${type === 'visit'
        ? `We've received your request to visit ${BRAND}${when ? ` on <b>${esc(when)}</b>${lead.time ? ` (${esc(lead.time.toLowerCase())})` : ''}` : ''}. Someone from our team will call you on <b>${esc(lead.phone)}</b> to confirm the time.`
        : `We've received your question${lead.topic ? ` about <b>${esc(lead.topic.toLowerCase())}</b>` : ''}. Someone from our team will get back to you on <b>${esc(lead.phone)}</b> soon.`}
    </p>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#4a3a20">If you'd like to talk sooner, call or WhatsApp us on <b>${PHONE}</b>, or simply reply to this email.</p>
    <p style="margin:20px 0 0;font-size:15px;color:#4a3a20">Warm regards,<br>Team ${BRAND}</p>`)

  const custText = `Thank you, ${first}.\n\n${type === 'visit'
    ? `We've received your request to visit ${BRAND}${when ? ` on ${when}${lead.time ? ` (${lead.time.toLowerCase()})` : ''}` : ''}. Someone from our team will call you on ${lead.phone} to confirm the time.`
    : `We've received your question${lead.topic ? ` about ${lead.topic.toLowerCase()}` : ''}. Someone from our team will get back to you on ${lead.phone} soon.`}\n\nIf you'd like to talk sooner, call or WhatsApp us on ${PHONE}, or reply to this email.\n\nWarm regards,\nTeam ${BRAND}`

  try {
    await transporter.sendMail({
      from: `"${BRAND} Website" <${GMAIL_USER}>`,
      to: LEAD_TO || GMAIL_USER,
      replyTo: lead.email || undefined,
      subject: teamSubject,
      text: teamText,
      html: teamHtml,
    })
  } catch (err) {
    console.error('lead: team mail failed', err)
    return res.status(502).json({ ok: false, error: 'Could not send right now.' })
  }

  // the lead is already with the team, so a failed confirmation should not fail the form
  if (lead.email) {
    try {
      await transporter.sendMail({
        from: `"${BRAND}" <${GMAIL_USER}>`,
        to: lead.email,
        replyTo: GMAIL_USER,
        subject: custSubject,
        text: custText,
        html: custHtml,
      })
    } catch (err) {
      console.error('lead: confirmation mail failed', err)
    }
  }

  return res.status(200).json({ ok: true })
}
