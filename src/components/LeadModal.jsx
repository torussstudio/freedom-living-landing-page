import { useState } from "react";
import { createPortal } from "react-dom";
import { useModal } from "../hooks/useModal.js";
import {
  IcoClose,
  isEmail,
  Req,
  Select,
  Svg,
  useFormState,
  useLeadSubmit,
} from "./formKit.jsx";

const WHO = ["Myself", "Myself & my spouse", "My parents", "Another family member"];
const TIMELINE = [
  "On project completion (Dec 2027)",
  "Within 1–2 years",
  "Planning for the future",
  "Just exploring",
];
const HEARD = [
  "Facebook / Instagram",
  "Google Search",
  "Friends / Family",
  "Newspaper / Other Ads",
  "Other",
];
const EMPTY = {
  name: "",
  phone: "",
  email: "",
  who: "",
  timeline: "",
  heard: "",
  agree: false,
};

const IcoUser = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="8" r="3.6" />
    <path d="M4.5 20c.8-4 3.7-6 7.5-6s6.7 2 7.5 6" />
  </Svg>
);
const IcoPhone = (p) => (
  <Svg {...p}>
    <path d="M5 4.5h3.2l1.4 4-2 1.3a11 11 0 0 0 6.6 6.6l1.3-2 4 1.4V19a1.5 1.5 0 0 1-1.6 1.5C10.8 20 4 13.2 3.5 6.1A1.5 1.5 0 0 1 5 4.5Z" />
  </Svg>
);
const IcoMail = (p) => (
  <Svg {...p}>
    <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
    <path d="m4.5 7.5 7.5 6 7.5-6" />
  </Svg>
);
const IcoCalendar = (p) => (
  <Svg {...p}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
    <path d="M3.5 10h17M8 3v4M16 3v4" />
  </Svg>
);
const IcoUsers = (p) => (
  <Svg {...p}>
    <circle cx="9" cy="8.5" r="3.2" />
    <path d="M3 19.5c.6-3.4 3-5 6-5s5.4 1.6 6 5" />
    <path d="M16 5.6a3.2 3.2 0 0 1 0 5.8M17.5 14.7c1.9.5 3.1 2 3.5 4.8" />
  </Svg>
);
const IcoMegaphone = (p) => (
  <Svg {...p}>
    <path d="M4 10v4a1 1 0 0 0 1 1h2l8 4V5L7 9H5a1 1 0 0 0-1 1ZM18.5 9.5a4 4 0 0 1 0 5M7 15l1 4.5h2.5L10 16" />
  </Svg>
);
/**
 * "Let's help you explore your options" modal. Same behaviour as the investor
 * modal: it closes ONLY with the X button (no backdrop click, no Escape).
 * A valid submit posts a "callback" lead to /api/lead (Google Sheet + email) and shows a thank-you.
 */
export default function LeadModal({ open, onClose }) {
  const { f, setF, errors, setErrors, set, setPhone, pick: pickVal } =
    useFormState(EMPTY);
  const { panel, closeBtn, trap } = useModal(open);
  const [hp, setHp] = useState(""); // honeypot, stays empty for real visitors
  const { sending, sent, sendErr, send, reset } = useLeadSubmit();

  if (!open) return null;

  // closing starts the next visit with a fresh form
  const close = () => {
    setF(EMPTY);
    setErrors({});
    reset();
    onClose();
  };

  const submit = (e) => {
    e.preventDefault();
    if (sending) return;
    const err = {};
    if (!f.name.trim()) err.name = "Please tell us your name.";
    if (f.phone.length !== 10) err.phone = "Enter your 10-digit mobile number.";
    if (f.email.trim() && !isEmail(f.email.trim()))
      err.email = "Enter a valid email address.";
    if (!f.who) err.who = "Please choose who you are exploring a home for.";
    if (!f.timeline) err.timeline = "Please select a timeline.";
    if (!f.agree) err.agree = "Please agree to be contacted.";
    setErrors(err);
    const first = ["name", "phone", "email", "who", "timeline", "agree"].find(
      (k) => err[k],
    );
    if (first) {
      document.getElementById(`lm-${first}`)?.focus();
      return;
    }
    send(
      {
        type: "callback",
        name: f.name.trim(),
        phone: `+91 ${f.phone}`,
        email: f.email.trim(),
        for: f.who,
        timeline: f.timeline,
        heard: f.heard,
        at: new Date().toISOString(),
      },
      hp,
    );
  };

  return createPortal(
    <div className="imodal" data-lenis-prevent>
      <div
        className="imodal-panel lm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lm-title"
        ref={panel}
        onKeyDown={trap}
      >
        <button
          ref={closeBtn}
          type="button"
          className="imodal-x"
          aria-label="Close"
          onClick={close}
        >
          <IcoClose size={22} />
        </button>
        {sent ? (
          <div className="imodal-done" role="status">
            <span className="kicker">Received</span>
            <h3 id="lm-title">Thank you, {sent.name.split(" ")[0]}.</h3>
            <p>Our team will call you on {sent.phone} soon.</p>
            <button className="btn ghost" type="button" onClick={close}>
              Close
            </button>
          </div>
        ) : (
          <>
        <div className="imodal-head lm-head">
          <h3 id="lm-title">Let&rsquo;s help you explore your options.</h3>
          <p className="inv-intro">
            Share a few details and our team will get in touch with the
            information you need.
          </p>
        </div>

        <form className="imodal-form" noValidate onSubmit={submit}>
          <input
              className="![position:absolute] ![left:-9999px] ![width:1px] ![height:1px] ![opacity:0]"
              type="text"
              name="company"
              value={hp}
              onChange={(e) => setHp(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />
          <div className="fr two">
            <div className="fld">
              <label htmlFor="lm-name">
                Full name <Req />
              </label>
              <div className="ctl ico">
                <IcoUser size={22} className="lead-ico" />
                <input
                  id="lm-name"
                  autoComplete="name"
                  placeholder="Your full name"
                  value={f.name}
                  onChange={set("name")}
                  aria-invalid={!!errors.name}
                />
              </div>
              {errors.name && <span className="err">{errors.name}</span>}
            </div>
            <div className="fld">
              <label htmlFor="lm-phone">
                Mobile / WhatsApp <Req />
              </label>
              <div className="ctl ico">
                <IcoPhone size={22} className="lead-ico" />
                <input
                  id="lm-phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  placeholder="+91 Mobile number"
                  value={f.phone}
                  onChange={setPhone}
                  aria-invalid={!!errors.phone}
                />
              </div>
              {errors.phone && <span className="err">{errors.phone}</span>}
            </div>
          </div>

          <div className="fr two">
            <div className="fld">
              <label htmlFor="lm-email">
                Email address <span className="opt-note">(optional)</span>
              </label>
              <div className="ctl ico">
                <IcoMail size={22} className="lead-ico" />
                <input
                  id="lm-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={f.email}
                  onChange={set("email")}
                  aria-invalid={!!errors.email}
                />
              </div>
              {errors.email && <span className="err">{errors.email}</span>}
            </div>
            <div className="fld">
              <label htmlFor="lm-who">
                Who is the home for? <Req />
              </label>
              <Select
                id="lm-who"
                label="Who are you exploring a home for"
                Icon={IcoUsers}
                options={WHO}
                value={f.who}
                placeholder="Select an option"
                invalid={!!errors.who}
                onChange={pickVal("who")}
              />
              {errors.who && <span className="err">{errors.who}</span>}
            </div>
          </div>

          <div className="fr two">
            <div className="fld">
              <label htmlFor="lm-timeline">
                Planning to move <Req />
              </label>
              <Select
                id="lm-timeline"
                label="When are you considering moving"
                Icon={IcoCalendar}
                options={TIMELINE}
                value={f.timeline}
                placeholder="Select timeline"
                invalid={!!errors.timeline}
                onChange={pickVal("timeline")}
              />
              {errors.timeline && (
                <span className="err">{errors.timeline}</span>
              )}
            </div>
            <div className="fld">
              <label htmlFor="lm-heard">How did you hear about us?</label>
              <Select
                id="lm-heard"
                label="How did you hear about us"
                Icon={IcoMegaphone}
                options={HEARD}
                value={f.heard}
                placeholder="Select an option"
                onChange={pickVal("heard")}
              />
            </div>
          </div>

          <div className="fld">
            <label className="lm-agree">
              <input
                id="lm-agree"
                type="checkbox"
                checked={f.agree}
                onChange={(e) => {
                  setF((x) => ({ ...x, agree: e.target.checked }));
                  setErrors((er) => ({ ...er, agree: undefined }));
                }}
                aria-invalid={!!errors.agree}
              />
              <span>
                I agree to be contacted by the Freedom Living team regarding my
                enquiry.
              </span>
            </label>
            {errors.agree && <span className="err">{errors.agree}</span>}
          </div>

          <button
            className="btn lm-submit"
            type="submit"
            disabled={sending}
            aria-busy={sending}
          >
            {sending ? "Sending…" : "Request a Call Back"}{" "}
            {!sending && <span className="arr">→</span>}
          </button>
          {sendErr && (
            <p className="err imodal-err" role="alert">
              {sendErr}
            </p>
          )}
        </form>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
