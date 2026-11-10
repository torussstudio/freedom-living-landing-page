import { useMemo, useState } from "react";
import { CONTACT } from "../data/content.js";
import { DatePicker, TimeSelect, toISO } from "./FormPickers.jsx";
import { postLead } from "../lib/postLead.js";
import { Req, Svg, useFormState } from "./formKit.jsx";

const WHO = [
  ["Myself", "Myself"],
  ["Myself and my spouse", "Me & my spouse"],
  ["My parents", "My parents"],
  ["A relative", "A relative"],
];
const EMPTY = {
  name: "",
  phone: "",
  email: "",
  date: "",
  time: "Morning",
  message: "",
};

/* ---------- icons (stroke = currentColor) ---------- */
const IcoCalendar = (p) => (
  <Svg {...p}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
    <path d="M3.5 10h17M8 3v4M16 3v4M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01" />
  </Svg>
);
const IcoChat = (p) => (
  <Svg {...p}>
    <path d="M20.5 11.6c0 4.3-3.8 7.7-8.5 7.7-1.2 0-2.4-.2-3.4-.6L4 20l1.2-3.6c-1-1.3-1.7-3-1.7-4.8C3.5 7.3 7.3 4 12 4s8.5 3.3 8.5 7.6Z" />
  </Svg>
);
const IcoCoins = (p) => (
  <Svg {...p}>
    <ellipse cx="10" cy="6.5" rx="6" ry="2.5" />
    <path d="M4 6.5v4c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-4M4 10.5v4c0 1.4 2.7 2.5 6 2.5 1 0 2-.1 2.8-.3" />
    <ellipse cx="17" cy="15.5" rx="4" ry="1.8" />
    <path d="M13 15.5v2.7c0 1 1.8 1.8 4 1.8s4-.8 4-1.8v-2.7" />
  </Svg>
);
const IcoHeart = (p) => (
  <Svg {...p}>
    <path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20Z" />
    <path d="M7 12.5h2.6l1.4-2.5 2 4.5 1.4-2h2.6" />
  </Svg>
);
const IcoBuilding = (p) => (
  <Svg {...p}>
    <path d="M4 20.5V5.5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v15M14 9.5h5a1 1 0 0 1 1 1v10M2.5 20.5h19M7.5 8h1M10 8h1M7.5 11.5h1M10 11.5h1M7.5 15h1M10 15h1M17 13h.01M17 16.5h.01" />
    <path d="M8.5 20.5v-2.5h2v2.5" />
  </Svg>
);
const IcoHelmet = (p) => (
  <Svg {...p}>
    <path d="M3 18.5h18M4.5 18.5v-2a7.5 7.5 0 0 1 15 0v2" />
    <path d="M10 9.3V6.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2.8M8 10l1 4.5M16 10l-1 4.5" />
  </Svg>
);
const IcoQuestion = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M9.6 9.6a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.2-2.4 3.7M12 17h.01" />
  </Svg>
);
const IcoLock = (p) => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" {...p}>
    <path
      d="M7.5 10V7.5a4.5 4.5 0 0 1 9 0V10"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <rect x="4.5" y="10" width="15" height="11" rx="2.5" fill="currentColor" />
    <circle cx="12" cy="15" r="1.6" fill="var(--cream)" />
    <path
      d="M12 15.8v2.2"
      stroke="var(--cream)"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

const TOPICS = [
  ["pricing", "Pricing & ownership", IcoCoins],
  ["care", "Care & medical support", IcoHeart],
  ["homes", "Homes & facilities", IcoBuilding],
  ["construction", "Construction & availability", IcoHelmet],
  ["other", "Something else", IcoQuestion],
];

function CopyLine({ label, value }) {
  const [state, setState] = useState("Copy");
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setState("Copied");
    } catch {
      setState("Copy failed");
    }
    setTimeout(() => setState("Copy"), 1600);
  };
  return (
    <div className="cl">
      <div>
        <small>{label}</small>
        <span className="v">{value}</span>
      </div>
      <button className="copy" type="button" onClick={copy}>
        {state}
      </button>
    </div>
  );
}

/**
 * Lead form. `mode` and `prefill` are controlled by App so the floor-plan
 * "Ask about …" button can switch the form to an enquiry about that home.
 * On submit the lead is POSTed to /api/lead (Vercel function), which emails the
 * team and sends the visitor a confirmation if they gave an email.
 */
export default function Visit({ mode, setMode, prefill }) {
  const [who, setWho] = useState("Myself");
  const [topic, setTopic] = useState("pricing");
  const { f, setF, errors, setErrors, set, setPhone } = useFormState(EMPTY);
  const [sent, setSent] = useState(null);
  const [sending, setSending] = useState(false);
  const [sendErr, setSendErr] = useState("");
  const [hp, setHp] = useState(""); // honeypot, stays empty for real visitors
  const minDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return toISO(d);
  }, []);

  // apply a prefill message coming from the floor plans (only if the field is empty)
  const [lastPrefill, setLastPrefill] = useState(null);
  if (prefill && prefill !== lastPrefill) {
    setLastPrefill(prefill);
    setTopic("homes");
    if (!f.message) setF((v) => ({ ...v, message: prefill }));
  }

  const submit = async (e) => {
    e.preventDefault();
    if (sending) return;
    const err = {};
    if (!f.name.trim()) err.name = "Please tell us your name.";
    if (f.phone.length !== 10) err.phone = "Enter your 10-digit mobile number.";
    if (mode === "visit" && !f.date)
      err.date = "Please pick a date for your visit.";
    if (mode === "enquiry" && !topic)
      err.topic = "Please choose what your enquiry is about.";
    setErrors(err);
    const first = ["name", "phone", "date"].find((k) => err[k]);
    if (Object.keys(err).length) {
      if (first) document.getElementById(`f-${first}`)?.focus();
      return;
    }
    const lead =
      mode === "visit"
        ? {
            type: "visit",
            name: f.name.trim(),
            phone: `+91 ${f.phone}`,
            email: f.email,
            for: who,
            date: f.date,
            time: f.time,
            message: f.message,
            at: new Date().toISOString(),
          }
        : {
            type: "enquiry",
            name: f.name.trim(),
            phone: `+91 ${f.phone}`,
            email: f.email,
            topic: TOPICS.find((t) => t[0] === topic)?.[1],
            message: f.message,
            at: new Date().toISOString(),
          };
    setSending(true);
    setSendErr("");
    const r = await postLead(lead, hp);
    if (r.ok) setSent(lead);
    else setSendErr(r.message);
    setSending(false);
  };

  const reset = () => {
    setF(EMPTY);
    setWho("Myself");
    setTopic("pricing");
    setErrors({});
    setSent(null);
    setSendErr("");
    setMode("visit");
  };
  const switchMode = (m) => {
    setMode(m);
    setErrors({});
  };

  return (
    <section
      className="visit grad on-grad sec ![background-image:url('../assets/img/visit-bg.webp')]"
      id="visit"
    >
      <div className="wrap visit-grid">
        <div>
          <div className="kicker rv">
            <span>Come feel. Come belong.</span>
          </div>
          <h2 className="rv">
            Be part of the <span>Freedom Living journey.</span>
          </h2>
          <p className="lead rv">
            Walk the site, meet the team, and picture your mornings here. Tell
            us a little about yourself and we'll call to fix a time.
          </p>
          <div className="contact rv">
            <CopyLine label="Call or WhatsApp" value={CONTACT.phone} />
            <CopyLine label="Email" value={CONTACT.email} />
          </div>
        </div>

        <div className={`rv ![--d:.15s]${sent ? " visit-sent" : ""}`}>
          {sent ? (
            <div className="thanks">
              <span className="kicker">Received</span>
              <h3>Thank you, {sent.name.split(" ")[0]}.</h3>
              <p>
                {sent.type === "visit"
                  ? `We'll call you on ${sent.phone} to confirm a time${sent.date ? " around " + new Date(sent.date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "long" }) : ""}.`
                  : `We'll get back to you on ${sent.phone} with an answer.`}
              </p>
              <div>
                <button className="btn ghost" type="button" onClick={reset}>
                  Send another
                </button>
              </div>
            </div>
          ) : (
            <form className="f" noValidate onSubmit={submit}>
              <input className="![position:absolute] ![left:-9999px] ![width:1px] ![height:1px] ![opacity:0]"
                type="text"
                name="company"
                value={hp}
                onChange={(e) => setHp(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"

              />
              <div className="seg" role="tablist" aria-label="Enquiry type">
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === "visit"}
                  onClick={() => switchMode("visit")}
                >
                  <IcoCalendar /> Book a visit
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === "enquiry"}
                  onClick={() => switchMode("enquiry")}
                >
                  <IcoChat /> Ask a question
                </button>
              </div>

              <div className="fr two">
                <div className="fld">
                  <label htmlFor="f-name">
                    Your name <Req />
                  </label>
                  <div className="ctl">
                    <input
                      id="f-name"
                      autoComplete="name"
                      placeholder="Full name"
                      value={f.name}
                      onChange={set("name")}
                      aria-invalid={!!errors.name}
                    />
                  </div>
                  {errors.name && <span className="err">{errors.name}</span>}
                </div>
                <div className="fld">
                  <label htmlFor="f-phone">
                    Phone number <Req />
                  </label>
                  <div className="ctl phone">
                    <span className="pre" aria-hidden="true">
                      +91
                    </span>
                    <input
                      id="f-phone"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      placeholder="10-digit mobile number"
                      value={f.phone}
                      onChange={setPhone}
                      aria-invalid={!!errors.phone}
                    />
                  </div>
                  {errors.phone && <span className="err">{errors.phone}</span>}
                </div>
              </div>

              <div className="fld">
                <label htmlFor="f-email">Email (optional)</label>
                <div className="ctl">
                  <input
                    id="f-email"
                    type="email"
                    autoComplete="email"
                    placeholder="Email address"
                    value={f.email}
                    onChange={set("email")}
                  />
                </div>
              </div>

              {mode === "visit" ? (
                <>
                  <div className="fld">
                    <span className="lb" id="who-l">
                      This enquiry is for
                    </span>
                    <div
                      className="opts"
                      role="radiogroup"
                      aria-labelledby="who-l"
                    >
                      {WHO.map(([v, l]) => (
                        <button
                          key={v}
                          type="button"
                          className="opt"
                          role="radio"
                          aria-checked={who === v}
                          onClick={() => setWho(v)}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="fr two">
                    <div className="fld">
                      <label htmlFor="f-date">
                        Preferred visit date <Req />
                      </label>
                      <DatePicker
                        id="f-date"
                        value={f.date}
                        min={minDate}
                        invalid={!!errors.date}
                        onChange={(v) => {
                          setF((x) => ({ ...x, date: v }));
                          setErrors((er) => ({ ...er, date: undefined }));
                        }}
                      />
                      {errors.date && (
                        <span className="err">{errors.date}</span>
                      )}
                    </div>
                    <div className="fld">
                      <label htmlFor="f-time">Preferred time</label>
                      <TimeSelect
                        id="f-time"
                        value={f.time}
                        onChange={(v) => setF((x) => ({ ...x, time: v }))}
                      />
                    </div>
                  </div>
                  <div className="fld">
                    <label htmlFor="f-msg">
                      Anything we should know? (optional)
                    </label>
                    <textarea
                      id="f-msg"
                      placeholder="Mobility needs, special assistance, or any other note"
                      value={f.message}
                      onChange={set("message")}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="fld">
                    <span className="lb" id="topic-l">
                      This enquiry is about <Req />
                    </span>
                    <div
                      className="topics"
                      role="radiogroup"
                      aria-labelledby="topic-l"
                    >
                      {TOPICS.map(([v, l, Icon]) => (
                        <button
                          key={v}
                          type="button"
                          className="topic"
                          role="radio"
                          aria-checked={topic === v}
                          onClick={() => setTopic(v)}
                        >
                          <Icon size={22} /> <span>{l}</span>
                        </button>
                      ))}
                    </div>
                    {errors.topic && (
                      <span className="err">{errors.topic}</span>
                    )}
                  </div>
                  <div className="fld">
                    <label htmlFor="f-msg">Your question (optional)</label>
                    <textarea
                      id="f-msg"
                      placeholder="Write your question here..."
                      value={f.message}
                      onChange={set("message")}
                    />
                  </div>
                </>
              )}

              <div className="go">
                <p className="fine">
                  <IcoLock />{" "}
                  <span>
                    We'll only use your details to contact you about Freedom
                    Living.
                  </span>
                </p>
                <button
                  className="btn"
                  type="submit"
                  disabled={sending}
                  aria-busy={sending}
                  data-sending={sending || undefined}
                >
                  {sending
                    ? "Sending…"
                    : mode === "visit"
                      ? "Request my visit"
                      : "Send my question"}{" "}
                  {!sending && <span className="arr">→</span>}
                </button>
              </div>
              {sendErr && (
                <p className="err ![padding-left:0]" role="alert" >
                  {sendErr}
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
