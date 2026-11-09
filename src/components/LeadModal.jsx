import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

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
const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

const Svg = ({ children, size = 20, ...p }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...p}
  >
    {children}
  </svg>
);
const IcoClose = (p) => (
  <Svg strokeWidth="2" {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
);
const IcoChevron = (p) => (
  <Svg strokeWidth="2.2" {...p}>
    <path d="m6.5 9.5 5.5 5.5 5.5-5.5" />
  </Svg>
);
const IcoCheck = (p) => (
  <Svg strokeWidth="2.4" {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Svg>
);
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
const IcoMegaphone = (p) => (
  <Svg {...p}>
    <path d="M4 10v4a1 1 0 0 0 1 1h2l8 4V5L7 9H5a1 1 0 0 0-1 1ZM18.5 9.5a4 4 0 0 1 0 5M7 15l1 4.5h2.5L10 16" />
  </Svg>
);
const Req = () => (
  <span className="req" aria-hidden="true">
    *
  </span>
);

/* dropdown that reuses the site's .fpick / .ctl / .pop menu styling */
function Select({ id, value, options, placeholder, label, Icon, onChange, invalid }) {
  const wrap = useRef(null);
  const btn = useRef(null);
  const list = useRef(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const close = (refocus) => {
    setOpen(false);
    if (refocus === true) btn.current?.focus();
  };
  useEffect(() => {
    if (!open) return;
    const down = (e) => {
      if (!wrap.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", down);
    return () => document.removeEventListener("pointerdown", down);
  }, [open]);
  useEffect(() => {
    if (open) list.current?.children[active]?.focus({ preventScroll: true });
  }, [open, active]);

  const toggle = () => {
    if (!open) setActive(Math.max(0, options.indexOf(value)));
    setOpen((o) => !o);
  };
  const pick = (v) => {
    onChange(v);
    close(true);
  };
  const onKey = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % options.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a - 1 + options.length) % options.length);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      pick(options[active]);
    } else if (e.key === "Tab") close();
  };
  const onBtnKey = (e) => {
    if ((e.key === "ArrowDown" || e.key === "ArrowUp") && !open) {
      e.preventDefault();
      toggle();
    }
  };

  return (
    <div className="fpick" ref={wrap}>
      <button
        ref={btn}
        id={id}
        type="button"
        className={`ctl ico${value ? "" : " empty"}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-invalid={invalid}
        onClick={toggle}
        onKeyDown={onBtnKey}
      >
        <Icon size={22} className="lead-ico" />
        <span className="shown">{value || placeholder}</span>
        <IcoChevron className="chev" />
      </button>
      {open && (
        <ul
          className="pop menu"
          role="listbox"
          aria-label={label}
          ref={list}
          onKeyDown={onKey}
        >
          {options.map((v, i) => (
            <li
              key={v}
              role="option"
              tabIndex={-1}
              aria-selected={v === value}
              className={i === active ? "on" : ""}
              onMouseEnter={() => setActive(i)}
              onClick={() => pick(v)}
            >
              <span>{v}</span>{" "}
              {v === value && <IcoCheck size={18} className="tick" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * "Let's help you explore your options" modal. Same behaviour as the investor
 * modal: it closes ONLY with the X button (no backdrop click, no Escape).
 * Submit is a dummy for now: it validates, but sends and shows nothing.
 */
export default function LeadModal({ open, onClose }) {
  const [f, setF] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const panel = useRef(null);
  const closeBtn = useRef(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement;
    const html = document.documentElement;
    const wasLocked = html.classList.contains("!overflow-hidden");
    html.classList.add("!overflow-hidden");
    closeBtn.current?.focus({ preventScroll: true });
    return () => {
      if (!wasLocked) html.classList.remove("!overflow-hidden");
      prev?.focus?.({ preventScroll: true });
    };
  }, [open]);

  if (!open) return null;

  const set = (k) => (e) => setF((v) => ({ ...v, [k]: e.target.value }));
  const pickVal = (k) => (v) => {
    setF((x) => ({ ...x, [k]: v }));
    setErrors((er) => ({ ...er, [k]: undefined }));
  };
  const setPhone = (e) =>
    setF((v) => ({
      ...v,
      phone: e.target.value.replace(/\D/g, "").slice(0, 10),
    }));

  const submit = (e) => {
    e.preventDefault();
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
    // Dummy for now: nothing is sent and nothing is shown after a valid submit.
  };

  // keep Tab inside the dialog
  const trap = (e) => {
    if (e.key !== "Tab") return;
    const els = [
      ...panel.current.querySelectorAll(
        'button:not([disabled]), input:not([tabindex="-1"]), textarea',
      ),
    ].filter((el) => el.offsetParent !== null);
    if (!els.length) return;
    const a = els[0];
    const z = els[els.length - 1];
    if (e.shiftKey && document.activeElement === a) {
      e.preventDefault();
      z.focus();
    } else if (!e.shiftKey && document.activeElement === z) {
      e.preventDefault();
      a.focus();
    }
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
          onClick={onClose}
        >
          <IcoClose size={22} />
        </button>
        <div className="imodal-head lm-head">
          <h3 id="lm-title">Let&rsquo;s help you explore your options.</h3>
          <p className="inv-intro">
            Share a few details and our team will get in touch with the
            information you need.
          </p>
        </div>

        <form className="imodal-form" noValidate onSubmit={submit}>
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
            <span className="lb" id="lm-who-l">
              Who are you exploring a home for? <Req />
            </span>
            <div
              className="lm-radios"
              role="radiogroup"
              aria-labelledby="lm-who-l"
            >
              {WHO.map((v, i) => (
                <button
                  key={v}
                  id={i === 0 ? "lm-who" : undefined}
                  type="button"
                  className="lm-radio"
                  role="radio"
                  aria-checked={f.who === v}
                  onClick={() => pickVal("who")(v)}
                >
                  <i aria-hidden="true" />
                  <span>{v}</span>
                </button>
              ))}
            </div>
            {errors.who && <span className="err">{errors.who}</span>}
          </div>

          <div className="fr two">
            <div className="fld">
              <label htmlFor="lm-timeline">
                When are you considering moving? <Req />
              </label>
              <Select
                id="lm-timeline"
                label="Timeline"
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

          <button className="btn lm-submit" type="submit">
            Request a Call Back <span className="arr">→</span>
          </button>
        </form>
      </div>
    </div>,
    document.body,
  );
}
