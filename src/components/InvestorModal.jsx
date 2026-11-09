import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const CATEGORIES = [
  "Individual investor",
  "Business / Corporate investor",
  "NRI investor",
  "Other",
];
const EMPTY = { name: "", phone: "", email: "", category: "", message: "" };
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
const Req = () => (
  <span className="req" aria-hidden="true">
    *
  </span>
);

/* dropdown that reuses the site's .fpick / .ctl / .pop menu styling */
function CategorySelect({ id, value, onChange, invalid }) {
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
    if (!open) setActive(Math.max(0, CATEGORIES.indexOf(value)));
    setOpen((o) => !o);
  };
  const pick = (v) => {
    onChange(v);
    close(true);
  };
  const onKey = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % CATEGORIES.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a - 1 + CATEGORIES.length) % CATEGORIES.length);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      pick(CATEGORIES[active]);
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
        className={`ctl${value ? "" : " empty"}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-invalid={invalid}
        onClick={toggle}
        onKeyDown={onBtnKey}
      >
        <span className="shown ![padding-left:0]" >
          {value || "Select investor category"}
        </span>
        <IcoChevron className="chev" />
      </button>
      {open && (
        <ul
          className="pop menu ![right:0]"
          role="listbox"
          aria-label="Investor category"
          ref={list}
          onKeyDown={onKey}

        >
          {CATEGORIES.map((v, i) => (
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
 * Investor enquiry modal. It closes ONLY with the X button
 * (no backdrop click, no Escape key). Posts to /api/lead with type "investor".
 */
export default function InvestorModal({ open, onClose }) {
  const [f, setF] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [hp, setHp] = useState("");
  const panel = useRef(null);
  const closeBtn = useRef(null);

  // lock page scroll while open, move focus in, and give it back on close
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
    if (!isEmail(f.email.trim())) err.email = "Enter a valid email address.";
    if (!f.category) err.category = "Please choose an investor category.";
    setErrors(err);
    const first = ["name", "phone", "email", "category"].find((k) => err[k]);
    if (first) {
      document.getElementById(`inv-${first}`)?.focus();
      return;
    }
    // Dummy for now: nothing is sent and nothing is shown after a valid submit.
    // (Wire this up to /api/lead later.)
  };

  // keep Tab inside the dialog
  const trap = (e) => {
    if (e.key !== "Tab") return;
    const els = [
      ...panel.current.querySelectorAll(
        'button:not([disabled]), input:not([tabindex="-1"]), textarea, [tabindex="0"], [role="option"]',
      ),
    ].filter((el) => el.offsetParent !== null && el.getAttribute("role") !== "option");
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

  const heading = (
    <>
      <span className="kicker">Palghat Senior Living Limited</span>
      <h3 id="inv-title">Explore investment opportunities.</h3>
      <p className="inv-intro">
        Share your details and our team will contact you to discuss potential
        investment and shareholding opportunities.
      </p>
    </>
  );

  return createPortal(
    <div className="imodal" data-lenis-prevent>
      <div
        className="imodal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="inv-title"
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
        <div className="imodal-head">{heading}</div>

        {(
          <form className="imodal-form" noValidate onSubmit={submit}>
            <input className="![position:absolute] ![left:-9999px] ![width:1px] ![height:1px] ![opacity:0]"
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
                <label htmlFor="inv-name">
                  Full name <Req />
                </label>
                <div className="ctl">
                  <input
                    id="inv-name"
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
                <label htmlFor="inv-phone">
                  Phone / WhatsApp <Req />
                </label>
                <div className="ctl phone">
                  <span className="pre" aria-hidden="true">
                    +91
                  </span>
                  <input
                    id="inv-phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    placeholder="Mobile number"
                    value={f.phone}
                    onChange={setPhone}
                    aria-invalid={!!errors.phone}
                  />
                </div>
                {errors.phone && <span className="err">{errors.phone}</span>}
              </div>
            </div>

            <div className="fld">
              <label htmlFor="inv-email">
                Email address <Req />
              </label>
              <div className="ctl">
                <input
                  id="inv-email"
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
              <label htmlFor="inv-category">
                Investor category <Req />
              </label>
              <CategorySelect
                id="inv-category"
                value={f.category}
                invalid={!!errors.category}
                onChange={(v) => {
                  setF((x) => ({ ...x, category: v }));
                  setErrors((er) => ({ ...er, category: undefined }));
                }}
              />
              {errors.category && (
                <span className="err">{errors.category}</span>
              )}
            </div>

            <div className="fld">
              <label htmlFor="inv-msg">
                Anything you&apos;d like to add? (optional)
              </label>
              <textarea
                id="inv-msg"
                placeholder="Your interest, ticket size, or any question"
                value={f.message}
                onChange={set("message")}
              />
            </div>

            <div className="go">
              <p className="fine">
                <IcoLock />{" "}
                <span>
                  We&apos;ll only use your details to contact you about
                  investment opportunities.
                </span>
              </p>
              <button className="btn" type="submit">
                Submit enquiry <span className="arr">→</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body,
  );
}
